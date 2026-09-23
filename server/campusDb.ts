import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase.ts';
import {
  CampusRecord,
  BuildingRecord,
  RoomRecord,
  FoodRecord,
  EnergyRoomRecord,
  WaterMeterRecord,
  WasteRecord,
  OccupancyRecord,
  CampusEventRecord,
  CampusAlertRecord,
  AgentRunRecord,
  ActionPlanItem,
  ImpactRecord,
  DataSourceType,
} from '../src/types/index.ts';
import {
  SRM_CAMPUS_RECORD,
  SRM_BUILDINGS,
  SRM_ROOMS,
  generateSRMFoodRecords,
  SRM_ENERGY_ROOMS,
  generateSRMWaterRecords,
  SRM_WASTE_RECORDS,
  SRM_OCCUPANCY_RECORDS,
  SRM_EVENTS,
  SRM_ALERTS,
} from './data/demoData.ts';

/**
 * CLEAN DATABASE ABSTRACTION FOR FIRESTORE
 *
 * Supports the 12 required collections:
 * - campus
 * - buildings
 * - rooms
 * - food_records
 * - energy_records
 * - water_records
 * - waste_records
 * - occupancy
 * - events
 * - alerts
 * - agent_runs
 * - action_plans
 * - impact_records
 *
 * All demo records contain dataSource: "DEMO"
 */

export class CampusDatabaseService {
  private isInitialized = false;

  // In-memory fallback cache to ensure fast reads and graceful operation if Firestore is empty or cold
  private memoryCampus: CampusRecord = { ...SRM_CAMPUS_RECORD };
  private memoryBuildings: BuildingRecord[] = [...SRM_BUILDINGS];
  private memoryRooms: RoomRecord[] = [...SRM_ROOMS];
  private memoryFoodRecords: FoodRecord[] = generateSRMFoodRecords();
  private memoryEnergyRooms: EnergyRoomRecord[] = [...SRM_ENERGY_ROOMS];
  private memoryWaterRecords: WaterMeterRecord[] = generateSRMWaterRecords();
  private memoryWasteRecords: WasteRecord[] = [...SRM_WASTE_RECORDS];
  private memoryOccupancy: OccupancyRecord[] = [...SRM_OCCUPANCY_RECORDS];
  private memoryEvents: CampusEventRecord[] = [...SRM_EVENTS];
  private memoryAlerts: CampusAlertRecord[] = [...SRM_ALERTS];
  private memoryAgentRuns: AgentRunRecord[] = [];
  private memoryActionPlans: ActionPlanItem[] = [];
  private memoryImpactRecords: ImpactRecord[] = [];

  // Data Source Settings
  private activeDataSource: DataSourceType = 'DEMO';

  getActiveDataSource(): DataSourceType {
    return this.activeDataSource;
  }

  setActiveDataSource(mode: DataSourceType) {
    this.activeDataSource = mode;
  }

  /**
   * Seed Firestore on startup or reset
   */
  async seedInitialDemoData(): Promise<void> {
    try {
      console.log('[Firestore] Seeding demo dataset for SRM KTR...');

      // 1. Campus record
      const campusRef = doc(db, 'campus', SRM_CAMPUS_RECORD.id);
      await setDoc(campusRef, SRM_CAMPUS_RECORD, { merge: true });

      // 2. Buildings
      for (const bld of SRM_BUILDINGS) {
        await setDoc(doc(db, 'buildings', bld.id), bld, { merge: true });
      }

      // 3. Rooms
      for (const rm of SRM_ROOMS) {
        await setDoc(doc(db, 'rooms', rm.id), rm, { merge: true });
      }

      // 4. Food records (seed sample or verify existing)
      const foodSnap = await getDocs(query(collection(db, 'food_records'), limit(1)));
      if (foodSnap.empty) {
        console.log('[Firestore] Seeding food_records collection...');
        for (const item of this.memoryFoodRecords.slice(0, 42)) {
          await setDoc(doc(db, 'food_records', item.id), item, { merge: true });
        }
      }

      // 5. Energy rooms
      for (const rm of this.memoryEnergyRooms) {
        await setDoc(doc(db, 'energy_records', rm.id), rm, { merge: true });
      }

      // 6. Water records
      const waterSnap = await getDocs(query(collection(db, 'water_records'), limit(1)));
      if (waterSnap.empty) {
        console.log('[Firestore] Seeding water_records collection...');
        for (const w of this.memoryWaterRecords.slice(0, 35)) {
          await setDoc(doc(db, 'water_records', w.id), w, { merge: true });
        }
      }

      // 7. Waste records
      for (const w of this.memoryWasteRecords) {
        await setDoc(doc(db, 'waste_records', w.id), w, { merge: true });
      }

      // 8. Occupancy
      for (const occ of this.memoryOccupancy) {
        await setDoc(doc(db, 'occupancy', occ.id), occ, { merge: true });
      }

      // 9. Events
      for (const evt of this.memoryEvents) {
        await setDoc(doc(db, 'events', evt.id), evt, { merge: true });
      }

      // 10. Alerts
      for (const alt of this.memoryAlerts) {
        await setDoc(doc(db, 'alerts', alt.id), alt, { merge: true });
      }

      this.isInitialized = true;
      console.log('[Firestore] SRM KTR demo datasets seeded successfully.');
    } catch (err) {
      console.warn('[Firestore] Seed operation encountered network or permission constraint, using memory cache:', err);
    }
  }

  // CAMPUS API
  async getCampus(): Promise<CampusRecord> {
    try {
      const snap = await getDoc(doc(db, 'campus', SRM_CAMPUS_RECORD.id));
      if (snap.exists()) {
        return snap.data() as CampusRecord;
      }
    } catch (e) {
      // fallback to memory
    }
    return this.memoryCampus;
  }

  // BUILDINGS API
  async getBuildings(): Promise<BuildingRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'buildings'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as BuildingRecord);
      }
    } catch (e) {}
    return this.memoryBuildings;
  }

  // ROOMS API
  async getRooms(): Promise<RoomRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'rooms'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as RoomRecord);
      }
    } catch (e) {}
    return this.memoryRooms;
  }

  // FOOD API
  async getFoodRecords(): Promise<FoodRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'food_records'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as FoodRecord);
      }
    } catch (e) {}
    return this.memoryFoodRecords;
  }

  async addFoodRecord(record: Omit<FoodRecord, 'id' | 'dataSource'>): Promise<FoodRecord> {
    const newRecord: FoodRecord = {
      ...record,
      id: `srm-food-${Date.now()}`,
      dataSource: this.activeDataSource,
    };
    try {
      await setDoc(doc(db, 'food_records', newRecord.id), newRecord);
    } catch (e) {}
    this.memoryFoodRecords.push(newRecord);
    return newRecord;
  }

  // ENERGY API
  async getEnergyRecords(): Promise<EnergyRoomRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'energy_records'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as EnergyRoomRecord);
      }
    } catch (e) {}
    return this.memoryEnergyRooms;
  }

  async addEnergyRecord(record: Omit<EnergyRoomRecord, 'id' | 'dataSource'>): Promise<EnergyRoomRecord> {
    const newRecord: EnergyRoomRecord = {
      ...record,
      id: `srm-en-${Date.now()}`,
      dataSource: this.activeDataSource,
    };
    try {
      await setDoc(doc(db, 'energy_records', newRecord.id), newRecord);
    } catch (e) {}
    this.memoryEnergyRooms.push(newRecord);
    return newRecord;
  }

  async updateEnergyRoomStatus(
    roomId: string,
    acStatus?: 'ON' | 'OFF' | 'ECO',
    lightsStatus?: 'ON' | 'OFF' | 'DIM'
  ): Promise<EnergyRoomRecord | null> {
    const room = this.memoryEnergyRooms.find((r) => r.id === roomId);
    if (!room) return null;

    if (acStatus) room.acStatus = acStatus;
    if (lightsStatus) room.lightsStatus = lightsStatus;

    if (room.acStatus === 'OFF' && room.lightsStatus === 'OFF') {
      room.powerConsumptionKw = Number((room.baselineExpectedKw * 0.9).toFixed(1));
      room.isAnomaly = false;
      room.anomalyReason = undefined;
    } else if (room.acStatus === 'OFF' && room.lightsStatus === 'ON') {
      room.powerConsumptionKw = Number((room.baselineExpectedKw + 0.8).toFixed(1));
    } else if (room.acStatus === 'ECO') {
      room.powerConsumptionKw = Number((room.baselineExpectedKw * 1.2).toFixed(1));
      room.isAnomaly = false;
      room.anomalyReason = undefined;
    }

    try {
      await updateDoc(doc(db, 'energy_records', room.id), {
        acStatus: room.acStatus,
        lightsStatus: room.lightsStatus,
        powerConsumptionKw: room.powerConsumptionKw,
        isAnomaly: room.isAnomaly,
      });
    } catch (e) {}

    return room;
  }

  // WATER API
  async getWaterRecords(): Promise<WaterMeterRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'water_records'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as WaterMeterRecord);
      }
    } catch (e) {}
    return this.memoryWaterRecords;
  }

  async addWaterRecord(record: Omit<WaterMeterRecord, 'id' | 'dataSource'>): Promise<WaterMeterRecord> {
    const newRecord: WaterMeterRecord = {
      ...record,
      id: `srm-water-${Date.now()}`,
      dataSource: this.activeDataSource,
    };
    try {
      await setDoc(doc(db, 'water_records', newRecord.id), newRecord);
    } catch (e) {}
    this.memoryWaterRecords.push(newRecord);
    return newRecord;
  }

  // WASTE API
  async getWasteRecords(): Promise<WasteRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'waste_records'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as WasteRecord);
      }
    } catch (e) {}
    return this.memoryWasteRecords;
  }

  // ACTION PLANS API
  async getActionPlans(): Promise<ActionPlanItem[]> {
    try {
      const snap = await getDocs(collection(db, 'action_plans'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as ActionPlanItem);
      }
    } catch (e) {}
    return this.memoryActionPlans;
  }

  async saveActionPlans(plans: ActionPlanItem[]): Promise<void> {
    this.memoryActionPlans = plans;
    try {
      for (const item of plans) {
        await setDoc(doc(db, 'action_plans', item.id), item, { merge: true });
      }
    } catch (e) {}
  }

  async updateActionPlanStatus(
    actionId: string,
    status: ActionPlanItem['status']
  ): Promise<ActionPlanItem | null> {
    const target = this.memoryActionPlans.find((a) => a.id === actionId);
    if (target) {
      target.status = status;
      try {
        await updateDoc(doc(db, 'action_plans', actionId), { status });
      } catch (e) {}
      return target;
    }
    return null;
  }

  // AGENT RUNS API
  async getAgentRuns(): Promise<AgentRunRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'agent_runs'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as AgentRunRecord);
      }
    } catch (e) {}
    return this.memoryAgentRuns;
  }

  async saveAgentRun(run: AgentRunRecord): Promise<void> {
    this.memoryAgentRuns.unshift(run);
    try {
      await setDoc(doc(db, 'agent_runs', run.id), run);
    } catch (e) {}
  }

  // IMPACT RECORDS API
  async getImpactRecords(): Promise<ImpactRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'impact_records'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as ImpactRecord);
      }
    } catch (e) {}
    return this.memoryImpactRecords;
  }

  async saveImpactRecord(record: ImpactRecord): Promise<void> {
    this.memoryImpactRecords.unshift(record);
    try {
      await setDoc(doc(db, 'impact_records', record.id), record);
    } catch (e) {}
  }

  // RESET
  async resetAllData(): Promise<void> {
    this.memoryFoodRecords = generateSRMFoodRecords();
    this.memoryEnergyRooms = [...SRM_ENERGY_ROOMS];
    this.memoryWaterRecords = generateSRMWaterRecords();
    this.memoryWasteRecords = [...SRM_WASTE_RECORDS];
    this.memoryActionPlans = [];
    this.memoryAgentRuns = [];
    this.memoryImpactRecords = [];
    await this.seedInitialDemoData();
  }
}

export const campusDb = new CampusDatabaseService();
