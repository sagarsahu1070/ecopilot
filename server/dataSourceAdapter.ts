import { DataSourceType } from '../src/types/index.ts';
import { campusDb } from './campusDb.ts';

export interface CampusDataSourceAdapter {
  name: string;
  sourceType: DataSourceType;
  isAvailable: boolean;
  statusMessage: string;
  fetchTelemetry: () => Promise<any>;
}

/**
 * Clean Adapter Pattern for Campus Data Sources
 *
 * Current:
 * - DEMO: Enabled with verified SRM KTR campus infrastructure and realistic operational datasets.
 *
 * Future Extensions:
 * - AUTHORIZED_API: Connects to official SRMIST Facilities Management REST/GraphQL endpoint when authorized.
 * - AUTHORIZED_SENSOR_DATA: Connects to MQTT/LoRaWAN gateway for physical smart submeters.
 * - MANUAL_ENTRY: Form-based daily log submissions by hostel mess supervisors and electricians.
 */

export class DemoCampusAdapter implements CampusDataSourceAdapter {
  name = 'SRM KTR Deterministic Demo Telemetry';
  sourceType: DataSourceType = 'DEMO';
  isAvailable = true;
  statusMessage = 'Active: Operational measurements simulated for SRM KTR prototype demonstration.';

  async fetchTelemetry() {
    const [food, energy, water, waste] = await Promise.all([
      campusDb.getFoodRecords(),
      campusDb.getEnergyRecords(),
      campusDb.getWaterRecords(),
      campusDb.getWasteRecords(),
    ]);
    return { food, energy, water, waste };
  }
}

export class AuthorizedSRMApiAdapter implements CampusDataSourceAdapter {
  name = 'SRMIST Official Campus API';
  sourceType: DataSourceType = 'AUTHORIZED_API';
  isAvailable = false;
  statusMessage = 'Offline: Requires authorized SRMIST IT OAuth credentials and Facilities API gateway configuration.';

  async fetchTelemetry() {
    throw new Error('Authorized SRMIST API gateway is not configured. Telemetry must be sourced from DEMO DATA.');
  }
}

export class AuthorizedSensorAdapter implements CampusDataSourceAdapter {
  name = 'SRM KTR Smart IoT Sensor Bus';
  sourceType: DataSourceType = 'AUTHORIZED_SENSOR_DATA';
  isAvailable = false;
  statusMessage = 'Offline: LoRaWAN / Modbus hardware sensor gateway not provisioned.';

  async fetchTelemetry() {
    throw new Error('Physical IoT sensor bus not provisioned.');
  }
}

export class ManualEntryAdapter implements CampusDataSourceAdapter {
  name = 'SRM Facility Log Manual Entry';
  sourceType: DataSourceType = 'MANUAL_ENTRY';
  isAvailable = true;
  statusMessage = 'Ready: Allows hostel mess wardens and lab technicians to submit daily meter readings.';

  async fetchTelemetry() {
    return {
      food: await campusDb.getFoodRecords(),
      energy: await campusDb.getEnergyRecords(),
      water: await campusDb.getWaterRecords(),
      waste: await campusDb.getWasteRecords(),
    };
  }
}

export class CampusDataSourceManager {
  private adapters: Map<DataSourceType, CampusDataSourceAdapter> = new Map();

  constructor() {
    this.registerAdapter(new DemoCampusAdapter());
    this.registerAdapter(new AuthorizedSRMApiAdapter());
    this.registerAdapter(new AuthorizedSensorAdapter());
    this.registerAdapter(new ManualEntryAdapter());
  }

  registerAdapter(adapter: CampusDataSourceAdapter) {
    this.adapters.set(adapter.sourceType, adapter);
  }

  getAdapter(type: DataSourceType): CampusDataSourceAdapter {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new Error(`Data source adapter for ${type} is not registered`);
    }
    return adapter;
  }

  getAllAdapters(): Array<{
    type: DataSourceType;
    name: string;
    isAvailable: boolean;
    statusMessage: string;
    isActive: boolean;
  }> {
    const current = campusDb.getActiveDataSource();
    return Array.from(this.adapters.values()).map((a) => ({
      type: a.sourceType,
      name: a.name,
      isAvailable: a.isAvailable,
      statusMessage: a.statusMessage,
      isActive: a.sourceType === current,
    }));
  }
}

export const dataSourceManager = new CampusDataSourceManager();
