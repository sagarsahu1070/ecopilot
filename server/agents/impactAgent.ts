import { ImpactAnalysisResult, ImpactRecord } from '../../src/types/index.ts';
import { FoodAgentResult } from './foodAgent.ts';
import { EnergyAgentResult } from './energyAgent.ts';
import { WaterAgentResult } from './waterAgent.ts';
import { WasteAgentResult } from './wasteAgent.ts';

export function runImpactAnalysis(
  foodResult: FoodAgentResult,
  energyResult: EnergyAgentResult,
  waterResult: WaterAgentResult,
  wasteResult: WasteAgentResult
): ImpactAnalysisResult {
  const runId = `srm-impact-${Date.now()}`;
  const timestamp = new Date().toISOString();

  // Unit Economic & Carbon Assumptions (normalized for SRM KTR institution)
  const assumptions = {
    currencySymbol: '$', // normalized baseline
    foodWasteCostPerKg: 3.5, // Average raw ingredient + kitchen prep labor
    energyCostPerKwh: 0.14, // Commercial institutional utility tariff ($/kWh)
    waterCostPerLiter: 0.0035, // Municipal supply + wastewater surcharge ($/L)
    carbonIntensityGridKwhKg: 0.42, // Regional electrical grid emission factor (kg CO2e / kWh)
    carbonIntensityFoodWasteKg: 2.5, // Landfill anaerobic methane emission factor (kg CO2e / kg food)
    carbonIntensityWaterM3Kg: 0.35, // Pumping, conveyance and wastewater treatment emissions (kg CO2e / 1,000 L)
  };

  // 1. Food Impact (Monthly extrapolation: 4.3 weeks per month)
  const monthlyPreventableFoodKg = Math.round(
    foodResult.metrics.potentialPreventableSurplusKgPerWeek * 4.3
  );
  const estimatedFoodCostSavings = Math.round(
    monthlyPreventableFoodKg * assumptions.foodWasteCostPerKg
  );
  const estimatedFoodCo2AvoidedKg = Math.round(
    monthlyPreventableFoodKg * assumptions.carbonIntensityFoodWasteKg
  );

  // 2. Energy Impact
  const monthlyEnergySavingsKwh = Math.round(
    energyResult.metrics.estimatedDailyEnergyWasteKwh * 30
  );
  const estimatedEnergyCostSavings = Math.round(
    monthlyEnergySavingsKwh * assumptions.energyCostPerKwh
  );
  const estimatedEnergyCo2AvoidedKg = Math.round(
    monthlyEnergySavingsKwh * assumptions.carbonIntensityGridKwhKg
  );

  // 3. Water Impact
  const monthlyWaterSavingsLiters = Math.round(
    waterResult.metrics.excessWaterVolumeLitersPerDay * 30
  );
  const estimatedWaterCostSavings = Math.round(
    monthlyWaterSavingsLiters * assumptions.waterCostPerLiter
  );
  const estimatedWaterCo2AvoidedKg = Math.round(
    (monthlyWaterSavingsLiters / 1000) * assumptions.carbonIntensityWaterM3Kg
  );

  // 4. Waste Impact
  const estimatedDiversionRatePercent = Number(
    (
      wasteResult.metrics.currentDiversionRatePercent +
      (wasteResult.metrics.targetDiversionRatePercent - wasteResult.metrics.currentDiversionRatePercent) * 0.65
    ).toFixed(1)
  );
  const estimatedWasteCostSavings = wasteResult.metrics.monthlyLandfillTippingFeeSavingsDollars;

  // 5. Total Consolidated Impact
  const totalEstimatedCostSavingsMonth =
    estimatedFoodCostSavings +
    estimatedEnergyCostSavings +
    estimatedWaterCostSavings +
    estimatedWasteCostSavings;

  const totalCo2eAvoidedKgMonth =
    estimatedFoodCo2AvoidedKg +
    estimatedEnergyCo2AvoidedKg +
    estimatedWaterCo2AvoidedKg;

  const equivalentTreesPlanted = Math.round(totalCo2eAvoidedKgMonth / 21.77);

  const summary = `ESTIMATED monthly potential savings of $${totalEstimatedCostSavingsMonth.toLocaleString()} and ${(totalCo2eAvoidedKgMonth / 1000).toFixed(2)} Metric Tons CO2e avoided across SRM KTR campus operations through coordinated multi-agent recommendations.`;

  return {
    id: runId,
    runId,
    timestamp,
    summary,
    dataSource: 'DEMO',
    label: 'ESTIMATED',
    assumptions,
    metrics: {
      estimatedFoodWasteReductionKg: monthlyPreventableFoodKg,
      estimatedFoodCostSavings,
      estimatedFoodCo2AvoidedKg,

      estimatedEnergySavingsKwh: monthlyEnergySavingsKwh,
      estimatedEnergyCostSavings,
      estimatedEnergyCo2AvoidedKg,

      estimatedWaterSavingsLiters: monthlyWaterSavingsLiters,
      estimatedWaterCostSavings,
      estimatedWaterCo2AvoidedKg,

      estimatedDiversionRatePercent,
      estimatedWasteCostSavings,

      totalEstimatedCostSavingsMonth,
      totalCo2eAvoidedKgMonth,
      equivalentTreesPlanted,
    },
    disclaimer:
      'ESTIMATED PROJECTIONS: All financial savings, carbon offsets, and resource volumes are calculated model projections derived from simulated prototype datasets and explicit tariff assumptions. These projections do not represent verified real-world utility bill credits or measured SRMIST fiscal figures until verified by physical campus meters.',
  };
}
