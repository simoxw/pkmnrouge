import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Auto-update Service Worker when new version is available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // use a relative URL and scope so that the worker works even when
      // the app is served from a subfolder
      const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      console.log('[SW] Service Worker registered:', reg);

      // Check for updates periodically (every 5 minutes)
      setInterval(async () => {
        try {
          await reg.update();
          console.log('[SW] Updating service worker...');
        } catch (err) {
          console.error('[SW] Update check failed:', err);
        }
      }, 5 * 60 * 1000);

      // Listen for new SW taking control
      reg.addEventListener('controllerchange', () => {
        console.log('[SW] New version activated, reloading page...');
        window.location.reload();
      });

      // Listen for new SW waiting (redundant state)
      if (reg.waiting) {
        console.log('[SW] New version waiting to activate');
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New version ready, triggering reload...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
    } catch (err) {
      console.log('[SW] Service Worker registration failed:', err);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
