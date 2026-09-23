import React from 'react';
import { useEcoPilot } from '../context/EcoPilotContext.tsx';
import {
  Sparkles,
  UtensilsCrossed,
  Zap,
  Droplets,
  Trash2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  ChevronRight,
  Info,
  Building,
  Server,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    overview,
    lastRun,
    lastImpact,
    executeRunWorkflow,
    isExecutingRun,
    setCurrentPage,
    updateActionStatus,
  } = useEcoPilot();

  // Multi-day trend data from real dataset overview
  const trendData = overview?.sevenDayTrends && overview.sevenDayTrends.length > 0
    ? overview.sevenDayTrends
    : [
        { date: '09-17', foodWasteKg: 62, energyKwh: 195, waterLiters: 820 },
        { date: '09-18', foodWasteKg: 54, energyKwh: 180, waterLiters: 790 },
        { date: '09-19', foodWasteKg: 78, energyKwh: 210, waterLiters: 1140 },
        { date: '09-20', foodWasteKg: 49, energyKwh: 175, waterLiters: 930 },
        { date: '09-21', foodWasteKg: 85, energyKwh: 230, waterLiters: 1420 },
        { date: '09-22', foodWasteKg: 92, energyKwh: 245, waterLiters: 1850 },
        { date: '09-23', foodWasteKg: 48, energyKwh: 160, waterLiters: 840 },
      ];

  const campusName = overview?.campusInfo?.shortName || 'SRM KTR';
  const campusFullName = overview?.campusInfo?.name || 'SRM Institute of Science and Technology';
  const campusLocation = overview?.campusInfo?.campus || 'Kattankulathur Campus';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 light:from-white light:via-emerald-50/20 light:to-slate-100 light:border-slate-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ECOPILOT COMMAND CENTER</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400">SRM KTR DEMO TELEMETRY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white light:text-slate-900">
              EcoPilot {campusName}
            </h1>
            <p className="text-sm font-semibold text-emerald-400 light:text-emerald-700">
              AI-Powered Campus Sustainability Manager • {campusFullName} • {campusLocation}
            </p>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-300 light:text-slate-600">
              Autonomous multi-agent intelligence network continuously analyzing simulated campus sustainability data modeled for SRM KTR across food prep buffers, unoccupied room energy draw, plumbing deviations, and waste stream sorting.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-emerald-400 border border-slate-700">
                Detect
              </span>
              <span>→</span>
              <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-teal-400 border border-slate-700">
                Investigate
              </span>
              <span>→</span>
              <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-purple-400 border border-slate-700">
                Decide
              </span>
              <span>→</span>
              <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-amber-400 border border-slate-700">
                Recommend
              </span>
              <span>→</span>
              <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-blue-400 border border-slate-700">
                Measure
              </span>
              <span>→</span>
              <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-emerald-400 border border-slate-700">
                Sustain
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={executeRunWorkflow}
              disabled={isExecutingRun}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-6 py-3.5 text-base font-extrabold text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-5 w-5 text-emerald-100 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{isExecutingRun ? 'ORCHESTRATING AGENTS...' : 'RUN ECOPILOT'}</span>
            </button>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Summary Cards: Food, Energy, Water, Waste */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 🍱 FOOD CARD */}
        <div
          onClick={() => setCurrentPage('food')}
          className="group cursor-pointer rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-slate-900/90 shadow-lg shadow-black/20 light:bg-white light:border-slate-200 light:hover:border-emerald-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                overview?.foodStatus.status === 'ALERT'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {overview?.foodStatus.status ?? 'WARNING'}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-500">
              Food Waste Agent
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white light:text-slate-900">
                {overview?.foodStatus.currentLeftoverRatePercent ?? 14.1}%
              </span>
              <span className="text-xs text-slate-400">leftover rate</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3 text-xs light:border-slate-100">
            <div className="flex items-center justify-between text-slate-400">
              <span>Weekly Surplus</span>
              <strong className="text-slate-200 light:text-slate-700">
                ~{overview?.foodStatus.estimatedSurplusKgWeek ?? 172} kg / wk
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Dining Facility</span>
              <span className="text-amber-400 font-semibold truncate max-w-[120px]">
                Sannasi Mess A
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Potential Savings</span>
              <strong className="text-emerald-400 font-semibold">
                ${overview?.foodStatus.weeklySavingsPotential ?? 548} / wk
              </strong>
            </div>
          </div>
        </div>

        {/* ⚡ ENERGY CARD */}
        <div
          onClick={() => setCurrentPage('energy')}
          className="group cursor-pointer rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-slate-900/90 shadow-lg shadow-black/20 light:bg-white light:border-slate-200 light:hover:border-emerald-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-rose-400 border border-rose-500/30">
              {overview?.energyStatus.status === 'ALERT' ? 'ANOMALY DETECTED' : 'NORMAL'}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-500">
              Energy Waste Agent
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white light:text-slate-900">
                {overview?.energyStatus.anomalousRoomsCount ?? 3} Rooms
              </span>
              <span className="text-xs text-rose-400 font-medium">idle & active</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3 text-xs light:border-slate-100">
            <div className="flex items-center justify-between text-slate-400">
              <span>Daily Wasted Power</span>
              <strong className="text-slate-200 light:text-slate-700">
                {overview?.energyStatus.dailyKwhWaste ?? 310} kWh/day
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Idle Draw</span>
              <strong className="text-rose-400">
                {overview?.energyStatus.unoccupiedPowerWasteKw ?? 21.6} kW
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Monitored Buildings</span>
              <strong className="text-emerald-400 font-semibold truncate max-w-[120px]">
                TP & TP2 Labs
              </strong>
            </div>
          </div>
        </div>

        {/* 💧 WATER CARD */}
        <div
          onClick={() => setCurrentPage('water')}
          className="group cursor-pointer rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-slate-900/90 shadow-lg shadow-black/20 light:bg-white light:border-slate-200 light:hover:border-emerald-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
              <Droplets className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-cyan-400 border border-cyan-500/30">
              {overview?.waterStatus.status === 'ALERT' ? 'OUTLIER FLAGGED' : 'NORMAL'}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-500">
              Water Usage Agent
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white light:text-slate-900">
                +{overview?.waterStatus.campusDeviationPercent ?? 12.8}%
              </span>
              <span className="text-xs text-slate-400">vs baseline</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3 text-xs light:border-slate-100">
            <div className="flex items-center justify-between text-slate-400">
              <span>Unusual Outliers</span>
              <strong className="text-slate-200 light:text-slate-700">1 Facility</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Investigating Zone</span>
              <strong className="text-cyan-400 truncate max-w-[120px]">
                {overview?.waterStatus.highestVarianceBuilding ?? 'Tech Pavilion 2'}
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Excess Flow</span>
              <strong className="text-emerald-400 font-semibold">
                {(((overview?.waterStatus.unexplainedExcessLitersDay ?? 14200) * 7) / 1000).toFixed(0)}k L / wk
              </strong>
            </div>
          </div>
        </div>

        {/* 🗑️ WASTE CARD */}
        <div
          onClick={() => setCurrentPage('waste')}
          className="group cursor-pointer rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-slate-900/90 shadow-lg shadow-black/20 light:bg-white light:border-slate-200 light:hover:border-emerald-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
              <Trash2 className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400 border border-emerald-500/30">
              {overview?.wasteStatus.alertsCount ? 'CONTAMINATION' : 'NORMAL'}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-500">
              General Waste Agent
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white light:text-slate-900">
                {overview?.wasteStatus.diversionRatePercent ?? 46.2}%
              </span>
              <span className="text-xs text-slate-400">
                diversion (target {overview?.wasteStatus.targetDiversionRatePercent ?? 65}%)
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3 text-xs light:border-slate-100">
            <div className="flex items-center justify-between text-slate-400">
              <span>Contamination Rate</span>
              <strong className="text-amber-400">
                {overview?.wasteStatus.contaminationRatePercent ?? 18.4}% (Paper)
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Sorting Engine</span>
              <span className="text-emerald-400 font-semibold">Gemini Vision AI</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Campus Station</span>
              <strong className="text-emerald-400 font-semibold truncate max-w-[120px]">
                Tech Park Hub
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Trend Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                SRM KTR Resource Telemetry & Trends
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500">
                7-day calculated trends across Sannasi Mess surplus (kg), Tech Park energy (kWh), and TP2 water flow (x10 L)
              </p>
            </div>
            <span className="text-[10px] font-mono rounded bg-slate-800 px-2 py-0.5 text-amber-400 border border-slate-700">
              DEMO DATASET
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#10b981',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="foodWasteKg"
                  name="Food Leftover (kg)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFood)"
                />
                <Area
                  type="monotone"
                  dataKey="energyKwh"
                  name="Energy Load (kWh)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnergy)"
                />
                <Area
                  type="monotone"
                  dataKey="waterLiters"
                  name="Water Flow (x10 L)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWater)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projected Impact Snapshot Card */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-md flex flex-col justify-between light:bg-white light:border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Impact Synthesis
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                ESTIMATED
              </span>
            </div>
            <h3 className="text-lg font-black text-white light:text-slate-900">
              Coordinated Potential
            </h3>
            <p className="mt-1 text-xs text-slate-400 light:text-slate-600">
              ESTIMATED monthly projections across SRM KTR operations if agent recommendations are enacted.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 light:bg-emerald-50 light:border-emerald-200">
                <span className="text-[11px] font-semibold text-slate-400 light:text-slate-600">
                  Estimated Monthly Savings
                </span>
                <div className="text-2xl font-black text-emerald-400 light:text-emerald-700">
                  ${lastImpact?.metrics.totalEstimatedCostSavingsMonth.toLocaleString() ?? '3,828'}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 light:bg-slate-50 light:border-slate-200">
                  <span className="text-slate-400">Carbon Avoided</span>
                  <div className="mt-1 text-base font-bold text-teal-300 light:text-teal-700">
                    {( (lastImpact?.metrics.totalCo2eAvoidedKgMonth ?? 3042) / 1000 ).toFixed(2)} MT
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 light:bg-slate-50 light:border-slate-200">
                  <span className="text-slate-400">Trees Equivalent</span>
                  <div className="mt-1 text-base font-bold text-emerald-300 light:text-emerald-700">
                    {lastImpact?.metrics.equivalentTreesPlanted ?? 140} Trees
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 light:border-slate-100">
            <button
              onClick={() => setCurrentPage('impact')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition-colors light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200"
            >
              <span>Explore Impact Methodology</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI ACTION PLAN SECTION */}
      <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-xl light:bg-white light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400 border border-purple-500/30 mb-2">
              <Layers className="h-3.5 w-3.5" />
              <span>AI COORDINATOR DIRECTIVE QUEUE</span>
            </div>
            <h2 className="text-2xl font-black text-white light:text-slate-900">
              AI Action Plan
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-600">
              Prioritized recommendations formulated by the AI Coordinator combining Food, Energy, Water, and Waste findings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('coordinator')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors light:bg-slate-100 light:border-slate-300 light:text-slate-800"
            >
              <span>View Full Coordinator Matrix</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Action items list */}
        <div className="space-y-3.5">
          {lastRun?.prioritizedActionPlan.map((action) => {
            const isApproved = action.status === 'approved' || action.status === 'resolved';
            const isInvestigating = action.status === 'in_investigation';

            return (
              <div
                key={action.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isApproved
                    ? 'border-emerald-500/40 bg-emerald-950/20 light:bg-emerald-50/50 light:border-emerald-200'
                    : isInvestigating
                    ? 'border-cyan-500/40 bg-cyan-950/20 light:bg-cyan-50/50 light:border-cyan-200'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 light:border-slate-200 light:bg-slate-50/60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-xs font-black">
                        {action.priority}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-white light:text-slate-900">
                        {action.title}
                      </h3>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700 light:bg-slate-200 light:text-slate-700 light:border-slate-300">
                        {action.buildingOrArea}
                      </span>
                      <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                        Req: {action.authorityLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 light:text-slate-600">
                      {action.description}
                    </p>

                    <p className="text-[11px] text-emerald-400/90 font-medium">
                      💡 <strong>Reasoning:</strong> {action.reasoning}
                    </p>
                  </div>

                  {/* Right side: Savings & Human Action Status */}
                  <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
                    <div className="text-right text-xs">
                      <span className="text-emerald-400 font-extrabold">
                        +${action.estimatedSavings.costPerWeek}/wk
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {action.estimatedSavings.resourceSaved}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {action.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateActionStatus(action.id, 'in_investigation')}
                            className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                          >
                            Investigate
                          </button>
                          <button
                            onClick={() => updateActionStatus(action.id, 'approved')}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
                          >
                            Approve Action
                          </button>
                        </>
                      )}

                      {action.status === 'in_investigation' && (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-cyan-500/20 px-2.5 py-1 text-[11px] font-bold text-cyan-400 border border-cyan-500/40">
                            🔍 In Investigation
                          </span>
                          <button
                            onClick={() => updateActionStatus(action.id, 'resolved')}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}

                      {action.status === 'approved' && (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/40">
                            ✓ Approved by Lead
                          </span>
                          <button
                            onClick={() => updateActionStatus(action.id, 'resolved')}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            Complete
                          </button>
                        </div>
                      )}

                      {action.status === 'resolved' && (
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-400 border border-slate-700 flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          Resolved & Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safety & Compliance disclaimer */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400 light:bg-slate-50 light:border-slate-200">
          <Info className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Human-in-the-Loop Protocol:</strong> EcoPilot operates strictly in an advisory role. The system does not directly control campus equipment. Human authorization from SRM facilities or dining management is required before any physical intervention is initiated.
          </p>
        </div>
      </div>
    </div>
  );
};
