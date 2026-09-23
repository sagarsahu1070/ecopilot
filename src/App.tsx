import React from 'react';
import { EcoPilotProvider, useEcoPilot } from './context/EcoPilotContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { RunEcoPilotModal } from './components/RunEcoPilotModal.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { FoodPage } from './pages/FoodPage.tsx';
import { EnergyPage } from './pages/EnergyPage.tsx';
import { WaterPage } from './pages/WaterPage.tsx';
import { WastePage } from './pages/WastePage.tsx';
import { CoordinatorPage } from './pages/CoordinatorPage.tsx';
import { ImpactAnalyticsPage } from './pages/ImpactAnalyticsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
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
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPage, setCurrentPage, theme } = useEcoPilot();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'food':
        return <FoodPage />;
      case 'energy':
        return <EnergyPage />;
      case 'water':
        return <WaterPage />;
      case 'waste':
        return <WastePage />;
      case 'coordinator':
        return <CoordinatorPage />;
      case 'impact':
        return <ImpactAnalyticsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  const mobileNavItems = [
    { id: 'dashboard', label: 'Command', icon: LayoutDashboard },
    { id: 'food', label: 'Food', icon: UtensilsCrossed },
    { id: 'energy', label: 'Energy', icon: Zap },
    { id: 'water', label: 'Water', icon: Droplets },
    { id: 'waste', label: 'Waste', icon: Trash2 },
    { id: 'coordinator', label: 'Coordinator', icon: Cpu },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
  ] as const;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900 light'
    }`}>
      {/* Top Header */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="md:hidden sticky bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-2 py-2 flex items-center justify-around text-[10px] text-slate-400 light:bg-white light:border-slate-200">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as any)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
                isActive ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Multi-Agent Run Orchestrator Modal */}
      <RunEcoPilotModal />
    </div>
  );
};

export default function App() {
  return (
    <EcoPilotProvider>
      <AppContent />
    </EcoPilotProvider>
  );
}
