import assert from 'node:assert/strict';
import { ZONE_FARM as zone } from '../src/world/zoneDefinitions.js';
import { NavGrid } from '../src/world/navGrid.js';
import { tileToScreen } from '../src/world/isoMath.js';

console.log('--- Village layout acceptance tests ---');
assert.ok(zone.plaza, 'the village needs an explicit central plaza');
assert.equal(zone.plots.length, 12, 'retain the twelve playable farm plots');
const nav = new NavGrid(zone.width, zone.height);
for (let y = 0; y < zone.height; y++) {
  for (let x = 0; x < zone.width; x++) {
    if (zone.isWater(x, y)) nav.setSolid(x, y);
  }
}
for (const building of zone.buildings) {
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
for (const prop of zone.trees) {
  assert.ok(!prop.textureKey.startsWith('lantern'), 'lanterns must attach to architecture, not float over the lawn');
  assert.ok(!zone.isPath(prop.tileX, prop.tileY), `vegetation must leave the road clear: ${prop.textureKey}`);
  assert.ok(!zone.isWater(prop.tileX, prop.tileY), 'vegetation must stay on land');
  assert.ok(nav.isWalkable(prop.tileX, prop.tileY), 'vegetation must not overlap a building');
  if (prop.solid !== false) nav.setSolid(prop.tileX, prop.tileY);
}

for (const npc of zone.npcs) {
  const building = zone.buildings.find(item => item.id === npc.workplaceId);
  assert.ok(building, `${npc.id} has a workplace`);
  assert.ok(nav.isWalkable(npc.tileX, npc.tileY), `${npc.id} stands on unobstructed land`);
  assert.ok(!zone.isPath(Math.floor(npc.tileX), Math.floor(npc.tileY)), `${npc.id} leaves the road clear`);
  const buildingFoot = tileToScreen(building.tileX + building.footprintW / 2, building.tileY + building.footprintH).y;
  assert.ok(tileToScreen(npc.tileX, npc.tileY).y > buildingFoot, `${npc.id} is visible in front of the workplace`);
  nav.setSolid(Math.floor(npc.tileX), Math.floor(npc.tileY));
}

assert.equal(zone.resources.filter(node => node.type === 'mining').length, 6);
assert.equal(zone.resources.filter(node => node.type === 'foraging').length, 5);
for (const resource of zone.resources) {
  assert.ok(!zone.isPath(resource.tileX, resource.tileY), 'resource nodes stay off roads');
  assert.ok(!zone.isWater(resource.tileX, resource.tileY), 'resource nodes stay on dry land');
  assert.ok(nav.isWalkable(resource.tileX, resource.tileY), 'resources cannot overlap buildings, NPCs or trees');
  if (resource.solid !== false) nav.setSolid(resource.tileX, resource.tileY);
}

// Flood the real walking grid, including NPCs and gateway posts.
const start = [Math.floor(zone.spawnPoint.tileX), Math.floor(zone.spawnPoint.tileY)];
assert.ok(nav.isWalkable(...start), 'the player starts in a safe farmyard');
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
for (let y = 0; y < zone.height; y++) {
  for (let x = 0; x < zone.width; x++) {
    if (zone.isPath(x, y)) {
      assert.ok(nav.isWalkable(x, y), `road is obstructed at ${x},${y}`);
      assert.ok(visited.has(`${x},${y}`), `road is disconnected at ${x},${y}`);
    }
  }
}
for (const target of [...zone.interactives, ...zone.plots]) {
  assert.ok(nav.isWalkable(target.tileX, target.tileY), `${target.id} has a walkable interaction point`);
  assert.ok(visited.has(`${Math.floor(target.tileX)},${Math.floor(target.tileY)}`), `${target.id} is reachable`);
}
for (const npc of zone.npcs) {
  const canApproach = queue.some(([x, y]) =>
    Math.hypot(x + 0.5 - npc.tileX, y + 0.5 - npc.tileY) <= 1.15
  );
  assert.ok(canApproach, `${npc.id} can be approached within dialogue range`);
}
const gate = zone.buildings.find(item => item.id === 'forest_gateway');
assert.ok(gate.tileY <= 3, 'the gateway belongs at the northern village boundary');
assert.equal(gate.collisionCells.length, 2, 'the two gate posts are solid while the opening is clear');
const door = zone.interactives.find(item => item.id === 'cottage_door');
assert.ok(Math.hypot(zone.spawnPoint.tileX - door.tileX, zone.spawnPoint.tileY - door.tileY) >= 1.5);

// A pier is a walkable layer above water, never a strip of grass cut into it.
for (let y = 27; y <= 31; y++) {
  for (let x = 5; x <= 11; x++) {
    assert.ok(zone.isWater(x, y), `lake interior must contain water at ${x},${y}`);
  }
}
for (const x of [9, 10]) {
  assert.equal(zone.isWater(x, 25), false, 'the pier entrance has a grassy bank');
  assert.equal(zone.isPath(x, 25), false, 'dirt must stop before the grassy shoreline');
}
const pier = zone.buildings.find(item => item.id === 'fishing_pier');
assert.ok(pier.walkableCells.length > 0, 'the deck remains walkable above the water');
assert.equal(pier.groundProp, true, 'characters must render above the pier deck');
console.log('Village layout: clear roads, reachable NPCs, buildings, farm and exits PASS');
