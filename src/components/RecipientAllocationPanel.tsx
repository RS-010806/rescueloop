import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  CheckCircle,
  Flame,
  Snowflake,
  Edit3,
  AlertCircle,
  Plus,
  Minus,
  Check,
  RotateCcw,
} from 'lucide-react';
import type { RecipientOrg, LogisticsAgentOutput } from '../types/rescue.ts';

interface RecipientAllocationPanelProps {
  recipients: RecipientOrg[];
  logistics: LogisticsAgentOutput | null;
  clearedPortions: number;
  onUpdateAllocations: (updated: { recipientId: string; portions: number }[]) => void;
}

export const RecipientAllocationPanel: React.FC<RecipientAllocationPanelProps> = ({
  recipients,
  logistics,
  clearedPortions,
  onUpdateAllocations,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftAllocations, setDraftAllocations] = useState<Record<string, number>>({});

  const getAllocatedAmount = (id: string) => {
    if (isEditing) {
      return draftAllocations[id] ?? 0;
    }
    const alloc = logistics?.allocations.find((a) => a.recipientId === id);
    return alloc ? alloc.allocatedPortions : 0;
  };

  const handleStartEditing = () => {
    const initial: Record<string, number> = {};
    recipients.forEach((r) => {
      const alloc = logistics?.allocations.find((a) => a.recipientId === r.id);
      initial[r.id] = alloc ? alloc.allocatedPortions : 0;
    });
    setDraftAllocations(initial);
    setIsEditing(true);
  };

  const handlePortionChange = (id: string, portions: number) => {
    const safeNum = Math.max(0, portions || 0);
    setDraftAllocations((prev) => ({
      ...prev,
      [id]: safeNum,
    }));
  };

  const handleAdjustStep = (id: string, delta: number) => {
    const current = draftAllocations[id] ?? 0;
    handlePortionChange(id, Math.max(0, current + delta));
  };

  const handleSaveAllocations = () => {
    const list = Object.entries(draftAllocations).map(([recipientId, portions]) => ({
      recipientId,
      portions,
    }));
    onUpdateAllocations(list);
    setIsEditing(false);
  };

  const currentTotalAllocated = Object.values(
    isEditing
      ? draftAllocations
      : logistics?.allocations.reduce((acc, a) => ({ ...acc, [a.recipientId]: a.allocatedPortions }), {}) || {}
  ).reduce((sum, n) => (sum as number) + (n as number), 0) as number;

  const remainingBalance = clearedPortions - currentTotalAllocated;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 lg:p-7 shadow-sm flex flex-col space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              3
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              Matched Community Kitchens & Shelters
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Allocations matched by declared intake capacity, distance, and dietary requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEditing}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Modify Allocations</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAllocations}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Apply Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Allocation Balance Banner */}
      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {currentTotalAllocated} of {clearedPortions} Cleared Portions Allocated
            </div>
            <div className="text-xs text-slate-500">
              {remainingBalance === 0
                ? 'Balanced redistribution: 100% of safety-cleared meals assigned.'
                : remainingBalance > 0
                ? `${remainingBalance} portions remain unassigned.`
                : `Overallocated by ${Math.abs(remainingBalance)} portions! Please adjust.`}
            </div>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            remainingBalance === 0
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : remainingBalance > 0
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-rose-100 text-rose-800 border-rose-300'
          }`}
        >
          {remainingBalance === 0 ? '100% BALANCED' : `${Math.abs(remainingBalance)} PORTION GAP`}
        </span>
      </div>

      {/* Recipient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipients.map((recipient) => {
          const allocated = getAllocatedAmount(recipient.id);
          const capacityPercent = Math.min(
            100,
            Math.round((allocated / recipient.declaredCapacityPortions) * 100)
          );
          const isAssigned = allocated > 0;

          return (
            <div
              key={recipient.id}
              className={`rounded-2xl border p-5 transition-all ${
                isAssigned
                  ? 'border-emerald-300/80 bg-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{recipient.name}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {recipient.address} ({recipient.distanceKm} km away)
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isAssigned
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isAssigned ? `${allocated} Portions` : 'No Allocation'}
                </span>
              </div>

              {/* Tags & Capability */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {recipient.acceptsHotFood && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    <Flame className="h-3 w-3 text-amber-600" /> Hot Food
                  </span>
                )}
                {recipient.acceptsChilledFood && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                    <Snowflake className="h-3 w-3 text-sky-600" /> Chilled Storage
                  </span>
                )}
                {recipient.dietaryRequirements.map((req, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 capitalize"
                  >
                    {req.replace('-', ' ')}
                  </span>
                ))}
              </div>

              {/* Capacity Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Absorption Capacity:</span>
                  <span className="text-slate-900 font-bold">
                    {allocated} / {recipient.declaredCapacityPortions} servings ({capacityPercent}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      capacityPercent >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>

              {/* Stepper if Editing */}
              {isEditing && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Adjust Portions:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdjustStep(recipient.id, -10)}
                      className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={draftAllocations[recipient.id] ?? 0}
                      onChange={(e) => handlePortionChange(recipient.id, Number(e.target.value))}
                      className="w-16 rounded-lg border border-slate-300 text-center text-xs font-bold py-1 text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAdjustStep(recipient.id, 10)}
                      className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Contact info snippet */}
              <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Contact: {recipient.contactPerson}</span>
                <span>{recipient.operatingHours}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
