import assert from 'node:assert/strict';
import { ZONES, getZoneDefinition } from '../src/world/zoneDefinitions.js';
import { ZoneManager } from '../src/world/ZoneManager.js';
import { EventBus, EVENTS } from '../src/utils/EventBus.js';

console.log('--- Multi-Zone Transitions & Registry Unit Tests ---');

// Test 1: Registry Completeness
const expectedZones = ['farm', 'cottage', 'village', 'lake', 'mine'];
for (const id of expectedZones) {
  assert.ok(ZONES[id], `Zone ${id} exists in ZONES registry`);
  assert.equal(getZoneDefinition(id).id, id, `getZoneDefinition('${id}') returns correct definition`);
}
assert.equal(getZoneDefinition('invalid_id').id, 'farm', 'fallback to farm zone on unknown zone id');
console.log('✓ Test 1 Passed: Registry completeness and fallback behavior verified');

// Test 2: Bidirectional Waypoint / Portal Topology
const portalPairs = [
  { fromZone: 'farm', toZone: 'cottage', fromPortal: 'cottage_door', toPortal: 'cottage_exit_door' },
  { fromZone: 'farm', toZone: 'village', fromPortal: 'farm_to_village_portal', toPortal: 'village_to_farm_portal' },
  { fromZone: 'farm', toZone: 'lake', fromPortal: 'farm_to_lake_portal', toPortal: 'lake_to_farm_portal' },
  { fromZone: 'village', toZone: 'mine', fromPortal: 'village_to_mine_portal', toPortal: 'mine_to_village_portal' },
  { fromZone: 'village', toZone: 'lake', fromPortal: 'village_to_lake_portal', toPortal: 'lake_to_village_portal' }
];

for (const pair of portalPairs) {
  const zoneA = ZONES[pair.fromZone];
  const zoneB = ZONES[pair.toZone];

  const portalA = zoneA.interactives.find(item => item.id === pair.fromPortal);
  const portalB = zoneB.interactives.find(item => item.id === pair.toPortal);

  assert.ok(portalA, `${pair.fromPortal} exists in ${pair.fromZone}`);
  assert.ok(portalB, `${pair.toPortal} exists in ${pair.toZone}`);

  assert.equal(portalA.targetZone, pair.toZone, `${pair.fromPortal} targets ${pair.toZone}`);
  assert.equal(portalB.targetZone, pair.fromZone, `${pair.toPortal} targets ${pair.fromZone}`);

  // Target spawn must fall within target zone boundaries
  if (portalA.targetSpawn) {
    assert.ok(portalA.targetSpawn.tileX >= 0 && portalA.targetSpawn.tileX < zoneB.width, `${pair.fromPortal} spawn X within target zone width`);
    assert.ok(portalA.targetSpawn.tileY >= 0 && portalA.targetSpawn.tileY < zoneB.height, `${pair.fromPortal} spawn Y within target zone height`);
  }
  if (portalB.targetSpawn) {
    assert.ok(portalB.targetSpawn.tileX >= 0 && portalB.targetSpawn.tileX < zoneA.width, `${pair.toPortal} spawn X within target zone width`);
    assert.ok(portalB.targetSpawn.tileY >= 0 && portalB.targetSpawn.tileY < zoneA.height, `${pair.toPortal} spawn Y within target zone height`);
  }
}
console.log('✓ Test 2 Passed: Bidirectional portal topology and spawn bounds verified');

// Test 3: ZoneManager Lifecycle & changeZone logic
let eventEmitted = null;
const unsubscribe = EventBus.on(EVENTS.ZONE_CHANGED, data => {
  eventEmitted = data;
});

const mockScene = {
  add: {
    sprite: () => ({
      setOrigin: () => {},
      setScale: () => {},
      setDepth: () => {},
      play: () => {},
      destroy: () => {}
    })
  },
  anims: {
    exists: () => false,
    create: () => {},
    generateFrameNumbers: () => []
  },
  cameras: {
    main: {
      fadeOut: (dur, r, g, b) => {},
      fadeIn: (dur, r, g, b) => {},
      once: (event, cb) => cb(),
      centerOn: () => {}
    }
  },
  worldRenderer: {
    clearZone: () => {},
    buildZone: () => {}
  },
  inputRouter: {
    setFrozen: () => {}
  },
  movementSystem: {
    navGrid: null
  },
  interactionSystem: {
    setInteractives: () => {},
    setNPCs: () => {},
    setActiveZone: () => {}
  },
  saveData: {
    world: { activeZone: 'farm' }
  },
  saveManager: {
    save: async () => {}
  },
  audio: {
    play: () => {}
  },
  scene: {
    get: () => ({ showToast: () => {} })
  },
  player: {
    tileX: 0,
    tileY: 0,
    x: 0,
    y: 0,
    facing: 'sw',
    syncScreenPosition: () => {},
    playIdleAnimation: () => {}
  }
};

const zm = new ZoneManager(mockScene);
assert.equal(zm.getCurrentZoneId(), 'farm');
assert.equal(zm.getCurrentZone().id, 'farm');

await zm.changeZone('village', { tileX: 3.5, tileY: 16.0, facing: 'se' });
assert.equal(zm.getCurrentZoneId(), 'village');
assert.equal(mockScene.player.tileX, 3.5);
assert.equal(mockScene.player.tileY, 16.0);
assert.equal(mockScene.player.facing, 'se');
assert.equal(mockScene.saveData.world.activeZone, 'village');
assert.ok(eventEmitted, 'ZONE_CHANGED event emitted');
assert.equal(eventEmitted.zoneId, 'village');
unsubscribe();
console.log('✓ Test 3 Passed: ZoneManager changeZone transitions state and emits events');

// Test 4: checkBoundaryPortals triggers changeZone on collision
let triggeredTarget = null;
zm.changeZone = async (target, spawn) => {
  triggeredTarget = target;
};

// Player far from portals
mockScene.player.tileX = 10;
mockScene.player.tileY = 10;
zm.checkBoundaryPortals(mockScene.player);
assert.equal(triggeredTarget, null, 'no transition when far from portals');

// Position player at village_to_farm_portal (1.5, 15.5)
mockScene.player.tileX = 1.5;
mockScene.player.tileY = 15.5;
zm.checkBoundaryPortals(mockScene.player);
assert.equal(triggeredTarget, 'farm', 'portal transition triggered on boundary arrival');
console.log('✓ Test 4 Passed: Boundary portal detection works accurately');

console.log('All ZoneTransitions unit tests PASSED successfully!\n');
