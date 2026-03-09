import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// the vite-plugin-pwa takes care of generating and registering a
// service worker for us. the following import is optional but gives us
// hooks for update notifications.
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] new content available, refresh to update');
  },
  onOfflineReady() {
    console.log('[PWA] offline ready');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
