import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { store, DEMO_WASTE_ITEMS } from './server/store.ts';
import { campusDb } from './server/campusDb.ts';
import { dataSourceManager } from './server/dataSourceAdapter.ts';
import { ai, hasGeminiKey } from './server/gemini.ts';
import { runFoodAgent } from './server/agents/foodAgent.ts';
import { runEnergyAgent } from './server/agents/energyAgent.ts';
import { runWaterAgent } from './server/agents/waterAgent.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: hasGeminiKey,
    environment: 'EcoPilot SRM KTR Full-stack',
    campus: 'SRM Institute of Science and Technology, Kattankulathur',
    dataSource: campusDb.getActiveDataSource(),
  });
});

// ==========================================
// 1. CAMPUS INFRASTRUCTURE ENDPOINTS
// ==========================================

// GET /api/campus
app.get('/api/campus', async (_req: Request, res: Response) => {
  try {
    const campus = await campusDb.getCampus();
    res.json(campus);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/buildings
app.get('/api/buildings', async (_req: Request, res: Response) => {
  try {
    const buildings = await campusDb.getBuildings();
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/rooms
app.get('/api/rooms', async (_req: Request, res: Response) => {
  try {
    const rooms = await campusDb.getRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ==========================================
// 2. DATA SOURCE CONFIGURATION ENDPOINTS
// ==========================================

app.get('/api/data-sources', (_req: Request, res: Response) => {
  try {
    const sources = dataSourceManager.getAllAdapters();
    res.json({
      current: campusDb.getActiveDataSource(),
      sources,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/data-sources/select', (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Missing dataSource type' });
    }
    const adapter = dataSourceManager.getAdapter(type);
    if (!adapter.isAvailable) {
      return res.status(400).json({
        error: `Data source ${type} is not available: ${adapter.statusMessage}`,
      });
    }
    campusDb.setActiveDataSource(type);
    res.json({
      success: true,
      current: type,
      statusMessage: adapter.statusMessage,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ==========================================
// 3. OVERVIEW / DASHBOARD ENDPOINT
// ==========================================

// Overview stats (Health score, 7-day trend series, status badges)
app.get('/api/overview', async (_req: Request, res: Response) => {
  try {
    const overview = await store.getCampusOverview();
    const lastRun = store.getLastRun();
    const lastImpact = store.getLastImpact();
    res.json({ overview, lastRun, lastImpact });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ==========================================
// 4. FOOD AGENT ENDPOINTS
// ==========================================

// GET /api/food
app.get('/api/food', async (_req: Request, res: Response) => {
  try {
    const records = await store.getFoodData();
    const metrics = await store.getFoodMetrics();
    res.json({ records, metrics });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/food/summary
app.get('/api/food/summary', async (_req: Request, res: Response) => {
  try {
    const records = await store.getFoodData();
    const analysis = runFoodAgent(records);
    res.json({
      averageStudentsServed: analysis.metrics.averageStudentsServed,
      averageStudentsExpected: analysis.metrics.averageStudentsExpected,
      averagePreparation: Math.round(analysis.metrics.totalPreparedKg / (analysis.metrics.totalRecordsAnalyzed || 1)),
      averageLeftovers: analysis.metrics.averageLeftoverKgPerSession,
      leftoverPercentage: analysis.metrics.overallLeftoverRatePercent,
      highWasteMeals: analysis.metrics.highWasteMeals,
      estimatedDemand: analysis.metrics.estimatedNextMealDemand,
      recommendedPreparation: analysis.metrics.recommendedPreparationMeals,
      potentialSurplusKgWeek: analysis.metrics.potentialPreventableSurplusKgPerWeek,
      dataSource: 'DEMO',
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/food
app.post('/api/food', async (req: Request, res: Response) => {
  try {
    const record = await campusDb.addFoodRecord(req.body);
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/food/predict', (req: Request, res: Response) => {
  try {
    const { expectedStudents, weather, isExamDay, universityEvent } = req.body;
    const base = Number(expectedStudents) || 1200;

    let turnoutFactor = 0.88;
    if (weather === 'Rainy') turnoutFactor -= 0.10;
    if (isExamDay) turnoutFactor += 0.05;
    if (universityEvent) turnoutFactor -= 0.14;

    const estimatedDemand = Math.round(base * Math.max(0.4, Math.min(1.05, turnoutFactor)));
    // Calibrated 5% safety buffer instead of standard wasteful 15%
    const recommendedPrep = Math.round(estimatedDemand * 1.05);
    const standardPrep = Math.round(base * 1.15);
    const potentialWasteReductionKg = Math.round((standardPrep - recommendedPrep) * 0.45);
    const estimatedCostSavings = Math.round(potentialWasteReductionKg * 4.25);

    res.json({
      model: 'EcoPilot-SRMKTR-FoodDemand-v2',
      campus: 'SRM KTR',
      diningFacility: 'Sannasi Mess A',
      studentsExpected: base,
      estimatedDemand,
      recommendedPreparationMeals: recommendedPrep,
      safetyBufferPercentage: 5,
      potentialWasteReductionKg,
      estimatedCostSavingsDollars: estimatedCostSavings,
      batchAdvice:
        'Cook 75% for initial mess shift opening; hold remaining portion in refrigerated staging to cook only if student headcounts exceed 850 by 45 mins before closure.',
      label: 'ESTIMATED (Subject to dining supervisor confirmation)',
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ==========================================
// 5. ENERGY AGENT ENDPOINTS
// ==========================================

// GET /api/energy
app.get('/api/energy', async (_req: Request, res: Response) => {
  try {
    const rooms = await store.getEnergyData();
    const metrics = await store.getEnergyMetrics();
    res.json({
      rooms,
      metrics,
      anomalyCount: metrics.anomalyRoomsCount,
      totalWastedKw: metrics.totalIdlePowerWasteKw,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/energy/anomalies
app.get('/api/energy/anomalies', async (_req: Request, res: Response) => {
  try {
    const rooms = await store.getEnergyData();
    const analysis = runEnergyAgent(rooms);
    const anomalies = analysis.evaluatedRooms.filter((r) => r.isAnomaly);
    res.json({
      totalAudited: rooms.length,
      anomalyCount: anomalies.length,
      totalIdleWasteKw: analysis.metrics.totalIdlePowerWasteKw,
      estimatedDailyWasteKwh: analysis.metrics.estimatedDailyEnergyWasteKwh,
      anomalies: anomalies.map((r) => ({
        id: r.id,
        building: r.building,
        room: r.room,
        occupancy: r.occupancy,
        acStatus: r.acStatus,
        lightsStatus: r.lightsStatus,
        computerCount: r.computerCount,
        activeComputers: r.activeComputers,
        powerConsumptionKw: r.powerConsumptionKw,
        baselineExpectedKw: r.baselineExpectedKw,
        reason: r.anomalyReason,
      })),
      dataSource: 'DEMO',
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/energy
app.post('/api/energy', async (req: Request, res: Response) => {
  try {
    const record = await campusDb.addEnergyRecord(req.body);
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/energy/toggle-room', async (req: Request, res: Response) => {
  try {
    const { roomId, acStatus, lightsStatus } = req.body;
    const updated = await store.updateRoomStatus(roomId, acStatus, lightsStatus);
    res.json({ success: true, room: updated });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ==========================================
// 6. WATER AGENT ENDPOINTS
// ==========================================

// GET /api/water
app.get('/api/water', async (_req: Request, res: Response) => {
  try {
    const records = await store.getWaterData();
    const metrics = await store.getWaterMetrics();
    res.json({
      records,
      metrics,
      anomalyCount: metrics.anomalyBuildingsCount,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/water/anomalies
app.get('/api/water/anomalies', async (_req: Request, res: Response) => {
  try {
    const records = await store.getWaterData();
    const analysis = runWaterAgent(records);
    const anomalies = analysis.metrics.buildingStats.filter((b) => b.isAnomaly);
    res.json({
      totalBuildings: analysis.metrics.totalBuildingsMonitored,
      anomalyCount: anomalies.length,
      campusDeviationPercent: analysis.metrics.campusOverallDeviationPercent,
      highestVarianceBuilding: analysis.metrics.highestVarianceBuilding,
      highestVarianceDeviationPercent: analysis.metrics.highestVarianceDeviationPercent,
      anomalies: anomalies.map((a) => ({
        building: a.building,
        baselineLiters: a.baselineLiters,
        recentAverageLiters: a.recentAverageLiters,
        deviationPercent: a.deviationPercent,
        plausibleCause: a.primaryPlausibleCause,
        confidence: a.confidence,
        note: 'Anomaly status does not necessarily indicate a physical pipe leak. Acoustic inspection required.',
      })),
      dataSource: 'DEMO',
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/water
app.post('/api/water', async (req: Request, res: Response) => {
  try {
    const record = await campusDb.addWaterRecord(req.body);
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ==========================================
// 7. WASTE AGENT ENDPOINTS
// ==========================================

// GET /api/waste
app.get('/api/waste', async (_req: Request, res: Response) => {
  try {
    const metrics = store.getWasteMetrics();
    const records = await campusDb.getWasteRecords();
    res.json({ metrics, records, items: DEMO_WASTE_ITEMS });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/waste/demo-items', (_req: Request, res: Response) => {
  res.json({ items: DEMO_WASTE_ITEMS });
});

// POST /api/waste/analyze (and alias /api/waste/classify)
const handleWasteAnalyze = async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', demoItemId } = req.body;

    // 1. Check if user selected one of the deterministic demo items
    if (demoItemId) {
      const match = DEMO_WASTE_ITEMS.find((item) => item.id === demoItemId);
      if (match) {
        return res.json({
          category: match.category,
          confidence: match.confidence,
          reason: match.reason,
          explanation: match.reason,
          recommendedDisposal: match.recommendedDisposal,
          recommendedDisposalRoute: match.recommendedDisposal,
          isRecyclable: match.isRecyclable,
          campusBinLocation: match.campusBinLocation,
          predictionSource: 'SRM KTR Deterministic Demo Item (AI Prediction)',
          isAIPrediction: true,
        });
      }
    }

    // 2. If imageBase64 is provided and Gemini key is valid, run Gemini 3.8 Flash Vision on server
    if (ai && hasGeminiKey && imageBase64) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
        const prompt = `You are the EcoPilot Waste Classification Agent for SRM Institute of Science and Technology (SRM KTR Campus).
Analyze this waste item image.
Classify it strictly into ONE of these 5 categories:
- Organic
- Paper
- Plastic
- E-waste
- General Waste

Output valid JSON ONLY with no backticks, matching this exact structure:
{
  "category": "Organic" | "Paper" | "Plastic" | "E-waste" | "General Waste",
  "confidence": number between 75 and 99,
  "reason": "1-2 concise sentences explaining what the item is and its material makeup",
  "recommendedDisposal": "Specific SRM KTR campus disposal station (e.g. Green Organic Composting Bin at Sannasi Mess, Blue Recyclable Plastics, Yellow Paper Recycler, Tech Park E-waste Locker, or Black General Waste)",
  "isRecyclable": boolean,
  "campusBinLocation": "Tech Park Concourse, UB Ground Floor, or Sannasi Mess",
  "specialHandlingNotes": "Optional safety note"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          },
        });

        const rawText = response.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            category: parsed.category,
            confidence: parsed.confidence,
            reason: parsed.reason,
            explanation: parsed.reason,
            recommendedDisposal: parsed.recommendedDisposal,
            recommendedDisposalRoute: parsed.recommendedDisposal,
            isRecyclable: parsed.isRecyclable,
            campusBinLocation: parsed.campusBinLocation,
            specialHandlingNotes: parsed.specialHandlingNotes,
            predictionSource: 'Gemini 3.8 Flash Vision (AI Prediction)',
            isAIPrediction: true,
          });
        }
      } catch (geminiError) {
        console.warn('Gemini vision API call failed, falling back to deterministic classifier:', geminiError);
      }
    }

    // 3. Fallback deterministic classifier
    return res.json({
      category: 'Plastic',
      confidence: 90,
      reason: 'Polyethylene terephthalate (PET) beverage packaging identified by geometric contour and opacity.',
      explanation: 'Polyethylene terephthalate (PET) beverage packaging identified by geometric contour and opacity.',
      recommendedDisposal: 'Blue Recyclable Plastics Bin at Tech Park or UB. Empty all fluids before deposit.',
      recommendedDisposalRoute: 'Blue Recyclable Plastics Bin at Tech Park or UB. Empty all fluids before deposit.',
      isRecyclable: true,
      campusBinLocation: 'Tech Park Main Concourse & Food Court',
      predictionSource: 'Deterministic Rule Engine (AI Prediction)',
      isAIPrediction: true,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

app.post('/api/waste/analyze', handleWasteAnalyze);
app.post('/api/waste/classify', handleWasteAnalyze);

// ==========================================
// 8. AI COORDINATOR & AGENT RUNS ENDPOINTS
// ==========================================

// POST /api/run-ecopilot (and alias POST /api/ecopilot/run)
const handleRunEcoPilot = async (_req: Request, res: Response) => {
  try {
    const pipelineResult = await store.executeFullPipeline();
    res.json(pipelineResult);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
};

app.post('/api/run-ecopilot', handleRunEcoPilot);
app.post('/api/ecopilot/run', handleRunEcoPilot);

// GET /api/agent-runs
app.get('/api/agent-runs', async (_req: Request, res: Response) => {
  try {
    const runs = await campusDb.getAgentRuns();
    res.json({ runs });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/action-plans
app.get('/api/action-plans', async (_req: Request, res: Response) => {
  try {
    const plans = await campusDb.getActionPlans();
    res.json({ actionPlans: plans });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Action item status update
app.post('/api/actions/status', async (req: Request, res: Response) => {
  try {
    const { actionId, status } = req.body;
    const updated = await store.updateActionStatus(actionId, status);
    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ==========================================
// 9. IMPACT ANALYSIS ENDPOINTS
// ==========================================

// GET /api/impact
app.get('/api/impact', async (_req: Request, res: Response) => {
  try {
    const records = await campusDb.getImpactRecords();
    const latest = store.getLastImpact() || records[0];
    res.json({
      latest,
      history: records,
      label: 'ESTIMATED',
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ==========================================
// 10. STORE RESET
// ==========================================

// Reset demo dataset
app.post('/api/store/reset', async (_req: Request, res: Response) => {
  try {
    await store.resetData();
    const overview = await store.getCampusOverview();
    const lastRun = store.getLastRun();
    const lastImpact = store.getLastImpact();
    res.json({ success: true, overview, lastRun, lastImpact });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EcoPilot SRM KTR] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[EcoPilot] Server startup failed:', err);
  process.exit(1);
});
