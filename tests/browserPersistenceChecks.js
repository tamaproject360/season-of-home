import { SaveRepository } from '../src/persistence/SaveRepository.js';
import { createNewSave } from '../src/persistence/SaveSerializer.js';

/** Exercise real browser IndexedDB in a disposable database, never player slots. */
export async function runBrowserPersistenceChecks() {
  const name = `soh-acceptance-${Date.now()}`;
  const repo = new SaveRepository({ indexedDB: globalThis.indexedDB, dbName: name });
  const results = [];
  const check = (condition, text) => { if (!condition) throw new Error(text); results.push(text); };
  await repo.init();
  check(repo.isAvailable && !repo.usingFallback, 'Native IndexedDB available');
  const first = createNewSave({ slotId: 1, name: 'Native QA' });
  await repo.saveSlot(first);
  await repo.saveSlot(createNewSave({ slotId: 2, name: 'Second' }));
  first.player.coins = 96;
  first.world.weather = 'rain';
  first.housing.placedObjects = [{ objectId: 'decor_1', itemId: 'plant_pot', gridX: 2, gridY: 2, rotation: 0 }];
  first.pet.affection = 3; first.pet.lastPettedDay = 1;
  first.world.zoneStates.farm = { resources: { day: 1, nodes: { forest_herb_01: { hits: 1, depleted: true } } }, fishing: { attempts: 4 } };
  await repo.saveSlot(first);
  const second = await repo.loadSlot(1);
  check(second.player.coins === 96 && (await repo.loadSlot(2)).player.coins === 80, 'SAVE-01: slot isolation');
  check(second.housing.placedObjects[0].gridX === 2, 'SAVE-04: decoration position restored');
  check(second.world.weather === 'rain', 'SAVE-05: saved weather restored');
  check(second.pet.affection === 3 && second.world.zoneStates.farm.resources.nodes.forest_herb_01.depleted &&
    second.world.zoneStates.farm.fishing.attempts === 4, 'Phase 5: pet, resource depletion and fishing history restored');
  await new Promise((resolve, reject) => {
    const tx = repo.db.transaction('saveSlots', 'readwrite');
    tx.objectStore('saveSlots').put({ ...second, player: { ...second.player, coins: -1 } });
    tx.oncomplete = resolve; tx.onabort = () => reject(tx.error);
  });
  let consentRequired = false;
  try { await repo.loadSlot(1); } catch (error) { consentRequired = error.code === 'RECOVERY_REQUIRED'; }
  check(consentRequired, 'SAVE-06: corrupt primary requires recovery consent');
  const recovered = await repo.loadSlot(1, { recover: true });
  check(recovered.player.coins === 80, 'SAVE-06: valid backup can be read');
  await repo.saveSlot(recovered);
  await repo.deleteSlot(2);
  check(await repo.loadSlot(2) === null && (await repo.loadSlot(1)).player.coins === 80, 'SAVE-08: delete isolation');
  const base = await repo.loadSlot(1);
  const originalTransaction = repo.db.transaction.bind(repo.db);
  repo.db.transaction = (...args) => {
    const tx = originalTransaction(...args);
    if (args[1] === 'readwrite') {
      const originalStore = tx.objectStore.bind(tx);
      tx.objectStore = storeName => {
        const store = originalStore(storeName);
        if (storeName === 'saveSlots') {
          const put = store.put.bind(store);
          store.put = value => { const request = put(value); request.addEventListener('success', () => tx.abort()); return request; };
        }
        return store;
      };
    }
    return tx;
  };
  let aborted = false;
  try { await repo.saveSlot({ ...base, player: { ...base.player, coins: 999 } }); } catch { aborted = true; }
  repo.db.transaction = originalTransaction;
  check(aborted && (await repo.loadSlot(1)).player.coins === 80, 'SAVE-07/10: failed transaction preserves committed data');
  repo.db.close();
  await new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.deleteDatabase(name);
    request.onsuccess = resolve; request.onerror = () => reject(request.error);
  });
  return results;
}
