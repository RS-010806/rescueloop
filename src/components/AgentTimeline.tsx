import React, { useState } from 'react';
import {
  Eye,
  ShieldCheck,
  Building2,
  Truck,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Code2,
  X,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import type { AgentExecutionState, WorkflowStage, OrchestrationResult } from '../types/rescue.ts';

interface AgentTimelineProps {
  orchestrationResult: OrchestrationResult | null;
  isRunning: boolean;
  activeStage?: WorkflowStage;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({
  orchestrationResult,
  isRunning,
  activeStage,
}) => {
  const [selectedAgentData, setSelectedAgentData] = useState<{
    name: string;
    stage: string;
    data: any;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const stagesConfig: {
    stage: WorkflowStage;
    number: string;
    name: string;
    role: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      stage: 'vision',
      number: '1',
      name: 'Vision Agent',
      role: 'Surplus Image & Volume Classification',
      icon: Eye,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
    },
    {
      stage: 'safety',
      number: '2',
      name: 'Safety Gate Agent',
      role: 'HACCP Temperature & Venue Authorization',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      stage: 'matching',
      number: '3',
      name: 'Shelter Matching Agent',
      role: 'Distance, Dietary & Absorption Ranking',
      icon: Building2,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      stage: 'logistics',
      number: '4',
      name: 'Logistics & Route Agent',
      role: 'Balanced Portion Allocation & Courier Stops',
      icon: Truck,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      stage: 'impact',
      number: '5',
      name: 'Impact Audit Agent',
      role: 'EPA WARM Carbon, Water & Landfill Ledger',
      icon: Leaf,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
  ];

  const handleCopyJson = () => {
    if (!selectedAgentData) return;
    navigator.clipboard.writeText(JSON.stringify(selectedAgentData.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="pipeline-section"
      className="rounded-3xl border border-slate-200/90 bg-white p-6 lg:p-7 shadow-sm flex flex-col space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              5
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              5-Agent Operational Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sequential handoffs passing verified structured JSON between specialized AI agents.
          </p>
        </div>

        {isRunning && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-2 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
            <span>Active Stage: {activeStage ? activeStage.toUpperCase() : 'ORCHESTRATING'}</span>
          </span>
        )}
      </div>

      {/* Stage Cards Flow */}
      <div className="space-y-3.5">
        {stagesConfig.map((item) => {
          const state: AgentExecutionState | undefined =
            orchestrationResult?.executionStates?.[item.stage];

          const isCurrentExecuting = isRunning && activeStage === item.stage;
          const status = state?.status || (isCurrentExecuting ? 'running' : 'idle');

          const getStatusBadge = () => {
            if (status === 'completed') {
              return (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>CLEARED</span>
                </span>
              );
            }
            if (status === 'flagged') {
              return (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>REVIEW REQUIRED</span>
                </span>
              );
            }
            if (status === 'blocked') {
              return (
                <span className="flex items-center gap-1.5 rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-800">
                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                  <span>BLOCKED</span>
                </span>
              );
            }
            if (status === 'running') {
              return (
                <span className="flex items-center gap-1.5 rounded-full bg-teal-100 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-800">
                  <span className="h-2 w-2 rounded-full bg-teal-600 animate-ping"></span>
                  <span>ANALYZING...</span>
                </span>
              );
            }
            return (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
                PENDING
              </span>
            );
          };

          const Icon = item.icon;

          return (
            <div
              key={item.stage}
              className={`rounded-2xl border p-4.5 transition-all duration-300 ${
                isCurrentExecuting
                  ? 'border-emerald-400 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20'
                  : status === 'blocked'
                  ? 'border-rose-200 bg-rose-50/50'
                  : status === 'flagged'
                  ? 'border-amber-200 bg-amber-50/50'
                  : status === 'completed'
                  ? 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  : 'border-slate-200/70 bg-slate-50/60 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${item.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Stage {item.number}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{item.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  {getStatusBadge()}

                  {state?.outputData && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAgentData({
                          name: item.name,
                          stage: item.stage,
                          data: state.outputData,
                        })
                      }
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      title="Inspect structured agent JSON output"
                    >
                      <Code2 className="h-3.5 w-3.5 text-slate-500" />
                      <span>JSON</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Agent Findings Summary in Plain English */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs leading-relaxed text-slate-700">
                {state?.findingsSummary ? (
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-900 shrink-0">Findings:</span>
                    <span>{state.findingsSummary}</span>
                  </div>
                ) : isCurrentExecuting ? (
                  <div className="text-slate-500 italic flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-ping"></span>
                    <span>Processing parameters and verifying safety guidelines...</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">
                    Awaiting handoff from previous pipeline stage.
                  </span>
                )}

                {/* Blockers or Warnings if present */}
                {state?.blockers && state.blockers.length > 0 && (
                  <div className="mt-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-rose-800 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-rose-600" />
                      <span>Safety Gate Blockers:</span>
                    </div>
                    {state.blockers.map((b, i) => (
                      <div key={i} className="pl-5">
                        • {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* JSON Inspector Modal */}
      {selectedAgentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-emerald-600" />
                <h4 className="text-base font-bold text-slate-900">
                  {selectedAgentData.name} Structured Output
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAgentData(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-auto font-mono text-xs text-slate-800 bg-slate-900 text-slate-100 leading-relaxed">
              <pre>{JSON.stringify(selectedAgentData.data, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
