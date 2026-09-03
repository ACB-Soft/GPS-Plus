import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App';
import { LanguageProvider } from './utils/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Global protection: In cross-origin iframes (like AI Studio preview), accessing window.localStorage
// can throw DOMException / SecurityError when third-party cookies or storage partitioning are restricted.
// We protect window.localStorage so that any call gracefully falls back to in-memory storage.
try {
  const testKey = '__probe_storage__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
} catch (storageError) {
  console.warn('[Storage] window.localStorage access is restricted in this iframe. Setting up memory fallback.');
  const memoryMap = new Map<string, string>();
  const mockStorage: Storage = {
    length: 0,
    clear() {
      memoryMap.clear();
      this.length = 0;
    },
    getItem(key: string) {
      return memoryMap.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(memoryMap.keys())[index] ?? null;
    },
    removeItem(key: string) {
      memoryMap.delete(key);
      this.length = memoryMap.size;
    },
    setItem(key: string, value: string) {
      memoryMap.set(key, String(value));
      this.length = memoryMap.size;
    }
  };

  try {
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });
  } catch (overrideErr) {
    console.warn('[Storage] Could not redefine window.localStorage property:', overrideErr);
  }
}

// Unregister any stale service workers in development that might intercept preview requests
if ('serviceWorker' in navigator && (window.location.hostname.includes('run.app') || window.location.hostname === 'localhost')) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().catch(() => {});
    }
  }).catch(() => {});
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

