import { ZONE_FARM } from '../world/zoneDefinitions.js';
import { ITEMS } from '../data/items.js';
import { QUESTS } from '../data/quests.js';
import { CROPS } from '../data/crops.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { WorldClock, SEASONS } from '../world/WorldClock.js';
import { DECORATIONS } from '../systems/DecorationSystem.js';

export const OUTFITS = {
  outfit_sage: { name: 'Hijau kebun', tint: 0xFFFFFF },
  outfit_clay: { name: 'Tanah liat', tint: 0xF2C7AB },
  outfit_straw: { name: 'Jerami hangat', tint: 0xEEE1AC }
};
/** Deep-copy serializable state without retaining live model references. */
export const copyData = value => JSON.parse(JSON.stringify(value));
const integer = (n, min, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(n) && n >= min && n <= max;
const requireValue = (condition, message) => { if (!condition) throw new Error(`Save tidak valid: ${message}`); };

/** Create a complete, validated starter snapshot for one save slot. */
export function createNewSave({ slotId = 1, name = 'Joni', appearanceId = 'outfit_sage' } = {}) {
  const inventory = new InventorySystem(16);
  for (const [id, count] of [['tool_hoe', 1], ['tool_watering_can', 1], ['seed_sunroot', 3],
    ['seed_mossberry', 2], ['wood', 6], ['stone', 4], ['ore', 3]]) inventory.addItem(id, count);
  const now = new Date().toISOString();
  const save = {
    schemaVersion: 1, slotId, revision: 0, createdAt: now, updatedAt: now,
    meta: { gameVersion: '0.6.0', playtimeSeconds: 0, lastZoneId: 'farm' },
    world: { ...new WorldClock().getState(), worldSeed: 47021, year: 1, zoneStates: {}, festivalState: {} },
    player: { name: String(name).trim().slice(0, 24) || 'Joni', appearanceId,
      zoneId: 'farm', position: { tileX: ZONE_FARM.spawnPoint.tileX, tileY: ZONE_FARM.spawnPoint.tileY },
      facing: ZONE_FARM.spawnPoint.facing, coins: 80, toolLevel: { wateringCan: 1 }, zoom: 1 },
    inventory: inventory.serialize(),
    farm: { plots: ZONE_FARM.plots.map((p, i) => ({ ...p, soilState: i === 0 ? 'watered' : 'tilled',
      cropId: i === 0 ? 'sunroot' : i === 1 ? 'mossberry' : null,
      growthStage: i === 0 ? 2 : i === 1 ? 4 : 0,
      plantedDay: i < 2 ? 1 : -1, wateredOnDay: i === 0 ? 1 : -1 })) },
    quests: { questStates: Object.fromEntries(Object.values(QUESTS).map(q => [q.id, {
      id: q.id, state: q.id === 'quest_beat_1' ? 'available' : 'locked', objectives: copyData(q.objectives)
    }])), claimedRewardTokens: [] },
    relationships: { scores: { suri: 10, bima: 0, nara: 0 }, talkedToday: [] },
    pet: { petId: 'kiko', affection: 0, mode: 'following', lastPettedDay: -1 },
    housing: { placedObjects: [] }, flags: {}
  };
  validateSave(save);
  return save;
}

/** Reject malformed snapshots before they can mutate the active game. */
export function validateSave(s) {
  requireValue(s && typeof s === 'object' && s.schemaVersion === 1, 'versi skema');
  requireValue(integer(s.slotId, 1, 3) && integer(s.revision, 0), 'slot/revisi');
  requireValue(Number.isFinite(Date.parse(s.createdAt)) && Number.isFinite(Date.parse(s.updatedAt)), 'tanggal');
  requireValue(s.meta && Number.isFinite(s.meta.playtimeSeconds) && s.meta.playtimeSeconds >= 0, 'waktu bermain');
  requireValue(integer(s.world?.day, 1) && SEASONS.includes(s.world.season), 'kalender');
  requireValue(Number.isFinite(s.world.timeMinutes) && s.world.timeMinutes >= 0 && s.world.timeMinutes < 1440, 'jam');
  requireValue(['clear', 'cloudy', 'rain'].includes(s.world.weather), 'cuaca');
  const player = s.player;
  requireValue(player && typeof player.name === 'string' && player.name.trim().length > 0 && player.name.length <= 24, 'nama');
  requireValue(Object.hasOwn(OUTFITS, player.appearanceId) && player.zoneId === 'farm', 'penampilan/zona');
  requireValue(integer(player.coins, 0) && [1, 2].includes(player.toolLevel?.wateringCan), 'koin/peralatan');
  requireValue(['sw', 'se', 'nw', 'ne'].includes(player.facing), 'arah hadap');
  requireValue(Number.isFinite(player.zoom) && player.zoom >= 0.5 && player.zoom <= 1.75, 'zoom');
  const p = player.position;
  requireValue(p && Number.isFinite(p.tileX) && Number.isFinite(p.tileY) &&
    p.tileX >= 0 && p.tileX < ZONE_FARM.width && p.tileY >= 0 && p.tileY < ZONE_FARM.height, 'posisi');
  const inv = s.inventory;
  requireValue(inv?.capacity === 16 && Array.isArray(inv.slots) && inv.slots.length === 16 && integer(inv.nextInstanceId, 1), 'tas');
  const instances = new Set();
  for (const item of inv.slots) {
    if (item === null) continue;
    requireValue(item && Object.hasOwn(ITEMS, item.itemId), 'ID item');
    requireValue(integer(item.count, 1, ITEMS[item.itemId].maxStack), 'jumlah item');
    requireValue(typeof item.instanceId === 'string' && /^item_\d+$/.test(item.instanceId) &&
      !instances.has(item.instanceId) && Number(item.instanceId.slice(5)) < inv.nextInstanceId, 'instance item');
    instances.add(item.instanceId);
  }
  requireValue(Array.isArray(s.farm?.plots) && s.farm.plots.length === 12, 'dua belas petak kebun');
  const plots = new Set();
  for (const plot of s.farm.plots) {
    requireValue(ZONE_FARM.plots.some(p => p.id === plot.id) && !plots.has(plot.id), 'ID petak');
    plots.add(plot.id);
    requireValue(['grass', 'tilled', 'watered'].includes(plot.soilState), 'kondisi tanah');
    requireValue(plot.cropId === null || Object.hasOwn(CROPS, plot.cropId), 'ID tanaman');
    requireValue(integer(plot.growthStage, plot.cropId === null ? 0 : 1, plot.cropId === null ? 0 : 4), 'tahap tanaman');
    requireValue(integer(plot.plantedDay, -1, s.world.day) && integer(plot.wateredOnDay, -1, s.world.day), 'hari tanaman');
  }
  requireValue(s.quests?.questStates && Array.isArray(s.quests.claimedRewardTokens), 'misi');
  for (const def of Object.values(QUESTS)) {
    const q = s.quests.questStates[def.id];
    requireValue(q && q.id === def.id && ['locked', 'available', 'active', 'completed', 'rewarded'].includes(q.state), 'status misi');
    requireValue(Array.isArray(q.objectives) && q.objectives.length === def.objectives.length, 'objektif misi');
    for (const obj of def.objectives) {
      const saved = q.objectives.find(o => o.id === obj.id);
      requireValue(saved && saved.target === obj.target && integer(saved.current, 0, obj.target), 'progres misi');
    }
    requireValue((q.state === 'rewarded') === s.quests.claimedRewardTokens.includes(`reward_token_${def.id}`), 'token hadiah misi');
  }
  requireValue(new Set(s.quests.claimedRewardTokens).size === s.quests.claimedRewardTokens.length &&
    s.quests.claimedRewardTokens.every(token => Object.keys(QUESTS).some(id => token === `reward_token_${id}`)), 'token hadiah');
  requireValue(s.relationships?.scores && Array.isArray(s.relationships.talkedToday), 'hubungan');
  for (const id of ['suri', 'bima', 'nara']) requireValue(integer(s.relationships.scores[id], 0, 100), 'poin hubungan');
  requireValue(s.relationships.talkedToday.every(id => ['suri', 'bima', 'nara'].includes(id)), 'sapaan harian');
  requireValue(s.pet && s.housing && Array.isArray(s.housing.placedObjects) && s.flags && typeof s.flags === 'object', 'state rumah/hewan/cerita');
  requireValue(integer(s.pet.affection, 0, 100) && ['following', 'resting'].includes(s.pet.mode) &&
    integer(s.pet.lastPettedDay, -1, s.world.day), 'status Kiko');
  if (s.pet.position) requireValue(Number.isFinite(s.pet.position.tileX) && Number.isFinite(s.pet.position.tileY), 'posisi Kiko');
  const decorIds = new Set();
  for (const object of s.housing.placedObjects) {
    const def = DECORATIONS[object.itemId];
    requireValue(def && typeof object.objectId === 'string' && !decorIds.has(object.objectId) &&
      integer(object.gridX, 1, 4) && integer(object.gridY, 1, 4) &&
      object.gridX + def.width <= 5 && object.gridY + def.height <= 5, 'dekorasi pondok');
    decorIds.add(object.objectId);
  }
  if (s.housing.storage) for (const [id, count] of Object.entries(s.housing.storage)) {
    requireValue(Object.hasOwn(DECORATIONS, id) && integer(count, 0, 99), 'penyimpanan dekorasi');
  }
  const resourceState = s.world.zoneStates?.farm?.resources;
  if (resourceState) {
    requireValue(integer(resourceState.day, 1, s.world.day) && resourceState.nodes && typeof resourceState.nodes === 'object', 'hari sumber daya');
    for (const [id, node] of Object.entries(resourceState.nodes)) {
      const def = ZONE_FARM.resources.find(resource => resource.id === id);
      requireValue(def && integer(node.hits, 0, def.hits) && typeof node.depleted === 'boolean' &&
        (!node.depleted || node.hits === def.hits), 'status sumber daya');
    }
  }
  const attempts = s.world.zoneStates?.farm?.fishing?.attempts;
  if (attempts !== undefined) requireValue(integer(attempts, 0), 'riwayat memancing');
  const festival = s.world.festivalState?.harvest_lantern_night;
  requireValue(festival === undefined || festival === 'celebrated', 'status festival');
  return true;
}

/** Capture a coherent plain-data snapshot from the active scene systems. */
export function captureSave(scene) {
  const save = copyData(scene.saveData);
  save.updatedAt = new Date().toISOString();
  save.meta.playtimeSeconds = scene.playtimeSeconds ?? save.meta.playtimeSeconds;
  save.world = { ...save.world, ...scene.worldClock.getState() };
  save.player = { ...save.player, ...copyData(scene.profile), coins: scene.wallet.coins,
    position: { tileX: scene.player.tileX, tileY: scene.player.tileY }, facing: scene.player.facing,
    zoom: scene.cameraControls?.targetZoom ?? 1 };
  save.inventory = scene.inventory.serialize();
  save.farm = scene.farmingSystem.serialize();
  save.quests = copyData(scene.questSystem.serialize());
  save.relationships = scene.relationshipSystem.serialize();
  validateSave(save);
  return copyData(save);
}

/** Restore validated state and recover a player position blocked by the current layout. */
export function restoreSave(scene, input) {
  validateSave(input);
  const save = copyData(input);
  scene.saveData = save;
  scene.profile = { name: save.player.name, appearanceId: save.player.appearanceId, toolLevel: save.player.toolLevel };
  scene.wallet.coins = save.player.coins;
  scene.playtimeSeconds = save.meta.playtimeSeconds;
  scene.worldClock.loadState(save.world);
  scene.inventory.deserialize(save.inventory);
  scene.farmingSystem.deserialize(save.farm);
  scene.questSystem.deserialize(save.quests);
  scene.relationshipSystem.deserialize(save.relationships);
  let { tileX, tileY } = save.player.position;
  const safe = (x, y) => [[-0.35, -0.35], [-0.35, 0.35], [0.35, -0.35], [0.35, 0.35]]
    .every(([dx, dy]) => scene.navGrid.isWalkable(x + dx, y + dy));
  if (!safe(tileX, tileY)) {
    const candidates = [];
    for (let y = 0; y < scene.navGrid.height; y++) {
      for (let x = 0; x < scene.navGrid.width; x++) {
        if (safe(x + 0.5, y + 0.5)) candidates.push({ x: x + 0.5, y: y + 0.5 });
      }
    }
    candidates.sort((a, b) => Math.hypot(a.x - tileX, a.y - tileY) - Math.hypot(b.x - tileX, b.y - tileY));
    if (!candidates.length) throw new Error('Tidak ada lokasi aman untuk memuat pemain.');
    tileX = candidates[0].x;
    tileY = candidates[0].y;
  }
  scene.player.facing = save.player.facing;
  scene.player.updatePosition(tileX, tileY, false);
  scene.player.sprite?.setTint(OUTFITS[save.player.appearanceId].tint);
  scene.cameraControls?.setZoom(save.player.zoom);
}
