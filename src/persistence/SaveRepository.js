import { STORAGE_KEYS } from '../config/constants.js';
import { copyData, validateSave } from './SaveSerializer.js';
import { migrateSave } from './migrations.js';

const validSlot = slot => {
  if (!Number.isInteger(slot) || slot < 1 || slot > 3) throw new Error('Slot harus 1, 2, atau 3.');
};

export class SaveRepository {
  constructor({ indexedDB = globalThis.indexedDB, dbName = STORAGE_KEYS.DB_NAME } = {}) {
    this.factory = indexedDB;
    this.dbName = dbName;
    this.db = null;
    this.isAvailable = false;
    this.usingFallback = false;
    this.fallbackStore = new Map();
  }

  async init() {
    try {
      if (!this.factory) throw new Error('IndexedDB tidak tersedia');
      this.db = await new Promise((resolve, reject) => {
        const request = this.factory.open(this.dbName, STORAGE_KEYS.DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('saveSlots')) db.createObjectStore('saveSlots', { keyPath: 'slotId' });
          if (!db.objectStoreNames.contains('saveBackups')) {
            db.createObjectStore('saveBackups', { keyPath: 'id' }).createIndex('slotId', 'slotId', { unique: false });
          }
          if (!db.objectStoreNames.contains('appMeta')) db.createObjectStore('appMeta', { keyPath: 'key' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Tutup tab game lama untuk membuka penyimpanan.'));
      });
      this.db.onversionchange = () => this.db.close();
      this.isAvailable = true;
      return { available: true, fallback: false };
    } catch (error) {
      this.usingFallback = true;
      return { available: false, fallback: true, error: error.message };
    }
  }

  transaction(stores, mode, enqueue) {
    return new Promise((resolve, reject) => {
      let result;
      const tx = this.db.transaction(stores, mode);
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(tx.error || new Error('Penyimpanan dibatalkan; perubahan tidak tersimpan.'));
      tx.onerror = () => {};
      try { enqueue(tx, value => { result = value; }); }
      catch (error) { tx.abort(); reject(error); }
    });
  }

  async getRawSlot(slotId) {
    validSlot(slotId);
    if (this.usingFallback) return copyData(this.fallbackStore.get(`save:${slotId}`) || null);
    return this.transaction('saveSlots', 'readonly', (tx, done) => {
      const request = tx.objectStore('saveSlots').get(slotId);
      request.onsuccess = () => done(request.result || null);
    });
  }

  async getBackups(slotId) {
    validSlot(slotId);
    if (this.usingFallback) return copyData(this.fallbackStore.get(`backups:${slotId}`) || []);
    return this.transaction('saveBackups', 'readonly', (tx, done) => {
      const request = tx.objectStore('saveBackups').index('slotId').getAll(slotId);
      request.onsuccess = () => done(request.result.sort((a, b) => b.revision - a.revision));
    });
  }

  async loadSlot(slotId, { recover = false } = {}) {
    const primary = await this.getRawSlot(slotId);
    if (!primary) return null;
    try { return migrateSave(primary); }
    catch (error) {
      if (error.code === 'FUTURE_VERSION') throw error;
      for (const backup of await this.getBackups(slotId)) {
        try {
          const save = migrateSave(backup.snapshot);
          if (recover) return save;
          const recovery = new Error('Save utama rusak. Cadangan yang valid tersedia. Pulihkan cadangan?');
          recovery.code = 'RECOVERY_REQUIRED';
          recovery.backup = { name: save.player.name, day: save.world.day, revision: save.revision };
          throw recovery;
        } catch (candidateError) {
          if (candidateError.code === 'RECOVERY_REQUIRED') throw candidateError;
        }
      }
      throw new Error('Save dan cadangan tidak dapat dimuat. Data tetap disimpan untuk pemulihan.');
    }
  }

  async listSlots() {
    return Promise.all([1, 2, 3].map(async slotId => {
      const raw = await this.getRawSlot(slotId);
      return { slotId, occupied: Boolean(raw), name: typeof raw?.player?.name === 'string' ? raw.player.name : '',
        day: raw?.world?.day, updatedAt: raw?.updatedAt };
    }));
  }

  async saveSlot(input) {
    validateSave(input);
    const snapshot = copyData(input);
    const slotId = snapshot.slotId;
    const prepare = previous => {
      if (previous?.schemaVersion > 1) throw new Error('Save versi lebih baru tidak boleh ditimpa.');
      snapshot.revision = Math.max(Number.isSafeInteger(previous?.revision) ? previous.revision : 0, snapshot.revision) + 1;
      snapshot.updatedAt = new Date().toISOString();
      let validPrevious = null;
      try { if (previous) validPrevious = migrateSave(previous); } catch { /* Never back up a corrupt primary. */ }
      return validPrevious;
    };
    if (this.usingFallback) {
      const previous = prepare(await this.getRawSlot(slotId));
      const backups = await this.getBackups(slotId);
      if (previous) backups.unshift({ id: `${slotId}:${previous.revision}`, slotId, revision: previous.revision, snapshot: previous });
      this.fallbackStore.set(`backups:${slotId}`, copyData(backups.slice(0, 2)));
      this.fallbackStore.set(`save:${slotId}`, copyData(snapshot));
      return copyData(snapshot);
    }
    return this.transaction(['saveSlots', 'saveBackups'], 'readwrite', (tx, done) => {
      const slots = tx.objectStore('saveSlots');
      const backups = tx.objectStore('saveBackups');
      const request = slots.get(slotId);
      request.onsuccess = () => {
        let previous;
        try { previous = prepare(request.result); } catch { tx.abort(); return; }
        if (previous) backups.put({ id: `${slotId}:${previous.revision}`, slotId, revision: previous.revision, snapshot: previous });
        slots.put(snapshot);
        const prune = backups.index('slotId').getAll(slotId);
        prune.onsuccess = () => {
          prune.result.sort((a, b) => b.revision - a.revision).slice(2).forEach(item => backups.delete(item.id));
        };
        done(snapshot);
      };
    });
  }

  async deleteSlot(slotId) {
    validSlot(slotId);
    if (this.usingFallback) {
      this.fallbackStore.delete(`save:${slotId}`);
      this.fallbackStore.delete(`backups:${slotId}`);
      return;
    }
    return this.transaction(['saveSlots', 'saveBackups'], 'readwrite', tx => {
      tx.objectStore('saveSlots').delete(slotId);
      const store = tx.objectStore('saveBackups');
      const request = store.index('slotId').getAll(slotId);
      request.onsuccess = () => request.result.forEach(item => store.delete(item.id));
    });
  }

  async getAppMeta(key) {
    if (this.usingFallback) return copyData(this.fallbackStore.get(`meta:${key}`) ?? null);
    return this.transaction('appMeta', 'readonly', (tx, done) => {
      const request = tx.objectStore('appMeta').get(key);
      request.onsuccess = () => done(request.result?.value ?? null);
    });
  }

  async setAppMeta(key, value) {
    if (this.usingFallback) { this.fallbackStore.set(`meta:${key}`, copyData(value)); return true; }
    return this.transaction('appMeta', 'readwrite', (tx, done) => {
      tx.objectStore('appMeta').put({ key, value: copyData(value) });
      done(true);
    });
  }
}

export const StorageRepo = new SaveRepository();
