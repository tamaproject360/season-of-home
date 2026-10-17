import assert from 'node:assert/strict';
import {
  ZONE_FARM,
  ZONE_COTTAGE,
  ZONE_VILLAGE,
  ZONE_LAKE,
  ZONE_MINE,
  ZONES
} from '../src/world/zoneDefinitions.js';
import { NavGrid } from '../src/world/navGrid.js';
import { tileToScreen } from '../src/world/isoMath.js';

console.log('--- Multi-Zone Topology & Layout Acceptance Tests ---');

function buildZoneNavGrid(zone) {
  const nav = new NavGrid(zone.width, zone.height);
  for (let y = 0; y < zone.height; y++) {
    for (let x = 0; x < zone.width; x++) {
      if (zone.isWater && zone.isWater(x, y)) nav.setSolid(x, y);
    }
  }
  for (const building of (zone.buildings || [])) {
    if (building.isSolid !== false) {
      nav.setSolidRect(building.tileX, building.tileY, building.footprintW, building.footprintH);
    }
    for (const post of building.collisionCells || []) {
      nav.setSolid(building.tileX + post.x, building.tileY + post.y);
    }
    for (const deck of building.walkableCells || []) {
      nav.setSolid(building.tileX + deck.x, building.tileY + deck.y, false);
    }
  }
  for (const prop of (zone.trees || [])) {
    assert.ok(!prop.textureKey.startsWith('lantern'), 'lanterns must attach to architecture, not float over the lawn');
    if (zone.isPath) {
      assert.ok(!zone.isPath(prop.tileX, prop.tileY), `vegetation must leave the road clear: ${prop.textureKey}`);
    }
    if (zone.isWater) {
      assert.ok(!zone.isWater(prop.tileX, prop.tileY), 'vegetation must stay on land');
    }
    assert.ok(nav.isWalkable(prop.tileX, prop.tileY), 'vegetation must not overlap a building');
    if (prop.solid !== false) nav.setSolid(prop.tileX, prop.tileY);
  }
  return nav;
}

function floodWalkable(nav, startX, startY) {
  const start = [Math.floor(startX), Math.floor(startY)];
  assert.ok(nav.isWalkable(...start), `start position (${startX}, ${startY}) must be walkable`);
  const visited = new Set([start.join(',')]);
  const queue = [start];
  for (let index = 0; index < queue.length; index++) {
    const [x, y] = queue[index];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = [x + dx, y + dy];
      const key = next.join(',');
      if (nav.isWalkable(...next) && !visited.has(key)) {
        visited.add(key);
        queue.push(next);
      }
    }
  }
  return { visited, queue };
}

// ----------------------------------------------------
// 1. ZONE_FARM acceptance tests
// ----------------------------------------------------
console.log('Testing ZONE_FARM...');
assert.equal(ZONE_FARM.width, 32);
assert.equal(ZONE_FARM.height, 32);
assert.equal(ZONE_FARM.plots.length, 12, 'farm retains initial twelve playable starter plots');
assert.ok(ZONE_FARM.tillableBounds.minX < ZONE_FARM.tillableBounds.maxX, 'valid tillable area bounds');

const farmNav = buildZoneNavGrid(ZONE_FARM);
const farmFlood = floodWalkable(farmNav, ZONE_FARM.spawnPoint.tileX, ZONE_FARM.spawnPoint.tileY);

// Cottage door must be reachable and separated from spawn
const cottageDoor = ZONE_FARM.interactives.find(item => item.id === 'cottage_door');
assert.ok(cottageDoor, 'cottage door exists in farm');
assert.ok(Math.hypot(ZONE_FARM.spawnPoint.tileX - cottageDoor.tileX, ZONE_FARM.spawnPoint.tileY - cottageDoor.tileY) >= 1.5);
assert.ok(farmFlood.visited.has(`${Math.floor(cottageDoor.tileX)},${Math.floor(cottageDoor.tileY)}`), 'cottage door is reachable');

// Portals to Village and Lake must be reachable
const farmToVillage = ZONE_FARM.interactives.find(item => item.id === 'farm_to_village_portal');
const farmToLake = ZONE_FARM.interactives.find(item => item.id === 'farm_to_lake_portal');
assert.ok(farmToVillage && farmToLake, 'farm portals to village and lake exist');
assert.ok(farmFlood.visited.has(`${Math.floor(farmToVillage.tileX)},${Math.floor(farmToVillage.tileY)}`), 'village portal reachable from farm');
assert.ok(farmFlood.visited.has(`${Math.floor(farmToLake.tileX)},${Math.floor(farmToLake.tileY)}`), 'lake portal reachable from farm');

// Plots must be walkable & reachable
for (const plot of ZONE_FARM.plots) {
  assert.ok(farmNav.isWalkable(plot.tileX, plot.tileY), `plot ${plot.id} is walkable`);
  assert.ok(farmFlood.visited.has(`${plot.tileX},${plot.tileY}`), `plot ${plot.id} is reachable`);
}
console.log('✓ ZONE_FARM layout PASSED');

// ----------------------------------------------------
// 2. ZONE_COTTAGE acceptance tests
// ----------------------------------------------------
console.log('Testing ZONE_COTTAGE...');
assert.equal(ZONE_COTTAGE.isInterior, true);
assert.equal(ZONE_COTTAGE.width, 14);
assert.equal(ZONE_COTTAGE.height, 14);

const cottageNav = buildZoneNavGrid(ZONE_COTTAGE);
const cottageFlood = floodWalkable(cottageNav, ZONE_COTTAGE.spawnPoint.tileX, ZONE_COTTAGE.spawnPoint.tileY);

const cottageBed = ZONE_COTTAGE.interactives.find(item => item.id === 'cottage_bed');
const cottageExit = ZONE_COTTAGE.interactives.find(item => item.id === 'cottage_exit_door');
assert.ok(cottageBed, 'bed exists in cottage');
assert.ok(cottageExit, 'exit door exists in cottage');
assert.ok(cottageFlood.visited.has(`${Math.floor(cottageExit.tileX)},${Math.floor(cottageExit.tileY)}`), 'exit door is reachable');
console.log('✓ ZONE_COTTAGE layout PASSED');

// ----------------------------------------------------
// 3. ZONE_VILLAGE acceptance tests
// ----------------------------------------------------
console.log('Testing ZONE_VILLAGE...');
assert.ok(ZONE_VILLAGE.plaza, 'the village needs an explicit central plaza');
const villageNav = buildZoneNavGrid(ZONE_VILLAGE);

// Validate 3 NPCs
assert.equal(ZONE_VILLAGE.npcs.length, 3, 'village has 3 NPCs: Nara, Bima, Suri');
for (const npc of ZONE_VILLAGE.npcs) {
  const building = ZONE_VILLAGE.buildings.find(item => item.id === npc.workplaceId);
  assert.ok(building, `${npc.id} has a workplace`);
  assert.ok(villageNav.isWalkable(npc.tileX, npc.tileY), `${npc.id} stands on unobstructed land`);
  assert.ok(!ZONE_VILLAGE.isPath(Math.floor(npc.tileX), Math.floor(npc.tileY)), `${npc.id} leaves the road clear`);
  const buildingFoot = tileToScreen(building.tileX + building.footprintW / 2, building.tileY + building.footprintH).y;
  assert.ok(tileToScreen(npc.tileX, npc.tileY).y > buildingFoot, `${npc.id} is visible in front of the workplace`);
  villageNav.setSolid(Math.floor(npc.tileX), Math.floor(npc.tileY));
}

// Forest gateway check
const gate = ZONE_VILLAGE.buildings.find(item => item.id === 'forest_gateway');
assert.ok(gate, 'forest gateway exists in village');
assert.ok(gate.tileY <= 3, 'the gateway belongs at the northern village boundary');
assert.equal(gate.collisionCells.length, 2, 'the two gate posts are solid while the opening is clear');

// Flood village from entrance
const villageFlood = floodWalkable(villageNav, ZONE_VILLAGE.spawnPoint.tileX, ZONE_VILLAGE.spawnPoint.tileY);

// Roads must be clear and fully connected
for (let y = 0; y < ZONE_VILLAGE.height; y++) {
  for (let x = 0; x < ZONE_VILLAGE.width; x++) {
    if (ZONE_VILLAGE.isPath(x, y)) {
      assert.ok(villageNav.isWalkable(x, y), `road is obstructed at ${x},${y}`);
      assert.ok(villageFlood.visited.has(`${x},${y}`), `road is disconnected at ${x},${y}`);
    }
  }
}

// Check dialogue accessibility
for (const npc of ZONE_VILLAGE.npcs) {
  const canApproach = villageFlood.queue.some(([x, y]) =>
    Math.hypot(x + 0.5 - npc.tileX, y + 0.5 - npc.tileY) <= 1.25
  );
  assert.ok(canApproach, `${npc.id} can be approached within dialogue range`);
}

// Portals to Farm, Mine, and Lake must be reachable
for (const portalId of ['village_to_farm_portal', 'village_to_mine_portal', 'village_to_lake_portal']) {
  const portal = ZONE_VILLAGE.interactives.find(item => item.id === portalId);
  assert.ok(portal, `portal ${portalId} exists in village`);
  assert.ok(villageFlood.visited.has(`${Math.floor(portal.tileX)},${Math.floor(portal.tileY)}`), `${portalId} reachable`);
}
console.log('✓ ZONE_VILLAGE layout PASSED');

// ----------------------------------------------------
// 4. ZONE_LAKE acceptance tests
// ----------------------------------------------------
console.log('Testing ZONE_LAKE...');
assert.equal(ZONE_LAKE.width, 32);
assert.equal(ZONE_LAKE.height, 32);

// Lake interior water check
for (let y = 14; y <= 28; y++) {
  for (let x = 6; x <= 25; x++) {
    assert.ok(ZONE_LAKE.isWater(x, y), `lake interior must contain water at ${x},${y}`);
  }
}

const lakeNav = buildZoneNavGrid(ZONE_LAKE);
const pier = ZONE_LAKE.buildings.find(item => item.id === 'fishing_pier');
assert.ok(pier, 'fishing pier exists in lake zone');
assert.ok(pier.walkableCells.length > 0, 'the deck remains walkable above the water');
assert.equal(pier.groundProp, true, 'characters must render above the pier deck');

// Pier cells must be walkable even over water
for (const cell of pier.walkableCells) {
  const px = pier.tileX + cell.x;
  const py = pier.tileY + cell.y;
  assert.ok(lakeNav.isWalkable(px, py), `pier deck cell (${px}, ${py}) is walkable`);
}

const lakeFlood = floodWalkable(lakeNav, ZONE_LAKE.spawnPoint.tileX, ZONE_LAKE.spawnPoint.tileY);
const fishingSpot = ZONE_LAKE.interactives.find(item => item.id === 'fishing_spot');
assert.ok(fishingSpot, 'fishing spot exists');
assert.ok(lakeFlood.visited.has(`${Math.floor(fishingSpot.tileX)},${Math.floor(fishingSpot.tileY)}`), 'fishing spot is reachable on pier');
console.log('✓ ZONE_LAKE layout PASSED');

// ----------------------------------------------------
// 5. ZONE_MINE acceptance tests
// ----------------------------------------------------
console.log('Testing ZONE_MINE...');
assert.equal(ZONE_MINE.width, 32);
assert.equal(ZONE_MINE.height, 32);

const miningNodes = ZONE_MINE.resources.filter(n => n.type === 'mining');
const foragingNodes = ZONE_MINE.resources.filter(n => n.type === 'foraging');
assert.ok(miningNodes.length >= 6, 'mine has at least 6 mining ore nodes');
assert.ok(foragingNodes.length >= 2, 'mine has foraging mushroom nodes');

const mineNav = buildZoneNavGrid(ZONE_MINE);
for (const res of ZONE_MINE.resources) {
  assert.ok(!ZONE_MINE.isPath(res.tileX, res.tileY), 'resource nodes stay off mountain trails');
  assert.ok(mineNav.isWalkable(res.tileX, res.tileY), 'resources cannot overlap solid terrain');
  if (res.solid !== false) mineNav.setSolid(res.tileX, res.tileY);
}

const mineFlood = floodWalkable(mineNav, ZONE_MINE.spawnPoint.tileX, ZONE_MINE.spawnPoint.tileY);
const minePortal = ZONE_MINE.interactives.find(item => item.id === 'mine_cave_portal');
const mineToVillage = ZONE_MINE.interactives.find(item => item.id === 'mine_to_village_portal');
assert.ok(minePortal, 'cave entrance exists');
assert.ok(mineToVillage, 'return portal to village exists');
assert.ok(mineFlood.visited.has(`${Math.floor(minePortal.tileX)},${Math.floor(minePortal.tileY)}`), 'cave portal reachable');
assert.ok(mineFlood.visited.has(`${Math.floor(mineToVillage.tileX)},${Math.floor(mineToVillage.tileY)}`), 'village portal reachable');
console.log('✓ ZONE_MINE layout PASSED');

console.log('All 5 Zones layout acceptance tests PASSED successfully!\n');
