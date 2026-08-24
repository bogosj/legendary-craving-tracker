import { LEGENDARIES } from '../../data/legendaries.ts';
import { trackerState } from '../../state/trackerState.ts';
import type { LegendaryMinionId, RuneType } from '../../state/types.ts';
import { getMinionBadgeIconSvg, getRuneIconSvg, getWobularIconSvg } from '../icons.ts';

export class DashboardComponent {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
    trackerState.subscribe(() => this.render());
  }

  private render() {
    const totals = trackerState.getTotals();

    const runeTypes: { type: RuneType; label: string; color: string }[] = [
      { type: 'ice', label: 'Ice', color: 'var(--rune-ice)' },
      { type: 'poison', label: 'Poison', color: 'var(--rune-poison)' },
      { type: 'blood', label: 'Blood', color: 'var(--rune-blood)' },
      { type: 'moon', label: 'Moon', color: 'var(--rune-moon)' },
      { type: 'death', label: 'Death', color: 'var(--rune-death)' },
      { type: 'cosmic', label: 'Cosmic', color: 'var(--rune-cosmic)' },
    ];

    const allMinionKeys = Object.keys(LEGENDARIES) as LegendaryMinionId[];

    this.container.innerHTML = `
      <section class="dashboard-grid">
        <!-- Card 1: Runes Spent -->
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Runes Spent</span>
            <span class="stat-subtext">${totals.totalCompletedCount} Cravings Done</span>
          </div>
          <div class="runes-grid">
            ${runeTypes
              .map(
                (r) => `
                <div class="rune-pill" style="border-left: 3px solid ${r.color};">
                  ${getRuneIconSvg(r.type, 18)}
                  <span>${r.label}</span>
                  <span class="rune-pill-val" style="color: ${r.color};">${totals.runesSpent[r.type].toLocaleString()}</span>
                </div>
              `
              )
              .join('')}
          </div>
        </div>

        <!-- Card 2: Wobular & Handbag Progression -->
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Wobular Earned</span>
            <span class="stat-subtext">${totals.totalCompletedCount} Cravings Done</span>
          </div>
          <div class="stat-main-value" style="color: var(--wobular-gold);">
            ${getWobularIconSvg(28)}
            ${totals.directWobularEarned.toLocaleString()}
            <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">Direct</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 0.35rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <span><strong>Mother's Handbag</strong> (Post-Run):</span>
              <span style="color: var(--text-gold); font-weight: 800;">+${totals.handbagWobularEarned.toLocaleString()} Wobular</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 0.2rem;">
              <span>Total Post-Run Yield:</span>
              <strong style="color: var(--text-main); font-size: 0.95rem;">${totals.totalWobularWithHandbag.toLocaleString()} Wobular</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Minion Breakdown Section (Larger Cards with Wiki Sprites) -->
      <section class="stat-card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div class="stat-card-header" style="margin-bottom: 0.75rem;">
          <span class="stat-card-title">Legendaries Summoned / Fed Breakdown</span>
          <span class="stat-subtext">${totals.totalCompletedCount} Total Created</span>
        </div>
        <div class="legendaries-breakdown-grid">
          ${allMinionKeys
            .map((minionId) => {
              const count = totals.minionCounts[minionId] || 0;
              const info = LEGENDARIES[minionId];
              return `
                <div class="legendary-card-pill ${count > 0 ? 'active' : ''}" style="--accent-color: ${info.accentColor};">
                  <div class="legendary-sprite-box">
                    ${getMinionBadgeIconSvg(minionId, 36)}
                  </div>
                  <div class="legendary-card-info">
                    <span class="legendary-card-name" style="color: ${info.accentColor};">${info.name}</span>
                    <span class="legendary-card-recipe">${info.recipeDescription}</span>
                  </div>
                  <div class="legendary-card-count ${count > 0 ? 'highlight' : ''}">
                    ${count}
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </section>
    `;
  }
}
