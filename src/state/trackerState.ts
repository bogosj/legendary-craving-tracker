import { ALL_CRAVINGS } from '../data/cravingsSchedule.ts';
import { LEGENDARIES, LEGENDARY_RUNE_COSTS } from '../data/legendaries.ts';
import type { CravingRecord, LegendaryMinionId, RuneCost, TrackerRunState } from './types.ts';
import { decodeStateFromUrl } from './urlCodec.ts';

const STORAGE_KEY = 'necromerger_legendary_tracker_state_v1';

export class TrackerStateManager {
  private state: TrackerRunState;
  private listeners: Set<(state: TrackerRunState) => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private createDefaultState(): TrackerRunState {
    const completedCravings: Record<number, CravingRecord> = {};

    // Prepopulate all cravings with default selections
    for (const craving of ALL_CRAVINGS) {
      const defaultMinion = craving.isScripted && craving.scriptedMinionId
        ? craving.scriptedMinionId
        : craving.allowedPool[0] || 'lich';

      completedCravings[craving.slotNumber] = {
        slotNumber: craving.slotNumber,
        selectedMinionId: defaultMinion,
        isCompleted: false,
      };
    }

    return {
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      maxDevourerLevel: 1000,
      selectedBracket: 'all',
      focusMode: true,
      completedCravings,
    };
  }

  private loadInitialState(): TrackerRunState {
    // 1. Check if URL has shared data query parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stateFromUrl = decodeStateFromUrl(urlParams);
      if (stateFromUrl) {
        // Save to localStorage as well
        this.saveToStorage(stateFromUrl);
        return stateFromUrl;
      }
    }

    // 2. Check localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Merge with all cravings to ensure schema completeness
          const defaultState = this.createDefaultState();
          return {
            ...defaultState,
            ...parsed,
            completedCravings: {
              ...defaultState.completedCravings,
              ...(parsed.completedCravings || {}),
            },
          };
        }
      } catch (err) {
        console.error('Failed to load state from localStorage:', err);
      }
    }

    // 3. Fallback to default
    return this.createDefaultState();
  }

  private saveToStorage(state: TrackerRunState) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }
  }

  private notify() {
    this.state.updatedAt = Date.now();
    this.saveToStorage(this.state);
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public getState(): TrackerRunState {
    return this.state;
  }

  public subscribe(listener: (state: TrackerRunState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  // --- ACTIONS ---

  public toggleCraving(slotNumber: number, forceState?: boolean): boolean {
    const record = this.state.completedCravings[slotNumber];
    if (!record) return false;

    const nextCompleted = forceState !== undefined ? forceState : !record.isCompleted;
    record.isCompleted = nextCompleted;
    record.completedAt = nextCompleted ? Date.now() : undefined;

    this.notify();
    return nextCompleted;
  }

  public getRecentlyCompletedCravings(limit: number = 5) {
    const completedList: { slotNumber: number; record: CravingRecord; craving: (typeof ALL_CRAVINGS)[0] }[] = [];

    for (const craving of ALL_CRAVINGS) {
      if (craving.level > this.state.maxDevourerLevel) continue;
      const record = this.state.completedCravings[craving.slotNumber];
      if (record && record.isCompleted) {
        completedList.push({ slotNumber: craving.slotNumber, record, craving });
      }
    }

    // Sort by completedAt descending (most recent first). If equal/missing, fallback to slotNumber descending.
    completedList.sort((a, b) => {
      const timeA = a.record.completedAt || 0;
      const timeB = b.record.completedAt || 0;
      if (timeA !== timeB) return timeB - timeA;
      return b.slotNumber - a.slotNumber;
    });

    return completedList.slice(0, limit);
  }

  public undoLastCompleted(): number | null {
    const recent = this.getRecentlyCompletedCravings(1);
    if (recent.length === 0) return null;
    const slot = recent[0].slotNumber;
    this.toggleCraving(slot, false);
    return slot;
  }

  public setSlotMinion(slotNumber: number, minionId: LegendaryMinionId) {
    const record = this.state.completedCravings[slotNumber];
    if (!record) return;

    record.selectedMinionId = minionId;
    this.notify();
  }

  public setMaxDevourerLevel(level: number) {
    this.state.maxDevourerLevel = level;
    this.notify();
  }

  public setSelectedBracket(bracket: string) {
    this.state.selectedBracket = bracket;
    this.notify();
  }

  public toggleFocusMode() {
    this.state.focusMode = !this.state.focusMode;
    this.notify();
  }

  public resetRun() {
    this.state = this.createDefaultState();
    this.notify();
  }

  public importState(newState: TrackerRunState) {
    const defaultState = this.createDefaultState();
    this.state = {
      ...defaultState,
      ...newState,
      completedCravings: {
        ...defaultState.completedCravings,
        ...(newState.completedCravings || {}),
      },
    };
    this.notify();
  }

  // --- CALCULATIONS ---

  public getTotals() {
    const runesSpent: Required<RuneCost> = {
      ice: 0,
      poison: 0,
      blood: 0,
      moon: 0,
      death: 0,
      cosmic: 0,
    };

    let directWobularEarned = 0;
    let totalCompletedCount = 0;
    const minionCounts: Record<LegendaryMinionId, number> = {
      lich: 0,
      gorgon: 0,
      harpy: 0,
      robo_chicken: 0,
      reaper: 0,
      cyclops: 0,
      archdemon: 0,
      shield_bot: 0,
      soul_stalker: 0,
      the_cursed: 0,
      the_colossus: 0,
      the_infernal: 0,
    };

    for (const craving of ALL_CRAVINGS) {
      if (craving.level > this.state.maxDevourerLevel) continue;

      const record = this.state.completedCravings[craving.slotNumber];
      if (record && record.isCompleted) {
        totalCompletedCount++;
        const minionId = record.selectedMinionId;
        minionCounts[minionId] = (minionCounts[minionId] || 0) + 1;

        // Direct base Wobular reward from minion
        const minionInfo = LEGENDARIES[minionId];
        directWobularEarned += minionInfo?.baseWobular || 2;

        // Rune costs
        const costs = LEGENDARY_RUNE_COSTS[minionId] || {};
        if (costs.ice) runesSpent.ice += costs.ice;
        if (costs.poison) runesSpent.poison += costs.poison;
        if (costs.blood) runesSpent.blood += costs.blood;
        if (costs.moon) runesSpent.moon += costs.moon;
        if (costs.death) runesSpent.death += costs.death;
        if (costs.cosmic) runesSpent.cosmic += costs.cosmic;
      }
    }

    const handbagWobularEarned = totalCompletedCount; // +1 per craving stored in Handbag for post-run
    const totalWobularWithHandbag = directWobularEarned + handbagWobularEarned;

    const totalRunesSpentSum =
      runesSpent.ice +
      runesSpent.poison +
      runesSpent.blood +
      runesSpent.moon +
      runesSpent.death +
      runesSpent.cosmic;

    // Calculate Projected Remaining Runes for uncompleted cravings up to maxDevourerLevel
    const remainingRunes: Required<RuneCost> = {
      ice: 0,
      poison: 0,
      blood: 0,
      moon: 0,
      death: 0,
      cosmic: 0,
    };
    let remainingCravingsCount = 0;
    let projectedWobularRemaining = 0;

    for (const craving of ALL_CRAVINGS) {
      if (craving.level > this.state.maxDevourerLevel) continue;

      const record = this.state.completedCravings[craving.slotNumber];
      if (!record || !record.isCompleted) {
        remainingCravingsCount++;
        const minionId = record?.selectedMinionId || craving.allowedPool[0] || 'lich';
        const minionInfo = LEGENDARIES[minionId];
        projectedWobularRemaining += (minionInfo?.baseWobular || 2) + 1;

        const costs = LEGENDARY_RUNE_COSTS[minionId] || {};
        if (costs.ice) remainingRunes.ice += costs.ice;
        if (costs.poison) remainingRunes.poison += costs.poison;
        if (costs.blood) remainingRunes.blood += costs.blood;
        if (costs.moon) remainingRunes.moon += costs.moon;
        if (costs.death) remainingRunes.death += costs.death;
        if (costs.cosmic) remainingRunes.cosmic += costs.cosmic;
      }
    }

    const remainingRunesSum =
      remainingRunes.ice +
      remainingRunes.poison +
      remainingRunes.blood +
      remainingRunes.moon +
      remainingRunes.death +
      remainingRunes.cosmic;

    return {
      runesSpent,
      totalRunesSpentSum,
      directWobularEarned,
      handbagWobularEarned,
      totalWobularWithHandbag,
      totalCompletedCount,
      minionCounts,
      remainingRunes,
      remainingRunesSum,
      remainingCravingsCount,
      projectedWobularRemaining,
    };
  }

  public getCurrentActiveSlot(): number | null {
    for (const craving of ALL_CRAVINGS) {
      if (craving.level > this.state.maxDevourerLevel) break;
      const record = this.state.completedCravings[craving.slotNumber];
      if (!record || !record.isCompleted) {
        return craving.slotNumber;
      }
    }
    return null;
  }
}

export const trackerState = new TrackerStateManager();
