import type { CravingDefinition, LegendaryMinionId } from '../state/types.ts';
import { ALL_LEGENDARY_IDS } from './legendaries.ts';

export const SCRIPTED_CRAVINGS_MAP: Record<number, { minionId: LegendaryMinionId; level: number }> = {
  1: { minionId: 'lich', level: 105 },
  2: { minionId: 'gorgon', level: 110 },
  3: { minionId: 'harpy', level: 115 },
  4: { minionId: 'robo_chicken', level: 120 },
  5: { minionId: 'reaper', level: 125 },
  8: { minionId: 'cyclops', level: 140 },
  12: { minionId: 'archdemon', level: 160 },
  16: { minionId: 'shield_bot', level: 180 },
  25: { minionId: 'soul_stalker', level: 220 },
  35: { minionId: 'the_cursed', level: 260 },
  40: { minionId: 'the_colossus', level: 280 },
  45: { minionId: 'the_infernal', level: 300 },
};

export function getAllowedPoolForSlot(slotNumber: number): LegendaryMinionId[] {
  if (slotNumber >= 1 && slotNumber <= 24) {
    return ['lich', 'gorgon', 'harpy', 'robo_chicken'];
  } else if (slotNumber >= 26 && slotNumber <= 34) {
    return ['lich', 'gorgon', 'harpy', 'robo_chicken', 'cyclops', 'archdemon', 'shield_bot'];
  } else if (slotNumber >= 36 && slotNumber <= 39) {
    return ['gorgon', 'harpy', 'robo_chicken', 'archdemon', 'shield_bot'];
  } else if (slotNumber >= 41 && slotNumber <= 44) {
    return ['lich', 'harpy', 'robo_chicken', 'reaper', 'soul_stalker'];
  } else if (slotNumber >= 46 && slotNumber <= 49) {
    return ['lich', 'gorgon', 'robo_chicken', 'reaper', 'cyclops', 'shield_bot', 'soul_stalker'];
  } else {
    // 50+
    return [...ALL_LEGENDARY_IDS];
  }
}

export function generateAllCravings(): CravingDefinition[] {
  const cravings: CravingDefinition[] = [];
  let currentSlot = 1;

  // Bracket 1: 101 - 200 (every 5 levels, starting from 105 -> 20 total)
  for (let lvl = 105; lvl <= 200; lvl += 5) {
    const scripted = SCRIPTED_CRAVINGS_MAP[currentSlot];
    const isScripted = Boolean(scripted);
    const pool = isScripted && scripted ? [scripted.minionId] : getAllowedPoolForSlot(currentSlot);

    cravings.push({
      slotNumber: currentSlot,
      level: lvl,
      isScripted,
      scriptedMinionId: scripted?.minionId,
      allowedPool: pool,
    });
    currentSlot++;
  }

  // Bracket 2: 201 - 400 (every 4 levels, starting from 204 -> 50 total: slots 21 to 70)
  for (let lvl = 204; lvl <= 400; lvl += 4) {
    const scripted = SCRIPTED_CRAVINGS_MAP[currentSlot];
    const isScripted = Boolean(scripted);
    const pool = isScripted && scripted ? [scripted.minionId] : getAllowedPoolForSlot(currentSlot);

    cravings.push({
      slotNumber: currentSlot,
      level: lvl,
      isScripted,
      scriptedMinionId: scripted?.minionId,
      allowedPool: pool,
    });
    currentSlot++;
  }

  // Bracket 3: 401 - 900 (every 3 levels, starting from 403 -> 166 total: slots 71 to 236)
  for (let lvl = 403; lvl <= 898; lvl += 3) {
    if (lvl === 799) continue; // Skip known 799 anomaly per wiki notes
    cravings.push({
      slotNumber: currentSlot,
      level: lvl,
      isScripted: false,
      allowedPool: getAllowedPoolForSlot(currentSlot),
    });
    currentSlot++;
  }
  // Level 900 milestone
  cravings.push({
    slotNumber: currentSlot,
    level: 900,
    isScripted: false,
    allowedPool: getAllowedPoolForSlot(currentSlot),
  });
  currentSlot++;

  // Bracket 4: 901 - 1000 (every 2 levels starting from 902 -> 50 total: slots to 287)
  for (let lvl = 902; lvl <= 1000; lvl += 2) {
    cravings.push({
      slotNumber: currentSlot,
      level: lvl,
      isScripted: false,
      allowedPool: getAllowedPoolForSlot(currentSlot),
    });
    currentSlot++;
  }

  return cravings;
}

export const ALL_CRAVINGS: CravingDefinition[] = generateAllCravings();

export function getBracketForSlot(slotNumber: number): string {
  const craving = ALL_CRAVINGS.find((c) => c.slotNumber === slotNumber);
  if (!craving) return '101-200';
  if (craving.level <= 200) return '101-200';
  if (craving.level <= 400) return '201-400';
  if (craving.level <= 900) return '401-900';
  return '901-1000';
}
