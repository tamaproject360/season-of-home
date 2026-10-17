import assert from 'node:assert/strict';
import { createNewSave, validateSave, captureSave, restoreSave } from '../src/persistence/SaveSerializer.js';
import { migrateSave } from '../src/persistence/migrations.js';
import { WorldClock } from '../src/world/WorldClock.js';
import { InventorySystem } from '../src/systems/InventorySystem.js';
import { NavGrid } from '../src/world/navGrid.js';

const saved = createNewSave({ slotId: 1, name: 'Ayu', appearanceId: 'outfit_clay' });
assert.equal(validateSave(saved), true);
assert.equal(saved.farm.plots.length, 12);
assert.equal(saved.player.name, 'Ayu');
const bad = mutate => {
  const copy = structuredClone(saved);
  mutate(copy);
  assert.throws(() => validateSave(copy));
};
bad(s => { s.player.coins = -1; });
bad(s => { s.slotId = 4; });
bad(s => { s.player.position.tileX = Infinity; });
bad(s => { s.inventory.slots[0].itemId = 'missing'; });
bad(s => { s.inventory.slots[1].instanceId = s.inventory.slots[0].instanceId; });
bad(s => { s.farm.plots[0].soilState = 'lava'; });
bad(s => { s.farm.plots = null; });
bad(s => { s.quests.claimedRewardTokens.push('reward_token_quest_beat_1'); });
bad(s => { s.schemaVersion = 999; });
assert.deepEqual(migrateSave(saved), saved);
assert.deepEqual(migrateSave(migrateSave(saved)), saved);
const legacy = structuredClone(saved);
delete legacy.schemaVersion;
assert.deepEqual(migrateSave(legacy), saved);

// Loading a clock must not grow plants a second time.
const clock = new WorldClock();
let days = 0;
clock.on('day', () => days++);
clock.loadState({ day: 3, season: 'spring', timeMinutes: 721, weather: 'rain' });
assert.equal(days, 0, 'restoring time does not advance a day');

const plots = saved.farm.plots.map(p => ({
  ...p, serialize() { const { serialize, deserialize, ...data } = this; return data; },
  deserialize(data) { Object.assign(this, data); }
}));
const scene = {
  inventory: new InventorySystem(), worldClock: clock,
  farmingSystem: { serialize: () => ({ plots: plots.map(p => p.serialize()) }),
    deserialize: data => data.plots.forEach((p, i) => plots[i].deserialize(p)) },
  questSystem: { serialize() { return this.data; }, deserialize(data) { this.data = data; } },
  relationshipSystem: { serialize() { return this.data; }, deserialize(data) { this.data = data; } },
  wallet: { coins: 0 }, navGrid: new NavGrid(36, 36),
  player: { updatePosition(x, y) { this.tileX = x; this.tileY = y; }, facing: 'sw' },
  cameraControls: { targetZoom: 1, setZoom(value) { this.targetZoom = value; } }
};
scene.navGrid.setSolid(9, 13);
restoreSave(scene, saved);
assert.ok(scene.navGrid.isWalkable(scene.player.tileX, scene.player.tileY), 'old positions recover to safe land');
scene.wallet.coins = 72;
scene.inventory.addItem('crop_sunroot', 2);
scene.worldClock.weather = 'rain';
const captured = captureSave(scene);
assert.equal(captured.player.coins, 72);
assert.equal(captured.world.weather, 'rain');
assert.equal(validateSave(captured), true);
scene.inventory.slots[2].count++;
assert.notDeepEqual(captured.inventory, scene.inventory.serialize(), 'snapshots cannot alias live objects');
restoreSave(scene, captured);
assert.deepEqual(scene.inventory.serialize(), captured.inventory);
assert.deepEqual(scene.questSystem.serialize(), captured.quests);
assert.deepEqual(scene.farmingSystem.serialize(), captured.farm);
console.log('Save snapshots: full roundtrip, deep copies, schema validation, migration and safe spawn PASS');
