import React, { useState, useEffect } from 'react';
import { WaterMeterRecord } from '../types/index.ts';
import { fetchWaterData } from '../services/api.ts';
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Wrench,
  Search,
  Filter,
  Waves,
  ShieldAlert,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

export const WaterPage: React.FC = () => {
  const [records, setRecords] = useState<WaterMeterRecord[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('Tech Pavilion 2 (TP2)');
  const [loading, setLoading] = useState(true);
  const [inspectionStatus, setInspectionStatus] = useState<Record<string, string>>({
    'Tech Pavilion 2 (TP2)': 'Dispatched facilities team with ultrasonic meter probe',
  });

  useEffect(() => {
    fetchWaterData()
      .then((res) => {
        setRecords(res.records);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const buildings = Array.from(new Set(records.map((r) => r.building)));

  const buildingRecords = records
    .filter((r) => r.building === selectedBuilding)
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartData = buildingRecords.map((r) => ({
    date: r.date.slice(5),
    consumptionL: r.waterConsumptionLiters,
    baselineL: r.baselineExpectedLiters,
    isAnomaly: r.isAnomaly,
    potentialCause: r.potentialCause,
  }));

  const recentAnomaly = buildingRecords.find((r) => r.isAnomaly);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Droplets className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              AGENT 3 OF 6
            </span>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/20">
              SRM KTR DEMO TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Water Usage & Flow Deviation Agent
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Calculates 30-day baseline consumption, identifies statistical variance, and categorizes plausible operational causes without premature leak assumptions. Simulated campus sustainability data modeled for SRM KTR.
          </p>
        </div>

        {/* Building Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Campus Zone:</label>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="rounded-xl border border-cyan-500/30 bg-slate-950 px-3.5 py-2 text-xs font-bold text-cyan-300 focus:outline-none light:bg-white light:text-slate-900 light:border-slate-300"
          >
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Explanatory Protocol Note */}
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 sm:p-5 backdrop-blur-md light:bg-cyan-50/60 light:border-cyan-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-slate-300 light:text-slate-700">
            <h4 className="font-bold text-white light:text-slate-900 text-sm">
              Non-Deterministic Anomaly Classification Protocol
            </h4>
            <p>
              The Water Agent intentionally evaluates multiple potential causes before triggering physical work orders:
              <strong> Increased occupancy</strong>, <strong>Grounds irrigation cycles</strong>, <strong>Sensor calibration drift</strong>, or <strong>Suspected plumbing failure</strong>.
              It does not diagnose an anomaly as a leak without empirical multi-sensor triangulation.
            </p>
          </div>
        </div>
      </div>

      {/* Daily Consumption Chart vs Baseline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white light:text-slate-900">
              {selectedBuilding} - Daily Water Consumption vs Baseline
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Flow measured in Liters / 24hr cycle against historical baseline
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Measured Flow
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-500" /> Baseline Expectation
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k L`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#06b6d4',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} Liters`, 'Flow']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="consumptionL"
                name="Actual Inflow (Liters)"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#06b6d4', strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="baselineL"
                name="Baseline Expected (Liters)"
                stroke="#64748b"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Investigation Card & Plausible Explanation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Anomaly Diagnosis */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2">
              <Search className="h-4 w-4 text-cyan-400" />
              Active Anomaly Investigation Dossier
            </h3>
            {recentAnomaly ? (
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                DEVIATION DETECTED
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                WITHIN BASELINE
              </span>
            )}
          </div>

          {recentAnomaly ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-cyan-500/20 bg-slate-950/60 p-4 text-xs space-y-2 light:bg-slate-50 light:border-cyan-100">
                <div className="flex items-center justify-between font-bold text-sm text-cyan-400">
                  <span>Statistical Variance: +58.2%</span>
                  <span>Confidence: {recentAnomaly.confidence}%</span>
                </div>
                <p className="text-slate-300 light:text-slate-600">
                  Sustained inflow of 620 L/hr detected between 01:00 and 05:00 when building occupancy registered zero. Deviation exceeds 3.2 standard deviations above historical 30-day baseline.
                </p>
              </div>

              {/* 4 Plausible Causes */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Candidate Explanations Evaluated by Agent:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    className={`rounded-xl border p-3 ${
                      recentAnomaly.potentialCause === 'possible plumbing issue'
                        ? 'border-rose-500/50 bg-rose-950/20 text-rose-300 light:bg-rose-50 light:text-rose-800'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center justify-between">
                      <span>Plumbing Issue</span>
                      <span className="text-[10px]">Rank 1 (68%)</span>
                    </div>
                    <p className="text-[11px]">
                      Pressure-relief bypass or continuously running flush valve in 2nd-floor restrooms.
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-3 ${
                      recentAnomaly.potentialCause === 'irrigation'
                        ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center justify-between">
                      <span>Irrigation Schedule</span>
                      <span className="text-[10px]">Rank 2 (20%)</span>
                    </div>
                    <p className="text-[11px]">
                      Exterior landscaping solenoid stuck open during nocturnal irrigation sequence.
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-3 ${
                      recentAnomaly.potentialCause === 'increased occupancy'
                        ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center justify-between">
                      <span>Event Occupancy</span>
                      <span className="text-[10px]">Rank 3 (8%)</span>
                    </div>
                    <p className="text-[11px]">
                      Unscheduled hackathon or laboratory overnight cleaning crew consumption.
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-3 ${
                      recentAnomaly.potentialCause === 'measurement anomaly'
                        ? 'border-amber-500/50 bg-amber-950/20 text-amber-300'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center justify-between">
                      <span>Telemetry Drift</span>
                      <span className="text-[10px]">Rank 4 (4%)</span>
                    </div>
                    <p className="text-[11px]">
                      Pulse-meter encoder intermittent glitch or power transient on data logger.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs space-y-2 light:bg-cyan-50 light:border-cyan-200">
                <span className="font-bold text-cyan-400 light:text-cyan-800 flex items-center gap-1.5">
                  <Wrench className="h-4 w-4" /> Recommended Human Investigation Directive:
                </span>
                <p className="text-slate-300 light:text-slate-700">
                  "Issue facility work order for non-destructive acoustic / ultrasonic sweep of TP2 mechanical utility risers and cooling tower makeup line before concluding pipe failure."
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Flow telemetry in this sector is tracking within standard statistical boundaries.
            </div>
          )}
        </div>

        {/* Right: Inspection Log and Staff Verification */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between light:bg-white light:border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-white light:text-slate-900 mb-2">
              Facilities Work Order Dispatch
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Authorized facility leads log inspections and verify physical root causes
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Investigation Status for {selectedBuilding}
                </label>
                <div className="mt-1.5 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 font-mono light:bg-slate-50 light:text-slate-800 light:border-slate-200">
                  {inspectionStatus[selectedBuilding] || 'No active work order dispatched.'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-2 light:bg-slate-50 light:border-slate-200">
                <span className="font-bold text-slate-300 light:text-slate-800">
                  Weekly Impact if Resolved:
                </span>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Saved Water Volume:</span>
                  <strong className="text-cyan-400 font-bold">58,800 Liters / wk</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Utility Bill Surcharge Savings:</span>
                  <strong className="text-emerald-400 font-bold">$205 / week</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Structural Water Damage Risk:</span>
                  <strong className="text-teal-300 font-bold">Mitigated</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 light:border-slate-200 flex gap-2">
            <button
              onClick={() => {
                setInspectionStatus((prev) => ({
                  ...prev,
                  [selectedBuilding]: 'Facilities technician inspection verified: cooling tower float valve recalibrated.',
                }));
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <Wrench className="h-4 w-4" />
              <span>Log Physical Inspection Complete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
