import {
  FoodRecord,
  EnergyRoomRecord,
  WaterMeterRecord,
  WasteRecord,
  CoordinatorResult,
  ImpactAnalysisResult,
  ActionPlanItem,
  CampusOverview,
  AgentRunRecord,
  ImpactRecord,
} from '../src/types/index.ts';
import { campusDb } from './campusDb.ts';
import { runFoodAgent, FoodAgentResult } from './agents/foodAgent.ts';
import { runEnergyAgent, EnergyAgentResult } from './agents/energyAgent.ts';
import { runWaterAgent, WaterAgentResult } from './agents/waterAgent.ts';
import { runWasteAgent, WasteAgentResult } from './agents/wasteAgent.ts';
import { runCoordinatorAgent } from './agents/coordinatorAgent.ts';
import { runImpactAnalysis } from './agents/impactAgent.ts';
import { ai, hasGeminiKey } from './gemini.ts';
import { DEMO_WASTE_ITEMS } from './data/demoData.ts';

export interface ExecutionLogEntry {
  stage: string;
  agent: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string;
}

export interface PipelineExecutionResult {
  success: boolean;
  coordinator: CoordinatorResult;
  impact: ImpactAnalysisResult;
  executionLogs: ExecutionLogEntry[];
  agentResults: {
    food: FoodAgentResult;
    energy: EnergyAgentResult;
    water: WaterAgentResult;
    waste: WasteAgentResult;
  };
}

class SustainabilityStore {
  private lastRun: CoordinatorResult | null = null;
  private lastImpact: ImpactAnalysisResult | null = null;

  private latestFoodResult: FoodAgentResult | null = null;
  private latestEnergyResult: EnergyAgentResult | null = null;
  private latestWaterResult: WaterAgentResult | null = null;
  private latestWasteResult: WasteAgentResult | null = null;

  constructor() {
    this.initializeStore();
  }

  async initializeStore() {
    await campusDb.seedInitialDemoData();
    await this.runWorkflowInitial();
  }

  async resetData() {
    await campusDb.resetAllData();
    await this.runWorkflowInitial();
  }

  // Initial calculation run
  async runWorkflowInitial() {
    const foodRecords = await campusDb.getFoodRecords();
    const energyRooms = await campusDb.getEnergyRecords();
    const waterRecords = await campusDb.getWaterRecords();

    this.latestFoodResult = runFoodAgent(foodRecords);
    this.latestEnergyResult = runEnergyAgent(energyRooms);
    this.latestWaterResult = runWaterAgent(waterRecords);
    this.latestWasteResult = runWasteAgent();

    const timestamp = new Date().toISOString();
    const runId = `srm-run-${Date.now()}`;

    const coordinator = await runCoordinatorAgent({
      foodResult: this.latestFoodResult,
      energyResult: this.latestEnergyResult,
      waterResult: this.latestWaterResult,
      wasteResult: this.latestWasteResult,
      aiClient: ai,
      hasGeminiKey,
    });

    const impact = runImpactAnalysis(
      this.latestFoodResult,
      this.latestEnergyResult,
      this.latestWaterResult,
      this.latestWasteResult
    );

    this.lastRun = coordinator;
    this.lastImpact = impact;

    // Persist action plans and impact record to Firestore
    await campusDb.saveActionPlans(coordinator.prioritizedActionPlan);
    await campusDb.saveImpactRecord(impact);
  }

  // Asynchronous full workflow execution called by POST /api/run-ecopilot
  async executeFullPipeline(): Promise<PipelineExecutionResult> {
    const executionLogs: ExecutionLogEntry[] = [];
    const now = () => new Date().toISOString();

    // 1. Load Data from Firestore abstraction layer
    const foodRecords = await campusDb.getFoodRecords();
    const energyRooms = await campusDb.getEnergyRecords();
    const waterRecords = await campusDb.getWaterRecords();
    const wasteRecords = await campusDb.getWasteRecords();

    executionLogs.push({
      stage: 'DATA_LAYER',
      agent: 'SRM KTR Central Data Layer',
      status: 'success',
      message: `Retrieved campus telemetry: ${foodRecords.length} mess records, ${energyRooms.length} room meters, ${waterRecords.length} facility water meters (dataSource: DEMO).`,
      timestamp: now(),
    });

    // 2. Food Agent
    let foodResult: FoodAgentResult;
    try {
      foodResult = runFoodAgent(foodRecords);
      this.latestFoodResult = foodResult;
      executionLogs.push({
        stage: 'FOOD_AGENT',
        agent: 'Food Waste Agent',
        status: 'success',
        message: `FOOD AGENT completed: Leftover rate ${foodResult.metrics.overallLeftoverRatePercent}% calculated across ${foodResult.metrics.totalRecordsAnalyzed} meal sessions. Potential savings $${foodResult.metrics.potentialCostSavingsDollarsPerWeek}/wk.`,
        timestamp: now(),
      });
    } catch (err) {
      executionLogs.push({
        stage: 'FOOD_AGENT',
        agent: 'Food Waste Agent',
        status: 'error',
        message: `FOOD AGENT error: ${(err as Error).message}`,
        timestamp: now(),
      });
      throw err;
    }

    // 3. Energy Agent
    let energyResult: EnergyAgentResult;
    try {
      energyResult = runEnergyAgent(energyRooms);
      this.latestEnergyResult = energyResult;
      executionLogs.push({
        stage: 'ENERGY_AGENT',
        agent: 'Energy Waste Agent',
        status: 'success',
        message: `ENERGY AGENT completed: ${energyResult.metrics.anomalyRoomsCount} room anomalies identified (${energyResult.metrics.totalIdlePowerWasteKw} kW idle draw). Estimated daily waste: ${energyResult.metrics.estimatedDailyEnergyWasteKwh} kWh/day.`,
        timestamp: now(),
      });
    } catch (err) {
      executionLogs.push({
        stage: 'ENERGY_AGENT',
        agent: 'Energy Waste Agent',
        status: 'error',
        message: `ENERGY AGENT error: ${(err as Error).message}`,
        timestamp: now(),
      });
      throw err;
    }

    // 4. Water Agent
    let waterResult: WaterAgentResult;
    try {
      waterResult = runWaterAgent(waterRecords);
      this.latestWaterResult = waterResult;
      executionLogs.push({
        stage: 'WATER_AGENT',
        agent: 'Water Usage Agent',
        status: 'success',
        message: `WATER AGENT completed: +${waterResult.metrics.highestVarianceDeviationPercent}% deviation in ${waterResult.metrics.highestVarianceBuilding}. ${waterResult.metrics.excessWaterVolumeLitersPerWeek.toLocaleString()} L/wk excess volume audited.`,
        timestamp: now(),
      });
    } catch (err) {
      executionLogs.push({
        stage: 'WATER_AGENT',
        agent: 'Water Usage Agent',
        status: 'error',
        message: `WATER AGENT error: ${(err as Error).message}`,
        timestamp: now(),
      });
      throw err;
    }

    // 5. Waste Agent
    let wasteResult: WasteAgentResult;
    try {
      wasteResult = runWasteAgent();
      this.latestWasteResult = wasteResult;
      executionLogs.push({
        stage: 'WASTE_AGENT',
        agent: 'General Waste Agent',
        status: 'success',
        message: `WASTE AGENT completed: ${wasteResult.metrics.currentDiversionRatePercent}% diversion vs ${wasteResult.metrics.targetDiversionRatePercent}% target, ${wasteResult.metrics.contaminationRatePercent}% contamination audited.`,
        timestamp: now(),
      });
    } catch (err) {
      executionLogs.push({
        stage: 'WASTE_AGENT',
        agent: 'General Waste Agent',
        status: 'error',
        message: `WASTE AGENT error: ${(err as Error).message}`,
        timestamp: now(),
      });
      throw err;
    }

    // 6. AI Coordinator
    let coordinatorResult: CoordinatorResult;
    try {
      coordinatorResult = await runCoordinatorAgent({
        foodResult,
        energyResult,
        waterResult,
        wasteResult,
        aiClient: ai,
        hasGeminiKey,
      });

      this.lastRun = coordinatorResult;

      executionLogs.push({
        stage: 'COORDINATOR_AGENT',
        agent: 'AI Coordinator Agent',
        status: 'success',
        message: `COORDINATOR completed: Synthesized 4 agent outputs into ${coordinatorResult.prioritizedActionPlan.length} prioritized action directives (${coordinatorResult.coordinatorMode || 'Gemini 3.8 Flash'}). Human approval required for all actions.`,
        timestamp: now(),
      });
    } catch (err) {
      executionLogs.push({
        stage: 'COORDINATOR_AGENT',
        agent: 'AI Coordinator Agent',
        status: 'error',
        message: `COORDINATOR error: ${(err as Error).message}. Showing fallback synthesis.`,
        timestamp: now(),
      });
      throw err;
    }

    // 7. Impact Analysis Agent
    let impactResult: ImpactAnalysisResult;
    try {
      impactResult = runImpactAnalysis(foodResult, energyResult, waterResult, wasteResult);
      this.lastImpact = impactResult;

      executionLogs.push({
        stage: 'IMPACT_AGENT',
        agent: 'Impact Analysis Agent',
        status: 'success',
        message: `IMPACT ANALYSIS completed: ESTIMATED $${impactResult.metrics.totalEstimatedCostSavingsMonth.toLocaleString()}/month cost savings and ${(impactResult.metrics.totalCo2eAvoidedKgMonth / 1000).toFixed(2)} MT CO2e avoided.`,
        timestamp: now(),
      });
    } catch (err) {
      executionLogs.push({
        stage: 'IMPACT_AGENT',
        agent: 'Impact Analysis Agent',
        status: 'error',
        message: `IMPACT ANALYSIS error: ${(err as Error).message}`,
        timestamp: now(),
      });
      throw err;
    }

    // 8. Persist to Firestore: agent_runs, action_plans, impact_records
    const agentRunRecord: AgentRunRecord = {
      id: coordinatorResult.runId,
      timestamp: coordinatorResult.timestamp,
      dataSource: 'DEMO',
      agentResults: {
        food: foodResult,
        energy: energyResult,
        water: waterResult,
        waste: wasteResult,
      },
      coordinatorResult,
      impactResult,
      executionLogs,
    };

    await Promise.all([
      campusDb.saveAgentRun(agentRunRecord),
      campusDb.saveActionPlans(coordinatorResult.prioritizedActionPlan),
      campusDb.saveImpactRecord(impactResult),
    ]);

    return {
      success: true,
      coordinator: coordinatorResult,
      impact: impactResult,
      executionLogs,
      agentResults: {
        food: foodResult,
        energy: energyResult,
        water: waterResult,
        waste: wasteResult,
      },
    };
  }

  // Getters
  async getFoodData(): Promise<FoodRecord[]> {
    return campusDb.getFoodRecords();
  }

  async getEnergyData(): Promise<EnergyRoomRecord[]> {
    return campusDb.getEnergyRecords();
  }

  async getWaterData(): Promise<WaterMeterRecord[]> {
    return campusDb.getWaterRecords();
  }

  async getActions(): Promise<ActionPlanItem[]> {
    return campusDb.getActionPlans();
  }

  getLastRun(): CoordinatorResult | null {
    return this.lastRun;
  }

  getLastImpact(): ImpactAnalysisResult | null {
    return this.lastImpact;
  }

  async getFoodMetrics() {
    const foodRecords = await campusDb.getFoodRecords();
    return this.latestFoodResult?.metrics || runFoodAgent(foodRecords).metrics;
  }

  async getEnergyMetrics() {
    const energyRooms = await campusDb.getEnergyRecords();
    return this.latestEnergyResult?.metrics || runEnergyAgent(energyRooms).metrics;
  }

  async getWaterMetrics() {
    const waterRecords = await campusDb.getWaterRecords();
    return this.latestWaterResult?.metrics || runWaterAgent(waterRecords).metrics;
  }

  getWasteMetrics() {
    return this.latestWasteResult?.metrics || runWasteAgent().metrics;
  }

  async updateRoomStatus(roomId: string, acStatus?: 'ON' | 'OFF' | 'ECO', lightsStatus?: 'ON' | 'OFF' | 'DIM') {
    const updated = await campusDb.updateEnergyRoomStatus(roomId, acStatus, lightsStatus);
    const rooms = await campusDb.getEnergyRecords();
    this.latestEnergyResult = runEnergyAgent(rooms);
    return updated;
  }

  async updateActionStatus(actionId: string, status: ActionPlanItem['status']) {
    const updated = await campusDb.updateActionPlanStatus(actionId, status);
    if (this.lastRun) {
      const target = this.lastRun.prioritizedActionPlan.find((a) => a.id === actionId);
      if (target) target.status = status;
    }
    return updated;
  }

  async getOverview(): Promise<CampusOverview> {
    return this.getCampusOverview();
  }

  async getCampusOverview(): Promise<CampusOverview> {
    const foodRecords = await campusDb.getFoodRecords();
    const energyRooms = await campusDb.getEnergyRecords();
    const waterRecords = await campusDb.getWaterRecords();
    const campus = await campusDb.getCampus();

    const foodMetrics = this.latestFoodResult?.metrics || runFoodAgent(foodRecords).metrics;
    const energyMetrics = this.latestEnergyResult?.metrics || runEnergyAgent(energyRooms).metrics;
    const waterMetrics = this.latestWaterResult?.metrics || runWaterAgent(waterRecords).metrics;
    const wasteMetrics = this.getWasteMetrics();

    // 7-day trend series computed dynamically
    const sevenDayTrends: CampusOverview['sevenDayTrends'] = [];
    const dateSet = Array.from(new Set(foodRecords.map((r) => r.date))).sort().slice(-7);

    for (const d of dateSet) {
      const dayFoods = foodRecords.filter((r) => r.date === d);
      const dayFoodWasteKg = dayFoods.reduce((acc, r) => acc + r.leftoverQuantityKg, 0);

      const dayWaters = waterRecords.filter((r) => r.date === d);
      const dayWaterLiters = dayWaters.reduce((acc, r) => acc + r.waterConsumptionLiters, 0);

      const dayEnergyKwh = Math.round(energyMetrics.totalCurrentPowerDrawKw * 14 + (dayFoods.length * 12));

      sevenDayTrends.push({
        date: d.slice(5),
        foodWasteKg: dayFoodWasteKg,
        energyKwh: dayEnergyKwh,
        waterLiters: Math.round(dayWaterLiters / 10),
        wasteDiversionRate: wasteMetrics.currentDiversionRatePercent,
      });
    }

    const foodScore = Math.max(0, 100 - foodMetrics.overallLeftoverRatePercent * 2.2);
    const energyScore = Math.max(0, 100 - (energyMetrics.anomalyRoomsCount / energyMetrics.totalRoomsAudited) * 60);
    const waterScore = Math.max(0, 100 - Math.abs(waterMetrics.campusOverallDeviationPercent) * 1.5);
    const wasteScore = Math.min(100, (wasteMetrics.currentDiversionRatePercent / wasteMetrics.targetDiversionRatePercent) * 100);

    const overallHealthScore = Math.round(
      foodScore * 0.25 + energyScore * 0.25 + waterScore * 0.25 + wasteScore * 0.25
    );

    return {
      campusInfo: {
        name: campus.name,
        campus: campus.campus,
        shortName: campus.shortName,
        location: campus.location,
        dataSource: 'DEMO',
      },
      overallHealthScore,
      activeAlertsCount: energyMetrics.anomalyRoomsCount + waterMetrics.anomalyBuildingsCount,
      activeAgentsCount: 6,
      criticalAnomaliesCount:
        energyMetrics.anomalyRoomsCount +
        waterMetrics.anomalyBuildingsCount +
        (foodMetrics.overallLeftoverRatePercent > 12 ? 1 : 0),
      totalEstimatedSavingsMonth:
        this.lastImpact?.metrics.totalEstimatedCostSavingsMonth || 3828,
      totalCarbonAvoidedKgMonth:
        this.lastImpact?.metrics.totalCo2eAvoidedKgMonth || 3042,
      lastRunTimestamp: this.lastRun?.timestamp || new Date().toISOString(),
      foodStatus: {
        status: foodMetrics.overallLeftoverRatePercent > 15 ? 'ALERT' : foodMetrics.overallLeftoverRatePercent > 10 ? 'WARNING' : 'OPTIMAL',
        leftoverRatePercent: foodMetrics.overallLeftoverRatePercent,
        currentLeftoverRatePercent: foodMetrics.overallLeftoverRatePercent,
        weeklyWasteKg: foodMetrics.potentialPreventableSurplusKgPerWeek,
        estimatedSurplusKgWeek: foodMetrics.potentialPreventableSurplusKgPerWeek,
        weeklySavingsPotential: foodMetrics.potentialCostSavingsDollarsPerWeek,
        trend: foodMetrics.overallLeftoverRatePercent > 12 ? 'degrading' : 'improving',
        alertsCount: foodMetrics.overallLeftoverRatePercent > 15 ? 1 : 0,
      },
      energyStatus: {
        status: energyMetrics.anomalyRoomsCount > 2 ? 'ALERT' : energyMetrics.anomalyRoomsCount > 0 ? 'WARNING' : 'OPTIMAL',
        wastedKwhDaily: energyMetrics.estimatedDailyEnergyWasteKwh,
        dailyKwhWaste: energyMetrics.estimatedDailyEnergyWasteKwh,
        unoccupiedPowerWasteKw: energyMetrics.totalIdlePowerWasteKw,
        unoccupiedActiveRooms: energyMetrics.anomalyRoomsCount,
        anomalousRoomsCount: energyMetrics.anomalyRoomsCount,
        trend: energyMetrics.anomalyRoomsCount > 0 ? 'degrading' : 'stable',
        alertsCount: energyMetrics.anomalyRoomsCount,
      },
      waterStatus: {
        status: waterMetrics.highestVarianceDeviationPercent > 30 ? 'ALERT' : waterMetrics.highestVarianceDeviationPercent > 15 ? 'WARNING' : 'OPTIMAL',
        deviationPercent: waterMetrics.campusOverallDeviationPercent,
        campusDeviationPercent: waterMetrics.campusOverallDeviationPercent,
        highestVarianceBuilding: waterMetrics.highestVarianceBuilding,
        unexplainedExcessLitersDay: waterMetrics.excessWaterVolumeLitersPerDay,
        suspectedAnomalies: waterMetrics.anomalyBuildingsCount,
        trend: waterMetrics.highestVarianceDeviationPercent > 20 ? 'degrading' : 'stable',
        alertsCount: waterMetrics.anomalyBuildingsCount,
      },
      wasteStatus: {
        status: wasteMetrics.contaminationRatePercent > 15 ? 'WARNING' : 'OPTIMAL',
        diversionRatePercent: wasteMetrics.currentDiversionRatePercent,
        targetDiversionRatePercent: wasteMetrics.targetDiversionRatePercent,
        contaminationRatePercent: wasteMetrics.contaminationRatePercent,
        trend: wasteMetrics.currentDiversionRatePercent < 50 ? 'degrading' : 'improving',
        alertsCount: wasteMetrics.contaminationRatePercent > 15 ? 1 : 0,
      },
      sevenDayTrends,
    };
  }
}

export const store = new SustainabilityStore();
export { DEMO_WASTE_ITEMS };
