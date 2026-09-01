import { ALL_CRAVINGS, getBracketForSlot } from '../../data/cravingsSchedule.ts';
import { LEGENDARIES, LEGENDARY_RUNE_COSTS } from '../../data/legendaries.ts';
import { trackerState } from '../../state/trackerState.ts';
import type { CravingDefinition, LegendaryMinionId, RuneType } from '../../state/types.ts';
import { getMinionBadgeIconSvg, getRuneIconSvg, getWobularIconSvg } from '../icons.ts';
import { showToast } from '../toast.ts';

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

    if (state.focusMode) {
      this.renderFocusMode(filteredCravings, state, activeSlot);
    } else {
      this.renderFullList(filteredCravings, state, activeSlot);
    }
  }

  private renderFocusMode(
    filteredCravings: CravingDefinition[],
    state: ReturnType<typeof trackerState.getState>,
    activeSlot: number | null
  ) {
    const allowedSlotSet = new Set(filteredCravings.map((c) => c.slotNumber));

    // Get recently completed cravings within the current filter
    const recentCompleted = trackerState
      .getRecentlyCompletedCravings(5)
      .filter((item) => allowedSlotSet.has(item.slotNumber));

    // Upcoming uncompleted cravings
    const upcomingCravings = filteredCravings
      .filter((c) => !state.completedCravings[c.slotNumber]?.isCompleted)
      .slice(0, 6);

    if (upcomingCravings.length === 0 && recentCompleted.length === 0) {
      this.container.innerHTML = `
        <div class="stat-card" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <h3>No cravings found for the selected filter.</h3>
          <p style="margin-top: 0.5rem; font-size: 0.9rem;">Try adjusting the Devourer Max Level or switching bracket tabs.</p>
        </div>
      `;
      return;
    }

    let html = '';

    // 1. Recently Completed Section (if any exist)
    if (recentCompleted.length > 0) {
      html += `
        <div class="cravings-section-group">
          <div class="section-group-header">
            <div class="section-group-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Recently Completed (${recentCompleted.length})</span>
            </div>
            <span class="section-group-hint">Tap checkbox or "Uncheck" to restore</span>
          </div>
          <div class="cravings-list recent-completed-list">
            ${recentCompleted.map((item) => this.renderCravingCard(item.craving, state, activeSlot)).join('')}
          </div>
        </div>
      `;
    }

    // 2. Upcoming Cravings Section
    if (upcomingCravings.length > 0) {
      html += `
        <div class="cravings-section-group" style="${recentCompleted.length > 0 ? 'margin-top: 1.5rem;' : ''}">
          <div class="section-group-header">
            <div class="section-group-title">
              <span class="pulse-dot"></span>
              <span>Upcoming Cravings (Next ${upcomingCravings.length})</span>
            </div>
            <span class="section-group-hint">Focus mode active</span>
          </div>
          <div class="cravings-list">
            ${upcomingCravings.map((craving) => this.renderCravingCard(craving, state, activeSlot)).join('')}
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="next-up-completed-banner" style="margin-top: 1rem;">
          <span style="font-size: 1.25rem;">🎉</span>
          <span>All cravings in this bracket are completed!</span>
        </div>
      `;
    }

    this.container.innerHTML = html;
    this.bindCardEvents(
      [...recentCompleted.map((r) => r.craving), ...upcomingCravings],
      state
    );
  }

  private renderFullList(
    filteredCravings: CravingDefinition[],
    state: ReturnType<typeof trackerState.getState>,
    activeSlot: number | null
  ) {
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

    this.bindCardEvents(filteredCravings, state);
  }

  private bindCardEvents(
    cravings: CravingDefinition[],
    _state: ReturnType<typeof trackerState.getState>
  ) {
    cravings.forEach((craving) => {
      const cardEl = this.container.querySelector(`[data-slot="${craving.slotNumber}"]`);
      if (!cardEl) return;

      const record = trackerState.getState().completedCravings[craving.slotNumber];
      const selectedMinionId = record?.selectedMinionId || craving.allowedPool[0] || 'lich';
      const minionInfo = LEGENDARIES[selectedMinionId];

      const toggleAction = () => {
        const isNowCompleted = trackerState.toggleCraving(craving.slotNumber);
        if (isNowCompleted) {
          showToast(`Checked off #${craving.slotNumber} ${minionInfo.name}`, {
            text: 'Undo',
            onClick: () => trackerState.toggleCraving(craving.slotNumber, false),
          });
        } else {
          showToast(`Unchecked #${craving.slotNumber} ${minionInfo.name}`);
        }
      };

      // Checkbox click
      const checkbox = cardEl.querySelector('.craving-checkbox');
      checkbox?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAction();
      });

      // Explicit Uncheck button click (if rendered on completed cards)
      const uncheckBtn = cardEl.querySelector('.btn-uncheck-slot');
      uncheckBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAction();
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
          <div class="craving-checkbox ${isCompleted ? 'checked' : ''}" title="${isCompleted ? 'Click to uncheck this craving' : 'Click to mark craving as completed'}">
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
              ${isCompleted ? `<span class="completed-badge">Done</span>` : ''}
            </div>
            <div class="craving-sub">
              Recipe: ${minionInfo.recipeDescription}
            </div>
          </div>
        </div>

        <div class="craving-right">
          ${
            isCompleted
              ? `
                <button class="btn btn-sm btn-uncheck-slot" title="Uncheck craving #${craving.slotNumber}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                  Uncheck
                </button>
              `
              : craving.isScripted
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
