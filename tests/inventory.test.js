import assert from 'node:assert';
import { InventorySystem } from '../src/systems/InventorySystem.js';

console.log('--- Running InventorySystem Unit Tests ---');

// Test 1: Empty initialization
const inv = new InventorySystem(16);
assert.strictEqual(inv.getSlots().length, 16);
assert.strictEqual(inv.getFreeSlotCount(), 16);
assert.strictEqual(inv.isFull(), false);
console.log('✓ Test 1 Passed: Initial 16 slots empty');

// Test 2: Adding single item and querying
const res1 = inv.addItem('seed_sunroot', 5);
assert.strictEqual(res1.success, true);
assert.strictEqual(res1.added, 5);
assert.strictEqual(res1.remaining, 0);
assert.strictEqual(inv.getItemCount('seed_sunroot'), 5);
assert.strictEqual(inv.hasItem('seed_sunroot', 5), true);
assert.strictEqual(inv.hasItem('seed_sunroot', 6), false);
assert.strictEqual(inv.getFreeSlotCount(), 15);
console.log('✓ Test 2 Passed: Single item addition and count check');

// Test 3: Stacking into same slot up to maxStack (99)
inv.addItem('seed_sunroot', 90);
assert.strictEqual(inv.getItemCount('seed_sunroot'), 95);
assert.strictEqual(inv.getFreeSlotCount(), 15); // Still in 1 slot!
assert.strictEqual(inv.getSlot(0).count, 95);

// Add 10 more (should fill slot 0 to 99, and put 6 in slot 1)
inv.addItem('seed_sunroot', 10);
assert.strictEqual(inv.getItemCount('seed_sunroot'), 105);
assert.strictEqual(inv.getSlot(0).count, 99);
assert.strictEqual(inv.getSlot(1).count, 6);
assert.strictEqual(inv.getFreeSlotCount(), 14);
console.log('✓ Test 3 Passed: Stacking up to maxStack=99 overflows to next slot');

// Test 4: Tools with maxStack=1 cannot stack
const resTool1 = inv.addItem('tool_hoe', 1);
const resTool2 = inv.addItem('tool_hoe', 1);
assert.strictEqual(resTool1.success, true);
assert.strictEqual(resTool2.success, true);
assert.strictEqual(inv.getSlot(2).itemId, 'tool_hoe');
assert.strictEqual(inv.getSlot(2).count, 1);
assert.strictEqual(inv.getSlot(3).itemId, 'tool_hoe');
assert.strictEqual(inv.getSlot(3).count, 1);
console.log('✓ Test 4 Passed: Non-stackable tools take distinct slots');

// Test 5: Filling all slots and verifying rejection
const invFull = new InventorySystem(16);
for (let i = 0; i < 16; i++) {
  invFull.addItem('stone', 99);
}
assert.strictEqual(invFull.isFull(), true);
assert.strictEqual(invFull.getFreeSlotCount(), 0);

// Trying to add a new item type to full inventory
const fullRes = invFull.addItem('crop_sunroot', 1);
assert.strictEqual(fullRes.success, false);
assert.strictEqual(fullRes.added, 0);
assert.strictEqual(fullRes.remaining, 1);
assert.strictEqual(invFull.hasItem('crop_sunroot'), false);
console.log('✓ Test 5 Passed: Full inventory safely rejects new item without state corruption');

// Test 6: Removing items across multiple slots
const invRemove = new InventorySystem(16);
invRemove.addItem('wood', 99);
invRemove.addItem('wood', 20); // total 119
assert.strictEqual(invRemove.getItemCount('wood'), 119);

const remRes = invRemove.removeItem('wood', 105);
assert.strictEqual(remRes, true);
assert.strictEqual(invRemove.getItemCount('wood'), 14);
assert.strictEqual(invRemove.getSlot(0), null); // Slot 0 emptied
assert.strictEqual(invRemove.getSlot(1).count, 14);
console.log('✓ Test 6 Passed: Multi-slot item removal works correctly');

// Test 7: Slot swapping and merging
const invSwap = new InventorySystem(16);
invSwap.addItem('ore', 10); // slot 0
invSwap.addItem('ore', 20); // slot 1
invSwap.swapSlots(0, 1); // should merge slot 0 into slot 1 (total 30)
assert.strictEqual(invSwap.getSlot(0), null);
assert.strictEqual(invSwap.getSlot(1).count, 30);
console.log('✓ Test 7 Passed: Slot merge on swap');

// Test 8: Serialization & Deserialization
const snapshot = invSwap.serialize();
const invRestored = new InventorySystem(16);
invRestored.deserialize(snapshot);
assert.strictEqual(invRestored.getSlot(1).count, 30);
assert.strictEqual(invRestored.getSlot(1).itemId, 'ore');
console.log('✓ Test 8 Passed: Serialization round-trip preserved state');

console.log('All InventorySystem unit tests PASSED successfully!\n');
