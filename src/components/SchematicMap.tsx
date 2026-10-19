import React, { useState } from 'react';
import { Truck, MapPin, Navigation, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import type { LogisticsAgentOutput, RecipientOrg, IncidentData } from '../types/rescue.ts';

interface SchematicMapProps {
  incident: IncidentData;
  logistics: LogisticsAgentOutput | null;
  recipients: RecipientOrg[];
}

export const SchematicMap: React.FC<SchematicMapProps> = ({
  incident,
  logistics,
  recipients,
}) => {
  const [activeStop, setActiveStop] = useState<number | null>(null);

  const allocatedStops = logistics?.allocations || [];

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 lg:p-7 shadow-sm flex flex-col space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              4
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              Logistics Route & Courier Sequence
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sequential delivery stops organized to minimize transit time and temperature loss.
          </p>
        </div>

        {allocatedStops.length > 0 && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600" />
            <span>
              {allocatedStops.length} Courier Stops · {logistics?.totalAllocatedPortions} Servings Total
            </span>
          </span>
        )}
      </div>

      {/* Schematic SVG Corridor with Light Stitch Palette */}
      <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 overflow-hidden">
        <div className="w-full overflow-x-auto py-2">
          <svg
            viewBox="0 0 760 190"
            className="w-full min-w-[620px] h-44 select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Road Corridor */}
            <path
              d="M 60 95 C 200 95, 260 95, 380 95 C 480 95, 540 95, 700 95"
              stroke="#cbd5e1"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 60 95 C 200 95, 260 95, 380 95 C 480 95, 540 95, 700 95"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="8 8"
              strokeLinecap="round"
              fill="none"
              className="animate-pulse"
            />

            {/* Origin Node (Pickup Dock) */}
            <g transform="translate(70, 95)">
              <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
              <text x="0" y="4" textAnchor="middle" fill="#047857" fontSize="11" fontWeight="bold">
                PICKUP
              </text>
              <text x="0" y="38" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">
                Donor Loading Dock
              </text>
              <text x="0" y="52" textAnchor="middle" fill="#64748b" fontSize="10">
                120 Bento Boxes
              </text>
            </g>

            {/* Stop 1: Hope Community Kitchen */}
            <g transform="translate(380, 95)">
              <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
              <text x="0" y="4" textAnchor="middle" fill="#1d4ed8" fontSize="11" fontWeight="bold">
                STOP 1
              </text>
              <text x="0" y="38" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">
                Hope Community Kitchen
              </text>
              <text x="0" y="52" textAnchor="middle" fill="#64748b" fontSize="10">
                70 Portions · 2.3 km
              </text>
            </g>

            {/* Stop 2: St. Jude Family Shelter */}
            <g transform="translate(680, 95)">
              <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
              <text x="0" y="4" textAnchor="middle" fill="#b45309" fontSize="11" fontWeight="bold">
                STOP 2
              </text>
              <text x="0" y="38" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">
                St. Jude Family Shelter
              </text>
              <text x="0" y="52" textAnchor="middle" fill="#64748b" fontSize="10">
                50 Portions · 4.8 km
              </text>
            </g>
          </svg>
        </div>

        {/* Courier ETA Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">Estimated Total Transit: 18 minutes (7.1 km)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Thermal Cambro preservation valid for 4 hours</span>
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Delivery Manifest */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Pickup & Drop-off Sequence
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold shrink-0">
              A
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Pickup: {incident.locationAddress || 'University Hall Catering Dock B'}
              </div>
              <div className="text-slate-500 text-[11px]">
                Collect {logistics?.totalAllocatedPortions || 120} portions in insulated containers
              </div>
            </div>
          </div>
          <span className="text-emerald-700 font-bold">Origin (0.0 km)</span>
        </div>

        {allocatedStops.map((stop, i) => {
          const rec = recipients.find((r) => r.id === stop.recipientId);
          return (
            <div
              key={stop.recipientId}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800 font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{rec?.name || stop.recipientName}</div>
                  <div className="text-slate-500 text-[11px]">
                    Unload {stop.allocatedPortions} meal portions · {rec?.operatingHours}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{rec?.distanceKm} km</span>
                <div className="text-[10px] text-slate-500">Stop {i + 1}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
