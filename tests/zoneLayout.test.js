import assert from 'node:assert/strict';
import { TILE } from '../src/config/constants.js';
import { tileToScreen } from '../src/world/isoMath.js';
import { ZONE_FARM } from '../src/world/zoneDefinitions.js';

const isInsideBuilding = (tileX, tileY, building) =>
  tileX >= building.tileX &&
  tileX < building.tileX + building.footprintW &&
  tileY >= building.tileY &&
  tileY < building.tileY + building.footprintH;

const isWalkablePathTile = (tileX, tileY) =>
  ZONE_FARM.isPath(Math.floor(tileX), Math.floor(tileY));

console.log('--- Running zone layout acceptance tests ---');

// NPCs stand outside their workplace and in front of its rendered base so roofs
// cannot cover them in the depth-sorted isometric scene.
for (const npc of ZONE_FARM.npcs) {
  const workplace = ZONE_FARM.buildings.find(building => building.id === npc.workplaceId);
  assert.ok(workplace, `${npc.id} must reference a valid workplace`);
  assert.equal(
    isInsideBuilding(npc.tileX, npc.tileY, workplace),
    false,
    `${npc.id} must not stand inside ${workplace.id}`
  );

  const frontFootY = tileToScreen(
    workplace.tileX + workplace.footprintW / 2,
    workplace.tileY + workplace.footprintH
  ).y;
  const npcFootY = tileToScreen(npc.tileX, npc.tileY).y;
  assert.ok(
    npcFootY >= frontFootY + TILE.HEIGHT / 4,
    `${npc.id} must stand clearly in front of ${workplace.id}`
  );
  assert.equal(
    isWalkablePathTile(npc.tileX, npc.tileY),
    false,
    `${npc.id} must not block a marked walking path`
  );
}

// Dirt paths are ground routes, never painted through solid building footprints.
for (const building of ZONE_FARM.buildings.filter(item => item.isSolid !== false)) {
  for (let tileY = building.tileY; tileY < building.tileY + building.footprintH; tileY++) {
    for (let tileX = building.tileX; tileX < building.tileX + building.footprintW; tileX++) {
      assert.equal(
        ZONE_FARM.isPath(tileX, tileY),
        false,
        `path must not pass beneath solid building ${building.id} at (${tileX}, ${tileY})`
      );
    }
  }
}

// Start in the farmyard rather than on the cottage doorstep.
const cottageDoor = ZONE_FARM.interactives.find(item => item.id === 'cottage_door');
const spawnDistance = Math.hypot(
  ZONE_FARM.spawnPoint.tileX - cottageDoor.tileX,
  ZONE_FARM.spawnPoint.tileY - cottageDoor.tileY
);
assert.ok(spawnDistance >= 1.5, 'player spawn must leave the cottage entrance clear');

// Festival lanterns use one small, unlit sprite each and stay off the walking lane.
const lanterns = ZONE_FARM.trees.filter(tree => tree.textureKey.startsWith('lantern_'));
assert.equal(lanterns.length, 4, 'the plaza should have four individual lantern props');
for (const lantern of lanterns) {
  assert.ok(
    ['lantern_unlit', 'lantern_lit'].includes(lantern.textureKey),
    'each lantern prop must reference an individual lantern texture'
  );
  assert.ok(lantern.scale <= 0.05, 'plaza lanterns must remain decorative in scale');
  assert.equal(
    isWalkablePathTile(lantern.tileX, lantern.tileY),
    false,
    'lanterns must not occupy the walking lane'
  );
}

// The forest gate sits at the east end of the village road, with a clear archway.
const forestGate = ZONE_FARM.buildings.find(building => building.id === 'forest_gateway');
const forestPortal = ZONE_FARM.interactives.find(item => item.id === 'forest_gate');
assert.ok(forestGate.tileX >= ZONE_FARM.width - 5, 'forest gate must sit at the village edge');
assert.ok(forestGate.tileY <= 8, "forest gate must meet the village's eastbound main road");
assert.equal(forestGate.isSolid, false, 'the gateway opening must remain traversable');
assert.ok(ZONE_FARM.isPath(forestPortal.tileX, forestPortal.tileY), 'the portal must sit on its approach path');

console.log('All zone layout tests PASSED successfully!\n');
