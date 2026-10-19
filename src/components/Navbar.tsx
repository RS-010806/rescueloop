import React from 'react';
import { ShieldCheck, Play, RotateCcw, HeartHandshake } from 'lucide-react';

interface NavbarProps {
  isSimulatedData: boolean;
  onToggleDataMode: (simulated: boolean) => void;
  onRunDemo: () => void;
  onReset: () => void;
  isRunning: boolean;
  status: string;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSimulatedData,
  onToggleDataMode,
  onRunDemo,
  onReset,
  isRunning,
  status,
  activeTab,
  onSelectTab,
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'intake', label: 'Surplus Intake' },
    { id: 'pipeline', label: '5-Agent Pipeline' },
    { id: 'route', label: 'Shelters & Route' },
    { id: 'impact', label: 'Impact Ledger' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 lg:px-8 py-3.5 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-xs">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900">RescueLoop AI</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800">
                Community Food Rescue
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Redirecting high-quality surplus meals to local shelters
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onReset}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-xs disabled:opacity-50"
            title="Reset to default demo"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onRunDemo}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-4.5 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50"
            id="nav-run-demo-btn"
          >
            {isRunning ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Live Demo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
