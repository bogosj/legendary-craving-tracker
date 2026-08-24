import './styles/main.css';
import { BracketTabsComponent } from './ui/components/BracketTabs.ts';
import { CravingListComponent } from './ui/components/CravingList.ts';
import { DashboardComponent } from './ui/components/Dashboard.ts';
import { HeaderComponent } from './ui/components/Header.ts';
import { NextUpCravingComponent } from './ui/components/NextUpCraving.ts';
import { ShareModalComponent } from './ui/components/ShareModal.ts';

function initApp() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.className = 'app-container';

  // Create containers for each component
  const headerContainer = document.createElement('div');
  const nextUpContainer = document.createElement('div');
  const dashboardContainer = document.createElement('div');
  const bracketTabsContainer = document.createElement('div');
  const cravingListContainer = document.createElement('div');

  appEl.appendChild(headerContainer);
  appEl.appendChild(nextUpContainer);
  appEl.appendChild(dashboardContainer);
  appEl.appendChild(bracketTabsContainer);
  appEl.appendChild(cravingListContainer);

  const shareModal = new ShareModalComponent();

  // Instantiate components
  new HeaderComponent(headerContainer, () => shareModal.open());
  new NextUpCravingComponent(nextUpContainer);
  new DashboardComponent(dashboardContainer);
  new BracketTabsComponent(bracketTabsContainer);
  new CravingListComponent(cravingListContainer);

  // Register PWA service worker
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
