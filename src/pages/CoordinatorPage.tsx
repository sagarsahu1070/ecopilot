import React, { useState } from 'react';
import { useEcoPilot } from '../context/EcoPilotContext.tsx';
import {
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  Zap,
  Droplets,
  Trash2,
  ChevronRight,
  FileCheck,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export const CoordinatorPage: React.FC = () => {
  const {
    lastRun,
    executeRunWorkflow,
    isExecutingRun,
    updateActionStatus,
    setCurrentPage,
  } = useEcoPilot();

  const [selectedAgentTab, setSelectedAgentTab] = useState<string>('food');

  const agentReports = lastRun?.agentReports || [];
  const activeReport = agentReports.find((r) => r.agentKey === selectedAgentTab) || agentReports[0];

  const getAgentIcon = (key: string) => {
    switch (key) {
      case 'food':
        return UtensilsCrossed;
      case 'energy':
        return Zap;
      case 'water':
        return Droplets;
      case 'waste':
      default:
        return Trash2;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'high':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'medium':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'low':
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <Cpu className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              AGENT 5 OF 6 • CENTRAL ORCHESTRATOR
            </span>
            <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/20">
              MULTI-AGENT SYNTHESIS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            AI Coordinator Agent Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Ingests reports from Food, Energy, Water, and Waste agents, resolves cross-domain priority conflicts, and generates an executive prioritized action plan.
          </p>
        </div>

        <button
          onClick={executeRunWorkflow}
          disabled={isExecutingRun}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>{isExecutingRun ? 'COORDINATING...' : 'TRIGGER RE-COORDINATION'}</span>
        </button>
      </div>

      {/* Synthesis Overview & Strategic Reasoning Card */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30 p-6 sm:p-8 backdrop-blur-md shadow-2xl light:bg-white light:border-purple-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white light:text-slate-900">
                Central Synthesis & Prioritization Reasoning
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Run ID: <code className="text-purple-300">{lastRun?.runId || 'eco-run-latest'}</code> • Timestamp: {lastRun?.timestamp ? new Date(lastRun.timestamp).toLocaleTimeString() : 'Recent'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/20">
              {lastRun?.criticalIssuesIdentified ?? 3} Critical Issues
            </span>
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20">
              {lastRun?.investigationRequiredCount ?? 2} Require Investigation
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              1. Combined Situation Overview
            </span>
            <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800 light:bg-slate-50 light:border-slate-200">
              {lastRun?.situationOverview ||
                'Cross-agent synthesis identified 7 high-priority opportunities across 4 domains. Primary concerns center around TP2 off-peak utilities (both energy and water surges) and kitchen prep overshooting rainy-day demand.'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              2. Tradeoff & Prioritization Rationale
            </span>
            <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800 light:bg-slate-50 light:border-slate-200">
              {lastRun?.synthesisReasoning ||
                'The Coordinator prioritized Food prep and TP2 water inspection as immediate ROI targets. Food waste yields the fastest operational savings ($550/wk) with zero capital expenditure, while TP2 water anomaly prevents potential structural flooding or mechanical equipment damage.'}
            </p>
          </div>
        </div>
      </div>

      {/* Agent Reports Matrix (Tabs & Inspector) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-white light:text-slate-900">
              Incoming Specialized Agent Reports
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Structured findings received by the AI Coordinator prior to action plan generation
            </p>
          </div>

          {/* Agent Switcher Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 light:bg-slate-100 light:border-slate-200">
            {agentReports.map((report) => {
              const Icon = getAgentIcon(report.agentKey);
              const isActive = selectedAgentTab === report.agentKey;
              return (
                <button
                  key={report.agentKey}
                  onClick={() => setSelectedAgentTab(report.agentKey)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{report.agentName.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Report Inspector */}
        {activeReport ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4 light:bg-slate-50 light:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-white light:text-slate-900">
                    {activeReport.agentName}
                  </h4>
                  <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
                    {activeReport.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-bold uppercase border ${getSeverityBadge(
                      activeReport.severity
                    )}`}
                  >
                    Severity: {activeReport.severity}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-bold text-emerald-400 border border-emerald-500/20">
                    Confidence: {activeReport.confidence}%
                  </span>
                </div>
              </div>

              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-3 light:border-slate-200">
                {Object.entries(activeReport.metricsSummary).map(([key, val]) => (
                  <div key={key} className="rounded-xl bg-slate-900/60 p-2.5 border border-slate-800/60 light:bg-white light:border-slate-200">
                    <span className="text-[10px] text-slate-400 truncate block">{key}</span>
                    <strong className="text-xs text-white light:text-slate-900 block mt-0.5 font-mono">
                      {val}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Findings breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Agent Specific Findings ({activeReport.findings.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeReport.findings.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-2 light:bg-white light:border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-white light:text-slate-900">
                        {f.title}
                      </h5>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono text-slate-300">
                        {f.location}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 light:text-slate-600">
                      {f.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1 light:border-slate-100">
                      <div className="text-emerald-400 font-semibold">
                        Impact: {f.potentialImpact}
                      </div>
                      <div className="text-purple-300 light:text-purple-700">
                        Action: {f.recommendedAction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Plan Queue & Status Triage */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-400" />
              Prioritized Action Directives
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Ranked 1 to 5 by ROI, mechanical urgency, and implementation complexity
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {lastRun?.prioritizedActionPlan.map((action) => (
            <div
              key={action.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 light:bg-slate-50 light:border-slate-200"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white text-xs font-black flex-shrink-0 mt-0.5">
                  {action.priority}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-white light:text-slate-900">
                      {action.title}
                    </h4>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] text-slate-300 light:bg-slate-200 light:text-slate-700">
                      {action.buildingOrArea}
                    </span>
                    <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[9px] text-purple-300 border border-purple-500/20">
                      Authority: {action.authorityLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 light:text-slate-600 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <div className="text-right text-xs">
                  <span className="text-emerald-400 font-extrabold">
                    +${action.estimatedSavings.costPerWeek}/wk
                  </span>
                </div>

                {action.status === 'pending' ? (
                  <button
                    onClick={() => updateActionStatus(action.id, 'approved')}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    Authorize
                  </button>
                ) : (
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    {action.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
