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
} from '../../src/types/index.ts';

/**
 * SRM KTR CAMPUS METADATA
 * Specifically configured for:
 * SRM Institute of Science and Technology, Kattankulathur Campus (SRM KTR)
 * Location: Kattankulathur, Tamil Nadu, India
 * All records strictly contain dataSource: "DEMO"
 */

export const SRM_CAMPUS_RECORD: CampusRecord = {
  id: 'campus-srm-ktr',
  name: 'SRM Institute of Science and Technology',
  campus: 'Kattankulathur',
  shortName: 'SRM KTR',
  location: 'Kattankulathur, Tamil Nadu, India',
  dataSource: 'DEMO',
  established: 1985,
  totalStudentsEstimate: 45000,
  updatedAt: new Date().toISOString(),
};

/**
 * Explicitly verified core facilities of SRM KTR
 * - Tech Park (TP / Main IT & Computing Hub)
 * - University Building (UB / Main Administrative & Academic Tower)
 * - SRM Medical College & Research Centre Hospital Block
 * - Sannasi Hostel & Dining Complex (Student residential & dining)
 * - Tech Pavilion 2 (TP2 / Engineering Labs)
 */
export const SRM_BUILDINGS: BuildingRecord[] = [
  {
    id: 'bld-tp',
    campusId: 'campus-srm-ktr',
    name: 'Tech Park (TP)',
    code: 'TP',
    type: 'Academic',
    floors: 15,
    primarySubmeterId: 'sub-tp-main',
    dataSource: 'DEMO',
  },
  {
    id: 'bld-ub',
    campusId: 'campus-srm-ktr',
    name: 'University Building (UB)',
    code: 'UB',
    type: 'Academic',
    floors: 14,
    primarySubmeterId: 'sub-ub-main',
    dataSource: 'DEMO',
  },
  {
    id: 'bld-tp2',
    campusId: 'campus-srm-ktr',
    name: 'Tech Pavilion 2 (TP2)',
    code: 'TP2',
    type: 'Laboratory',
    floors: 8,
    primarySubmeterId: 'sub-tp2-main',
    dataSource: 'DEMO',
  },
  {
    id: 'bld-sannasi',
    campusId: 'campus-srm-ktr',
    name: 'Sannasi Mess & Residential Complex',
    code: 'SANNASI',
    type: 'Dining',
    floors: 4,
    primarySubmeterId: 'sub-sannasi-dining',
    dataSource: 'DEMO',
  },
  {
    id: 'bld-audi',
    campusId: 'campus-srm-ktr',
    name: 'Dr. T. P. Ganesan Auditorium',
    code: 'TPGA',
    type: 'Administrative',
    floors: 3,
    primarySubmeterId: 'sub-tpga-hvac',
    dataSource: 'DEMO',
  },
];

export const SRM_ROOMS: RoomRecord[] = [
  {
    id: 'room-tp-304',
    buildingId: 'bld-tp',
    buildingName: 'Tech Park (TP)',
    roomNumber: 'TP-304',
    name: 'Computing Laboratory 304',
    type: 'Lab',
    capacity: 60,
    acInstalled: true,
    dataSource: 'DEMO',
  },
  {
    id: 'room-tp-101',
    buildingId: 'bld-tp',
    buildingName: 'Tech Park (TP)',
    roomNumber: 'TP-101',
    name: 'High Performance Computing Cluster',
    type: 'Lab',
    capacity: 35,
    acInstalled: true,
    dataSource: 'DEMO',
  },
  {
    id: 'room-tp2-204',
    buildingId: 'bld-tp2',
    buildingName: 'Tech Pavilion 2 (TP2)',
    roomNumber: 'TP2-204',
    name: 'Robotics & Automation Laboratory',
    type: 'Lab',
    capacity: 40,
    acInstalled: true,
    dataSource: 'DEMO',
  },
  {
    id: 'room-ub-502',
    buildingId: 'bld-ub',
    buildingName: 'University Building (UB)',
    roomNumber: 'UB-502',
    name: 'Seminar Hall 502',
    type: 'Classroom',
    capacity: 120,
    acInstalled: true,
    dataSource: 'DEMO',
  },
  {
    id: 'room-sannasi-main',
    buildingId: 'bld-sannasi',
    buildingName: 'Sannasi Mess & Residential Complex',
    roomNumber: 'MESS-1',
    name: 'Main Student Dining Hall A',
    type: 'Dining Hall',
    capacity: 1500,
    acInstalled: false,
    dataSource: 'DEMO',
  },
  {
    id: 'room-tpga-main',
    buildingId: 'bld-audi',
    buildingName: 'Dr. T. P. Ganesan Auditorium',
    roomNumber: 'AUDI-MAIN',
    name: 'Central Plenary Hall',
    type: 'Auditorium',
    capacity: 3000,
    acInstalled: true,
    dataSource: 'DEMO',
  },
];

/**
 * 1. DETERMINISTIC SRM KTR FOOD DATASET (84 Records: 14 days, 3 meals, 2 messes)
 * Messes: Sannasi Mess A and SRM Central Food Court
 */
export function generateSRMFoodRecords(): FoodRecord[] {
  const records: FoodRecord[] = [];
  const diningHalls = ['Sannasi Mess A', 'SRM Central Dining'];
  const meals: ('Breakfast' | 'Lunch' | 'Dinner')[] = ['Breakfast', 'Lunch', 'Dinner'];

  let idCounter = 1;
  const baseYear = 2026;

  for (let day = 10; day <= 23; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${baseYear}-09-${dayStr}`;
    const dayIndex = day - 10; // 0 to 13
    const isWeekend = dayIndex === 2 || dayIndex === 3 || dayIndex === 9 || dayIndex === 10;
    const isExamDay = dayIndex >= 6 && dayIndex <= 9; // University cycle tests / semester exams
    const isHoliday = dayIndex === 4;
    const universityEvent = dayIndex === 11 ? 'Milan Cultural Fest' : dayIndex === 1 ? 'Aaruush Tech Fest' : null;
    const weather: FoodRecord['weather'] = dayIndex === 5 || dayIndex === 12 ? 'Rainy' : dayIndex === 8 ? 'Hot' : 'Sunny';

    for (const hall of diningHalls) {
      for (const meal of meals) {
        let expected = meal === 'Lunch' ? 1400 : meal === 'Dinner' ? 1150 : 750;
        if (hall === 'SRM Central Dining') expected = Math.round(expected * 0.75);

        if (isWeekend) expected = Math.round(expected * 0.6);
        if (isHoliday) expected = Math.round(expected * 0.3);
        if (weather === 'Rainy') expected = Math.round(expected * 0.88);

        let turnoutRate = 0.89;
        if (weather === 'Rainy' && meal === 'Dinner') {
          turnoutRate = 0.78; // Monsoon dinner dip in Chennai/Kattankulathur
        } else if (isExamDay && meal === 'Dinner') {
          turnoutRate = 0.98; // Late night dining during exam weeks
        } else if (universityEvent) {
          turnoutRate = 0.72; // Campus fest food stalls reduce mess attendance
        } else if (meal === 'Breakfast') {
          turnoutRate = 0.82;
        }

        const studentsServed = Math.max(90, Math.round(expected * turnoutRate));

        // Prep with historical 15% buffer
        const kgPerMeal = meal === 'Lunch' ? 0.48 : meal === 'Dinner' ? 0.52 : 0.36;
        const preparedKg = Math.round(expected * kgPerMeal);
        const consumedKg = Math.round(studentsServed * (kgPerMeal * 0.92));
        const leftoverKg = Math.max(8, preparedKg - consumedKg);

        // Meal unit cost calculation (in USD / INR normalized benchmark)
        const costPerMeal = meal === 'Breakfast' ? 3.5 : meal === 'Lunch' ? 6.2 : 7.0;
        const totalCost = Math.round(preparedKg * costPerMeal * 1.8);
        const wasteCost = Math.round(leftoverKg * costPerMeal * 1.8);

        records.push({
          id: `srm-food-${idCounter++}`,
          date: dateStr,
          meal,
          diningHall: hall,
          studentsExpected: expected,
          studentsServed,
          preparedQuantityKg: preparedKg,
          leftoverQuantityKg: leftoverKg,
          weather,
          isHoliday,
          universityEvent,
          isExamDay,
          costPerMeal,
          totalCost,
          wasteCost,
          dataSource: 'DEMO',
        });
      }
    }
  }

  return records;
}

/**
 * 2. DETERMINISTIC SRM KTR ENERGY DATASET
 * Monitored spaces in Tech Park (TP), TP2, University Building (UB), Dr. TP Ganesan Audi
 */
export const SRM_ENERGY_ROOMS: EnergyRoomRecord[] = [
  {
    id: 'srm-en-1',
    building: 'Tech Park (TP)',
    room: 'Computing Lab 304',
    timestamp: '2026-09-23T09:00:00.000Z',
    occupancy: 0,
    acStatus: 'ON',
    acSetTemperatureC: 19.0,
    lightsStatus: 'ON',
    computerCount: 40,
    activeComputers: 34,
    powerConsumptionKw: 12.8,
    baselineExpectedKw: 1.4,
    isAnomaly: true,
    anomalyReason: 'Zero occupancy with central split AC at 19°C and 34 lab workstations active',
    dataSource: 'DEMO',
  },
  {
    id: 'srm-en-2',
    building: 'Tech Pavilion 2 (TP2)',
    room: 'Robotics Workshop 204',
    timestamp: '2026-09-23T09:00:00.000Z',
    occupancy: 0,
    acStatus: 'ON',
    acSetTemperatureC: 20.0,
    lightsStatus: 'ON',
    computerCount: 15,
    activeComputers: 12,
    powerConsumptionKw: 7.6,
    baselineExpectedKw: 0.8,
    isAnomaly: true,
    anomalyReason: 'Unoccupied workshop with industrial chiller and bench equipment energized',
    dataSource: 'DEMO',
  },
  {
    id: 'srm-en-3',
    building: 'University Building (UB)',
    room: 'Seminar Hall 502',
    timestamp: '2026-09-23T09:00:00.000Z',
    occupancy: 0,
    acStatus: 'OFF',
    acSetTemperatureC: 24.0,
    lightsStatus: 'ON',
    computerCount: 2,
    activeComputers: 0,
    powerConsumptionKw: 1.1,
    baselineExpectedKw: 0.2,
    isAnomaly: true,
    anomalyReason: 'High-bay ceiling lighting active with 0 occupants',
    dataSource: 'DEMO',
  },
  {
    id: 'srm-en-4',
    building: 'Dr. T. P. Ganesan Auditorium',
    room: 'Plenary Main Stage',
    timestamp: '2026-09-23T09:00:00.000Z',
    occupancy: 0,
    acStatus: 'ON',
    acSetTemperatureC: 18.0,
    lightsStatus: 'ON',
    computerCount: 4,
    activeComputers: 4,
    powerConsumptionKw: 16.5,
    baselineExpectedKw: 1.5,
    isAnomaly: true,
    anomalyReason: 'Auditorium chiller set to 18°C outside of scheduled event hours',
    dataSource: 'DEMO',
  },
  {
    id: 'srm-en-5',
    building: 'Tech Park (TP)',
    room: 'HPC Cluster Lab 101',
    timestamp: '2026-09-23T09:00:00.000Z',
    occupancy: 12,
    acStatus: 'ON',
    acSetTemperatureC: 21.0,
    lightsStatus: 'ON',
    computerCount: 30,
    activeComputers: 28,
    powerConsumptionKw: 14.2,
    baselineExpectedKw: 14.0,
    isAnomaly: false,
    dataSource: 'DEMO',
  },
  {
    id: 'srm-en-6',
    building: 'University Building (UB)',
    room: 'Faculty Conference Room 801',
    timestamp: '2026-09-23T09:00:00.000Z',
    occupancy: 0,
    acStatus: 'ECO',
    acSetTemperatureC: 25.0,
    lightsStatus: 'OFF',
    computerCount: 1,
    activeComputers: 0,
    powerConsumptionKw: 0.4,
    baselineExpectedKw: 0.4,
    isAnomaly: false,
    dataSource: 'DEMO',
  },
  {
    id: 'srm-en-7',
    building: 'Sannasi Mess & Residential Complex',
    room: 'Dining Hall A',
    timestamp: '2026-09-23T09:00:00.000Z',
    occupancy: 48,
    acStatus: 'OFF',
    acSetTemperatureC: 28.0,
    lightsStatus: 'ON',
    computerCount: 2,
    activeComputers: 2,
    powerConsumptionKw: 4.2,
    baselineExpectedKw: 4.0,
    isAnomaly: false,
    dataSource: 'DEMO',
  },
  {
    id: 'srm-en-8',
    building: 'Tech Pavilion 2 (TP2)',
    room: 'Electronics Lab 108',
    timestamp: '2026-09-23T09:00:00.000Z',
    occupancy: 22,
    acStatus: 'ON',
    acSetTemperatureC: 22.0,
    lightsStatus: 'ON',
    computerCount: 24,
    activeComputers: 20,
    powerConsumptionKw: 8.4,
    baselineExpectedKw: 8.6,
    isAnomaly: false,
    dataSource: 'DEMO',
  },
];

/**
 * 3. DETERMINISTIC SRM KTR WATER DATASET
 * Facilities: Tech Pavilion 2 (TP2), Sannasi Mess A, Tech Park (TP), University Building (UB), SRM Sports Complex
 */
export function generateSRMWaterRecords(): WaterMeterRecord[] {
  const records: WaterMeterRecord[] = [];
  const buildings = [
    'Tech Pavilion 2 (TP2)',
    'Sannasi Mess A',
    'Tech Park (TP)',
    'University Building (UB)',
    'SRM Sports Complex',
  ];

  let idCounter = 1;

  for (let day = 10; day <= 23; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-09-${dayStr}`;
    const dayIndex = day - 10;

    for (const bld of buildings) {
      let baseline = 20000;
      let weather: WaterMeterRecord['weather'] = 'Normal';
      let irrigation = false;
      let isAnomaly = false;
      let potentialCause: WaterMeterRecord['potentialCause'] = 'normal';
      let confidence = 85;
      let consumption = 20000;
      let occupancy = 450;

      if (bld === 'Tech Pavilion 2 (TP2)') {
        baseline = 16000;
        occupancy = 520;
        // In the latest 3 days (11, 12, 13), TP2 shows continuous off-peak night draw
        if (dayIndex >= 11) {
          isAnomaly = true;
          potentialCause = 'possible plumbing issue';
          confidence = 80;
          consumption = 25280; // +58.0% deviation
        } else {
          consumption = 16000 + (dayIndex % 3) * 190;
        }
      } else if (bld === 'Sannasi Mess A') {
        baseline = 32000;
        occupancy = 1600;
        if (dayIndex === 5) {
          isAnomaly = true;
          potentialCause = 'increased occupancy';
          confidence = 93;
          consumption = 37400;
        } else {
          consumption = 31800 + (dayIndex % 4) * 250;
        }
      } else if (bld === 'SRM Sports Complex') {
        baseline = 38000;
        occupancy = 320;
        if (dayIndex === 8) {
          irrigation = true;
          potentialCause = 'irrigation';
          confidence = 89;
          consumption = 42100;
        } else {
          consumption = 37900 + (dayIndex % 3) * 180;
        }
      } else if (bld === 'Tech Park (TP)') {
        baseline = 24000;
        occupancy = 1800;
        consumption = 23900 + (dayIndex % 5) * 140;
      } else {
        // University Building (UB)
        baseline = 26000;
        occupancy = 1200;
        consumption = 25900 + (dayIndex % 2) * 210;
      }

      records.push({
        id: `srm-water-${idCounter++}`,
        building: bld,
        date: dateStr,
        occupancy,
        waterConsumptionLiters: consumption,
        baselineExpectedLiters: baseline,
        weather,
        irrigationActive: irrigation,
        isAnomaly,
        potentialCause,
        confidence,
        dataSource: 'DEMO',
      });
    }
  }

  return records;
}

/**
 * 4. DETERMINISTIC SRM KTR WASTE BENCHMARK
 */
export const SRM_WASTE_DATA = {
  totalWasteMonthlyKg: 24600,
  recycledMaterialMonthlyKg: 7100,
  compostedMaterialMonthlyKg: 4400,
  landfillMaterialMonthlyKg: 13100,
  currentDiversionRatePercent: 46.7, // (7100 + 4400) / 24600 = 46.7%
  targetDiversionRatePercent: 65.0,
  contaminationRatePercent: 19.2,
  primaryContaminantStream: 'Paper & Packaging Pulp (Tech Park Concourse)',
  sampleBaleCountAudited: 50,
  sampleBalesRejected: 9,
  dataSource: 'DEMO' as const,
};

export const SRM_WASTE_RECORDS: WasteRecord[] = [
  {
    id: 'srm-w-1',
    date: '2026-09-22',
    stream: 'Organic',
    collectedKg: 520,
    divertedKg: 490,
    contaminationPercent: 5.8,
    location: 'Sannasi Mess A Scullery',
    dataSource: 'DEMO',
  },
  {
    id: 'srm-w-2',
    date: '2026-09-22',
    stream: 'Paper',
    collectedKg: 280,
    divertedKg: 220,
    contaminationPercent: 21.4,
    location: 'Tech Park Atrium Bins',
    dataSource: 'DEMO',
  },
  {
    id: 'srm-w-3',
    date: '2026-09-22',
    stream: 'Plastic',
    collectedKg: 340,
    divertedKg: 310,
    contaminationPercent: 8.8,
    location: 'Central Food Court',
    dataSource: 'DEMO',
  },
  {
    id: 'srm-w-4',
    date: '2026-09-22',
    stream: 'E-waste',
    collectedKg: 85,
    divertedKg: 85,
    contaminationPercent: 0.0,
    location: 'Tech Park IT Central Depository',
    dataSource: 'DEMO',
  },
  {
    id: 'srm-w-5',
    date: '2026-09-22',
    stream: 'General Waste',
    collectedKg: 780,
    divertedKg: 0,
    contaminationPercent: 0.0,
    location: 'Campus Perimeter Compactors',
    dataSource: 'DEMO',
  },
];

export const SRM_OCCUPANCY_RECORDS: OccupancyRecord[] = [
  {
    id: 'occ-1',
    facility: 'Tech Park (TP)',
    timestamp: '2026-09-23T09:00:00.000Z',
    headcount: 1420,
    capacity: 2200,
    dataSource: 'DEMO',
  },
  {
    id: 'occ-2',
    facility: 'Tech Pavilion 2 (TP2)',
    timestamp: '2026-09-23T09:00:00.000Z',
    headcount: 380,
    capacity: 900,
    dataSource: 'DEMO',
  },
  {
    id: 'occ-3',
    facility: 'Sannasi Mess A',
    timestamp: '2026-09-23T09:00:00.000Z',
    headcount: 180,
    capacity: 1500,
    dataSource: 'DEMO',
  },
];

export const SRM_EVENTS: CampusEventRecord[] = [
  {
    id: 'evt-1',
    name: 'Aaruush National Techno-Management Fest',
    date: '2026-09-11',
    expectedAttendance: 12000,
    venue: 'Dr. T. P. Ganesan Auditorium & Tech Park',
    dataSource: 'DEMO',
  },
  {
    id: 'evt-2',
    name: 'Milan National Cultural Festival',
    date: '2026-09-21',
    expectedAttendance: 15000,
    venue: 'SRM Grounds & Main Audi',
    dataSource: 'DEMO',
  },
];

export const SRM_ALERTS: CampusAlertRecord[] = [
  {
    id: 'alt-1',
    domain: 'energy',
    severity: 'critical',
    title: 'Idle HVAC & Equipment in TP-304',
    message: 'Zero occupancy with AC running at 19°C and 34 PCs drawing 12.8 kW in Tech Park.',
    location: 'Tech Park (TP) - Lab 304',
    timestamp: '2026-09-23T09:00:00.000Z',
    active: true,
    dataSource: 'DEMO',
  },
  {
    id: 'alt-2',
    domain: 'water',
    severity: 'high',
    title: 'Off-Peak Flow Deviation in TP2',
    message: 'Sustained nocturnal surge (+58%) detected in Tech Pavilion 2 submeter.',
    location: 'Tech Pavilion 2 (TP2)',
    timestamp: '2026-09-23T09:00:00.000Z',
    active: true,
    dataSource: 'DEMO',
  },
];

export const DEMO_WASTE_ITEMS = [
  {
    id: 'demo-1',
    name: 'Takeout Food Clamshell with Leftovers',
    description: 'Biodegradable bagasse box with unfinished rice & dal from mess',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
    category: 'Organic' as const,
    confidence: 95,
    reason: 'Contains cooked grains, lentils and compostable sugarcane bagasse fiber container.',
    recommendedDisposal: 'Green Organic Waste Bin at Sannasi Mess / Food Court. Scrape off plastic cutlery first.',
    isRecyclable: false,
    campusBinLocation: 'Sannasi Mess A Exit & Food Court Composting Station',
    dataSource: 'DEMO' as const,
  },
  {
    id: 'demo-2',
    name: 'Single-Use Plastic Water Bottle',
    description: 'Empty clear PET #1 beverage bottle with plastic cap',
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=60',
    category: 'Plastic' as const,
    confidence: 98,
    reason: 'High-density polyethylene / PET polymer suitable for mechanical recycling when empty.',
    recommendedDisposal: 'Blue Recyclable Plastics Bin. Empty all liquid completely and crush bottle.',
    isRecyclable: true,
    campusBinLocation: 'Tech Park Corridors, UB Ground Floor & Audi Foyer',
    dataSource: 'DEMO' as const,
  },
  {
    id: 'demo-3',
    name: 'Printed Semester Exam Question Papers',
    description: 'Stapled bundle of 75 GSM copy paper sheets with printed questions',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=60',
    category: 'Paper' as const,
    confidence: 97,
    reason: 'Clean high-grade wood-pulp paper. Staples are separated automatically by pulp hydrapulpers.',
    recommendedDisposal: 'Yellow Paper & Cardboard Recycling Bin. Keep free from coffee or grease.',
    isRecyclable: true,
    campusBinLocation: 'Tech Park Faculty Offices & Central Library Copy Center',
    dataSource: 'DEMO' as const,
  },
  {
    id: 'demo-4',
    name: 'Swollen Li-ion Laptop Battery',
    description: '3-cell pouch lithium-ion battery with visible cell expansion',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=60',
    category: 'E-waste' as const,
    confidence: 96,
    reason: 'Hazardous electrochemical secondary cell; presents thermal runaway danger. Never dispose in regular bins.',
    recommendedDisposal: 'Designated E-Waste Locker at Tech Park IT Helpdesk (Ground Floor, TP-004).',
    isRecyclable: true,
    campusBinLocation: 'Tech Park IT Central & Facilities Maintenance Depot',
    dataSource: 'DEMO' as const,
  },
  {
    id: 'demo-5',
    name: 'Polystyrene (Thermocol) Packing Insert',
    description: 'Rigid expanded polystyrene (#6 EPS) packaging foam',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60',
    category: 'General Waste' as const,
    confidence: 93,
    reason: 'Expanded Polystyrene (EPS #6) cannot be processed by campus dry recycling lines.',
    recommendedDisposal: 'Black General / Non-recyclable Waste Bin.',
    isRecyclable: false,
    campusBinLocation: 'Campus Central Perimeter Waste Hubs',
    dataSource: 'DEMO' as const,
  },
];
