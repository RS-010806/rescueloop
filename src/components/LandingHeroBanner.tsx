import React from 'react';
import { Sparkles, HeartHandshake, Quote, ArrowRight, CheckCircle2, RotateCcw, UtensilsCrossed } from 'lucide-react';
import { ALTERNATIVE_SCENARIOS, COMMUNITY_KITCHEN_HERO_IMAGE, FRESH_MEAL_PREP_IMAGE } from '../data/demoScenario.ts';
import type { IncidentData } from '../types/rescue.ts';

interface LandingHeroBannerProps {
  onRunDemo: () => void;
  onSelectScenario: (incident: IncidentData) => void;
  isRunning: boolean;
  activeScenarioId: string;
  isCustomMode: boolean;
  onToggleCustomMode: (isCustom: boolean) => void;
}

export const LandingHeroBanner: React.FC<LandingHeroBannerProps> = ({
  onRunDemo,
  onSelectScenario,
  isRunning,
  activeScenarioId,
  isCustomMode,
  onToggleCustomMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Visual Story Card */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-6 lg:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Explanatory Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/90 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>RescueLoop AI Coordination Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Turn banquet surplus into fresh, dignified meals for community shelters.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              When college galas, conference buffets, or hotel banquet services finish, wholesome food often ends up in dumpsters.
              RescueLoop AI inspects your food photo, validates core thermal records, matches local shelter capacities, and dispatches a verified redistribution route in seconds.
            </p>

            {/* Inspiring quote */}
            <div className="rounded-2xl bg-white/95 border border-emerald-100 p-4 flex items-start gap-3.5 shadow-xs">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 shrink-0">
                <Quote className="h-4 w-4" />
              </div>
              <div className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "Surplus food is not waste. It is dinner for 120 community neighbors tonight. In under ten minutes, RescueLoop audited our gala bento boxes and paired two downtown shelters with exact portion counts."
                <div className="text-xs font-bold text-slate-900 not-italic mt-1.5 flex items-center gap-2">
                  <span>Dr. Elena Rostova</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 font-normal">Campus Food Safety Coordinator</span>
                </div>
              </div>
            </div>

            {/* 3 Step Visual Pipeline Explanation */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-2xl bg-white border border-slate-200/90 p-3 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">Step 1</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-xs font-bold text-slate-900">Snap & Log</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Photo, portion count & internal temp</div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/90 p-3 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">Step 2</span>
                  <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                </div>
                <div className="text-xs font-bold text-slate-900">5-Agent Audit</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Safety check & shelter capacity match</div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/90 p-3 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">Step 3</span>
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                </div>
                <div className="text-xs font-bold text-slate-900">Route & Deliver</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Turn-by-turn route & courier dispatch</div>
              </div>
            </div>
          </div>

          {/* Right Visual Feature Cards */}
          <div className="lg:col-span-5 space-y-3">
            {/* Visual Photo Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-md border border-slate-200 aspect-[4/3] group bg-slate-100">
              <img
                src={COMMUNITY_KITCHEN_HERO_IMAGE}
                alt="Community volunteers preparing fresh meal boxes"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-4">
                <div className="text-white">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    <HeartHandshake className="h-3.5 w-3.5" />
                    <span>Real-World Impact</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Downtown Community Kitchen Volunteers
                  </div>
                  <div className="text-xs text-slate-200 font-medium">
                    120 hot meals received and distributed tonight
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              onClick={onRunDemo}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
              id="hero-run-demo-btn"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Executing 5-Agent Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run Live Demonstration Now</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher Banner: Sample Demo vs Custom Data */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
            Choose Your Operational Mode
          </span>
          <div className="text-sm font-bold text-slate-900">
            {isCustomMode
              ? 'Custom Mode: Upload your surplus food photo and fill in event details.'
              : 'Sample Preset: 120 freshly prepped grilled chicken & quinoa bento boxes.'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {isCustomMode
              ? 'Every field has an info icon to guide you through HACCP and shelter requirements.'
              : 'Includes verified thermal storage records at 62.8°C and authorized safety clearance.'}
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => onToggleCustomMode(false)}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isCustomMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ Sample Preset
          </button>
          <button
            type="button"
            onClick={() => onToggleCustomMode(true)}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isCustomMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✍️ Enter Custom Food
          </button>
        </div>
      </div>
    </div>
  );
};
