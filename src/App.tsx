import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingHeroBanner } from './components/LandingHeroBanner.tsx';
import { IncidentIntakePanel } from './components/IncidentIntakePanel.tsx';
import { AgentTimeline } from './components/AgentTimeline.tsx';
import { RecipientAllocationPanel } from './components/RecipientAllocationPanel.tsx';
import { SchematicMap } from './components/SchematicMap.tsx';
import { ImpactStats } from './components/ImpactStats.tsx';
import { ApprovalAndDispatchModal } from './components/ApprovalAndDispatchModal.tsx';
import {
  DEFAULT_DEMO_INCIDENT,
  DEFAULT_DEMO_RECIPIENTS,
  CUSTOM_INITIAL_INCIDENT,
} from './data/demoScenario.ts';
import type {
  IncidentData,
  RecipientOrg,
  OrchestrationResult,
  WorkflowStage,
  IncidentStatus,
} from './types/rescue.ts';
import { FileCheck, ArrowRight, CheckCircle2, Sparkles, HeartHandshake } from 'lucide-react';

export default function App() {
  const [incident, setIncident] = useState<IncidentData>(DEFAULT_DEMO_INCIDENT);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [recipients, setRecipients] = useState<RecipientOrg[]>(DEFAULT_DEMO_RECIPIENTS);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<WorkflowStage>('vision');
  const [incidentStatus, setIncidentStatus] = useState<IncidentStatus>('draft');
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health').catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleToggleCustomMode = (custom: boolean) => {
    setIsCustomMode(custom);
    if (custom) {
      if (incident.isSimulatedData) {
        setIncident({
          ...CUSTOM_INITIAL_INCIDENT,
          id: `INC-${Date.now().toString().slice(-4)}`,
        });
      }
    } else {
      setIncident(DEFAULT_DEMO_INCIDENT);
    }
    setOrchestrationResult(null);
    setIncidentStatus('draft');
  };

  const runPipeline = async (customIncident?: IncidentData) => {
    const targetIncident = customIncident || incident;
    setIsRunning(true);
    setIncidentStatus('analyzing');
    setActiveStage('vision');

    // Smooth scroll down to the pipeline so user immediately sees real-time progress
    setTimeout(() => {
      const pipelineEl = document.getElementById('pipeline-section');
      if (pipelineEl) {
        pipelineEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);

    const stages: WorkflowStage[] = ['vision', 'safety', 'matching', 'logistics', 'impact'];
    let stageIndex = 0;
    const interval = setInterval(() => {
      stageIndex = (stageIndex + 1) % stages.length;
      setActiveStage(stages[stageIndex]);
    }, 900);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch('/api/rescue/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident: targetIncident,
          recipients,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(interval);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: OrchestrationResult = await response.json();
      setOrchestrationResult(data);

      if (data.agents.logistics?.allocations) {
        setRecipients((prev) =>
          prev.map((r) => {
            const alloc = data.agents.logistics.allocations.find((a) => a.recipientId === r.id);
            const matchInfo = data.agents.matching?.rankedRecipients?.find((m) => m.recipientId === r.id);
            return {
              ...r,
              allocatedPortions: alloc ? alloc.allocatedPortions : 0,
              matchScore: matchInfo ? matchInfo.score : r.matchScore,
            };
          })
        );
      }

      if (data.status === 'blocked') {
        setIncidentStatus('draft');
        showToast('⚠️ Safety Gate Blocked: Storage temperature violation or missing officer clearance.');
      } else {
        setIncidentStatus('pending_approval');
        showToast('🎉 5-Agent Analysis Complete! Meals successfully routed to community partners.');
      }
    } catch {
      clearInterval(interval);

      // Deterministic fallback execution
      const { validateSafetyClearance, matchAndRankRecipients, allocateClearedFood, calculateEnvironmentalImpact } =
        await import('./utils/rescueLogic.ts');

      const localSafety = validateSafetyClearance(targetIncident);
      const localMatching = matchAndRankRecipients(
        recipients,
        targetIncident,
        localSafety.clearedQuantityPortions
      );
      const localLogistics = allocateClearedFood(
        localSafety.clearedQuantityPortions,
        localMatching.rankedRecipients,
        recipients
      );
      const localImpact = calculateEnvironmentalImpact(
        targetIncident.reportedPortions,
        localSafety.clearedQuantityPortions,
        localLogistics.totalAllocatedPortions,
        0,
        targetIncident.reportedWeightKg
      );

      const localResult: OrchestrationResult = {
        incidentId: targetIncident.id,
        completedAt: new Date().toISOString(),
        status: localSafety.status === 'blocked' ? 'blocked' : 'success',
        agents: {
          vision: {
            identifiedItems: [
              {
                name: 'Herb Roasted Chicken and Potatoes',
                category: 'protein',
                estimatedPortions: Math.round(targetIncident.reportedPortions * 0.5),
                confidence: 0.88,
                packaging: 'Stainless steel gastro pan with thermal lid',
                allergens: ['Dairy'],
              },
              {
                name: 'Mediterranean Quinoa Salad',
                category: 'carbohydrate',
                estimatedPortions: Math.round(targetIncident.reportedPortions * 0.3),
                confidence: 0.82,
                packaging: 'Half-size deep steam table pan',
                allergens: [],
              },
              {
                name: 'Steamed Seasonal Vegetables',
                category: 'vegetable',
                estimatedPortions: Math.round(targetIncident.reportedPortions * 0.2),
                confidence: 0.9,
                packaging: 'Vented steam table pan',
                allergens: [],
              },
            ],
            estimatedTotalPortions: targetIncident.reportedPortions,
            confidenceScore: 86,
            portionUncertaintyRange: [
              Math.round(targetIncident.reportedPortions * 0.9),
              Math.round(targetIncident.reportedPortions * 1.1),
            ],
            uncertaintyStatement:
              'Visual estimate based on container capacity. Visual checks must be verified on site.',
            missingInformationRequests: ['Confirm tare weight at loading dock.'],
            visualObservations: ['Thermal Cambro covers verified intact.'],
          },
          safety: localSafety,
          matching: localMatching,
          logistics: localLogistics,
          impact: localImpact,
        },
        executionStates: {
          vision: {
            stage: 'vision',
            agentName: 'Vision Agent',
            roleDescription: 'Food identification',
            status: 'completed',
            findingsSummary: `Identified 3 items (${targetIncident.reportedPortions} portions).`,
            blockers: [],
            outputData: null,
          },
          safety: {
            stage: 'safety',
            agentName: 'Safety Gate Agent',
            roleDescription: 'HACCP clearance',
            status: localSafety.status === 'blocked' ? 'blocked' : 'completed',
            findingsSummary:
              localSafety.status === 'cleared'
                ? `Safety clearance granted for ${localSafety.clearedQuantityPortions} portions.`
                : 'Blocked due to safety threshold violations.',
            blockers: localSafety.blockers,
            outputData: localSafety,
          },
          matching: {
            stage: 'matching',
            agentName: 'Matching Agent',
            roleDescription: 'Partner capacity',
            status: 'completed',
            findingsSummary: `Ranked ${recipients.length} candidate facilities.`,
            blockers: [],
            outputData: localMatching,
          },
          logistics: {
            stage: 'logistics',
            agentName: 'Logistics Agent',
            roleDescription: 'Portion routing',
            status: localSafety.status === 'blocked' ? 'blocked' : 'completed',
            findingsSummary: `Allocated ${localLogistics.totalAllocatedPortions} portions.`,
            blockers: [],
            outputData: localLogistics,
          },
          impact: {
            stage: 'impact',
            agentName: 'Impact Agent',
            roleDescription: 'Carbon and water impact',
            status: 'completed',
            findingsSummary: `Modelled ~${localImpact.estimatedWeightKg} kg diverted.`,
            blockers: [],
            outputData: localImpact,
          },
        },
        isFallback: true,
      };

      setOrchestrationResult(localResult);

      if (localLogistics.allocations) {
        setRecipients((prev) =>
          prev.map((r) => {
            const alloc = localLogistics.allocations.find((a) => a.recipientId === r.id);
            const matchInfo = localMatching.rankedRecipients.find((m) => m.recipientId === r.id);
            return {
              ...r,
              allocatedPortions: alloc ? alloc.allocatedPortions : 0,
              matchScore: matchInfo ? matchInfo.score : r.matchScore,
            };
          })
        );
      }

      if (localSafety.status !== 'blocked') {
        setIncidentStatus('pending_approval');
        showToast('🎉 5-Agent Analysis Complete! Meals successfully routed to community partners.');
      } else {
        showToast('⚠️ Safety Gate Blocked: Storage temperature violation or missing officer clearance.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectScenario = (newIncident: IncidentData) => {
    setIncident(newIncident);
    setIncidentStatus('draft');
    setOrchestrationResult(null);
    runPipeline(newIncident);
  };

  const handleReset = () => {
    setIncident(DEFAULT_DEMO_INCIDENT);
    setIsCustomMode(false);
    setRecipients(DEFAULT_DEMO_RECIPIENTS);
    setOrchestrationResult(null);
    setIncidentStatus('draft');
    setActiveTab('dashboard');
    showToast('Reset to default University Gala scenario.');
  };

  const handleUpdateAllocations = (
    updated: { recipientId: string; portions: number }[]
  ) => {
    setRecipients((prev) =>
      prev.map((r) => {
        const found = updated.find((u) => u.recipientId === r.id);
        return found ? { ...r, allocatedPortions: found.portions } : r;
      })
    );

    if (orchestrationResult && orchestrationResult.agents.logistics) {
      const newTotal = updated.reduce((sum, u) => sum + u.portions, 0);
      const newAllocations = orchestrationResult.agents.logistics.allocations.map(
        (a) => {
          const found = updated.find((u) => u.recipientId === a.recipientId);
          return found ? { ...a, allocatedPortions: found.portions } : a;
        }
      );

      setOrchestrationResult({
        ...orchestrationResult,
        agents: {
          ...orchestrationResult.agents,
          logistics: {
            ...orchestrationResult.agents.logistics,
            totalAllocatedPortions: newTotal,
            unallocatedPortions:
              orchestrationResult.agents.safety.clearedQuantityPortions - newTotal,
            allocations: newAllocations,
          },
        },
      });
      showToast('Recipient allocations updated.');
    }
  };

  const handleApprovePlan = () => {
    setIncidentStatus('approved');
    showToast('Plan approved by operator. Courier communication unlocked.');
  };

  const handleMarkDispatched = () => {
    setIncidentStatus('dispatched');
    showToast('Courier vehicle marked in transit.');
  };

  const handleMarkCompleted = () => {
    setIncidentStatus('completed');
    if (orchestrationResult) {
      setOrchestrationResult({
        ...orchestrationResult,
        agents: {
          ...orchestrationResult.agents,
          impact: {
            ...orchestrationResult.agents.impact,
            portionsCollected:
              orchestrationResult.agents.logistics?.totalAllocatedPortions || 0,
          },
        },
      });
    }
    showToast('Food delivery confirmed! All portions distributed.');
  };

  const clearedPortions =
    orchestrationResult?.agents.safety?.clearedQuantityPortions ?? incident.reportedPortions;
  const allocatedPortions =
    orchestrationResult?.agents.logistics?.totalAllocatedPortions ??
    recipients.reduce((sum, r) => sum + r.allocatedPortions, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        isSimulatedData={incident.isSimulatedData}
        onToggleDataMode={(sim) =>
          setIncident((prev) => ({ ...prev, isSimulatedData: sim }))
        }
        onRunDemo={() => runPipeline()}
        onReset={handleReset}
        isRunning={isRunning}
        status={incidentStatus}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Landing Hero */}
        <LandingHeroBanner
          onRunDemo={() => runPipeline()}
          onSelectScenario={handleSelectScenario}
          isRunning={isRunning}
          activeScenarioId={incident.id}
          isCustomMode={isCustomMode}
          onToggleCustomMode={handleToggleCustomMode}
        />

        {/* Operational Status Action Bar */}
        {orchestrationResult && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/70 px-6 py-4.5 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-2xs">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                  <span>Redistribution Plan Generated</span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      incidentStatus === 'approved'
                        ? 'bg-emerald-200 text-emerald-900'
                        : incidentStatus === 'dispatched'
                        ? 'bg-blue-200 text-blue-900'
                        : incidentStatus === 'completed'
                        ? 'bg-purple-200 text-purple-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {incidentStatus.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {allocatedPortions} of {clearedPortions} safety-cleared portions allocated across candidate community partners.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
              id="review-approve-plan-btn"
            >
              <span>Review & Approve Plan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Dynamic Views Based on Nav Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 xl:col-span-4">
              <IncidentIntakePanel
                incident={incident}
                onChange={setIncident}
                onRunAnalysis={() => runPipeline()}
                isRunning={isRunning}
                isCustomMode={isCustomMode}
              />
            </div>

            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <AgentTimeline
                orchestrationResult={orchestrationResult}
                isRunning={isRunning}
                activeStage={activeStage}
              />

              <RecipientAllocationPanel
                recipients={recipients}
                logistics={orchestrationResult?.agents.logistics || null}
                clearedPortions={clearedPortions}
                onUpdateAllocations={handleUpdateAllocations}
              />

              <SchematicMap
                incident={incident}
                logistics={orchestrationResult?.agents.logistics || null}
                recipients={recipients}
              />

              <ImpactStats
                impact={orchestrationResult?.agents.impact || null}
                reportedPortions={incident.reportedPortions}
                clearedPortions={clearedPortions}
                allocatedPortions={allocatedPortions}
              />
            </div>
          </div>
        )}

        {activeTab === 'intake' && (
          <div className="max-w-3xl mx-auto">
            <IncidentIntakePanel
              incident={incident}
              onChange={setIncident}
              onRunAnalysis={() => runPipeline()}
              isRunning={isRunning}
              isCustomMode={isCustomMode}
            />
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <AgentTimeline
              orchestrationResult={orchestrationResult}
              isRunning={isRunning}
              activeStage={activeStage}
            />
          </div>
        )}

        {activeTab === 'route' && (
          <div className="space-y-6">
            <RecipientAllocationPanel
              recipients={recipients}
              logistics={orchestrationResult?.agents.logistics || null}
              clearedPortions={clearedPortions}
              onUpdateAllocations={handleUpdateAllocations}
            />
            <SchematicMap
              incident={incident}
              logistics={orchestrationResult?.agents.logistics || null}
              recipients={recipients}
            />
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="max-w-4xl mx-auto">
            <ImpactStats
              impact={orchestrationResult?.agents.impact || null}
              reportedPortions={incident.reportedPortions}
              clearedPortions={clearedPortions}
              allocatedPortions={allocatedPortions}
            />
          </div>
        )}
      </main>

      {/* Human Review Modal */}
      <ApprovalAndDispatchModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        incident={incident}
        recipients={recipients}
        logistics={orchestrationResult?.agents.logistics || null}
        impact={orchestrationResult?.agents.impact || null}
        status={incidentStatus}
        onApprovePlan={handleApprovePlan}
        onMarkDispatched={handleMarkDispatched}
        onMarkCompleted={handleMarkCompleted}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        RescueLoop AI Logistics Coordination · Food Safety Regulations Enforced · Partner records are simulated for demonstration
      </footer>
    </div>
  );
}
