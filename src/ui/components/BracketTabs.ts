import { trackerState } from '../../state/trackerState.ts';

export class BracketTabsComponent {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
    trackerState.subscribe(() => this.render());
  }

  private render() {
    const state = trackerState.getState();
    const maxLvl = state.maxDevourerLevel;

    const brackets = [
      { id: 'all', label: 'All Cravings', minLvl: 100 },
      { id: '101-200', label: '101–200 (20 Cravings)', minLvl: 101 },
      { id: '201-400', label: '201–400 (50 Cravings)', minLvl: 201 },
      { id: '401-800', label: '401–800 (132 Cravings)', minLvl: 401 },
      { id: '801-1000', label: '801–1000 (100 Cravings)', minLvl: 801 },
    ];

    // Filter brackets to only those applicable to current max level
    const availableBrackets = brackets.filter((b) => b.id === 'all' || maxLvl >= b.minLvl);

    let activeBracket = state.selectedBracket;
    if (activeBracket === '401-900') activeBracket = '401-800';
    if (activeBracket === '901-1000') activeBracket = '801-1000';
    if (!availableBrackets.some((b) => b.id === activeBracket)) {
      activeBracket = 'all';
    }

    this.container.innerHTML = `
      <div class="tabs-container">
        ${availableBrackets
          .map(
            (b) => `
            <button class="tab-btn ${activeBracket === b.id ? 'active' : ''}" data-bracket="${b.id}">
              ${b.label}
            </button>
          `
          )
          .join('')}
      </div>
    `;

    this.container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const bracketId = target.getAttribute('data-bracket');
        if (bracketId) {
          trackerState.setSelectedBracket(bracketId);
        }
      });
    });
  }
}
