import { trackerState } from '../../state/trackerState.ts';
import { getWobularIconSvg } from '../icons.ts';

export class HeaderComponent {
  private container: HTMLElement;
  private onShareClick: () => void;

  constructor(container: HTMLElement, onShareClick: () => void) {
    this.container = container;
    this.onShareClick = onShareClick;
    this.render();
    trackerState.subscribe(() => this.render());
  }

  private render() {
    const state = trackerState.getState();

    const maxLevelOptions = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

    this.container.innerHTML = `
      <header class="app-header">
        <div class="header-top">
          <div class="logo-area">
            <div class="logo-icon">
              ${getWobularIconSvg(28)}
            </div>
            <div class="logo-title">
              <h1>NecroMerger Legendary Craving Tracker</h1>
              <div class="logo-subtitle">Track cravings, runes spent, and Wobular progression (Lvl 105–1000)</div>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" id="btn-share" title="Share your run via URL">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share / Export
            </button>
            <button class="btn ${state.focusMode ? 'btn-active' : ''}" id="btn-focus-mode" title="Toggle Focus Mode (Show Current + Next 5 cravings vs All)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              ${state.focusMode ? 'Focus: ON (Next 5)' : 'Focus: OFF (All)'}
            </button>
            <button class="btn btn-danger" id="btn-reset" title="Reset all tracker data">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
              Reset
            </button>
          </div>
        </div>

        <div class="header-controls">
          <div class="level-selector-group">
            <label for="max-level-select"><strong>Max Devourer Level:</strong></label>
            <select id="max-level-select" class="custom-select">
              ${maxLevelOptions
                .map(
                  (lvl) =>
                    `<option value="${lvl}" ${state.maxDevourerLevel === lvl ? 'selected' : ''}>Level ${lvl}</option>`
                )
                .join('')}
            </select>
          </div>
          <div class="stat-subtext">
            Auto-saves locally • Works offline
          </div>
        </div>
      </header>
    `;

    // Event listeners
    this.container.querySelector('#btn-share')?.addEventListener('click', () => {
      this.onShareClick();
    });

    this.container.querySelector('#btn-focus-mode')?.addEventListener('click', () => {
      trackerState.toggleFocusMode();
    });

    this.container.querySelector('#btn-reset')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all craving progress for this run?')) {
        trackerState.resetRun();
      }
    });

    this.container.querySelector('#max-level-select')?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      trackerState.setMaxDevourerLevel(parseInt(target.value, 10));
    });
  }
}
