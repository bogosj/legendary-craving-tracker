export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type PwaListener = () => void;

class PwaManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installed: boolean = false;
  private listeners: Set<PwaListener> = new Set();

  constructor() {
    this.installed = this.detectInstalled();
    this.initListeners();
  }

  private detectInstalled(): boolean {
    if (typeof window === 'undefined') return false;

    // 1. Standard standalone display mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // 2. Fullscreen or minimal-ui display mode (used by some PWA shells)
    if (
      window.matchMedia &&
      (window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches)
    ) {
      return true;
    }

    // 3. iOS Safari standalone mode
    if ((navigator as unknown as { standalone?: boolean }).standalone === true) {
      return true;
    }

    // 4. Android TWA
    if (typeof document !== 'undefined' && document.referrer && document.referrer.startsWith('android-app://')) {
      return true;
    }

    return false;
  }

  private initListeners() {
    if (typeof window === 'undefined') return;

    // Capture beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notify();
    });

    // Capture appinstalled event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.installed = true;
      this.notify();
    });

    // Listen for display mode media query changes
    if (window.matchMedia) {
      const standaloneMedia = window.matchMedia('(display-mode: standalone)');
      standaloneMedia.addEventListener?.('change', (e) => {
        if (e.matches) {
          this.installed = true;
          this.notify();
        }
      });
    }

    // Check navigator.getInstalledRelatedApps if supported
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as unknown as { getInstalledRelatedApps: () => Promise<unknown[]> })
        .getInstalledRelatedApps()
        .then((apps) => {
          if (apps && apps.length > 0) {
            this.installed = true;
            this.notify();
          }
        })
        .catch(() => {});
    }
  }

  public isInstalled(): boolean {
    return this.installed || this.detectInstalled();
  }

  public canPromptDirectly(): boolean {
    return this.deferredPrompt !== null;
  }

  public async promptInstall(): Promise<boolean> {
    if (this.deferredPrompt) {
      const promptEvent = this.deferredPrompt;
      this.deferredPrompt = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          this.installed = true;
          this.notify();
          return true;
        }
      } catch (err) {
        console.error('[PWA] Error during install prompt:', err);
      }
      this.notify();
      return false;
    }
    return false;
  }

  public subscribe(listener: PwaListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[PWA] Listener error:', err);
      }
    });
  }
}

export const pwaManager = new PwaManager();
