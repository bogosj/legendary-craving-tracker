import type { LegendaryInfo, LegendaryMinionId, RuneCost } from '../state/types.ts';

/**
 * ============================================================================
 * NECROMERGER LEGENDARY MINIONS CONFIGURATION
 * ============================================================================
 * 
 * Contains all metadata, fixed rune requirements, and base Wobular rewards
 * for each Legendary minion in the game.
 * 
 * Wobular Rule:
 *   - Feeding a legendary craving grants its minion's baseWobular
 *   - PLUS +1 additional Wobular from Mother's Handbag.
 */
export const LEGENDARIES: Record<LegendaryMinionId, LegendaryInfo> = {
  lich: {
    id: 'lich',
    name: 'Lich',
    group: 1,
    baseWobular: 2,
    runeCosts: {
      ice: 640,
    },
    recipeDescription: '2x Lv5 Grave',
    accentColor: '#38bdf8', // Ice Cyan
  },
  gorgon: {
    id: 'gorgon',
    name: 'Gorgon',
    group: 1,
    baseWobular: 2,
    runeCosts: {
      poison: 640,
    },
    recipeDescription: '2x Lv5 Cupboard',
    accentColor: '#4ade80', // Poison Green
  },
  harpy: {
    id: 'harpy',
    name: 'Harpy',
    group: 1,
    baseWobular: 2,
    runeCosts: {
      blood: 640,
    },
    recipeDescription: '2x Lv5 Altar',
    accentColor: '#f87171', // Blood Red
  },
  robo_chicken: {
    id: 'robo_chicken',
    name: 'Robo Chicken',
    group: 3,
    baseWobular: 3,
    runeCosts: {
      ice: 960,
      poison: 480,
    },
    recipeDescription: '2x Lv5 Foul Chicken',
    accentColor: '#fbbf24', // Amber / Gold
  },
  reaper: {
    id: 'reaper',
    name: 'Reaper',
    group: 2,
    baseWobular: 4,
    runeCosts: {
      ice: 1600,
      moon: 640,
    },
    recipeDescription: '2x Lv5 Lectern',
    accentColor: '#c084fc', // Moon Violet
  },
  cyclops: {
    id: 'cyclops',
    name: 'Cyclops',
    group: 2,
    baseWobular: 4,
    runeCosts: {
      poison: 1600,
      moon: 640,
    },
    recipeDescription: '2x Lv5 Fridge',
    accentColor: '#2dd4bf', // Teal
  },
  archdemon: {
    id: 'archdemon',
    name: 'Archdemon',
    group: 2,
    baseWobular: 4,
    runeCosts: {
      blood: 960,
      death: 960,
    },
    recipeDescription: '2x Lv5 Portal',
    accentColor: '#e11d48', // Crimson / Death
  },
  shield_bot: {
    id: 'shield_bot',
    name: 'Shield Bot',
    group: 3,
    baseWobular: 4,
    runeCosts: {
      cosmic: 640,
    },
    recipeDescription: '2x Lv5 Crashed Saucer',
    accentColor: '#60a5fa', // Blue
  },
  soul_stalker: {
    id: 'soul_stalker',
    name: 'Soul Stalker',
    group: 3,
    baseWobular: 6,
    runeCosts: {
      cosmic: 800,
      death: 800,
    },
    recipeDescription: '2x Lv2 Soul Grinder',
    accentColor: '#ec4899', // Cosmic Pink
  },
  the_cursed: {
    id: 'the_cursed',
    name: 'The Cursed',
    group: 4,
    baseWobular: 7,
    runeCosts: {
      ice: 2240,
      moon: 640,
    },
    recipeDescription: 'Lich + Reaper',
    accentColor: '#a78bfa', // Purple
  },
  the_colossus: {
    id: 'the_colossus',
    name: 'The Colossus',
    group: 4,
    baseWobular: 7,
    runeCosts: {
      poison: 2240,
      moon: 640,
    },
    recipeDescription: 'Gorgon + Cyclops',
    accentColor: '#f43f5e', // Rose
  },
  the_infernal: {
    id: 'the_infernal',
    name: 'The Infernal',
    group: 4,
    baseWobular: 7,
    runeCosts: {
      blood: 1600,
      death: 960,
    },
    recipeDescription: 'Harpy + Archdemon',
    accentColor: '#f97316', // Orange Flame
  },
};

export const ALL_LEGENDARY_IDS: LegendaryMinionId[] = [
  'lich',
  'gorgon',
  'harpy',
  'robo_chicken',
  'reaper',
  'cyclops',
  'archdemon',
  'shield_bot',
  'soul_stalker',
  'the_cursed',
  'the_colossus',
  'the_infernal',
];

/**
 * Convenient lookup map of rune costs extracted directly from LEGENDARIES
 */
export const LEGENDARY_RUNE_COSTS: Record<LegendaryMinionId, RuneCost> = Object.fromEntries(
  Object.entries(LEGENDARIES).map(([id, info]) => [id, info.runeCosts])
) as Record<LegendaryMinionId, RuneCost>;
