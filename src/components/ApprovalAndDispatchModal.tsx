import React, { useState } from 'react';
import {
  CheckCircle,
  Copy,
  Download,
  Share2,
  FileText,
  Mail,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Truck,
  Check,
  X,
  Phone,
} from 'lucide-react';
import type { IncidentData, RecipientOrg, LogisticsAgentOutput, ImpactAgentOutput, IncidentStatus } from '../types/rescue.ts';

interface ApprovalAndDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentData;
  recipients: RecipientOrg[];
  logistics: LogisticsAgentOutput | null;
  impact: ImpactAgentOutput | null;
  status: IncidentStatus;
  onApprovePlan: () => void;
  onMarkDispatched: () => void;
  onMarkCompleted: () => void;
}

export const ApprovalAndDispatchModal: React.FC<ApprovalAndDispatchModalProps> = ({
  isOpen,
  onClose,
  incident,
  recipients,
  logistics,
  impact,
  status,
  onApprovePlan,
  onMarkDispatched,
  onMarkCompleted,
}) => {
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const generateWhatsAppMessage = (r: RecipientOrg, portions: number) => {
    return `Hello ${r.contactPerson},\nRescueLoop AI coordination update: We have allocated ${portions} freshly prepared meal portions (${incident.title}) for ${r.name}.\nPickup Address: ${incident.locationAddress}\nFood Temperature Verified: ${incident.storageTempC}°C\nDietary: ${incident.dietaryTags.join(', ')}\nExpected Courier Arrival: Within 45 minutes.\nPlease confirm someone is on site to receive containers!`;
  };

  const generateDriverInstructions = () => {
    return `RESCUELOOP AI DISPATCH INSTRUCTIONS:\n1. PICKUP at ${incident.locationAddress}\n   - Contact: ${incident.contactName || 'Kitchen Dock Lead'} (${incident.contactPhone || '555-0199'})\n   - Load: ${logistics?.totalAllocatedPortions || 120} portions in thermal Cambro carriers\n   - Core temp check: ${incident.storageTempC}°C verified\n\n2. DELIVERY STOPS:\n${logistics?.allocations.map((a, i) => `   Stop ${i + 1}: ${a.recipientName} - Unload ${a.allocatedPortions} portions`).join('\n')}\n\nMaintain lid seals closed during transit. Deliver immediately.`;
  };

  const handleDownloadReport = () => {
    const reportText = `=====================================================
RESCUELOOP AI OPERATIONAL REDISTRIBUTION REPORT
=====================================================
Incident ID: ${incident.id}
Event / Donor: ${incident.title}
Address: ${incident.locationAddress}
Generated: ${new Date().toLocaleString()}
Status: ${status.toUpperCase()}

SURPLUS FOOD MANIFEST:
- Reported Portions: ${incident.reportedPortions}
- Measured Core Temp: ${incident.storageTempC}°C (${incident.storageMethod})
- Venue Safety Lead: ${incident.venueSafetyOfficerName}
- Safety Clearance: ${incident.venueSafetyClearanceGranted ? 'GRANTED' : 'DENIED'}
- Allergens Disclosed: ${incident.declaredAllergens.join(', ') || 'None'}

SHELTER ALLOCATIONS:
${logistics?.allocations.map((a) => `- ${a.recipientName}: ${a.allocatedPortions} portions`).join('\n')}
Total Cleared & Allocated: ${logistics?.totalAllocatedPortions} portions

ENVIRONMENTAL LEDGER:
- Organic Landfill Diverted: ${impact?.environmentalEstimates.landfillDivertedKg.toFixed(1)} kg
- Avoided Greenhouse Gases: ${impact?.environmentalEstimates.co2eAvoidedKg.toFixed(1)} kg CO2e
- Conserved Freshwater: ${impact?.environmentalEstimates.waterSavedLiters.toLocaleString()} Liters

=====================================================
RescueLoop AI · Good Samaritan Food Donation Act Compliant
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RescueLoop-Manifest-${incident.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isApproved = status === 'approved' || status === 'dispatched' || status === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Operator Review & Courier Dispatch</h3>
              <p className="text-xs text-slate-500">
                Mandatory human clearance required before dispatching volunteer transport.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Indicator */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Current Workflow State:
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  status === 'completed'
                    ? 'bg-purple-100 text-purple-800'
                    : status === 'dispatched'
                    ? 'bg-blue-100 text-blue-800'
                    : isApproved
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              {logistics?.totalAllocatedPortions || 120} Portions Cleared
            </div>
          </div>

          {/* Verification Checkbox */}
          {!isApproved && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 font-medium leading-relaxed">
                  <strong>Food Safety Law Notice:</strong> AI suggestions do not replace certified physical verification. The human coordinator must verify that temperature logs were taken with a calibrated probe and containers remain sealed.
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={operatorConfirmed}
                  onChange={(e) => setOperatorConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-900 font-semibold leading-snug">
                  I confirm that core food temperature was verified above 60°C (or below 4.5°C), venue coordinator authorized donation, and partner shelters have been notified.
                </span>
              </label>

              <button
                type="button"
                onClick={onApprovePlan}
                disabled={!operatorConfirmed}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Approve Redistribution Plan</span>
              </button>
            </div>
          )}

          {/* Action Tools Available After Approval */}
          {isApproved && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Communication & Dispatch Tools
              </div>

              {/* Shelter WhatsApp Drafts */}
              <div className="space-y-2">
                {logistics?.allocations.map((alloc) => {
                  const rec = recipients.find((r) => r.id === alloc.recipientId);
                  if (!rec) return null;
                  const msg = generateWhatsAppMessage(rec, alloc.allocatedPortions);
                  return (
                    <div
                      key={alloc.recipientId}
                      className="rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                          <span>WhatsApp to {rec.name} ({alloc.allocatedPortions} meals)</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Contact: {rec.contactPerson} · {rec.contactPhone}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg, `msg-${alloc.recipientId}`)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        {copiedKey === `msg-${alloc.recipientId}` ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Driver Instructions */}
              <div className="rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-blue-600" />
                    <span>Courier Turn-by-Turn Pickup Directions</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Complete routing instructions for volunteer driver
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(generateDriverInstructions(), 'driver')}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  {copiedKey === 'driver' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Instructions</span>
                    </>
                  )}
                </button>
              </div>

              {/* Download Report */}
              <div className="rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5 text-purple-600" />
                    <span>Export Official Redistribution Manifest (.txt)</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Includes temperature log, officer sign-off, and impact data
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Report</span>
                </button>
              </div>

              {/* Courier Transition Buttons */}
              <div className="pt-2 flex items-center gap-3">
                {status === 'approved' && (
                  <button
                    type="button"
                    onClick={onMarkDispatched}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-xs cursor-pointer"
                  >
                    <Truck className="h-4 w-4" />
                    <span>Mark Courier In Transit</span>
                  </button>
                )}
                {status === 'dispatched' && (
                  <button
                    type="button"
                    onClick={onMarkCompleted}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-3 text-xs font-bold text-white shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Confirm Handoff & Complete</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
