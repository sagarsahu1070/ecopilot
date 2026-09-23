import React from 'react';
import { useEcoPilot, PageId } from '../context/EcoPilotContext.tsx';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Zap,
  Droplets,
  Trash2,
  Cpu,
  BarChart3,
  FileText,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  isAgent?: boolean;
}

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, overview } = useEcoPilot();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
    },
    {
      id: 'food',
      label: 'Food Agent',
      icon: UtensilsCrossed,
      isAgent: true,
      badge: overview?.foodStatus.status === 'ALERT' ? 'SURPLUS' : 'ACTIVE',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'energy',
      label: 'Energy Agent',
      icon: Zap,
      isAgent: true,
      badge: `${overview?.energyStatus.unoccupiedActiveRooms ?? 3} ALERTS`,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      id: 'water',
      label: 'Water Agent',
      icon: Droplets,
      isAgent: true,
      badge: '+12.8% DEV',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      id: 'waste',
      label: 'Waste Agent',
      icon: Trash2,
      isAgent: true,
      badge: 'VISION AI',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'coordinator',
      label: 'AI Coordinator',
      icon: Cpu,
      isAgent: true,
      badge: 'SYNTHESIS',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'impact',
      label: 'Impact Analytics',
      icon: BarChart3,
    },
    {
      id: 'reports',
      label: 'Executive Reports',
      icon: FileText,
    },
    {
      id: 'settings',
      label: 'Settings & Data',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-emerald-900/20 bg-slate-950/60 p-4 flex flex-col justify-between hidden md:flex light:bg-slate-50 light:border-slate-200">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 light:text-slate-400">
            SRM KTR SUSTAINABILITY COMMAND CENTER
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-300'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 light:text-slate-600 light:hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive
                          ? 'text-emerald-400 light:text-emerald-600'
                          : 'text-slate-500 group-hover:text-slate-300 light:text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                        item.badgeColor || 'border-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Autonomous Loop Infographic */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 light:bg-white light:border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 light:text-slate-800">
              Autonomous Cycle
            </span>
          </div>
          <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-mono light:text-slate-600">
            <div className="flex items-center justify-between">
              <span>1. SENSE</span>
              <span className="text-emerald-400">DEMO DATA</span>
            </div>
            <div className="flex items-center justify-between">
              <span>2. REASON</span>
              <span className="text-teal-400">4 AGENTS</span>
            </div>
            <div className="flex items-center justify-between">
              <span>3. DECIDE</span>
              <span className="text-purple-400">COORDINATOR</span>
            </div>
            <div className="flex items-center justify-between">
              <span>4. PROPOSE</span>
              <span className="text-amber-400">ACTION PLAN</span>
            </div>
            <div className="flex items-center justify-between">
              <span>5. VERIFY</span>
              <span className="text-blue-400">SRM HUMAN LEAD</span>
            </div>
          </div>
          <p className="mt-2 text-[9px] text-slate-500 border-t border-slate-800/60 pt-2 light:border-slate-100">
            *No direct equipment actuation; human authorization required for safety.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-900/80 pt-3 text-[11px] text-slate-500 light:border-slate-200 light:text-slate-400">
        <p className="font-bold text-slate-300 light:text-slate-700">EcoPilot SRM KTR</p>
        <p className="text-[10px]">SRMIST Kattankulathur</p>
      </div>
    </aside>
  );
};
