import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { SaveRepository } from '../src/persistence/SaveRepository.js';
import { SaveManager } from '../src/persistence/SaveManager.js';
import { createNewSave } from '../src/persistence/SaveSerializer.js';
import { SettingsRepository } from '../src/persistence/SettingsRepository.js';

const repo = new SaveRepository({ indexedDB: new IDBFactory(), dbName: 'phase4-tests' });
await repo.init();
const first = createNewSave({ slotId: 1, name: 'Ayu' });
await repo.saveSlot(first);
await repo.saveSlot(createNewSave({ slotId: 2, name: 'Budi' }));
await repo.saveSlot(createNewSave({ slotId: 3, name: 'Citra' }));
for (const coins of [91, 92, 93]) await repo.saveSlot({ ...first, player: { ...first.player, coins } });
assert.equal((await repo.loadSlot(1)).player.coins, 93);
assert.equal((await repo.loadSlot(2)).player.name, 'Budi');
assert.equal((await repo.getBackups(1)).length, 2);

const writeRaw = snapshot => new Promise((resolve, reject) => {
  const tx = repo.db.transaction('saveSlots', 'readwrite');
  tx.objectStore('saveSlots').put(snapshot);
  tx.oncomplete = resolve;
  tx.onabort = () => reject(tx.error);
});
await writeRaw({ ...first, player: { ...first.player, coins: -9 } });
await assert.rejects(repo.loadSlot(1), error => error.code === 'RECOVERY_REQUIRED');
const recovered = await repo.loadSlot(1, { recover: true });
assert.equal(recovered.player.coins, 92);
await assert.rejects(repo.loadSlot(1), error => error.code === 'RECOVERY_REQUIRED');
await repo.saveSlot(recovered);
assert.equal((await repo.loadSlot(1)).player.coins, 92);

// Abort after the slot put succeeds but before the transaction commits.
const originalTransaction = repo.db.transaction.bind(repo.db);
repo.db.transaction = (...args) => {
  const tx = originalTransaction(...args);
  if (args[1] === 'readwrite') {
    const originalStore = tx.objectStore.bind(tx);
    tx.objectStore = name => {
      const store = originalStore(name);
      if (name === 'saveSlots') {
        const put = store.put.bind(store);
        store.put = value => {
          const request = put(value);
          request.addEventListener('success', () => tx.abort());
          return request;
        };
      }
      return store;
    };
  }
  return tx;
};
const beforeAbort = await repo.loadSlot(1);
await assert.rejects(repo.saveSlot({ ...beforeAbort, player: { ...beforeAbort.player, coins: 999 } }));
repo.db.transaction = originalTransaction;
assert.deepEqual(await repo.loadSlot(1), beforeAbort, 'aborted write preserves the last complete save');

const settings = new SettingsRepository(repo);
await settings.save({ textScale: 1.25, reducedMotion: true, touchControlSize: 1.5, masterVolume: 0.2 });
assert.equal((await new SettingsRepository(repo).load()).textScale, 1.25);
await repo.deleteSlot(2);
assert.equal(await repo.loadSlot(2), null);
assert.equal((await repo.getBackups(2)).length, 0);
assert.equal((await repo.loadSlot(3)).player.name, 'Citra');
assert.equal((await settings.load()).reducedMotion, true);

let concurrent = 0, peak = 0, writes = 0;
const statuses = [];
const queueRepo = { usingFallback: false, async saveSlot(snapshot) {
  concurrent++; peak = Math.max(peak, concurrent);
  await new Promise(resolve => setTimeout(resolve, 2));
  concurrent--; writes++;
  if (writes === 1) throw new Error('Quota exceeded');
  return snapshot;
} };
const manager = new SaveManager({ repository: queueRepo, capture: () => first, onStatus: s => statuses.push(s.state) });
await assert.rejects(manager.save());
await Promise.all([manager.save(), manager.save()]);
assert.equal(peak, 1, 'autosaves are serialized');
assert.ok(statuses.includes('error'));
assert.equal(statuses.at(-1), 'saved', 'failed writes do not poison retry queue');
manager.dispose();

const fallback = new SaveRepository({ indexedDB: null });
await fallback.init();
await fallback.saveSlot(first);
const copy = await fallback.loadSlot(1);
copy.player.coins = 0;
assert.equal((await fallback.loadSlot(1)).player.coins, 80, 'fallback returns independent copies');
assert.equal(fallback.usingFallback, true);
repo.db.close();
console.log('Persistence: three slots, atomic abort, backup consent, pruning, delete isolation, settings, queue/retry and fallback PASS');
