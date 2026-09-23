import React from 'react';
import { useEcoPilot } from '../context/EcoPilotContext.tsx';
import {
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  UtensilsCrossed,
  Zap,
  Droplets,
  Trash2,
  Cpu,
  BarChart3,
  FileCheck,
  Terminal,
} from 'lucide-react';

interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageConfig[] = [
  { id: 0, name: 'Data Collection', subtitle: 'Ingesting IoT feeds, dining tallies & meters', icon: Database },
  { id: 1, name: 'Food Agent', subtitle: 'Analyzing meal prep vs student turnout history', icon: UtensilsCrossed },
  { id: 2, name: 'Energy Agent', subtitle: 'Detecting empty cooling & lighting anomalies', icon: Zap },
  { id: 3, name: 'Water Agent', subtitle: 'Benchmarking 3-sigma off-peak baseline deviations', icon: Droplets },
  { id: 4, name: 'Waste Agent', subtitle: 'Evaluating recycling stream contamination & triage', icon: Trash2 },
  { id: 5, name: 'AI Coordinator', subtitle: 'Synthesizing cross-domain conflicts & prioritization', icon: Cpu },
  { id: 6, name: 'Impact Analysis', subtitle: 'Calculating financial ROI & carbon offset metrics', icon: BarChart3 },
  { id: 7, name: 'Action Plan Ready', subtitle: 'Deploying human-in-the-loop task directives', icon: FileCheck },
];

export const RunEcoPilotModal: React.FC = () => {
  const {
    isRunModalOpen,
    setIsRunModalOpen,
    isExecutingRun,
    activeExecutionStage,
    stageLogs,
    lastRun,
    lastImpact,
    setCurrentPage,
  } = useEcoPilot();

  if (!isRunModalOpen) return null;

  const isComplete = activeExecutionStage >= 7 && !isExecutingRun;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950 p-6 shadow-2xl shadow-emerald-500/20 flex flex-col text-slate-100 light:bg-white light:text-slate-900 light:border-emerald-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                EcoPilot Multi-Agent Orchestrator
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Autonomous coordination pipeline executing real cross-agent analysis
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRunModalOpen(false)}
            disabled={isExecutingRun}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-30 light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Timeline + Terminal Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 overflow-y-auto pr-1">
          {/* Timeline column */}
          <div className="lg:col-span-7 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-500 mb-2">
              Execution Timeline (Detect → Decide → Act)
            </h3>

            <div className="space-y-2">
              {STAGES.map((stg) => {
                const Icon = stg.icon;
                const isRunning = isExecutingRun && activeExecutionStage === stg.id;
                const isCompleted = activeExecutionStage > stg.id || isComplete;
                const isWaiting = activeExecutionStage < stg.id;

                let statusBadge = (
                  <span className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700">
                    <Clock className="h-3 w-3" /> WAITING
                  </span>
                );

                if (isRunning) {
                  statusBadge = (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      RUNNING
                    </span>
                  );
                } else if (isCompleted) {
                  statusBadge = (
                    <span className="flex items-center gap-1 rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      COMPLETED
                    </span>
                  );
                }

                return (
                  <div
                    key={stg.id}
                    className={`flex items-center justify-between rounded-xl p-3 border transition-all ${
                      isRunning
                        ? 'border-emerald-500/60 bg-emerald-950/20 shadow-sm shadow-emerald-500/20 light:bg-emerald-50/50'
                        : isCompleted
                        ? 'border-slate-800 bg-slate-900/40 light:border-slate-200 light:bg-slate-50/80'
                        : 'border-slate-800/60 bg-slate-900/10 opacity-60 light:border-slate-100 light:bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                          isRunning
                            ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                            : isCompleted
                            ? 'border-emerald-500/40 bg-emerald-950 text-emerald-400 light:bg-emerald-100'
                            : 'border-slate-800 bg-slate-900 text-slate-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 light:text-slate-800">
                            {stg.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 light:text-slate-500">
                          {stg.subtitle}
                        </p>
                      </div>
                    </div>

                    <div>{statusBadge}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Agent Log Console */}
          <div className="lg:col-span-5 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-500 mb-2 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              Agent Telemetry & Decision Log
            </h3>
            <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-emerald-300/90 overflow-y-auto max-h-[360px] space-y-1.5 shadow-inner light:bg-slate-900 light:border-slate-800">
              {stageLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span
                    className={
                      log.startsWith('SUCCESS')
                        ? 'text-emerald-400 font-bold'
                        : log.startsWith('ERROR')
                        ? 'text-rose-400 font-bold'
                        : log.includes('COORDINATOR')
                        ? 'text-purple-300 font-semibold'
                        : 'text-slate-300'
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
              {isExecutingRun && (
                <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                  <span className="text-slate-600">&gt;</span>
                  <span>Agent thread executing mathematical inference...</span>
                </div>
              )}
            </div>

            {/* Completion quick stats */}
            {isComplete && lastImpact && (
              <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-2 light:bg-emerald-50 light:border-emerald-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 light:text-emerald-700">
                    Projected Monthly Savings
                  </span>
                  <span className="font-extrabold text-white light:text-slate-900 text-sm">
                    ${lastImpact.metrics.totalEstimatedCostSavingsMonth.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 light:text-emerald-700">
                    Carbon Offset Potential
                  </span>
                  <span className="font-extrabold text-white light:text-slate-900 text-sm">
                    {(lastImpact.metrics.totalCo2eAvoidedKgMonth / 1000).toFixed(2)} MT CO₂e
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 light:text-emerald-700">
                    Priority Action Items
                  </span>
                  <span className="font-extrabold text-white light:text-slate-900 text-sm">
                    {lastRun?.prioritizedActionPlan.length || 5} Directives Generated
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 light:border-slate-200">
          <p className="text-[11px] text-slate-500">
            *Simulated campus sustainability data modeled for SRM KTR (DEMO DATA). Human authorization required before physical campus adjustments.
          </p>

          <div className="flex items-center gap-3">
            {isComplete ? (
              <>
                <button
                  onClick={() => {
                    setIsRunModalOpen(false);
                    setCurrentPage('coordinator');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  <span>View Coordinator Matrix</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsRunModalOpen(false)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  Done
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsRunModalOpen(false)}
                disabled={isExecutingRun}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
