export type DataSourceType = 'DEMO' | 'AUTHORIZED_API' | 'AUTHORIZED_SENSOR_DATA' | 'MANUAL_ENTRY';

export type AgentType = 'food' | 'energy' | 'water' | 'waste' | 'coordinator' | 'impact';

export type AgentStatus = 'waiting' | 'running' | 'completed' | 'error';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface CampusRecord {
  id: string;
  name: string; // "SRM Institute of Science and Technology"
  campus: string; // "Kattankulathur"
  shortName: string; // "SRM KTR"
  location: string; // "Kattankulathur, Tamil Nadu, India"
  dataSource: DataSourceType;
  established?: number;
  totalStudentsEstimate?: number;
  updatedAt: string;
}

export interface BuildingRecord {
  id: string;
  campusId: string;
  name: string;
  code: string;
  type: 'Academic' | 'Dining' | 'Hostel' | 'Sports' | 'Administrative' | 'Laboratory';
  floors: number;
  primarySubmeterId: string;
  dataSource: DataSourceType;
}

export interface RoomRecord {
  id: string;
  buildingId: string;
  buildingName: string;
  roomNumber: string;
  name: string;
  type: 'Lab' | 'Classroom' | 'Lecture Theater' | 'Dining Hall' | 'Office' | 'Auditorium';
  capacity: number;
  acInstalled: boolean;
  dataSource: DataSourceType;
}

export interface AgentFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  location?: string;
  metric?: string;
  severity: SeverityLevel;
  confidence: number; // 0 to 100
  potentialImpact: string;
  recommendedAction: string;
}

export interface AgentReport {
  agentName: 'Food Waste Agent' | 'Energy Waste Agent' | 'Water Usage Agent' | 'General Waste Agent';
  agentKey: 'food' | 'energy' | 'water' | 'waste';
  timestamp: string;
  status: AgentStatus;
  summary: string;
  severity: SeverityLevel;
  confidence: number;
  findings: AgentFinding[];
  metricsSummary: Record<string, string | number>;
  recommendedActions: string[];
}

export interface ActionPlanItem {
  id: string;
  priority: number;
  title: string;
  sourceAgent: 'food' | 'energy' | 'water' | 'waste' | 'coordinator'; // Matches prompt requirements
  agentSource?: 'food' | 'energy' | 'water' | 'waste' | 'coordinator';
  buildingOrArea: string;
  description: string;
  reasoning: string;
  actionRequired: string;
  authorityLevel: 'Dining Mgr' | 'Facilities Lead' | 'Sustainability Director' | 'Automation Trigger';
  severity: SeverityLevel;
  estimatedImpact: string; // Required in prompt
  estimatedSavings: {
    costPerWeek: number;
    resourceSaved: string;
    co2EquivalentKg: number;
  };
  humanApprovalRequired: boolean; // Prompt: The system must NOT directly control campus equipment.
  status: 'pending' | 'in_investigation' | 'approved' | 'resolved' | 'dismissed';
  createdAt: string;
  dataSource: DataSourceType;
}

export interface CoordinatorResult {
  runId: string;
  timestamp: string;
  situationOverview: string;
  criticalIssuesIdentified: number;
  investigationRequiredCount: number;
  prioritizedActionPlan: ActionPlanItem[];
  synthesisReasoning: string;
  agentReports: AgentReport[];
  coordinatorMode?: string;
  dataSource: DataSourceType;
}

export interface ImpactRecord {
  id: string;
  runId: string;
  timestamp: string;
  summary: string;
  dataSource: DataSourceType;
  assumptions: {
    currencySymbol: string; // '₹' or '$'
    foodWasteCostPerKg: number;
    energyCostPerKwh: number;
    waterCostPerLiter: number;
    carbonIntensityGridKwhKg: number;
    carbonIntensityFoodWasteKg: number;
    carbonIntensityWaterM3Kg: number;
  };
  metrics: {
    estimatedFoodWasteReductionKg: number;
    estimatedFoodCostSavings: number;
    estimatedFoodCo2AvoidedKg: number;

    estimatedEnergySavingsKwh: number;
    estimatedEnergyCostSavings: number;
    estimatedEnergyCo2AvoidedKg: number;

    estimatedWaterSavingsLiters: number;
    estimatedWaterCostSavings: number;
    estimatedWaterCo2AvoidedKg: number;

    estimatedDiversionRatePercent: number;
    estimatedWasteCostSavings: number;

    totalEstimatedCostSavingsMonth: number;
    totalCo2eAvoidedKgMonth: number;
    equivalentTreesPlanted: number;
  };
  label: 'ESTIMATED';
  disclaimer: string;
}

export type ImpactAnalysisResult = ImpactRecord;

export interface FoodRecord {
  id: string;
  date: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  diningHall: string;
  studentsExpected: number;
  studentsServed: number;
  preparedQuantityKg: number;
  leftoverQuantityKg: number;
  weather: 'Sunny' | 'Rainy' | 'Snowy' | 'Cloudy' | 'Cold Wave' | 'Hot';
  isHoliday: boolean;
  universityEvent: string | null;
  isExamDay: boolean;
  costPerMeal: number;
  totalCost: number;
  wasteCost: number;
  dataSource: DataSourceType;
}

export interface EnergyRoomRecord {
  id: string;
  building: string;
  room: string;
  timestamp: string;
  occupancy: number;
  acStatus: 'ON' | 'OFF' | 'ECO';
  acSetTemperatureC: number;
  lightsStatus: 'ON' | 'OFF' | 'DIM';
  computerCount: number;
  activeComputers: number;
  powerConsumptionKw: number;
  baselineExpectedKw: number;
  isAnomaly: boolean;
  anomalyReason?: string;
  dataSource: DataSourceType;
}

export interface WaterMeterRecord {
  id: string;
  building: string;
  date: string;
  occupancy: number;
  waterConsumptionLiters: number;
  baselineExpectedLiters: number;
  weather: 'Sunny' | 'Rainy' | 'Hot' | 'Normal';
  irrigationActive: boolean;
  isAnomaly: boolean;
  potentialCause: 'increased occupancy' | 'irrigation' | 'possible plumbing issue' | 'measurement anomaly' | 'normal';
  confidence: number;
  dataSource: DataSourceType;
}

export interface WasteRecord {
  id: string;
  date: string;
  stream: 'Organic' | 'Paper' | 'Plastic' | 'E-waste' | 'General Waste';
  collectedKg: number;
  divertedKg: number;
  contaminationPercent: number;
  location: string;
  dataSource: DataSourceType;
}

export interface WasteClassificationResult {
  category: 'Organic' | 'Paper' | 'Plastic' | 'E-waste' | 'General Waste';
  confidence: number;
  reason: string;
  recommendedDisposal: string;
  predictionSource: string;
  isRecyclable: boolean;
  campusBinLocation: string;
  specialHandlingNotes?: string;
  isAIPrediction: true;
}

export interface OccupancyRecord {
  id: string;
  facility: string;
  timestamp: string;
  headcount: number;
  capacity: number;
  dataSource: DataSourceType;
}

export interface CampusEventRecord {
  id: string;
  name: string;
  date: string;
  expectedAttendance: number;
  venue: string;
  dataSource: DataSourceType;
}

export interface CampusAlertRecord {
  id: string;
  domain: 'food' | 'energy' | 'water' | 'waste';
  severity: SeverityLevel;
  title: string;
  message: string;
  location: string;
  timestamp: string;
  active: boolean;
  dataSource: DataSourceType;
}

export interface AgentRunRecord {
  id: string;
  timestamp: string;
  dataSource: DataSourceType;
  agentResults: {
    food: any;
    energy: any;
    water: any;
    waste: any;
  };
  coordinatorResult: CoordinatorResult;
  impactResult: ImpactRecord;
  executionLogs: Array<{
    stage: string;
    agent: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    timestamp: string;
  }>;
}

export interface CampusOverview {
  campusInfo?: {
    name: string;
    campus: string;
    shortName: string;
    location: string;
    dataSource: DataSourceType;
  };
  overallHealthScore: number; // 0 to 100
  activeAlertsCount?: number;
  activeAgentsCount?: number;
  criticalAnomaliesCount?: number;
  totalEstimatedSavingsMonth?: number;
  totalCarbonAvoidedKgMonth?: number;
  lastRunTimestamp?: string;
  foodStatus: {
    status?: 'OPTIMAL' | 'WARNING' | 'ALERT';
    leftoverRatePercent: number;
    currentLeftoverRatePercent?: number;
    weeklyWasteKg?: number;
    estimatedSurplusKgWeek?: number;
    weeklySavingsPotential?: number;
    trend: 'improving' | 'stable' | 'degrading';
    alertsCount: number;
  };
  energyStatus: {
    status?: 'OPTIMAL' | 'WARNING' | 'ALERT';
    wastedKwhDaily?: number;
    dailyKwhWaste?: number;
    unoccupiedPowerWasteKw?: number;
    unoccupiedActiveRooms?: number;
    anomalousRoomsCount?: number;
    trend: 'improving' | 'stable' | 'degrading';
    alertsCount: number;
  };
  waterStatus: {
    status?: 'OPTIMAL' | 'WARNING' | 'ALERT';
    deviationPercent: number;
    campusDeviationPercent?: number;
    highestVarianceBuilding?: string;
    unexplainedExcessLitersDay?: number;
    suspectedAnomalies?: number;
    trend: 'improving' | 'stable' | 'degrading';
    alertsCount: number;
  };
  wasteStatus: {
    status?: 'OPTIMAL' | 'WARNING' | 'ALERT';
    diversionRatePercent: number;
    targetDiversionRatePercent?: number;
    contaminationRatePercent: number;
    trend: 'improving' | 'stable' | 'degrading';
    alertsCount: number;
  };
  sevenDayTrends?: Array<{
    date: string;
    foodWasteKg: number;
    energyKwh: number;
    waterLiters: number;
    wasteDiversionRate?: number;
  }>;
}
