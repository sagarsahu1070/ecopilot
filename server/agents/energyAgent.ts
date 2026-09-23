import { EnergyRoomRecord, AgentReport, AgentFinding } from '../../src/types/index.ts';

export interface EnergyAgentMetrics {
  totalRoomsAudited: number;
  unoccupiedRoomsCount: number;
  emptyRoomsWithAcCount: number;
  emptyRoomsWithLightsCount: number;
  anomalyRoomsCount: number;
  totalCurrentPowerDrawKw: number;
  totalBaselineExpectedKw: number;
  totalIdlePowerWasteKw: number;
  estimatedDailyEnergyWasteKwh: number;
  potentialDailyCarbonOffsetKgCo2e: number;
  projectedWeeklyCostWasteDollars: number;
}

export interface EnergyAgentResult {
  report: AgentReport;
  metrics: EnergyAgentMetrics;
  evaluatedRooms: EnergyRoomRecord[];
}

export function runEnergyAgent(rooms: EnergyRoomRecord[]): EnergyAgentResult {
  if (!rooms || rooms.length === 0) {
    throw new Error('Energy Agent: No room telemetry records provided for audit');
  }

  // Evaluate each room dynamically
  const evaluatedRooms: EnergyRoomRecord[] = rooms.map((room) => {
    let isAnomaly = false;
    let anomalyReason: string | undefined;

    const isEmpty = room.occupancy === 0;
    const acRunning = room.acStatus === 'ON';
    const lightsOn = room.lightsStatus === 'ON';
    const excessiveDraw = room.powerConsumptionKw > room.baselineExpectedKw * 1.8;

    if (isEmpty && acRunning && room.powerConsumptionKw > 5.0) {
      isAnomaly = true;
      anomalyReason = `Zero occupancy while commercial HVAC is actively cooling (${room.acSetTemperatureC}°C) and ${room.activeComputers} PCs drawing power`;
    } else if (isEmpty && acRunning) {
      isAnomaly = true;
      anomalyReason = `Empty room with AC running at ${room.acSetTemperatureC}°C`;
    } else if (isEmpty && lightsOn && room.powerConsumptionKw > 0.6) {
      isAnomaly = true;
      anomalyReason = 'Unoccupied space with high-bay illumination energized';
    } else if (excessiveDraw && room.occupancy < 3) {
      isAnomaly = true;
      anomalyReason = `Power draw (${room.powerConsumptionKw} kW) significantly exceeds baseline (${room.baselineExpectedKw} kW) given low occupancy (${room.occupancy})`;
    }

    return {
      ...room,
      isAnomaly,
      anomalyReason,
    };
  });

  const totalRoomsAudited = evaluatedRooms.length;
  const unoccupiedRooms = evaluatedRooms.filter((r) => r.occupancy === 0);
  const emptyRoomsWithAc = evaluatedRooms.filter((r) => r.occupancy === 0 && r.acStatus === 'ON');
  const emptyRoomsWithLights = evaluatedRooms.filter((r) => r.occupancy === 0 && r.lightsStatus === 'ON');
  const anomalyRooms = evaluatedRooms.filter((r) => r.isAnomaly);

  const totalCurrentPowerDrawKw = Number(
    evaluatedRooms.reduce((acc, r) => acc + r.powerConsumptionKw, 0).toFixed(1)
  );
  const totalBaselineExpectedKw = Number(
    evaluatedRooms.reduce((acc, r) => acc + r.baselineExpectedKw, 0).toFixed(1)
  );

  // Wasted kW is sum of (actual - baseline) for anomaly rooms
  const totalIdlePowerWasteKw = Number(
    anomalyRooms
      .reduce((acc, r) => acc + Math.max(0, r.powerConsumptionKw - r.baselineExpectedKw), 0)
      .toFixed(1)
  );

  // Daily energy waste (assuming average 12-16 hours idle setback duration for anomalous spaces)
  const averageIdleHoursPerDay = 14;
  const estimatedDailyEnergyWasteKwh = Math.round(totalIdlePowerWasteKw * averageIdleHoursPerDay);

  // Carbon emission factor for regional grid: 0.42 kg CO2e per kWh
  const gridEmissionFactorKgPerKwh = 0.42;
  const potentialDailyCarbonOffsetKgCo2e = Number(
    (estimatedDailyEnergyWasteKwh * gridEmissionFactorKgPerKwh).toFixed(1)
  );

  // Commercial utility rate: $0.14 per kWh
  const electricityRatePerKwh = 0.14;
  const projectedWeeklyCostWasteDollars = Math.round(
    estimatedDailyEnergyWasteKwh * 7 * electricityRatePerKwh
  );

  // Generate dynamic findings for top anomalous rooms
  const findings: AgentFinding[] = [];

  // Sort anomalies by wasted kW descending
  const sortedAnomalies = [...anomalyRooms].sort(
    (a, b) =>
      b.powerConsumptionKw - b.baselineExpectedKw - (a.powerConsumptionKw - a.baselineExpectedKw)
  );

  if (sortedAnomalies.length > 0) {
    const top = sortedAnomalies[0];
    const wastedTopKw = Number((top.powerConsumptionKw - top.baselineExpectedKw).toFixed(1));
    const wastedKwh24h = Math.round(wastedTopKw * 16);
    findings.push({
      id: 'e-find-1',
      category: 'Idle HVAC & Equipment',
      title: `${top.room} unoccupied with high cooling & workstation draw`,
      description: `Space in ${top.building} has 0 occupancy, but draws ${top.powerConsumptionKw} kW (baseline ${top.baselineExpectedKw} kW). Thermostat set to ${top.acSetTemperatureC}°C with ${top.activeComputers} active workstations.`,
      location: `${top.building} - ${top.room}`,
      metric: `${top.powerConsumptionKw} kW current draw vs ${top.baselineExpectedKw} kW baseline`,
      severity: 'critical',
      confidence: 98,
      potentialImpact: `Wasting ~${wastedKwh24h} kWh daily (~$${Math.round(wastedKwh24h * electricityRatePerKwh * 7)}/week)`,
      recommendedAction: 'Dispatch automated BMS nighttime setback command to 24°C and initiate remote PC sleep policy.',
    });
  }

  if (sortedAnomalies.length > 1) {
    const second = sortedAnomalies[1];
    findings.push({
      id: 'e-find-2',
      category: 'Lighting & HVAC Anomaly',
      title: `${second.room} idle equipment energized`,
      description: `${second.building} ${second.room} registered 0 occupants. AC status is ${second.acStatus}, lights status is ${second.lightsStatus}, consuming ${second.powerConsumptionKw} kW.`,
      location: `${second.building} - ${second.room}`,
      metric: `${second.powerConsumptionKw} kW active draw with 0 occupants`,
      severity: second.powerConsumptionKw > 5 ? 'high' : 'medium',
      confidence: 94,
      potentialImpact: `~$${Math.round(second.powerConsumptionKw * 12 * 7 * electricityRatePerKwh)}/week preventable utility loss`,
      recommendedAction: 'Verify room schedule and trigger authorized facilities equipment switch-off.',
    });
  }

  const metrics: EnergyAgentMetrics = {
    totalRoomsAudited,
    unoccupiedRoomsCount: unoccupiedRooms.length,
    emptyRoomsWithAcCount: emptyRoomsWithAc.length,
    emptyRoomsWithLightsCount: emptyRoomsWithLights.length,
    anomalyRoomsCount: anomalyRooms.length,
    totalCurrentPowerDrawKw,
    totalBaselineExpectedKw,
    totalIdlePowerWasteKw,
    estimatedDailyEnergyWasteKwh,
    potentialDailyCarbonOffsetKgCo2e,
    projectedWeeklyCostWasteDollars,
  };

  const report: AgentReport = {
    agentName: 'Energy Waste Agent',
    agentKey: 'energy',
    timestamp: new Date().toISOString(),
    status: 'completed',
    summary: `Audited ${totalRoomsAudited} campus spaces: ${anomalyRooms.length} rooms flagged with idle consumption (${totalIdlePowerWasteKw} kW waste). Estimated ${estimatedDailyEnergyWasteKwh} kWh wasted daily across unoccupied zones.`,
    severity: anomalyRooms.length > 2 ? 'critical' : 'high',
    confidence: 96,
    findings,
    metricsSummary: {
      'Active Anomaly Spaces': `${anomalyRooms.length} rooms`,
      'Total Idle Power Waste': `${totalIdlePowerWasteKw} kW`,
      'Estimated Daily Waste': `${estimatedDailyEnergyWasteKwh} kWh`,
      'Daily Carbon Offset Potential': `${potentialDailyCarbonOffsetKgCo2e} kg CO2e`,
      'Weekly Cost Impact': `$${projectedWeeklyCostWasteDollars}/wk`,
    },
    recommendedActions: [
      `Dispatch facilities lead or BMS preset to de-energize ${anomalyRooms.length} idle spaces`,
      'Deploy PC workstation automatic sleep policy on campus computer laboratories',
      'Recalibrate PIR motion timeout sensors in Engineering Hall lecture halls',
    ],
  };

  return { report, metrics, evaluatedRooms };
}
