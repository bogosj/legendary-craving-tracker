import { ALL_CRAVINGS } from '../../data/cravingsSchedule.ts';
import { LEGENDARIES, LEGENDARY_RUNE_COSTS } from '../../data/legendaries.ts';
import { trackerState } from '../../state/trackerState.ts';
import type { CravingDefinition, LegendaryMinionId, RuneType, TrackerRunState } from '../../state/types.ts';
import { getMinionBadgeIconSvg, getRuneIconSvg, getWobularIconSvg } from '../icons.ts';
import { showToast } from '../toast.ts';

export class NextUpCravingComponent {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
    trackerState.subscribe(() => this.render());
  }

  private render() {
    const state = trackerState.getState();
    const recentCompleted = trackerState.getRecentlyCompletedCravings(3);
    const lastCompleted = recentCompleted[0];

    const totalAllowedCravings = ALL_CRAVINGS.filter((c) => c.level <= state.maxDevourerLevel).length;

    let recentBarHtml = '';
    if (lastCompleted) {
      const minionInfo = LEGENDARIES[lastCompleted.record.selectedMinionId];
      recentBarHtml = `
        <div class="recently-completed-bar">
          <div class="recently-completed-info">
            <span class="recent-tag">Last Done:</span>
            <span class="recent-minion-badge">
              ${getMinionBadgeIconSvg(lastCompleted.record.selectedMinionId, 16)}
              <strong>#${lastCompleted.slotNumber}</strong> ${minionInfo.name}
            </span>
          </div>
          <button class="btn btn-sm btn-undo-recent" id="btn-quick-undo" title="Uncheck craving #${lastCompleted.slotNumber}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Uncheck #${lastCompleted.slotNumber}
          </button>
        </div>
      `;
    }

    const uncompletedCravings = ALL_CRAVINGS.filter(
      (c) => c.level <= state.maxDevourerLevel && !state.completedCravings[c.slotNumber]?.isCompleted
    );

    if (uncompletedCravings.length === 0) {
      this.container.innerHTML = `
        <div class="next-up-section">
          ${recentBarHtml}
          <div class="next-up-completed-banner">
            <span style="font-size: 1.25rem;">🎉</span>
            <span>All cravings completed up to <strong>Level ${state.maxDevourerLevel}</strong>!</span>
          </div>
        </div>
      `;
      this.bindUndoButton(lastCompleted);
      return;
    }

    const nextUpCraving = uncompletedCravings[0];
    const followingCravings = uncompletedCravings.slice(1, 3);

    this.container.innerHTML = `
      <div class="next-up-section">
        ${recentBarHtml}

        <div class="next-up-header-label">
          <div class="next-up-title-badge">
            <span class="pulse-dot"></span>
            <span>Next Up Craving</span>
          </div>
          <span class="next-up-progress-hint">Craving #${nextUpCraving.slotNumber} of ${totalAllowedCravings}</span>
        </div>

        ${this.renderCravingCard(nextUpCraving, state, true)}

        ${
          followingCravings.length > 0
            ? `
            <div class="following-cravings-group">
              <div class="following-cravings-header">
                <span class="following-cravings-title">Following Available Cravings (${followingCravings.length})</span>
              </div>
              <div class="following-cravings-list">
                ${followingCravings.map((c) => this.renderCravingCard(c, state, false)).join('')}
              </div>
            </div>
          `
            : ''
        }
      </div>
    `;

    // Event listeners
    const displayedCravings = [nextUpCraving, ...followingCravings];
    displayedCravings.forEach((craving) => {
      const cardEl = this.container.querySelector(`[data-slot="${craving.slotNumber}"]`);
      if (!cardEl) return;

      const record = trackerState.getState().completedCravings[craving.slotNumber];
      const selectedMinionId = record?.selectedMinionId || craving.allowedPool[0] || 'lich';
      const minionInfo = LEGENDARIES[selectedMinionId];

      const checkbox = cardEl.querySelector('.craving-checkbox');
      checkbox?.addEventListener('click', () => {
        const isNowCompleted = trackerState.toggleCraving(craving.slotNumber);
        if (isNowCompleted) {
          showToast(`Checked off #${craving.slotNumber} ${minionInfo.name}`, {
            text: 'Undo',
            onClick: () => trackerState.toggleCraving(craving.slotNumber, false),
          });
        } else {
          showToast(`Unchecked #${craving.slotNumber} ${minionInfo.name}`);
        }
      });

      const select = cardEl.querySelector('.minion-select') as HTMLSelectElement;
      select?.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        trackerState.setSlotMinion(craving.slotNumber, target.value as LegendaryMinionId);
      });
    });

    this.bindUndoButton(lastCompleted);
  }

  private renderCravingCard(
    craving: CravingDefinition,
    state: TrackerRunState,
    isNextUp: boolean
  ): string {
    const record = state.completedCravings[craving.slotNumber];
    const isCompleted = Boolean(record?.isCompleted);
    const selectedMinionId = record?.selectedMinionId || craving.allowedPool[0] || 'lich';
    const minionInfo = LEGENDARIES[selectedMinionId];
    const runeCosts = LEGENDARY_RUNE_COSTS[selectedMinionId] || {};
    const runeEntries = Object.entries(runeCosts) as [RuneType, number][];

    const cardClass = isNextUp
      ? 'craving-card active-target next-up-card'
      : 'craving-card following-craving-card';

    return `
      <div class="${cardClass} ${isCompleted ? 'completed' : ''}" data-slot="${craving.slotNumber}">
        <div class="craving-left">
          <div class="craving-checkbox ${isNextUp ? 'next-up-checkbox' : ''} ${isCompleted ? 'checked' : ''}" title="${isCompleted ? 'Click to uncheck this craving' : 'Click to mark craving as completed'}">
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
                ${getMinionBadgeIconSvg(selectedMinionId, isNextUp ? 26 : 22)}
              </span>
              <span class="craving-name" style="color: ${minionInfo.accentColor}; ${isNextUp ? 'font-size: 1.05rem;' : ''}">
                ${minionInfo.name}
              </span>
              ${
                craving.isScripted
                  ? `<span class="scripted-badge" title="Guaranteed Scripted Craving">Guaranteed</span>`
                  : `<span class="random-badge" title="Random Pool (${craving.allowedPool.length} options)">Random</span>`
              }
              ${isNextUp ? `<span class="scripted-badge" style="background: #713f12; color: #fde047; border-color: #eab308;">Next Up</span>` : ''}
              ${isCompleted ? `<span class="completed-badge">Done</span>` : ''}
            </div>
            <div class="craving-sub">
              Recipe: <strong>${minionInfo.recipeDescription}</strong>
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
                <div class="rune-pill" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                  ${getRuneIconSvg(runeType, 16)}
                  <span>${amount}</span>
                </div>
              `
              )
              .join('')}
          </div>

          <!-- Direct Reward Preview -->
          <div class="craving-reward-preview" title="Direct Wobular Reward (+1 stored in Handbag for post-run)">
            ${getWobularIconSvg(18)}
            +${minionInfo.baseWobular}
          </div>
        </div>
      </div>
    `;
  }

  private bindUndoButton(lastCompleted?: { slotNumber: number; record: any; craving: any }) {
    if (!lastCompleted) return;
    const undoBtn = this.container.querySelector('#btn-quick-undo');
    undoBtn?.addEventListener('click', () => {
      const minionInfo = LEGENDARIES[lastCompleted.record.selectedMinionId as LegendaryMinionId];
      trackerState.toggleCraving(lastCompleted.slotNumber, false);
      showToast(`Unchecked #${lastCompleted.slotNumber} ${minionInfo?.name || 'Craving'}`);
    });
  }
}
