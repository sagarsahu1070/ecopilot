import {
  CampusOverview,
  CoordinatorResult,
  ImpactAnalysisResult,
  FoodRecord,
  EnergyRoomRecord,
  WaterMeterRecord,
  WasteClassificationResult,
  ActionPlanItem,
  CampusRecord,
  BuildingRecord,
  RoomRecord,
} from '../types/index.ts';

export interface PipelineExecutionLog {
  stage: string;
  agent: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string;
}

export interface RunEcoPilotResponse {
  success: boolean;
  coordinator: CoordinatorResult;
  impact: ImpactAnalysisResult;
  executionLogs: PipelineExecutionLog[];
  agentResults: {
    food: any;
    energy: any;
    water: any;
    waste: any;
  };
}

export async function fetchCampusInfo(): Promise<CampusRecord> {
  const res = await fetch('/api/campus');
  if (!res.ok) throw new Error('Failed to fetch campus metadata');
  return res.json();
}

export async function fetchBuildings(): Promise<BuildingRecord[]> {
  const res = await fetch('/api/buildings');
  if (!res.ok) throw new Error('Failed to fetch buildings');
  return res.json();
}

export async function fetchRooms(): Promise<RoomRecord[]> {
  const res = await fetch('/api/rooms');
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}

export async function fetchDataSources(): Promise<{
  current: string;
  sources: Array<{
    type: string;
    name: string;
    isAvailable: boolean;
    statusMessage: string;
    isActive: boolean;
  }>;
}> {
  const res = await fetch('/api/data-sources');
  if (!res.ok) throw new Error('Failed to fetch data sources');
  return res.json();
}

export async function selectDataSource(type: string): Promise<{ success: boolean; current: string }> {
  const res = await fetch('/api/data-sources/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to select data source');
  }
  return res.json();
}

export async function fetchOverview(): Promise<{
  overview: CampusOverview;
  lastRun: CoordinatorResult | null;
  lastImpact: ImpactAnalysisResult | null;
}> {
  const res = await fetch('/api/overview');
  if (!res.ok) throw new Error('Failed to fetch campus overview');
  return res.json();
}

export async function fetchFoodData(): Promise<{ records: FoodRecord[]; metrics?: any }> {
  const res = await fetch('/api/food');
  if (!res.ok) throw new Error('Failed to fetch food records');
  return res.json();
}

export async function fetchFoodSummary() {
  const res = await fetch('/api/food/summary');
  if (!res.ok) throw new Error('Failed to fetch food summary');
  return res.json();
}

export async function predictFoodDemand(params: {
  meal: string;
  expectedStudents: number;
  weather: string;
  isExamDay: boolean;
  universityEvent: string | null;
  diningHall: string;
}) {
  const res = await fetch('/api/food/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Food prediction request failed');
  return res.json();
}

export async function fetchEnergyData(): Promise<{
  rooms: EnergyRoomRecord[];
  metrics?: any;
  anomalyCount: number;
  totalWastedKw: number;
}> {
  const res = await fetch('/api/energy');
  if (!res.ok) throw new Error('Failed to fetch energy rooms');
  return res.json();
}

export async function fetchEnergyAnomalies() {
  const res = await fetch('/api/energy/anomalies');
  if (!res.ok) throw new Error('Failed to fetch energy anomalies');
  return res.json();
}

export async function toggleRoomEquipment(params: {
  roomId: string;
  acStatus?: 'ON' | 'OFF' | 'ECO';
  lightsStatus?: 'ON' | 'OFF' | 'DIM';
}): Promise<{ success: boolean; room: EnergyRoomRecord }> {
  const res = await fetch('/api/energy/toggle-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to update room status');
  return res.json();
}

export async function fetchWaterData(): Promise<{
  records: WaterMeterRecord[];
  metrics?: any;
  anomalyCount: number;
}> {
  const res = await fetch('/api/water');
  if (!res.ok) throw new Error('Failed to fetch water data');
  return res.json();
}

export async function fetchWaterAnomalies() {
  const res = await fetch('/api/water/anomalies');
  if (!res.ok) throw new Error('Failed to fetch water anomalies');
  return res.json();
}

export async function fetchDemoWasteItems() {
  const res = await fetch('/api/waste/demo-items');
  if (!res.ok) throw new Error('Failed to fetch demo waste items');
  return res.json();
}

export async function classifyWaste(params: {
  imageBase64?: string;
  mimeType?: string;
  demoItemId?: string;
}): Promise<WasteClassificationResult> {
  const res = await fetch('/api/waste/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to classify waste item');
  return res.json();
}

export async function runEcoPilotPipeline(): Promise<RunEcoPilotResponse> {
  const res = await fetch('/api/run-ecopilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to execute EcoPilot agent pipeline');
  return res.json();
}

export async function fetchAgentRuns() {
  const res = await fetch('/api/agent-runs');
  if (!res.ok) throw new Error('Failed to fetch agent runs');
  return res.json();
}

export async function fetchActionPlans() {
  const res = await fetch('/api/action-plans');
  if (!res.ok) throw new Error('Failed to fetch action plans');
  return res.json();
}

export async function fetchImpact() {
  const res = await fetch('/api/impact');
  if (!res.ok) throw new Error('Failed to fetch impact metrics');
  return res.json();
}

export async function updateActionItemStatus(
  actionId: string,
  status: ActionPlanItem['status']
): Promise<{ success: boolean; item: ActionPlanItem }> {
  const res = await fetch('/api/actions/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actionId, status }),
  });
  if (!res.ok) throw new Error('Failed to update action plan item');
  return res.json();
}

export async function resetCampusDemoData(): Promise<{ success: boolean; overview: CampusOverview; lastRun: CoordinatorResult; lastImpact: ImpactAnalysisResult }> {
  const res = await fetch('/api/store/reset', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset campus data');
  return res.json();
}
