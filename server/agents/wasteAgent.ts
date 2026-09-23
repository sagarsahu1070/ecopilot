import { AgentReport, AgentFinding, WasteClassificationResult } from '../../src/types/index.ts';
import { SRM_WASTE_DATA, DEMO_WASTE_ITEMS } from '../data/demoData.ts';

export interface WasteAgentMetrics {
  totalWasteMonthlyKg: number;
  recycledMaterialMonthlyKg: number;
  compostedMaterialMonthlyKg: number;
  landfillMaterialMonthlyKg: number;
  currentDiversionRatePercent: number;
  targetDiversionRatePercent: number;
  contaminationRatePercent: number;
  monthlyLandfillDiversionPotentialKg: number;
  monthlyLandfillTippingFeeSavingsDollars: number;
}

export interface WasteAgentResult {
  report: AgentReport;
  metrics: WasteAgentMetrics;
}

export function runWasteAgent(): WasteAgentResult {
  const data = SRM_WASTE_DATA;

  // Potential improvement: bridge current diversion rate to target rate
  const deltaPercent = Math.max(0, data.targetDiversionRatePercent - data.currentDiversionRatePercent);
  const monthlyLandfillDiversionPotentialKg = Math.round(data.totalWasteMonthlyKg * (deltaPercent / 100));

  // Landfill tipping fee avoidance: ~$70 per metric ton ($0.07/kg) + recyclable rebate
  const tippingFeePerKg = 0.07;
  const monthlyLandfillTippingFeeSavingsDollars = Math.round(
    monthlyLandfillDiversionPotentialKg * tippingFeePerKg
  );

  const findings: AgentFinding[] = [
    {
      id: 'ws-find-1',
      category: 'Recycling Contamination',
      title: 'Packaging Contamination in Tech Park Paper & Cardboard Bins',
      description: `Audit of ${data.sampleBaleCountAudited} recycling bales revealed ${data.sampleBalesRejected} rejections (${data.contaminationRatePercent}% contamination rate) in the ${data.primaryContaminantStream}. Discarded beverage cups with residual liquids in dry paper stream trigger load rejection by dry recycling haulers.`,
      location: 'Tech Park Atrium & Food Court',
      metric: `${data.contaminationRatePercent}% contamination rate vs < 5% processor tolerance`,
      severity: 'medium',
      confidence: 90,
      potentialImpact: `Prevents ${monthlyLandfillDiversionPotentialKg.toLocaleString()} kg of compostable & recyclable material from being sent to landfill each month`,
      recommendedAction: 'Install smart visual sorting signage with clear liquid dump funnels at Tech Park waste stations before semester exam peaks.',
    },
  ];

  const metrics: WasteAgentMetrics = {
    totalWasteMonthlyKg: data.totalWasteMonthlyKg,
    recycledMaterialMonthlyKg: data.recycledMaterialMonthlyKg,
    compostedMaterialMonthlyKg: data.compostedMaterialMonthlyKg,
    landfillMaterialMonthlyKg: data.landfillMaterialMonthlyKg,
    currentDiversionRatePercent: data.currentDiversionRatePercent,
    targetDiversionRatePercent: data.targetDiversionRatePercent,
    contaminationRatePercent: data.contaminationRatePercent,
    monthlyLandfillDiversionPotentialKg,
    monthlyLandfillTippingFeeSavingsDollars,
  };

  const report: AgentReport = {
    agentName: 'General Waste Agent',
    agentKey: 'waste',
    timestamp: new Date().toISOString(),
    status: 'completed',
    summary: `Campus diversion rate is ${data.currentDiversionRatePercent}% against the ${data.targetDiversionRatePercent}% institutional target. Contamination in paper recycling stream is ${data.contaminationRatePercent}%, causing processor bale rejection.`,
    severity: data.contaminationRatePercent > 15 ? 'medium' : 'low',
    confidence: 89,
    findings,
    metricsSummary: {
      'Current Diversion Rate': `${data.currentDiversionRatePercent}%`,
      'Contamination Rate': `${data.contaminationRatePercent}%`,
      'Target Diversion Rate': `${data.targetDiversionRatePercent}%`,
      'Monthly Diversion Potential': `${(monthlyLandfillDiversionPotentialKg / 1000).toFixed(1)} MT / month`,
      'Tipping Fee Savings': `$${monthlyLandfillTippingFeeSavingsDollars}/month`,
    },
    recommendedActions: [
      'Deploy clear visual sorting signage and liquid dump sink at Tech Park waste hubs',
      'Schedule annual campus electronics & e-waste drive prior to hostel departures',
      'Conduct pre-composting food waste scullery contamination audit at Sannasi Mess A',
    ],
  };

  return { report, metrics };
}
