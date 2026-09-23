import React, { useState } from 'react';
import { useEcoPilot } from '../context/EcoPilotContext.tsx';
import {
  FileText,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Share2,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { overview, lastRun, lastImpact } = useEcoPilot();
  const [reportType, setReportType] = useState<'executive' | 'technical' | 'audit'>('executive');
  const [reportPeriod, setReportPeriod] = useState<string>('current-month');

  const handlePrint = () => {
    window.print();
  };

  const campusName = overview?.campusInfo?.shortName || 'SRM KTR';
  const campusFullName = overview?.campusInfo?.name || 'SRM Institute of Science and Technology';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              EXECUTIVE INTELLIGENCE • {campusName}
            </span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">
              AUDIT READY
            </span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
              DEMO DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Sustainability Audit & Executive Digest
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Synthesized multi-agent reports formatted for {campusFullName}, Kattankulathur Campus leadership.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer light:bg-white light:border-slate-300 light:text-slate-800"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Customization Filters */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 light:bg-white light:border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Report Format
            </label>
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 light:bg-slate-100 light:border-slate-200">
              <button
                onClick={() => setReportType('executive')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  reportType === 'executive' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Executive Digest
              </button>
              <button
                onClick={() => setReportType('technical')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  reportType === 'technical' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Technical Log
              </button>
              <button
                onClick={() => setReportType('audit')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  reportType === 'audit' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                ESG Compliance Audit
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Timeframe
            </label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 light:bg-slate-50 light:text-slate-800 light:border-slate-200"
            >
              <option value="current-month">Current Month (Fall 2026)</option>
              <option value="q3">Q3 2026 Academic Quarter</option>
              <option value="annual">2025-2026 Annual Audit</option>
            </select>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400">
          Generated: <strong className="text-white light:text-slate-900 font-mono">{new Date().toLocaleDateString()}</strong>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 sm:p-10 shadow-2xl space-y-8 light:bg-white light:border-slate-300 light:shadow-md">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white light:text-slate-900">
                ECO<span className="text-emerald-400">PILOT</span>{' '}
                <span className="text-amber-400">{campusName}</span>
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                Official Digest
              </span>
            </div>
            <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
              {campusFullName} • Kattankulathur Campus Facilities & Sustainability Administration
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <div className="font-mono text-slate-400">Audit Ref: SRM-KTR-ECO-2026</div>
            <div className="text-emerald-400 font-bold">Health Score: {overview?.overallHealthScore ?? 81}/100</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400">
            1. Executive Synthesis & Risk Assessment
          </h2>
          <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 light:bg-slate-50 light:border-slate-200">
            {lastRun?.situationOverview ||
              'EcoPilot autonomous monitoring across SRM KTR campus domains flagged 3 operational anomalies. Focal points include Tech Pavilion 2 off-peak flow variance (+24.6%) and idle HVAC loads in Tech Park Lab 304. Sannasi Mess food preparation recalibration offers zero-capital immediate savings.'}
          </p>
        </div>

        {/* Section 2: Macro Metrics Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400">
            2. Key Performance Indicators & ESTIMATED Projections
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 light:bg-slate-50 light:border-slate-200">
              <span className="text-slate-400 block text-[11px]">Monthly Cost Savings</span>
              <div className="text-xl font-extrabold text-white light:text-slate-900 mt-1">
                ${lastImpact?.metrics.totalEstimatedCostSavingsMonth.toLocaleString() ?? '3,828'}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">ESTIMATED Model Projection</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 light:bg-slate-50 light:border-slate-200">
              <span className="text-slate-400 block text-[11px]">Carbon Offset</span>
              <div className="text-xl font-extrabold text-teal-300 light:text-teal-700 mt-1">
                {( (lastImpact?.metrics.totalCo2eAvoidedKgMonth ?? 3042) / 1000 ).toFixed(2)} MT CO₂e
              </div>
              <span className="text-[10px] text-teal-400 font-semibold">Avoided emissions / mo</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 light:bg-slate-50 light:border-slate-200">
              <span className="text-slate-400 block text-[11px]">Food Waste Leftovers</span>
              <div className="text-xl font-extrabold text-amber-300 light:text-amber-700 mt-1">
                {overview?.foodStatus.currentLeftoverRatePercent ?? 14.1}%
              </div>
              <span className="text-[10px] text-amber-400 font-semibold">Target: 7.5%</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 light:bg-slate-50 light:border-slate-200">
              <span className="text-slate-400 block text-[11px]">Waste Diversion</span>
              <div className="text-xl font-extrabold text-emerald-300 light:text-emerald-700 mt-1">
                {overview?.wasteStatus.diversionRatePercent ?? 46.2}%
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Target: 65%</span>
            </div>
          </div>
        </div>

        {/* Section 3: Prioritized Action Plan */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400">
            3. Prioritized Multi-Agent Directives Queue
          </h2>

          <div className="space-y-2 text-xs">
            {lastRun?.prioritizedActionPlan.map((action) => (
              <div
                key={action.id}
                className="flex items-start justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/40 light:bg-slate-50 light:border-slate-200"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                      {action.priority}
                    </span>
                    <strong className="text-white light:text-slate-900 text-xs sm:text-sm">
                      {action.title}
                    </strong>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-700">
                      {action.buildingOrArea}
                    </span>
                  </div>
                  <p className="text-slate-300 light:text-slate-600 text-[11px]">
                    {action.description}
                  </p>
                </div>

                <div className="text-right text-[11px]">
                  <span className="text-emerald-400 font-bold">+${action.estimatedSavings.costPerWeek}/wk</span>
                  <div className="text-slate-500">{action.status.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign-off & Policy Notice */}
        <div className="border-t border-slate-800 pt-6 light:border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
          <div>
            <span className="font-bold text-slate-300 light:text-slate-700 block mb-1">Human Authorization Governance</span>
            <p className="text-[11px]">
              All recommended physical actions require explicit sign-off from designated SRMIST building managers or dining wardens before BMS schedules or inventory adjustments are enacted.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-300 light:text-slate-700 block mb-1">Data Provenance</span>
            <p className="text-[11px]">
              All operational records used in this prototype digest are SRM KTR DEMO TELEMETRY (Simulated campus sustainability data modeled for SRM KTR) clearly labeled <code className="text-amber-400 font-mono">DEMO DATA</code>. The application does not claim live unverified campus telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
