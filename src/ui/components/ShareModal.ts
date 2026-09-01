import { trackerState } from '../../state/trackerState.ts';
import { encodeStateToUrl } from '../../state/urlCodec.ts';
import { showToast } from '../toast.ts';

export class ShareModalComponent {
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

  private render() {
    const state = trackerState.getState();
    const shareableUrl = encodeStateToUrl(state);
    const jsonString = JSON.stringify(state, null, 2);

    this.backdropEl.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>Share & Export Run</h3>
          <button class="modal-close" id="modal-btn-close">&times;</button>
        </div>

        <div class="modal-body">
          <div>
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">
              Shareable Link (State Encoded in URL Parameter)
            </label>
            <div class="share-url-box">
              <input type="text" class="share-url-input" id="share-link-input" value="${shareableUrl}" readonly />
              <button class="btn btn-primary" id="btn-copy-link">
                Copy Link
              </button>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem;">
              Anyone opening this URL will load your exact craving selections and progress.
            </p>
          </div>

          <hr style="border: 0; border-top: 1px solid var(--border-color);" />

          <div>
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">
              JSON Backup & Restore
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn" id="btn-download-json">
                Download .json
              </button>
              <button class="btn" id="btn-copy-json">
                Copy JSON
              </button>
              <label class="btn" style="cursor: pointer;">
                Load JSON File
                <input type="file" id="input-load-file" accept=".json" style="display: none;" />
              </label>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    this.backdropEl.querySelector('#modal-btn-close')?.addEventListener('click', () => this.close());
    this.backdropEl.addEventListener('click', (e) => {
      if (e.target === this.backdropEl) this.close();
    });

    const copyLinkBtn = this.backdropEl.querySelector('#btn-copy-link');
    copyLinkBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareableUrl);
        showToast('Share link copied to clipboard!');
      } catch {
        const input = this.backdropEl.querySelector('#share-link-input') as HTMLInputElement;
        input.select();
        document.execCommand('copy');
        showToast('Share link copied!');
      }
    });

    this.backdropEl.querySelector('#btn-copy-json')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(jsonString);
        showToast('JSON state copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy JSON:', err);
      }
    });

    this.backdropEl.querySelector('#btn-download-json')?.addEventListener('click', () => {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `necromerger-cravings-run-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('JSON backup downloaded!');
    });

    const fileInput = this.backdropEl.querySelector('#input-load-file') as HTMLInputElement;
    fileInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed && parsed.completedCravings) {
            trackerState.importState(parsed);
            showToast('Run state loaded successfully!');
            this.close();
          } else {
            alert('Invalid tracker state JSON file format.');
          }
        } catch {
          alert('Could not parse JSON file.');
        }
      };
      reader.readAsText(file);
    });
  }
}
