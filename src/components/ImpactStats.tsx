import React, { useState } from 'react';
import { Leaf, Droplets, Scale, Info, CheckCircle2, X } from 'lucide-react';
import type { ImpactAgentOutput } from '../types/rescue.ts';

interface ImpactStatsProps {
  impact: ImpactAgentOutput | null;
  reportedPortions: number;
  clearedPortions: number;
  allocatedPortions: number;
}

export const ImpactStats: React.FC<ImpactStatsProps> = ({
  impact,
  reportedPortions,
  clearedPortions,
  allocatedPortions,
}) => {
  const [showMethodology, setShowMethodology] = useState(false);

  const co2Avoided = impact?.environmentalEstimates.co2eAvoidedKg || 0;
  const waterSaved = impact?.environmentalEstimates.waterSavedLiters || 0;
  const landfillDiverted = impact?.environmentalEstimates.landfillDivertedKg || 0;
  const portionsCollected = impact?.portionsCollected || 0;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 lg:p-7 shadow-sm flex flex-col space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
              5
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              Environmental Impact & Diverted Food Ledger
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Transparent accounting tracking diverted organic mass, avoided greenhouse gas emissions, and water conservation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMethodology(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
        >
          <Info className="h-4 w-4 text-emerald-600" />
          <span>Accounting Methodology</span>
        </button>
      </div>

      {/* 4 Pipeline Volume Stages */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Available Surplus */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            1. Reported Surplus
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {reportedPortions} <span className="text-xs font-semibold text-slate-500">servings</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Initial banquet intake</div>
        </div>

        {/* Safety Cleared */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            2. Safety Cleared
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {clearedPortions} <span className="text-xs font-semibold text-slate-500">servings</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Passed HACCP gate</div>
        </div>

        {/* Allocated */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            3. Shelter Allocated
          </div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">
            {allocatedPortions} <span className="text-xs font-semibold text-slate-500">servings</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Matched to recipient needs</div>
        </div>

        {/* Completed Pickups */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            4. Handed Off
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {portionsCollected} <span className="text-xs font-semibold text-slate-500">servings</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {portionsCollected > 0 ? 'Verified delivered' : 'Awaiting dispatch confirmation'}
          </div>
        </div>
      </div>

      {/* Environmental Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 shrink-0 shadow-2xs">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Organic Mass Diverted
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {landfillDiverted.toFixed(1)} <span className="text-sm font-semibold text-slate-500">kg</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Solid waste prevented from anaerobic decomposition in local landfills.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 flex items-start gap-4">
          <div className="rounded-2xl bg-teal-100 p-3 text-teal-700 shrink-0 shadow-2xs">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Avoided Greenhouse Gas
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {co2Avoided.toFixed(1)} <span className="text-sm font-semibold text-slate-500">kg CO2e</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Equivalent to avoiding ~520 km of gasoline passenger vehicle travel.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5 flex items-start gap-4">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700 shrink-0 shadow-2xs">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-800">
              Embedded Water Conserved
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {waterSaved.toLocaleString()} <span className="text-sm font-semibold text-slate-500">liters</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Agricultural freshwater footprint embedded in harvested ingredients.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                <h4 className="text-lg font-bold text-slate-900">Environmental Accounting Methodology</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowMethodology(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900">Serving Mass Assumption:</strong> Based on the EPA Waste Reduction Model (WARM v15), an average prepared buffet or catered dinner portion weighs approximately 0.42 kg.
              </p>
              <p>
                <strong className="text-slate-900">Methane & Carbon Avoidance:</strong> Landfilled organic waste decomposes anaerobically producing methane (28x GWP over 100 years). Each kilogram of diverted prepared food avoids roughly 2.60 kg of CO2-equivalent emissions.
              </p>
              <p>
                <strong className="text-slate-900">Embedded Water Footprint:</strong> Global water footprint averages for mixed meal compositions (grains, poultry, produce) estimate approximately 1,350 liters of embedded freshwater per kilogram of food.
              </p>
              <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200">
                Notice: All figures represent modelled environmental offsets based on peer-reviewed environmental life-cycle analysis (LCA) standards.
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowMethodology(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
