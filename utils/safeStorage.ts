// Resilient storage utility with memory fallback for cross-origin iframes and restricted environments.

class MemoryStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const memoryFallback = new MemoryStorage();

export const isStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__storage_probe__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      console.warn(`[safeStorage] Access to localStorage is blocked (iframe sandbox). Using fallback for "${key}".`, e);
    }
    return memoryFallback.getItem(key);
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[safeStorage] Set to localStorage is blocked (iframe sandbox). Using fallback for "${key}".`, e);
    }
    memoryFallback.setItem(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[safeStorage] Remove from localStorage is blocked (iframe sandbox).`, e);
    }
    memoryFallback.removeItem(key);
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.clear();
      }
    } catch (e) {
      console.warn(`[safeStorage] Clear localStorage is blocked (iframe sandbox).`, e);
    }
    memoryFallback.clear();
  }
};

export default safeStorage;
