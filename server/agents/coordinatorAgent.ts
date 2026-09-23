import { GoogleGenAI } from '@google/genai';
import {
  AgentReport,
  ActionPlanItem,
  CoordinatorResult,
} from '../../src/types/index.ts';
import { FoodAgentResult } from './foodAgent.ts';
import { EnergyAgentResult } from './energyAgent.ts';
import { WaterAgentResult } from './waterAgent.ts';
import { WasteAgentResult } from './wasteAgent.ts';

export interface CoordinatorRunInput {
  foodResult: FoodAgentResult;
  energyResult: EnergyAgentResult;
  waterResult: WaterAgentResult;
  wasteResult: WasteAgentResult;
  aiClient: GoogleGenAI | null;
  hasGeminiKey: boolean;
}

export async function runCoordinatorAgent(input: CoordinatorRunInput): Promise<CoordinatorResult> {
  const { foodResult, energyResult, waterResult, wasteResult, aiClient, hasGeminiKey } = input;
  const runId = `srm-run-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const agentReports: AgentReport[] = [
    foodResult.report,
    energyResult.report,
    waterResult.report,
    wasteResult.report,
  ];

  // Try calling Gemini Coordinator with real reports if Gemini is configured
  if (aiClient && hasGeminiKey) {
    try {
      const coordinatorPrompt = `You are the EcoPilot SRM KTR Central AI Coordinator for SRM Institute of Science and Technology, Kattankulathur Campus.
You are synthesizing reports from 4 specialized autonomous agents (Food Waste, Energy Waste, Water Usage, General Waste).
DO NOT invent measurements, numbers, or facilities not present in these agent outputs.
All actions must require human approval before physical execution (facilities staff or dining managers).

AGENT OUTPUTS:
1. Food Waste Agent:
- Summary: ${foodResult.report.summary}
- Leftover Rate: ${foodResult.metrics.overallLeftoverRatePercent}%
- Rainy Day Leftover Rate: ${foodResult.metrics.rainyDayLeftoverRatePercent}% (vs Sunny ${foodResult.metrics.sunnyDayLeftoverRatePercent}%)
- Estimated Next Meal Demand: ${foodResult.metrics.estimatedNextMealDemand} meals
- Recommended Preparation: ${foodResult.metrics.recommendedPreparationMeals} meals
- Potential Savings: $${foodResult.metrics.potentialCostSavingsDollarsPerWeek}/week (~${foodResult.metrics.potentialPreventableSurplusKgPerWeek} kg food saved/wk)
- Findings: ${JSON.stringify(foodResult.report.findings)}

2. Energy Waste Agent:
- Summary: ${energyResult.report.summary}
- Active Anomaly Rooms: ${energyResult.metrics.anomalyRoomsCount}
- Idle Power Wasted: ${energyResult.metrics.totalIdlePowerWasteKw} kW
- Estimated Daily Waste: ${energyResult.metrics.estimatedDailyEnergyWasteKwh} kWh/day
- Potential Weekly Waste Cost: $${energyResult.metrics.projectedWeeklyCostWasteDollars}/week
- Carbon Offset Potential: ${energyResult.metrics.potentialDailyCarbonOffsetKgCo2e} kg CO2e/day
- Findings: ${JSON.stringify(energyResult.report.findings)}

3. Water Usage Agent:
- Summary: ${waterResult.report.summary}
- Campus Deviation: +${waterResult.metrics.campusOverallDeviationPercent}%
- Highest Variance Building: ${waterResult.metrics.highestVarianceBuilding} (+${waterResult.metrics.highestVarianceDeviationPercent}%)
- Weekly Excess Volume: ${waterResult.metrics.excessWaterVolumeLitersPerWeek.toLocaleString()} Liters
- Estimated Weekly Cost Impact: $${waterResult.metrics.estimatedWeeklyCostImpactDollars}/week
- Findings: ${JSON.stringify(waterResult.report.findings)}

4. General Waste Agent:
- Summary: ${wasteResult.report.summary}
- Current Diversion Rate: ${wasteResult.metrics.currentDiversionRatePercent}% (Target: ${wasteResult.metrics.targetDiversionRatePercent}%)
- Contamination Rate: ${wasteResult.metrics.contaminationRatePercent}%
- Monthly Diversion Potential: ${wasteResult.metrics.monthlyLandfillDiversionPotentialKg.toLocaleString()} kg
- Monthly Tipping Savings: $${wasteResult.metrics.monthlyLandfillTippingFeeSavingsDollars}/month
- Findings: ${JSON.stringify(wasteResult.report.findings)}

TASK:
Analyze the 4 agent reports above.
Return a valid JSON object strictly matching this schema:
{
  "situationOverview": "2-3 concise sentences summarizing the overall campus situation using the actual numbers above.",
  "synthesisReasoning": "2-3 sentences explaining trade-offs and why certain actions are prioritized first (e.g. food prep has fastest ROI, water prevents mechanical damage).",
  "criticalIssuesCount": number of critical or high severity issues identified across the agents,
  "investigationRequiredCount": number of issues requiring human physical inspection (like water acoustic probe),
  "actionPlan": [
    {
      "priority": number (1 to 5),
      "title": "Action title",
      "sourceAgent": "food" | "energy" | "water" | "waste" | "coordinator",
      "buildingOrArea": "Location string",
      "description": "Concrete explanation using the real numbers from the agent reports",
      "reasoning": "Why this priority was selected",
      "actionRequired": "Specific directive for human staff",
      "authorityLevel": "Dining Mgr" | "Facilities Lead" | "Sustainability Director" | "Automation Trigger",
      "severity": "critical" | "high" | "medium" | "low",
      "estimatedImpact": "Short text summary of impact",
      "costPerWeek": number (weekly dollars saved),
      "resourceSaved": "Brief text like '85 kg food saved / wk'",
      "co2EquivalentKg": number,
      "humanApprovalRequired": true
    }
  ]
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: coordinatorPrompt,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        const actionPlan: ActionPlanItem[] = (parsed.actionPlan || []).map(
          (item: any, idx: number) => ({
            id: `act-${Date.now()}-${idx + 1}`,
            priority: item.priority || idx + 1,
            title: item.title,
            sourceAgent: item.sourceAgent || item.agentSource || 'coordinator',
            agentSource: item.sourceAgent || item.agentSource || 'coordinator',
            buildingOrArea: item.buildingOrArea || 'SRM KTR Campus',
            description: item.description,
            reasoning: item.reasoning,
            actionRequired: item.actionRequired,
            authorityLevel: item.authorityLevel || 'Facilities Lead',
            severity: item.severity || 'medium',
            estimatedImpact: item.estimatedImpact || `+$${item.costPerWeek || 0}/wk savings`,
            estimatedSavings: {
              costPerWeek: item.costPerWeek || 0,
              resourceSaved: item.resourceSaved || 'Resource conserved',
              co2EquivalentKg: item.co2EquivalentKg || 0,
            },
            humanApprovalRequired: true,
            status: idx === 1 ? 'in_investigation' : 'pending',
            createdAt: timestamp,
            dataSource: 'DEMO',
          })
        );

        return {
          runId,
          timestamp,
          situationOverview: parsed.situationOverview,
          criticalIssuesIdentified: parsed.criticalIssuesCount || 3,
          investigationRequiredCount: parsed.investigationRequiredCount || 2,
          prioritizedActionPlan: actionPlan,
          synthesisReasoning: parsed.synthesisReasoning,
          agentReports,
          coordinatorMode: 'Gemini 3.8 Flash',
          dataSource: 'DEMO',
        };
      }
    } catch (error) {
      console.warn('Gemini Coordinator call failed or timed out. Falling back to deterministic rule engine:', error);
    }
  }

  // DETERMINISTIC RULE-BASED COORDINATOR FALLBACK
  const fallbackPlan: ActionPlanItem[] = [
    {
      id: `act-${Date.now()}-1`,
      priority: 1,
      title: "Recalibrate Sannasi Mess Tomorrow Dinner Preparation Quantities",
      sourceAgent: 'food',
      agentSource: 'food',
      buildingOrArea: 'Sannasi Mess A & Residential Complex',
      description: `Analysis across ${foodResult.metrics.totalRecordsAnalyzed} meal logs shows rainy dinner surplus at ${foodResult.metrics.rainyDayLeftoverRatePercent}%. Adjust baseline prep buffer from 15% to 5% (${foodResult.metrics.recommendedPreparationMeals} meals recommended vs ${foodResult.metrics.estimatedNextMealDemand} expected demand).`,
      reasoning: 'Fastest operational ROI with immediate zero-capital savings; prevents direct biological spoilage in hostel kitchens.',
      actionRequired: 'Hostel mess warden review and kitchen batch production schedule update.',
      authorityLevel: 'Dining Mgr',
      severity: 'high',
      estimatedImpact: `Preventable ~${foodResult.metrics.potentialPreventableSurplusKgPerWeek} kg food surplus/week ($${foodResult.metrics.potentialCostSavingsDollarsPerWeek}/wk)`,
      estimatedSavings: {
        costPerWeek: foodResult.metrics.potentialCostSavingsDollarsPerWeek,
        resourceSaved: `${foodResult.metrics.potentialPreventableSurplusKgPerWeek} kg food saved / wk`,
        co2EquivalentKg: Math.round(foodResult.metrics.potentialPreventableSurplusKgPerWeek * 2.5),
      },
      humanApprovalRequired: true,
      status: 'pending',
      createdAt: timestamp,
      dataSource: 'DEMO',
    },
    {
      id: `act-${Date.now()}-2`,
      priority: 2,
      title: `Acoustic Probe & Submeter Inspection in ${waterResult.metrics.highestVarianceBuilding}`,
      sourceAgent: 'water',
      agentSource: 'water',
      buildingOrArea: waterResult.metrics.highestVarianceBuilding,
      description: `Water flow deviated +${waterResult.metrics.highestVarianceDeviationPercent}% above baseline with continuous off-peak night draw (${waterResult.metrics.excessWaterVolumeLitersPerWeek.toLocaleString()} L excess volume/week). Probable pressure-relief bypass, continuous flush fixture, or cooling tower auto-fill issue. (Not verified as a leak without acoustic probe).`,
      reasoning: 'High-risk infrastructure vulnerability; undetected pressurized water leaks degrade structural slabs and inflate municipal wastewater surcharges.',
      actionRequired: 'Dispatch SRM campus facilities plumbing supervisor with ultrasonic listening stick to mechanical risers.',
      authorityLevel: 'Facilities Lead',
      severity: 'high',
      estimatedImpact: `Excess ~${waterResult.metrics.excessWaterVolumeLitersPerWeek.toLocaleString()} L/week ($${waterResult.metrics.estimatedWeeklyCostImpactDollars}/wk)`,
      estimatedSavings: {
        costPerWeek: waterResult.metrics.estimatedWeeklyCostImpactDollars,
        resourceSaved: `${waterResult.metrics.excessWaterVolumeLitersPerWeek.toLocaleString()} L water / wk`,
        co2EquivalentKg: Math.round(waterResult.metrics.excessWaterVolumeLitersPerWeek * 0.00035),
      },
      humanApprovalRequired: true,
      status: 'in_investigation',
      createdAt: timestamp,
      dataSource: 'DEMO',
    },
    {
      id: `act-${Date.now()}-3`,
      priority: 3,
      title: `BMS Night Setback for ${energyResult.metrics.anomalyRoomsCount} Unoccupied Spaces in TP & TP2`,
      sourceAgent: 'energy',
      agentSource: 'energy',
      buildingOrArea: 'Tech Park (TP) Lab 304 & Auditorium Stage',
      description: `${energyResult.metrics.anomalyRoomsCount} campus rooms detected drawing ${energyResult.metrics.totalIdlePowerWasteKw} kW while completely unoccupied. Estimated daily waste is ${energyResult.metrics.estimatedDailyEnergyWasteKwh} kWh.`,
      reasoning: 'Substantial direct electrical cost waste and unnecessary wear on compressor units during low-occupancy windows.',
      actionRequired: 'SRM electrical engineer trigger authorized BMS setback to 24°C and send remote PC sleep command.',
      authorityLevel: 'Automation Trigger',
      severity: 'critical',
      estimatedImpact: `~$${energyResult.metrics.projectedWeeklyCostWasteDollars}/week in avoidable power draw`,
      estimatedSavings: {
        costPerWeek: energyResult.metrics.projectedWeeklyCostWasteDollars,
        resourceSaved: `${Math.round(energyResult.metrics.estimatedDailyEnergyWasteKwh * 7)} kWh electricity / wk`,
        co2EquivalentKg: Math.round(energyResult.metrics.potentialDailyCarbonOffsetKgCo2e * 7),
      },
      humanApprovalRequired: true,
      status: 'pending',
      createdAt: timestamp,
      dataSource: 'DEMO',
    },
    {
      id: `act-${Date.now()}-4`,
      priority: 4,
      title: 'Upgrade Recycling Waste Stream Sorting & Signage in Tech Park',
      sourceAgent: 'waste',
      agentSource: 'waste',
      buildingOrArea: 'Tech Park Main Concourse & Food Court',
      description: `Current diversion is ${wasteResult.metrics.currentDiversionRatePercent}% vs ${wasteResult.metrics.targetDiversionRatePercent}% target, with ${wasteResult.metrics.contaminationRatePercent}% contamination in paper packaging stream.`,
      reasoning: 'Reduces municipal landfill tipping fees and prevents full recycling cart rejection at the materials recovery facility.',
      actionRequired: 'Housekeeping supervisor install visual bilingual guide decals and liquids disposal funnels at central waste islands.',
      authorityLevel: 'Sustainability Director',
      severity: 'medium',
      estimatedImpact: `Potential ${wasteResult.metrics.monthlyLandfillDiversionPotentialKg.toLocaleString()} kg/month landfill diversion`,
      estimatedSavings: {
        costPerWeek: Math.round(wasteResult.metrics.monthlyLandfillTippingFeeSavingsDollars / 4),
        resourceSaved: `${Math.round(wasteResult.metrics.monthlyLandfillDiversionPotentialKg / 4)} kg diverted / wk`,
        co2EquivalentKg: Math.round((wasteResult.metrics.monthlyLandfillDiversionPotentialKg / 4) * 0.5),
      },
      humanApprovalRequired: true,
      status: 'pending',
      createdAt: timestamp,
      dataSource: 'DEMO',
    },
    {
      id: `act-${Date.now()}-5`,
      priority: 5,
      title: 'Autonomous Follow-up Telemetry Audit in 48 Hours',
      sourceAgent: 'coordinator',
      agentSource: 'coordinator',
      buildingOrArea: 'SRM KTR Campus-wide',
      description: 'Schedule automated EcoPilot rescan to verify post-intervention consumption deltas against historical baseline.',
      reasoning: 'Closes the DETECT -> INVESTIGATE -> DECIDE -> RECOMMEND -> MEASURE -> LEARN continuous feedback loop.',
      actionRequired: 'Facilities supervisor confirmation for automated telemetry re-audit.',
      authorityLevel: 'Sustainability Director',
      severity: 'low',
      estimatedImpact: 'Continuous telemetry optimization and variance tracking',
      estimatedSavings: {
        costPerWeek: 0,
        resourceSaved: 'Systemic Learning Loop',
        co2EquivalentKg: 0,
      },
      humanApprovalRequired: true,
      status: 'pending',
      createdAt: timestamp,
      dataSource: 'DEMO',
    },
  ];

  return {
    runId,
    timestamp,
    situationOverview:
      `EcoPilot autonomous monitoring across SRM KTR campus domains flagged ${energyResult.metrics.anomalyRoomsCount + waterResult.metrics.anomalyBuildingsCount} operational anomalies. Primary focal points include Tech Pavilion 2 off-peak flow variance (+${waterResult.metrics.highestVarianceDeviationPercent}%) and idle HVAC loads in Tech Park Lab 304.`,
    criticalIssuesIdentified: 3,
    investigationRequiredCount: 2,
    prioritizedActionPlan: fallbackPlan,
    synthesisReasoning:
      'The Coordinator prioritized Sannasi Mess food prep and Tech Pavilion 2 water inspection as immediate ROI targets. Food waste yields immediate cost reduction without capital expense, while water investigation prevents potential mechanical failure. Human authorization is strictly enforced before any equipment control.',
    agentReports,
    coordinatorMode: hasGeminiKey ? 'Gemini 3.8 Flash' : 'Deterministic Rule Engine',
    dataSource: 'DEMO',
  };
}
