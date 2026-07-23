import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App';
import { LanguageProvider } from './utils/LanguageContext';
import { registerSW } from 'virtual:pwa-register';

// Global beforeinstallprompt handler to avoid missing early events
(window as any).__deferredPwaPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__deferredPwaPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-prompt-captured'));
});

// Register Service Worker for PWA
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Yeni PWA sürümü mevcut, yenileniyor...');
  },
  onOfflineReady() {
    console.log('PWA çevrimdışı kullanıma hazır.');
  },
});

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}

