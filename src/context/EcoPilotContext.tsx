import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CampusOverview,
  CoordinatorResult,
  ImpactAnalysisResult,
  ActionPlanItem
} from '../types/index.ts';
import {
  fetchOverview,
  runEcoPilotPipeline,
  updateActionItemStatus as apiUpdateActionStatus,
  resetCampusDemoData as apiResetData
} from '../services/api.ts';

export type PageId =
  | 'dashboard'
  | 'food'
  | 'energy'
  | 'water'
  | 'waste'
  | 'coordinator'
  | 'impact'
  | 'reports'
  | 'settings';

interface EcoPilotContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  overview: CampusOverview | null;
  lastRun: CoordinatorResult | null;
  lastImpact: ImpactAnalysisResult | null;
  isLoading: boolean;
  isRunModalOpen: boolean;
  setIsRunModalOpen: (open: boolean) => void;
  isExecutingRun: boolean;
  activeExecutionStage: number; // 0: data collection, 1: food, 2: energy, 3: water, 4: waste, 5: coordinator, 6: impact, 7: complete
  stageLogs: string[];
  refreshData: () => Promise<void>;
  refreshOverview: () => Promise<void>;
  executeRunWorkflow: () => Promise<void>;
  updateActionStatus: (actionId: string, status: ActionPlanItem['status']) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const EcoPilotContext = createContext<EcoPilotContextType | undefined>(undefined);

export const EcoPilotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [overview, setOverview] = useState<CampusOverview | null>(null);
  const [lastRun, setLastRun] = useState<CoordinatorResult | null>(null);
  const [lastImpact, setLastImpact] = useState<ImpactAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Run execution pipeline state
  const [isRunModalOpen, setIsRunModalOpen] = useState<boolean>(false);
  const [isExecutingRun, setIsExecutingRun] = useState<boolean>(false);
  const [activeExecutionStage, setActiveExecutionStage] = useState<number>(0);
  const [stageLogs, setStageLogs] = useState<string[]>([]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('ecopilot_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('ecopilot_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOverview();
      setOverview(data.overview);
      setLastRun(data.lastRun);
      setLastImpact(data.lastImpact);
    } catch (err) {
      console.error('Failed to load EcoPilot overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Multi-agent workflow execution
  const executeRunWorkflow = async () => {
    setIsRunModalOpen(true);
    setIsExecutingRun(true);
    setActiveExecutionStage(0);
    setStageLogs([
      'Initiating autonomous sensor sweep across dining halls, submeters, and room BMS...',
    ]);

    try {
      // Execute actual server-side multi-agent logic via POST /api/run-ecopilot
      const result = await runEcoPilotPipeline();

      // Display the actual completed function results from the server execution log
      if (result.executionLogs && result.executionLogs.length > 0) {
        for (let i = 0; i < result.executionLogs.length; i++) {
          const logEntry = result.executionLogs[i];
          setActiveExecutionStage(i + 1);

          const prefix = logEntry.status === 'success' ? '✓ ' : '✗ ';
          setStageLogs((prev) => [...prev, `${prefix}${logEntry.message}`]);

          // Slight visual pacing for readability
          await new Promise((res) => setTimeout(res, 450));
        }
      }

      setLastRun(result.coordinator);
      setLastImpact(result.impact);
      setActiveExecutionStage(7);

      if (result.coordinator.coordinatorMode === 'Deterministic Rule Engine') {
        setStageLogs((prev) => [
          ...prev,
          'INFO: AI Coordinator unavailable. Showing deterministic rule-based analysis.',
        ]);
      }

      setStageLogs((prev) => [
        ...prev,
        '✓ SUCCESS: Multi-agent coordination complete! Action Plan & Impact updated from real calculations.',
      ]);
      await refreshData();
    } catch (error) {
      console.error('Pipeline execution failed:', error);
      setStageLogs((prev) => [
        ...prev,
        `✗ ERROR: ${error instanceof Error ? error.message : 'Unknown execution failure'}`,
      ]);
    } finally {
      setIsExecutingRun(false);
    }
  };

  const updateActionStatus = async (actionId: string, status: ActionPlanItem['status']) => {
    try {
      await apiUpdateActionStatus(actionId, status);
      if (lastRun) {
        setLastRun({
          ...lastRun,
          prioritizedActionPlan: lastRun.prioritizedActionPlan.map((item) =>
            item.id === actionId ? { ...item, status } : item
          ),
        });
      }
    } catch (err) {
      console.error('Failed to update action status:', err);
    }
  };

  const resetDemoData = async () => {
    try {
      setIsLoading(true);
      await apiResetData();
      await refreshData();
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EcoPilotContext.Provider
      value={{
        theme,
        toggleTheme,
        currentPage,
        setCurrentPage,
        overview,
        lastRun,
        lastImpact,
        isLoading,
        isRunModalOpen,
        setIsRunModalOpen,
        isExecutingRun,
        activeExecutionStage,
        stageLogs,
        refreshData,
        refreshOverview: refreshData,
        executeRunWorkflow,
        updateActionStatus,
        resetDemoData,
      }}
    >
      {children}
    </EcoPilotContext.Provider>
  );
};

export const useEcoPilot = () => {
  const context = useContext(EcoPilotContext);
  if (!context) {
    throw new Error('useEcoPilot must be used within an EcoPilotProvider');
  }
  return context;
};
