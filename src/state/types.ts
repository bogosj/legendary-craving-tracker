export type LegendaryMinionId =
  | 'lich'
  | 'gorgon'
  | 'harpy'
  | 'robo_chicken'
  | 'reaper'
  | 'cyclops'
  | 'archdemon'
  | 'shield_bot'
  | 'soul_stalker'
  | 'the_cursed'
  | 'the_colossus'
  | 'the_infernal';

export type RuneType = 'ice' | 'poison' | 'blood' | 'moon' | 'death' | 'cosmic';

export interface RuneCost {
  ice?: number;
  poison?: number;
  blood?: number;
  moon?: number;
  death?: number;
  cosmic?: number;
}

export interface LegendaryInfo {
  id: LegendaryMinionId;
  name: string;
  group: number;
  baseWobular: number;
  runeCosts: RuneCost;
  recipeDescription: string;
  accentColor: string;
}

export interface CravingDefinition {
  slotNumber: number;        // 1 to 287
  level: number;             // 105 to 1000
  isScripted: boolean;
  scriptedMinionId?: LegendaryMinionId;
  allowedPool: LegendaryMinionId[]; // Minions that can roll for this slot
}

export interface CravingRecord {
  slotNumber: number;
  selectedMinionId: LegendaryMinionId;
  isCompleted: boolean;
  completedAt?: number;      // timestamp
}

export interface TrackerRunState {
  version: number;
  createdAt: number;
  updatedAt: number;
  maxDevourerLevel: number;  // Filter: 100, 200, 300, ..., 1000
  selectedBracket: string;   // 'all' | '101-200' | '201-400' | '401-900' | '901-1000'
  focusMode: boolean;        // Only show current & next 5 cravings
  completedCravings: Record<number, CravingRecord>; // Keyed by slotNumber
}
