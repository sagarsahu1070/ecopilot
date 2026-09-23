import React, { useState, useEffect } from 'react';
import { EnergyRoomRecord } from '../types/index.ts';
import { fetchEnergyData, toggleRoomEquipment } from '../services/api.ts';
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  Power,
  Sliders,
  Building,
  Monitor,
  Thermometer,
  ShieldAlert,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const EnergyPage: React.FC = () => {
  const [rooms, setRooms] = useState<EnergyRoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [anomalyOnly, setAnomalyOnly] = useState<boolean>(false);
  const [totalWastedKw, setTotalWastedKw] = useState<number>(0);

  const loadData = () => {
    setLoading(true);
    fetchEnergyData()
      .then((res) => {
        setRooms(res.rooms);
        setTotalWastedKw(res.totalWastedKw);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (
    roomId: string,
    currentAc: 'ON' | 'OFF' | 'ECO',
    currentLights: 'ON' | 'OFF' | 'DIM'
  ) => {
    // If currently ON, switch OFF (or if already OFF, switch ON)
    const nextAc: 'ON' | 'OFF' = currentAc === 'ON' ? 'OFF' : 'ON';
    const nextLights: 'ON' | 'OFF' = currentLights === 'ON' ? 'OFF' : 'ON';

    try {
      const res = await toggleRoomEquipment({
        roomId,
        acStatus: nextAc,
        lightsStatus: nextLights,
      });
      if (res.success) {
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? res.room : r))
        );
      }
    } catch (err) {
      console.error('Failed to toggle equipment:', err);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (buildingFilter !== 'all' && r.building !== buildingFilter) return false;
    if (anomalyOnly && !r.isAnomaly) return false;
    return true;
  });

  const anomalyCount = rooms.filter((r) => r.isAnomaly).length;

  // Chart data: occupancy vs power
  const scatterData = rooms.map((r) => ({
    name: `${r.building} - ${r.room}`,
    occupancy: r.occupancy,
    powerKw: r.powerConsumptionKw,
    isAnomaly: r.isAnomaly,
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              AGENT 2 OF 6
            </span>
            <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/20">
              SRM KTR DEMO TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Energy Waste & Occupancy Audit Agent
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Identifies zero-occupancy spaces running commercial HVAC compressors, idle computer laboratories, and uncalibrated lighting zones. Simulated campus sustainability data modeled for SRM KTR.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors light:bg-white light:border-slate-300 light:text-slate-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Refresh Demo Telemetry</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 light:bg-rose-50 light:border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 light:text-rose-700">
              Active Anomalies Detected
            </span>
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white light:text-slate-900">
            {anomalyCount} Spaces
          </div>
          <p className="mt-1 text-xs text-rose-300/80 light:text-rose-700">
            Empty rooms with active HVAC or lights
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 light:bg-amber-50 light:border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 light:text-amber-700">
              Continuous Wasted Power
            </span>
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white light:text-slate-900">
            25.3 kW
          </div>
          <p className="mt-1 text-xs text-amber-300/80 light:text-amber-700">
            ~184 kWh projected daily electricity loss
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 light:bg-emerald-50 light:border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 light:text-emerald-700">
              Potential Daily Avoidance
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white light:text-slate-900">
            77.3 kg CO₂e
          </div>
          <p className="mt-1 text-xs text-emerald-300/80 light:text-emerald-700">
            Grid emission reduction via setback actions
          </p>
        </div>
      </div>

      {/* Occupancy vs Power Scatter Correlation */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white light:text-slate-900">
              Occupancy vs Power Consumption Correlation
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Outlier rooms (0 occupants with high kW draw) represent primary energy drain targets
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Anomaly Room
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Normal Room
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                type="number"
                dataKey="occupancy"
                name="Occupants"
                unit=" ppl"
                stroke="#94a3b8"
                fontSize={11}
              />
              <YAxis
                type="number"
                dataKey="powerKw"
                name="Power"
                unit=" kW"
                stroke="#94a3b8"
                fontSize={11}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#f43f5e',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Scatter
                name="Rooms"
                data={scatterData}
                fill="#10b981"
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  const isAnom = payload.isAnomaly;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isAnom ? 7 : 5}
                      fill={isAnom ? '#f43f5e' : '#10b981'}
                      stroke={isAnom ? '#ffe4e6' : '#a7f3d0'}
                      strokeWidth={1.5}
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Monitor & Interactive Actuation Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 light:bg-white light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-white light:text-slate-900">
              Campus Room Monitoring & Authorization Panel
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Inspect anomalous spaces and execute simulated authorized equipment setbacks
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 light:bg-slate-50 light:text-slate-800 light:border-slate-200"
            >
              <option value="all">All Campus Wings</option>
              <option value="Tech Pavilion 2 (TP2)">Tech Pavilion 2 (TP2)</option>
              <option value="Engineering Hall">Engineering Hall</option>
              <option value="Science Complex">Science Complex</option>
              <option value="Student Union">Student Union</option>
              <option value="University Library">University Library</option>
            </select>

            <button
              onClick={() => setAnomalyOnly(!anomalyOnly)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-colors ${
                anomalyOnly
                  ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {anomalyOnly ? 'Showing Anomalies Only' : 'Filter Anomalies'}
            </button>
          </div>
        </div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const isCritical = room.isAnomaly && room.powerConsumptionKw > 8;
            return (
              <div
                key={room.id}
                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                  room.isAnomaly
                    ? 'border-rose-500/40 bg-rose-950/20 shadow-md shadow-rose-950/20 light:bg-rose-50/50 light:border-rose-200'
                    : 'border-slate-800 bg-slate-950/50 light:bg-slate-50/60 light:border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {room.building}
                      </span>
                      <h4 className="text-sm font-extrabold text-white light:text-slate-900">
                        {room.room}
                      </h4>
                    </div>

                    {room.isAnomaly ? (
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        ANOMALY
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        OPTIMAL
                      </span>
                    )}
                  </div>

                  {/* Anomaly diagnosis message */}
                  {room.isAnomaly && room.anomalyReason && (
                    <div className="mt-2.5 rounded-xl border border-rose-500/20 bg-rose-950/40 p-2.5 text-[11px] text-rose-200 light:bg-rose-100/60 light:text-rose-900">
                      <strong>AI Diagnosis:</strong> {room.anomalyReason}
                    </div>
                  )}

                  {/* Room sensors metadata */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300 light:text-slate-700">
                    <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/60 light:bg-white light:border-slate-200">
                      <span className="text-[10px] text-slate-400">Occupancy</span>
                      <div className="font-extrabold text-sm text-white light:text-slate-900">
                        {room.occupancy} persons
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/60 light:bg-white light:border-slate-200">
                      <span className="text-[10px] text-slate-400">Power Draw</span>
                      <div className={`font-extrabold text-sm ${room.isAnomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {room.powerConsumptionKw} kW
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/60 light:bg-white light:border-slate-200">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Thermometer className="h-3 w-3" /> AC Status
                      </span>
                      <div className="font-bold text-xs">
                        {room.acStatus} ({room.acSetTemperatureC}°C)
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/60 light:bg-white light:border-slate-200">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Monitor className="h-3 w-3" /> Computers
                      </span>
                      <div className="font-bold text-xs">
                        {room.activeComputers} of {room.computerCount} active
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authorized Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 light:border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Baseline: {room.baselineExpectedKw} kW
                  </span>

                  <button
                    onClick={() => handleToggle(room.id, room.acStatus, room.lightsStatus)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      room.isAnomaly
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                        : 'border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{room.acStatus === 'ON' ? 'Switch Off Equipment' : 'Turn On'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
