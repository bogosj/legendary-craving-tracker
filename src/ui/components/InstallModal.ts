export class InstallModalComponent {
  private backdropEl: HTMLElement;

  constructor() {
    this.backdropEl = document.createElement('div');
    this.backdropEl.className = 'modal-backdrop';
    document.body.appendChild(this.backdropEl);
    this.render();
  }

  public open() {
    this.render();
    this.backdropEl.classList.add('open');
  }

  public close() {
    this.backdropEl.classList.remove('open');
  }

  private isIos(): boolean {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  private isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  private render() {
    const isIosDevice = this.isIos();
    const isAndroidDevice = this.isAndroid();

    let instructionsHtml = '';

    if (isIosDevice) {
      instructionsHtml = `
        <div class="install-step-list">
          <div class="install-step">
            <span class="step-num">1</span>
            <div class="step-text">
              In Safari, tap the <strong>Share</strong> button
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin: 0 4px;">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              at the bottom of the screen.
            </div>
          </div>
          <div class="install-step">
            <span class="step-num">2</span>
            <div class="step-text">
              Scroll down and tap <strong>Add to Home Screen</strong>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin: 0 4px;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>.
            </div>
          </div>
          <div class="install-step">
            <span class="step-num">3</span>
            <div class="step-text">
              Tap <strong>Add</strong> in the top-right corner to finish.
            </div>
          </div>
        </div>
      `;
    } else if (isAndroidDevice) {
      instructionsHtml = `
        <div class="install-step-list">
          <div class="install-step">
            <span class="step-num">1</span>
            <div class="step-text">
              Tap the browser menu <strong>(⋮)</strong> in Chrome or your browser.
            </div>
          </div>
          <div class="install-step">
            <span class="step-num">2</span>
            <div class="step-text">
              Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
            </div>
          </div>
          <div class="install-step">
            <span class="step-num">3</span>
            <div class="step-text">
              Confirm by tapping <strong>Install</strong>.
            </div>
          </div>
        </div>
      `;
    } else {
      instructionsHtml = `
        <div class="install-step-list">
          <div class="install-step">
            <span class="step-num">1</span>
            <div class="step-text">
              Look for the <strong>Install</strong> icon 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin: 0 4px;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              in your browser's address bar (Chrome, Edge, Brave, etc.).
            </div>
          </div>
          <div class="install-step">
            <span class="step-num">2</span>
            <div class="step-text">
              Click <strong>Install NecroMerger Craving Tracker</strong>.
            </div>
          </div>
          <div class="install-step">
            <span class="step-num">3</span>
            <div class="step-text">
              The app will open in its own standalone, distraction-free window with offline support!
            </div>
          </div>
        </div>
      `;
    }

    this.backdropEl.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <h3>Install App (PWA)</h3>
          </div>
          <button class="modal-close" id="install-modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            Installing as a Progressive Web App allows instant loading, full offline capability, and fullscreen tracking without browser toolbars.
          </p>
          ${instructionsHtml}
          <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
            <button class="btn btn-primary" id="install-modal-done">Got it</button>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    this.backdropEl.querySelector('#install-modal-close')?.addEventListener('click', () => this.close());
    this.backdropEl.querySelector('#install-modal-done')?.addEventListener('click', () => this.close());
    this.backdropEl.addEventListener('click', (e) => {
      if (e.target === this.backdropEl) this.close();
    });
  }
}
