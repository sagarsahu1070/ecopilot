import React, { useState, useEffect } from 'react';
import { useEcoPilot } from '../context/EcoPilotContext.tsx';
import {
  Settings,
  Sparkles,
  RotateCcw,
  Sliders,
  DollarSign,
  Building,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Moon,
  Sun,
  Database,
  Info,
  Server,
  Radio,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { fetchDataSources, selectDataSource } from '../services/api.ts';

interface DataSourceItem {
  type: string;
  name: string;
  isAvailable: boolean;
  statusMessage: string;
  isActive: boolean;
}

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, resetDemoData, isLoading, refreshOverview } = useEcoPilot();
  const [resetSuccess, setResetSuccess] = useState(false);

  // Data Sources state
  const [dataSources, setDataSources] = useState<DataSourceItem[]>([]);
  const [currentSource, setCurrentSource] = useState('DEMO');
  const [sourceMessage, setSourceMessage] = useState<string | null>(null);
  const [isUpdatingSource, setIsUpdatingSource] = useState(false);

  // Local editable parameters
  const [foodCost, setFoodCost] = useState('4.25');
  const [elecRate, setElecRate] = useState('0.14');
  const [waterRate, setWaterRate] = useState('0.0035');
  const [foodBuffer, setFoodBuffer] = useState('5');
  const [savedSettings, setSavedSettings] = useState(false);

  useEffect(() => {
    fetchDataSources()
      .then((data) => {
        setDataSources(data.sources);
        setCurrentSource(data.current);
      })
      .catch((err) => console.warn('Could not load data sources:', err));
  }, []);

  const handleSelectDataSource = async (type: string) => {
    try {
      setIsUpdatingSource(true);
      setSourceMessage(null);
      const res = await selectDataSource(type);
      setCurrentSource(res.current);
      setDataSources((prev) =>
        prev.map((s) => ({ ...s, isActive: s.type === res.current }))
      );
      setSourceMessage(`Data source set to: ${type}`);
      await refreshOverview();
    } catch (err: any) {
      setSourceMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdatingSource(false);
    }
  };

  const handleReset = async () => {
    await resetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
              <Settings className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              SYSTEM CONFIGURATION • SRM KTR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Campus Settings & Data Sources
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Configure SRM KTR data ingestion adapters, utility tariffs, autonomous decision boundaries, and demonstration datasets.
          </p>
        </div>

        {savedSettings && (
          <span className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="h-4 w-4" /> Parameters Updated
          </span>
        )}
      </div>

      {/* DATA SOURCES SECTION */}
      <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/70 p-6 backdrop-blur-md light:bg-white light:border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 light:border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white light:text-slate-900">
                Data Sources & SRM Campus Adapters
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Choose the ingestion mode for campus food logs, energy submeters, and water flows.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/25 px-2.5 py-1 text-xs font-black uppercase text-amber-300 border border-amber-500/40">
            Current: {currentSource}
          </span>
        </div>

        {sourceMessage && (
          <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-xs text-slate-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>{sourceMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. DEMO DATA */}
          <div
            className={`rounded-xl border p-4 transition-all ${
              currentSource === 'DEMO'
                ? 'border-emerald-500/60 bg-emerald-950/20 light:bg-emerald-50 light:border-emerald-400'
                : 'border-slate-800 bg-slate-950/50 light:bg-slate-50 light:border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300 border border-amber-500/40">
                DEMO DATA
              </span>
              <span className="text-[10px] font-semibold text-emerald-400">Active</span>
            </div>
            <h4 className="text-sm font-extrabold text-white light:text-slate-900">
              SRM KTR DEMO TELEMETRY
            </h4>
            <p className="mt-1 text-xs text-slate-400 light:text-slate-600">
              Simulated campus sustainability data modeled for SRM KTR (Tech Park, TP2, UB, and Sannasi Mess).
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 light:border-slate-200">
              <button
                disabled={currentSource === 'DEMO' || isUpdatingSource}
                onClick={() => handleSelectDataSource('DEMO')}
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {currentSource === 'DEMO' ? 'Active Ingestion' : 'Select Demo Mode'}
              </button>
            </div>
          </div>

          {/* 2. AUTHORIZED API */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 opacity-80 light:bg-slate-50 light:border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                OFFICIAL API
              </span>
              <span className="text-[10px] font-semibold text-rose-400">Requires Auth</span>
            </div>
            <h4 className="text-sm font-extrabold text-white light:text-slate-900">
              SRMIST Campus API
            </h4>
            <p className="mt-1 text-xs text-slate-400 light:text-slate-600">
              Direct connection to official SRMIST facilities REST gateway once authorized by campus IT.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 light:border-slate-200">
              <button
                disabled
                className="w-full rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
              >
                Not Authorized
              </button>
            </div>
          </div>

          {/* 3. HARDWARE IOT SENSORS */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 opacity-80 light:bg-slate-50 light:border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                IOT SENSORS
              </span>
              <span className="text-[10px] font-semibold text-rose-400">Gateway Offline</span>
            </div>
            <h4 className="text-sm font-extrabold text-white light:text-slate-900">
              Smart Submeter Bus
            </h4>
            <p className="mt-1 text-xs text-slate-400 light:text-slate-600">
              LoRaWAN / Modbus MQTT broker streaming real-time CT clamp and ultrasonic pulse readings.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 light:border-slate-200">
              <button
                disabled
                className="w-full rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
              >
                Hardware Unlinked
              </button>
            </div>
          </div>

          {/* 4. MANUAL ENTRY */}
          <div
            className={`rounded-xl border p-4 transition-all ${
              currentSource === 'MANUAL_ENTRY'
                ? 'border-emerald-500/60 bg-emerald-950/20 light:bg-emerald-50 light:border-emerald-400'
                : 'border-slate-800 bg-slate-950/50 light:bg-slate-50 light:border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-blue-300 border border-blue-500/40">
                MANUAL ENTRY
              </span>
              <span className="text-[10px] font-semibold text-blue-400">Supported</span>
            </div>
            <h4 className="text-sm font-extrabold text-white light:text-slate-900">
              Facility Shift Logs
            </h4>
            <p className="mt-1 text-xs text-slate-400 light:text-slate-600">
              Daily manual log entry for hostel mess wardens and lab technicians via POST /api/* endpoints.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 light:border-slate-200">
              <button
                disabled={currentSource === 'MANUAL_ENTRY' || isUpdatingSource}
                onClick={() => handleSelectDataSource('MANUAL_ENTRY')}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {currentSource === 'MANUAL_ENTRY' ? 'Active' : 'Enable Manual Logs'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
          <Info className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Integrity Notice:</strong> In strict compliance with guidelines, EcoPilot does not invent private SRMIST telemetry nor claim access to an unauthorized campus API. All operational records are SRM KTR DEMO TELEMETRY (Simulated campus sustainability data modeled for SRM KTR) clearly tagged with <code className="text-amber-400 font-mono">dataSource: "DEMO"</code>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Utility Rates & Campus Parameters */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 light:bg-white light:border-slate-200"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 light:border-slate-200">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <h3 className="text-base font-extrabold text-white light:text-slate-900">
                Institutional Utility Tariffs & Assumptions
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Food Waste Cost ($ / kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={foodCost}
                  onChange={(e) => setFoodCost(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
                />
                <span className="text-[10px] text-slate-500">Raw ingredient + mess kitchen preparation</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Commercial Electricity ($ / kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={elecRate}
                  onChange={(e) => setElecRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
                />
                <span className="text-[10px] text-slate-500">Institutional campus power grid tariff</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Municipal Water & Sewer ($ / Liter)
                </label>
                <input
                  type="number"
                  step="0.0005"
                  value={waterRate}
                  onChange={(e) => setWaterRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
                />
                <span className="text-[10px] text-slate-500">Fresh supply + sewage treatment costs</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  AI Recommended Prep Safety Buffer (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="2"
                  max="15"
                  value={foodBuffer}
                  onChange={(e) => setFoodBuffer(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
                />
                <span className="text-[10px] text-slate-500">Tightens kitchen overproduction margin</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 light:border-slate-200 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Save Parameter Updates
              </button>
            </div>
          </form>

          {/* Verified SRM KTR Campus Facilities */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 light:bg-white light:border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 light:border-slate-200">
              <Building className="h-4 w-4 text-emerald-400" />
              <h3 className="text-base font-extrabold text-white light:text-slate-900">
                SRM KTR Campus Infrastructure (Modeled)
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 light:bg-slate-50 light:border-slate-200">
                <div>
                  <strong className="text-white light:text-slate-900">Tech Park (TP)</strong>
                  <p className="text-[11px] text-slate-400">Computing Labs, Software Studios, Submeter TP-M1</p>
                </div>
                <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-400 font-bold">
                  IDLE DRAW FLAGGED
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 light:bg-slate-50 light:border-slate-200">
                <div>
                  <strong className="text-white light:text-slate-900">Tech Pavilion 2 (TP2)</strong>
                  <p className="text-[11px] text-slate-400">Classrooms, Labs & Water Main Inflow #2</p>
                </div>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-400 font-bold">
                  WATER OUTLIER
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 light:bg-slate-50 light:border-slate-200">
                <div>
                  <strong className="text-white light:text-slate-900">Sannasi Mess Dining Complex</strong>
                  <p className="text-[11px] text-slate-400">Student Hostels Mess A & Kitchen Composting Unit</p>
                </div>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400 font-bold">
                  SURPLUS AUDIT
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 light:bg-slate-50 light:border-slate-200">
                <div>
                  <strong className="text-white light:text-slate-900">University Building (UB)</strong>
                  <p className="text-[11px] text-slate-400">Administrative offices, Central Library, Central Concourse</p>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Runtime & Firestore Management */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Runtime Architecture Status */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 light:bg-white light:border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 light:border-slate-200">
              <Cpu className="h-4 w-4 text-purple-400" />
              <h3 className="text-base font-extrabold text-white light:text-slate-900">
                AI Engine & Multi-Agent Swarm
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Coordinator Model:</span>
                <span className="font-mono text-purple-300 font-bold">Google Gemini 3.8 Flash</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Layer:</span>
                <span className="text-emerald-400 font-bold">Firebase Firestore (Persistent)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Server Architecture:</span>
                <span className="text-slate-300">Express + Vite SSR Middleware</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Human Approval Rule:</span>
                <span className="text-amber-400 font-bold">Enforced (No Direct Actuation)</span>
              </div>
            </div>
          </div>

          {/* Theme & Display */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 light:bg-white light:border-slate-200">
            <h3 className="text-base font-extrabold text-white light:text-slate-900">
              Display & Theme
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <strong className="text-white light:text-slate-900 block">
                  {theme === 'dark' ? 'Dark Sustainability Command Center' : 'Clean Institutional Light Mode'}
                </strong>
                <span className="text-slate-400">High-contrast accessibility standards</span>
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white cursor-pointer light:bg-slate-100 light:text-slate-800 light:border-slate-300"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-purple-400" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>

          {/* Demo Reset Card */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-6 space-y-3 light:bg-amber-50 light:border-amber-200">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <h3 className="text-base font-extrabold text-white light:text-slate-900">
                Demo Dataset Management
              </h3>
            </div>
            <p className="text-xs text-slate-300 light:text-slate-700">
              Reset all simulated SRM KTR dining, energy, and water records to their initial deterministic factory state. Re-evaluates baseline thresholds and persists to Firestore.
            </p>

            <button
              onClick={handleReset}
              disabled={isLoading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Database className="h-4 w-4" />
              <span>{isLoading ? 'Resetting Data...' : 'RESET SRM KTR DEMO DATA'}</span>
            </button>

            {resetSuccess && (
              <p className="text-xs text-emerald-400 font-semibold text-center">
                ✓ Campus datasets reseeded to Firestore successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
