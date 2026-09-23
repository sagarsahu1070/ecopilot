import React from 'react';
import { useEcoPilot } from '../context/EcoPilotContext.tsx';
import {
  Sparkles,
  Sun,
  Moon,
  ShieldAlert,
  Leaf,
  RefreshCw,
  Building,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    overview,
    executeRunWorkflow,
    isExecutingRun,
    setCurrentPage,
  } = useEcoPilot();

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/20 bg-slate-950/80 backdrop-blur-md dark:border-emerald-500/10 dark:bg-slate-950/80 light:bg-white/90 light:border-slate-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/40">
              <Leaf className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-black tracking-tight text-white light:text-slate-900">
                  ECO<span className="text-emerald-400">PILOT</span>{' '}
                  <span className="text-amber-400 font-extrabold text-sm sm:text-base">SRM KTR</span>
                </span>
                <span className="hidden sm:inline-flex rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-emerald-400 border border-emerald-500/30">
                  Campus Sustainability
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  DEMO DATA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 light:text-slate-600 hidden xs:block">
                SRM Institute of Science and Technology • Kattankulathur Campus
              </p>
            </div>
          </button>
        </div>

        {/* Center / Status */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 border border-slate-800 text-slate-300 light:bg-slate-100 light:text-slate-700 light:border-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">SRM KTR Command Center Active</span>
            <span className="text-slate-500">|</span>
            <span>Health Score: <strong className="text-white light:text-slate-900">{overview?.overallHealthScore ?? 81}/100</strong></span>
          </div>

          {overview?.activeAlertsCount ? (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{overview.activeAlertsCount} Anomalies Flagged</span>
            </div>
          ) : null}
        </div>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-3">
          {/* Main Action Button */}
          <button
            onClick={executeRunWorkflow}
            disabled={isExecutingRun}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {isExecutingRun ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
            )}
            <span>{isExecutingRun ? 'COORDINATING...' : 'RUN ECOPILOT'}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-colors light:bg-slate-100 light:border-slate-200 light:text-slate-600"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
