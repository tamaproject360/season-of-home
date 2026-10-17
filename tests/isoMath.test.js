import assert from 'node:assert';
import { tileToScreen, screenToTile } from '../src/world/isoMath.js';

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

console.log('All isoMath tests PASSED successfully!\n');
