import { ALL_CRAVINGS } from '../../data/cravingsSchedule.ts';
import { LEGENDARIES, LEGENDARY_RUNE_COSTS } from '../../data/legendaries.ts';
import { trackerState } from '../../state/trackerState.ts';
import type { LegendaryMinionId, RuneType } from '../../state/types.ts';
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
    const activeSlot = trackerState.getCurrentActiveSlot();
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

    if (activeSlot === null) {
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

    const craving = ALL_CRAVINGS.find((c) => c.slotNumber === activeSlot);
    if (!craving) {
      this.container.innerHTML = recentBarHtml ? `<div class="next-up-section">${recentBarHtml}</div>` : '';
      this.bindUndoButton(lastCompleted);
      return;
    }

    const record = state.completedCravings[craving.slotNumber];
    const isCompleted = Boolean(record?.isCompleted);
    const selectedMinionId = record?.selectedMinionId || craving.allowedPool[0] || 'lich';
    const minionInfo = LEGENDARIES[selectedMinionId];
    const runeCosts = LEGENDARY_RUNE_COSTS[selectedMinionId] || {};
    const runeEntries = Object.entries(runeCosts) as [RuneType, number][];

    this.container.innerHTML = `
      <div class="next-up-section">
        ${recentBarHtml}

        <div class="next-up-header-label">
          <div class="next-up-title-badge">
            <span class="pulse-dot"></span>
            <span>Next Up Craving</span>
          </div>
          <span class="next-up-progress-hint">Craving #${craving.slotNumber} of ${totalAllowedCravings}</span>
        </div>

        <div class="craving-card active-target next-up-card" data-slot="${craving.slotNumber}">
          <div class="craving-left">
            <div class="craving-checkbox next-up-checkbox" title="Mark Craving Completed">
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
                  ${getMinionBadgeIconSvg(selectedMinionId, 26)}
                </span>
                <span class="craving-name" style="color: ${minionInfo.accentColor}; font-size: 1.05rem;">
                  ${minionInfo.name}
                </span>
                ${
                  craving.isScripted
                    ? `<span class="scripted-badge" title="Guaranteed Scripted Craving">Guaranteed</span>`
                    : `<span class="random-badge" title="Random Pool (${craving.allowedPool.length} options)">Random</span>`
                }
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
                  <select class="minion-select next-up-minion-select" ${isCompleted ? 'disabled' : ''}>
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
      </div>
    `;

    // Event listeners
    const checkbox = this.container.querySelector('.next-up-checkbox');
    checkbox?.addEventListener('click', () => {
      const isNowCompleted = trackerState.toggleCraving(craving.slotNumber);
      if (isNowCompleted) {
        showToast(`Checked off #${craving.slotNumber} ${minionInfo.name}`, {
          text: 'Undo',
          onClick: () => trackerState.toggleCraving(craving.slotNumber, false),
        });
      }
    });

    const select = this.container.querySelector('.next-up-minion-select') as HTMLSelectElement;
    select?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      trackerState.setSlotMinion(craving.slotNumber, target.value as LegendaryMinionId);
    });

    this.bindUndoButton(lastCompleted);
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
