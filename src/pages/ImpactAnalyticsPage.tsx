import React from 'react';
import { useEcoPilot } from '../context/EcoPilotContext.tsx';
import {
  BarChart3,
  DollarSign,
  Leaf,
  TreePine,
  Droplets,
  Zap,
  UtensilsCrossed,
  Trash2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

export const ImpactAnalyticsPage: React.FC = () => {
  const { lastImpact, lastRun } = useEcoPilot();

  const metrics = lastImpact?.metrics || {
    estimatedFoodWasteReductionKg: 340,
    estimatedFoodCostSavings: 1445,
    estimatedFoodCo2AvoidedKg: 850,

    estimatedEnergySavingsKwh: 3640,
    estimatedEnergyCostSavings: 509,
    estimatedEnergyCo2AvoidedKg: 1528,

    estimatedWaterSavingsLiters: 235200,
    estimatedWaterCostSavings: 823,
    estimatedWaterCo2AvoidedKg: 82,

    estimatedDiversionRatePercent: 58.5,
    estimatedWasteCostSavings: 296,

    totalEstimatedCostSavingsMonth: 3073,
    totalCo2eAvoidedKgMonth: 2460,
    equivalentTreesPlanted: 113,
  };

  const assumptions = lastImpact?.assumptions || {
    currencySymbol: '$',
    foodWasteCostPerKg: 4.25,
    energyCostPerKwh: 0.14,
    waterCostPerLiter: 0.0035,
    carbonIntensityGridKwhKg: 0.42,
    carbonIntensityFoodWasteKg: 2.5,
    carbonIntensityWaterM3Kg: 0.35,
  };

  const costBreakdownData = [
    { name: 'Food Prep Optimization', value: metrics.estimatedFoodCostSavings, color: '#f59e0b' },
    { name: 'Water Flow Anomaly Fix', value: metrics.estimatedWaterCostSavings, color: '#06b6d4' },
    { name: 'HVAC / Idle Power Setback', value: metrics.estimatedEnergyCostSavings, color: '#f43f5e' },
    { name: 'Recycling Tipping Rebate', value: metrics.estimatedWasteCostSavings, color: '#10b981' },
  ];

  const carbonBreakdownData = [
    { name: 'Energy (Grid Offset)', kgCo2e: metrics.estimatedEnergyCo2AvoidedKg, fill: '#f43f5e' },
    { name: 'Food (Methane Avoidance)', kgCo2e: metrics.estimatedFoodCo2AvoidedKg, fill: '#f59e0b' },
    { name: 'Water (Pumping/Sewage)', kgCo2e: metrics.estimatedWaterCo2AvoidedKg, fill: '#06b6d4' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              AGENT 6 OF 6
            </span>
            <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-teal-300 border border-teal-500/20">
              ESTIMATED PROJECTIONS
            </span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300 border border-amber-500/30">
              DEMO DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Impact Analysis Agent
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Translates coordinated agent recommendations into transparent ESTIMATED financial projections, carbon offsets, and SRM KTR campus sustainability metrics.
          </p>
        </div>
      </div>

      {/* ESTIMATED PROJECTIONS DISCLAIMER BANNER */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 flex items-start gap-3 light:bg-amber-50 light:border-amber-200 light:text-amber-900">
        <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider text-amber-300 light:text-amber-800">
            PROJECTION LABEL: ESTIMATED (NOT MEASURED SRMIST FINANCIALS)
          </p>
          <p className="text-slate-300 light:text-slate-700">
            {lastImpact?.disclaimer ||
              'All cost savings, carbon avoidance figures, and resource volumes are estimated model projections derived from simulated prototype datasets and explicit tariff assumptions. These figures do not represent measured SRMIST utility bill reductions until physical campus submeters are verified.'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Monthly Savings</span>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white light:text-slate-900">
            ${metrics.totalEstimatedCostSavingsMonth.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-emerald-400 font-semibold">
            ESTIMATED model projection across 4 domains
          </p>
        </div>

        <div className="rounded-2xl border border-teal-500/30 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Carbon Avoidance</span>
            <Leaf className="h-5 w-5 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-white light:text-slate-900">
            {(metrics.totalCo2eAvoidedKgMonth / 1000).toFixed(2)} MT CO₂e
          </div>
          <p className="mt-1 text-xs text-teal-400 font-semibold">
            {metrics.totalCo2eAvoidedKgMonth.toLocaleString()} kg CO₂e / month avoided
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sequestration Equivalent</span>
            <TreePine className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white light:text-slate-900">
            {metrics.equivalentTreesPlanted} Trees
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Annual tree sequestration equivalent (EPA WARM)
          </p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cost Breakdown Pie */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
          <h3 className="text-base font-extrabold text-white light:text-slate-900 mb-1">
            Estimated Monthly Cost Savings by Domain
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Financial impact distribution if agent actions are enacted
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Estimated Savings']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#10b981',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {costBreakdownData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300 light:text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Carbon Breakdown Bar */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
          <h3 className="text-base font-extrabold text-white light:text-slate-900 mb-1">
            Greenhouse Gas Avoidance Breakdown (kg CO₂e)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Emissions reduction based on regional grid & biological decomposition factors
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carbonBreakdownData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString()} kg CO₂e`, 'Avoidance']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#10b981',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="kgCo2e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400 light:bg-slate-50 light:border-slate-200">
            <p>
              <strong>Carbon Calculation Methodology:</strong> Avoided energy is converted using grid emission intensity (0.42 kg CO₂e/kWh). Food waste diversion avoids anaerobic landfill decomposition (2.5 kg CO₂e/kg). Water savings include municipal pumping and aeration power (0.35 kg CO₂e/m³).
            </p>
          </div>
        </div>
      </div>

      {/* Assumptions Transparency Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 light:border-slate-200">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <div>
            <h3 className="text-base font-extrabold text-white light:text-slate-900">
              Audit Transparency: Calculation Factors & Parameters
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Underlying assumptions governing the Impact Analysis Agent calculations (dataSource: DEMO)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 light:bg-slate-50 light:border-slate-200">
            <span className="text-slate-400 font-semibold block">Food Waste Cost Basis</span>
            <div className="text-base font-bold text-white light:text-slate-900 font-mono">
              ${assumptions.foodWasteCostPerKg.toFixed(2)} / kg
            </div>
            <p className="text-[11px] text-slate-500">
              Weighted average institutional bulk ingredient + kitchen prep labor
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 light:bg-slate-50 light:border-slate-200">
            <span className="text-slate-400 font-semibold block">Commercial Electricity Tariff</span>
            <div className="text-base font-bold text-white light:text-slate-900 font-mono">
              ${assumptions.energyCostPerKwh.toFixed(2)} / kWh
            </div>
            <p className="text-[11px] text-slate-500">
              Campus blended peak and off-peak utility rate structure
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 light:bg-slate-50 light:border-slate-200">
            <span className="text-slate-400 font-semibold block">Water & Sewer Rate</span>
            <div className="text-base font-bold text-white light:text-slate-900 font-mono">
              ${assumptions.waterCostPerLiter.toFixed(4)} / Liter
            </div>
            <p className="text-[11px] text-slate-500">
              Municipal clean water supply fee plus wastewater discharge surcharge
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 light:bg-slate-50 light:border-slate-200">
            <span className="text-slate-400 font-semibold block">Grid Carbon Intensity</span>
            <div className="text-base font-bold text-white light:text-slate-900 font-mono">
              {assumptions.carbonIntensityGridKwhKg} kg CO₂e / kWh
            </div>
            <p className="text-[11px] text-slate-500">
              Regional electrical grid generation emission factor
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 light:bg-slate-50 light:border-slate-200">
            <span className="text-slate-400 font-semibold block">Food Decomposition Factor</span>
            <div className="text-base font-bold text-white light:text-slate-900 font-mono">
              {assumptions.carbonIntensityFoodWasteKg} kg CO₂e / kg waste
            </div>
            <p className="text-[11px] text-slate-500">
              EPA WARM model landfill anaerobic methane release factor
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 light:bg-slate-50 light:border-slate-200">
            <span className="text-slate-400 font-semibold block">Water Pumping & Treatment</span>
            <div className="text-base font-bold text-white light:text-slate-900 font-mono">
              {assumptions.carbonIntensityWaterM3Kg} kg CO₂e / m³
            </div>
            <p className="text-[11px] text-slate-500">
              Embedded carbon in water pressurized delivery and sewer aeration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
