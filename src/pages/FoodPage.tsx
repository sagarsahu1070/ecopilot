import React, { useState, useEffect } from 'react';
import { FoodRecord } from '../types/index.ts';
import { fetchFoodData, predictFoodDemand } from '../services/api.ts';
import {
  UtensilsCrossed,
  Sparkles,
  Calculator,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CloudRain,
  Sun,
  GraduationCap,
  ShieldCheck,
  ChefHat,
  Search,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

export const FoodPage: React.FC = () => {
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<string>('all');
  const [selectedMeal, setSelectedMeal] = useState<string>('all');

  // Interactive Demand Estimator State
  const [simMeal, setSimMeal] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Lunch');
  const [simExpected, setSimExpected] = useState<number>(1200);
  const [simWeather, setSimWeather] = useState<'Sunny' | 'Rainy' | 'Cold Wave'>('Rainy');
  const [simExam, setSimExam] = useState<boolean>(false);
  const [simEvent, setSimEvent] = useState<string>('');
  const [simHall, setSimHall] = useState<string>('Sannasi Mess A');
  const [prediction, setPrediction] = useState<{
    studentsExpected: number;
    estimatedDemand: number;
    recommendedPreparationMeals: number;
    potentialWasteReductionKg: number;
    estimatedCostSavingsDollars: number;
    batchAdvice: string;
    label: string;
  } | null>({
    studentsExpected: 1200,
    estimatedDemand: 1030,
    recommendedPreparationMeals: 1080,
    potentialWasteReductionKg: 135,
    estimatedCostSavingsDollars: 878,
    batchAdvice:
      'Cook 75% for primary rush; hold secondary batch chilled and finish only if turnstiles cross 800 students by 12:45.',
    label: 'AI Model Estimate (Requires kitchen lead verification)',
  });
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  useEffect(() => {
    fetchFoodData()
      .then((res) => {
        setRecords(res.records);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    try {
      const res = await predictFoodDemand({
        meal: simMeal,
        expectedStudents: simExpected,
        weather: simWeather,
        isExamDay: simExam,
        universityEvent: simEvent || null,
        diningHall: simHall,
      });
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (selectedHall !== 'all' && r.diningHall !== selectedHall) return false;
    if (selectedMeal !== 'all' && r.meal !== selectedMeal) return false;
    return true;
  });

  // Chart data: prep vs served vs leftover for latest 8 records
  const chartData = filteredRecords.slice(-8).map((r) => ({
    name: `${r.date.slice(5)} ${r.meal[0]}`,
    prepKg: r.preparedQuantityKg,
    servedKg: Math.round(r.studentsServed * 0.42),
    leftoverKg: r.leftoverQuantityKg,
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <UtensilsCrossed className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              AGENT 1 OF 6
            </span>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
              SRM KTR DEMO TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Food Waste & Demand Prediction Agent
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Monitors historical dining turnout, analyzes weather & exam deviations, and recommends precision prep batch sizing. Simulated campus sustainability data modeled for SRM KTR.
          </p>
        </div>
      </div>

      {/* Demand Estimator Simulator Card */}
      <div className="rounded-3xl border border-amber-500/20 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl light:bg-white light:border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white light:text-slate-900">
                Interactive Meal Demand & Batch Preparation Estimator
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Model food demand using live scenario inputs (Weather, Exam schedules, Event factors)
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            AI Demand Engine
          </span>
        </div>

        <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Dining Hall
            </label>
            <select
              value={simHall}
              onChange={(e) => setSimHall(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
            >
              <option value="Sannasi Mess A">Sannasi Mess A</option>
              <option value="SRM Central Dining">SRM Central Dining</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Meal Session
            </label>
            <select
              value={simMeal}
              onChange={(e) => setSimMeal(e.target.value as any)}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Students Expected
            </label>
            <input
              type="number"
              min="100"
              max="3000"
              step="50"
              value={simExpected}
              onChange={(e) => setSimExpected(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Forecast Weather
            </label>
            <select
              value={simWeather}
              onChange={(e) => setSimWeather(e.target.value as any)}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
            >
              <option value="Sunny">☀️ Sunny / Normal</option>
              <option value="Rainy">🌧️ Rainy / Storm (-8%)</option>
              <option value="Cold Wave">❄️ Cold Wave (-12%)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Campus Context
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 light:text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simExam}
                  onChange={(e) => setSimExam(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                Exam Week
              </label>
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPredicting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isPredicting ? <Sparkles className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
              <span>ESTIMATE DEMAND</span>
            </button>
          </div>
        </form>

        {/* Prediction Results Banner */}
        {prediction && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-4 light:bg-amber-50 light:border-amber-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-amber-400 light:text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 light:text-amber-700">
                  AI Recommendation Card
                </span>
                <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-700">
                  {prediction.label}
                </span>
              </div>
              <span className="text-xs text-amber-300 font-semibold">
                Buffer Adjusted: 5% (Reduced from 15% standard)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-amber-500/20 bg-slate-950/60 p-3 light:bg-white light:border-amber-100">
                <span className="text-[11px] text-slate-400">Students Expected</span>
                <div className="text-xl font-extrabold text-white light:text-slate-900">
                  {prediction.studentsExpected}
                </div>
                <span className="text-[10px] text-slate-500">Scheduled campus capacity</span>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-slate-950/60 p-3 light:bg-white light:border-amber-100">
                <span className="text-[11px] text-amber-300 font-semibold light:text-amber-700">
                  Model Estimated Demand
                </span>
                <div className="text-xl font-extrabold text-amber-400 light:text-amber-600">
                  {prediction.estimatedDemand} meals
                </div>
                <span className="text-[10px] text-slate-400">Adjusted for weather factor</span>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-slate-950/60 p-3 light:bg-white light:border-emerald-100">
                <span className="text-[11px] text-emerald-300 font-semibold light:text-emerald-700">
                  Recommended Preparation
                </span>
                <div className="text-xl font-extrabold text-emerald-400 light:text-emerald-600">
                  {prediction.recommendedPreparationMeals} meals
                </div>
                <span className="text-[10px] text-emerald-400/80">+5% safety margin</span>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-slate-950/60 p-3 light:bg-white light:border-amber-100">
                <span className="text-[11px] text-slate-400">Estimated Waste Avoided</span>
                <div className="text-xl font-extrabold text-emerald-400 light:text-emerald-600">
                  ${prediction.estimatedCostSavingsDollars}
                </div>
                <span className="text-[10px] text-slate-400">
                  ~{prediction.potentialWasteReductionKg} kg surplus saved
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-amber-200/90 light:text-amber-800 bg-amber-950/40 p-3 rounded-xl border border-amber-500/20 light:bg-white">
              <span className="font-bold text-amber-400">Batch Cooking Protocol:</span>
              <span>{prediction.batchAdvice}</span>
            </div>
          </div>
        )}
      </div>

      {/* Historical Data & Recharts Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recharts */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white light:text-slate-900">
                Prepared Quantity vs Leftovers (kg)
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Historical correlation between over-preparation and discarded portions
              </p>
            </div>
            <span className="text-[10px] font-mono rounded bg-slate-800 px-2 py-0.5 text-slate-400">
              14-DAY LOG
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#f59e0b',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="prepKg" name="Prepared (kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leftoverKg" name="Leftover Surplus (kg)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Key Insights & Recommendations */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between light:bg-white light:border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Food Agent Autonomous Findings
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
              Pattern analysis across 84 meal sessions
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs light:bg-slate-50 light:border-slate-200">
                <div className="flex items-center justify-between font-bold text-amber-400 mb-1">
                  <span>Rainy Dinner Surplus Fluctuation</span>
                  <span>18.4% Surplus</span>
                </div>
                <p className="text-slate-300 light:text-slate-600">
                  Precipitation during weekday dinners consistently suppresses North Commons turnout by an average of 142 students, yet kitchens historically prepared for 100% capacity.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs light:bg-slate-50 light:border-slate-200">
                <div className="flex items-center justify-between font-bold text-emerald-400 mb-1">
                  <span>Exam Night Demand Surge</span>
                  <span>+12% Late Footfall</span>
                </div>
                <p className="text-slate-300 light:text-slate-600">
                  Exam periods invert standard meal timing: late-night dining reaches 98% turnout, requiring higher protein batch preservation and extended serving windows.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs light:bg-slate-50 light:border-slate-200">
                <div className="flex items-center justify-between font-bold text-teal-400 mb-1">
                  <span>Recommended Action Directive</span>
                  <span>Batch Splitting</span>
                </div>
                <p className="text-slate-300 light:text-slate-600">
                  Scale main batch to 75% at shift open. Mandate secondary flash-steam contingency batch for last 45 minutes of meal window.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 light:border-slate-100">
            *Predictions are computed via statistical turnout models and require kitchen head chef verification before recipe batch adjustment.
          </div>
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white light:text-slate-900">
              Historical Dining Log & Waste Audit
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Detailed records per dining hall, meal type, turnout, and cost impact
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 light:bg-slate-50 light:text-slate-800 light:border-slate-200"
            >
              <option value="all">All Dining Halls</option>
              <option value="Sannasi Mess A">Sannasi Mess A</option>
              <option value="SRM Central Dining">SRM Central Dining</option>
            </select>

            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 light:bg-slate-50 light:text-slate-800 light:border-slate-200"
            >
              <option value="all">All Meals</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 light:text-slate-700">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase tracking-wider text-slate-400 light:bg-slate-100 light:border-slate-200">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Dining Hall</th>
                <th className="py-3 px-3">Meal</th>
                <th className="py-3 px-3">Expected / Served</th>
                <th className="py-3 px-3">Prepared (kg)</th>
                <th className="py-3 px-3">Leftover (kg)</th>
                <th className="py-3 px-3">Leftover Rate</th>
                <th className="py-3 px-3">Waste Cost</th>
                <th className="py-3 px-3">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
              {filteredRecords.slice(0, 10).map((r) => {
                const rate = Math.round((r.leftoverQuantityKg / r.preparedQuantityKg) * 100);
                const isHigh = rate > 15;
                return (
                  <tr key={r.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono">{r.date}</td>
                    <td className="py-3 px-3 font-medium text-white light:text-slate-900">{r.diningHall}</td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 light:bg-slate-200 light:text-slate-800">
                        {r.meal}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {r.studentsExpected} / <strong>{r.studentsServed}</strong>
                    </td>
                    <td className="py-3 px-3">{r.preparedQuantityKg} kg</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{r.leftoverQuantityKg} kg</td>
                    <td className="py-3 px-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          isHigh ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">${r.wasteCost}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      {r.weather !== 'Sunny' && <span className="mr-1">🌧️ {r.weather}</span>}
                      {r.isExamDay && <span className="mr-1 text-purple-400 font-semibold">Exam</span>}
                      {r.universityEvent && <span className="text-teal-400">Event</span>}
                      {!r.isExamDay && !r.universityEvent && r.weather === 'Sunny' && 'Normal'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
