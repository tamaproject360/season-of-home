import { STORAGE_KEYS } from '../config/constants.js';

/**
 * SaveRepository
 * Manages IndexedDB 'lembah-rimbun-db' and reports capability status truthfully.
 */
export class SaveRepository {
  constructor() {
    this.db = null;
    this.isAvailable = false;
    this.usingFallback = false;
    this.fallbackStore = new Map();
  }

  async init() {
    try {
      if (!window.indexedDB) {
        throw new Error('IndexedDB not supported on this browser');
      }

      this.db = await new Promise((resolve, reject) => {
        const request = window.indexedDB.open(STORAGE_KEYS.DB_NAME, STORAGE_KEYS.DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('saveSlots')) {
            db.createObjectStore('saveSlots', { keyPath: 'slotId' });
          }
          if (!db.objectStoreNames.contains('saveBackups')) {
            const backupStore = db.createObjectStore('saveBackups', { keyPath: 'id' });
            backupStore.createIndex('slotId', 'slotId', { unique: false });
          }
          if (!db.objectStoreNames.contains('appMeta')) {
            db.createObjectStore('appMeta', { keyPath: 'key' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      this.isAvailable = true;
      this.usingFallback = false;
      console.log('[SaveRepository] IndexedDB lembah-rimbun-db ready.');
      return { available: true, fallback: false };
    } catch (err) {
      console.warn('[SaveRepository] IndexedDB probe failed, using in-memory session fallback:', err);
      this.isAvailable = false;
      this.usingFallback = true;
      return { available: false, fallback: true, error: err.message };
    }
  }

  async getAppMeta(key) {
    if (this.usingFallback) {
      return this.fallbackStore.get(`appMeta:${key}`) || null;
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('appMeta', 'readonly');
      const store = tx.objectStore('appMeta');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    });
  }

  async setAppMeta(key, value) {
    if (this.usingFallback) {
      this.fallbackStore.set(`appMeta:${key}`, value);
      return true;
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('appMeta', 'readwrite');
      const store = tx.objectStore('appMeta');
      const req = store.put({ key, value });
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  }
}

export const StorageRepo = new SaveRepository();
