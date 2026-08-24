import { ALL_CRAVINGS, getBracketForSlot } from '../../data/cravingsSchedule.ts';
import { LEGENDARIES, LEGENDARY_RUNE_COSTS } from '../../data/legendaries.ts';
import { trackerState } from '../../state/trackerState.ts';
import type { CravingDefinition, LegendaryMinionId, RuneType } from '../../state/types.ts';
import { getMinionBadgeIconSvg, getRuneIconSvg, getWobularIconSvg } from '../icons.ts';

export class CravingListComponent {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
    trackerState.subscribe(() => this.render());
  }

  private render() {
    const state = trackerState.getState();
    const activeSlot = trackerState.getCurrentActiveSlot();

    // 1. Filter by Max Devourer Level
    let filteredCravings = ALL_CRAVINGS.filter((c) => c.level <= state.maxDevourerLevel);

    // 2. Filter by Bracket (if not 'all')
    if (state.selectedBracket !== 'all') {
      filteredCravings = filteredCravings.filter(
        (c) => getBracketForSlot(c.slotNumber) === state.selectedBracket
      );
    }

    // 3. Filter by Focus Mode (Current + Next 5 upcoming)
    if (state.focusMode) {
      const uncompletedSlots = filteredCravings.filter(
        (c) => !state.completedCravings[c.slotNumber]?.isCompleted
      );
      const upcoming5 = uncompletedSlots.slice(0, 6);
      filteredCravings = upcoming5;
    }

    if (filteredCravings.length === 0) {
      this.container.innerHTML = `
        <div class="stat-card" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <h3>No cravings found for the selected filter.</h3>
          <p style="margin-top: 0.5rem; font-size: 0.9rem;">Try adjusting the Devourer Max Level or switching bracket tabs.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="cravings-list">
        ${filteredCravings.map((craving) => this.renderCravingCard(craving, state, activeSlot)).join('')}
      </div>
    `;

    // Bind event listeners
    filteredCravings.forEach((craving) => {
      const cardEl = this.container.querySelector(`[data-slot="${craving.slotNumber}"]`);
      if (!cardEl) return;

      // Checkbox click
      const checkbox = cardEl.querySelector('.craving-checkbox');
      checkbox?.addEventListener('click', () => {
        trackerState.toggleCraving(craving.slotNumber);
      });

      // Minion selector change
      const select = cardEl.querySelector('.minion-select') as HTMLSelectElement;
      select?.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        trackerState.setSlotMinion(craving.slotNumber, target.value as LegendaryMinionId);
      });
    });
  }

  private renderCravingCard(
    craving: CravingDefinition,
    state: ReturnType<typeof trackerState.getState>,
    activeSlot: number | null
  ): string {
    const record = state.completedCravings[craving.slotNumber];
    const isCompleted = Boolean(record?.isCompleted);
    const selectedMinionId = record?.selectedMinionId || craving.allowedPool[0] || 'lich';
    const minionInfo = LEGENDARIES[selectedMinionId];
    const runeCosts = LEGENDARY_RUNE_COSTS[selectedMinionId] || {};
    const isActiveTarget = craving.slotNumber === activeSlot && !isCompleted;

    const runeEntries = Object.entries(runeCosts) as [RuneType, number][];

    return `
      <div class="craving-card ${isCompleted ? 'completed' : ''} ${isActiveTarget ? 'active-target' : ''}" data-slot="${craving.slotNumber}">
        <div class="craving-left">
          <div class="craving-checkbox" title="Toggle Craving Completion">
            ${
              isCompleted
                ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                : ''
            }
          </div>

          <div class="craving-num-badge">
            <span class="craving-slot-num">#${craving.slotNumber}</span>
            <span class="craving-level">Lv.${craving.level}</span>
          </div>

          <div class="craving-details">
            <div class="craving-title-row">
              <span class="craving-sprite-thumb">
                ${getMinionBadgeIconSvg(selectedMinionId, 24)}
              </span>
              <span class="craving-name" style="color: ${minionInfo.accentColor};">
                ${minionInfo.name}
              </span>
              ${
                craving.isScripted
                  ? `<span class="scripted-badge" title="Guaranteed Scripted Craving">Guaranteed</span>`
                  : `<span class="random-badge" title="Random Pool (${craving.allowedPool.length} options)">Random</span>`
              }
              ${isActiveTarget ? `<span class="scripted-badge" style="background: #713f12; color: #fde047; border-color: #eab308;">Next Up</span>` : ''}
            </div>
            <div class="craving-sub">
              Recipe: ${minionInfo.recipeDescription}
            </div>
          </div>
        </div>

        <div class="craving-right">
          <!-- Pool Dropdown for Random Slots -->
          ${
            craving.isScripted
              ? `
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
                  ${getMinionBadgeIconSvg(selectedMinionId, 16)}
                  Fixed
                </div>
              `
              : `
                <select class="minion-select" ${isCompleted ? 'disabled' : ''}>
                  ${craving.allowedPool
                    .map(
                      (mId) => `
                    <option value="${mId}" ${mId === selectedMinionId ? 'selected' : ''}>
                      ${LEGENDARIES[mId].name}
                    </option>
                  `
                    )
                    .join('')}
                </select>
              `
          }

          <!-- Rune Cost Breakdown for this slot -->
          <div class="craving-runes-preview">
            ${runeEntries
              .map(
                ([runeType, amount]) => `
                <div class="rune-pill" style="padding: 0.2rem 0.4rem; font-size: 0.75rem;">
                  ${getRuneIconSvg(runeType, 14)}
                  <span>${amount}</span>
                </div>
              `
              )
              .join('')}
          </div>

          <!-- Direct Reward Preview -->
          <div class="craving-reward-preview" title="Direct Wobular Reward (+1 stored in Handbag for post-run)">
            ${getWobularIconSvg(16)}
            +${minionInfo.baseWobular}
          </div>
        </div>
      </div>
    `;
  }
}
