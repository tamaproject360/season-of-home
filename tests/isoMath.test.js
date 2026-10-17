import assert from 'node:assert';
import { tileToScreen, screenToTile, worldScreenToTile } from '../src/world/isoMath.js';

console.log('--- Running isoMath Invariant Tests ---');

// Test 1: Origin (0, 0)
const originScreen = tileToScreen(0, 0);
assert.strictEqual(originScreen.x, 0);
assert.strictEqual(originScreen.y, 0);
const originTile = screenToTile(0, 0);
assert.strictEqual(originTile.tx, 0);
assert.strictEqual(originTile.ty, 0);
console.log('✓ Test 1 Passed: Origin (0,0) converts cleanly');

// Test 2: Round-trip transformation on positive fractional coordinates
const testCoords = [
  { tx: 5.25, ty: 4.5 },
  { tx: 10.0, ty: 12.0 },
  { tx: 0.125, ty: 0.875 },
  { tx: 15.9, ty: 3.1 }
];

for (const coord of testCoords) {
  const screen = tileToScreen(coord.tx, coord.ty);
  const back = screenToTile(screen.x, screen.y);
  const diffX = Math.abs(back.tx - coord.tx);
  const diffY = Math.abs(back.ty - coord.ty);
  assert(diffX < 1e-6, `tx invariant failed for ${coord.tx}: got ${back.tx}`);
  assert(diffY < 1e-6, `ty invariant failed for ${coord.ty}: got ${back.ty}`);
}
console.log('✓ Test 2 Passed: Round-trip fractional coordinates invariant within ±1e-6');

// Test 3: Offsets handling
const originX = 480;
const originY = 120;
const offsetScreen = tileToScreen(3.5, 2.5, originX, originY);
const offsetBack = screenToTile(offsetScreen.x, offsetScreen.y, originX, originY);
assert(Math.abs(offsetBack.tx - 3.5) < 1e-6);
assert(Math.abs(offsetBack.ty - 2.5) < 1e-6);
console.log('✓ Test 3 Passed: Custom origin offset handling');

// Test 4: All 4 Quadrants & Negative Coordinates
const quadCoords = [
  { tx: -2, ty: 4 },
  { tx: -3, ty: -5 },
  { tx: 4, ty: -2 }
];
for (const coord of quadCoords) {
  const screen = tileToScreen(coord.tx, coord.ty);
  const back = screenToTile(screen.x, screen.y);
  assert(Math.abs(back.tx - coord.tx) < 1e-6);
  assert(Math.abs(back.ty - coord.ty) < 1e-6);
}
console.log('✓ Test 4 Passed: 4 Quadrants & Negative coordinates handling');

const camera = { x: 10, y: 20, width: 960, height: 540, zoom: 1.6, scrollX: 100, scrollY: 70 };
const projected = tileToScreen(12.25, 8.5);
const pointerX = camera.x + camera.width / 2 + (projected.x - camera.scrollX - camera.width / 2) * camera.zoom;
const pointerY = camera.y + camera.height / 2 + (projected.y - camera.scrollY - camera.height / 2) * camera.zoom;
const picked = worldScreenToTile(pointerX, pointerY, camera);
assert.ok(Math.abs(picked.tx - 12.25) < 1e-6 && Math.abs(picked.ty - 8.5) < 1e-6,
  'pointer inversion must include zoom around the viewport center and camera offset');

// Test 5: Top-Down Orthogonal 2D projection round-trip invariants
import { setProjectionMode, getProjectionMode, PROJECTION_MODE } from '../src/world/isoMath.js';
setProjectionMode(PROJECTION_MODE.TOPDOWN);
assert.strictEqual(getProjectionMode(), 'topdown');

const topdownCoords = [
  { tx: 0, ty: 0 },
  { tx: 5.5, ty: 12.25 },
  { tx: -3.5, ty: 8.75 },
  { tx: 22, ty: 18 }
];

for (const coord of topdownCoords) {
  const screen = tileToScreen(coord.tx, coord.ty);
  const back = screenToTile(screen.x, screen.y);
  assert(Math.abs(back.tx - coord.tx) < 1e-6, `TopDown tx mismatch: ${back.tx} vs ${coord.tx}`);
  assert(Math.abs(back.ty - coord.ty) < 1e-6, `TopDown ty mismatch: ${back.ty} vs ${coord.ty}`);
}

const tdOffset = tileToScreen(4, 7, 100, 200);
const tdBack = screenToTile(tdOffset.x, tdOffset.y, 100, 200);
assert(Math.abs(tdBack.tx - 4) < 1e-6 && Math.abs(tdBack.ty - 7) < 1e-6);

// Reset back to isometric default
setProjectionMode(PROJECTION_MODE.ISOMETRIC);
assert.strictEqual(getProjectionMode(), 'isometric');
console.log('✓ Test 5 Passed: Top-Down Orthogonal projection round-trip invariants');

console.log('All isoMath tests PASSED successfully!\n');
