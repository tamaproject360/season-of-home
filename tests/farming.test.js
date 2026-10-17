import assert from 'node:assert';
import { InventorySystem } from '../src/systems/InventorySystem.js';
import { WorldClock } from '../src/world/WorldClock.js';
import { FarmingSystem } from '../src/systems/FarmingSystem.js';

console.log('--- Running FarmingSystem Unit Tests ---');

// Mock scene for headless testing
const mockScene = {
  add: {
    image: () => ({
      setOrigin: () => {},
      setDisplaySize: () => {},
      setScale: () => {},
      setDepth: () => {},
      setTexture: () => {},
      setVisible: () => {},
      destroy: () => {}
    })
  },
  textures: {
    exists: () => true
  }
};

// Import FarmPlot dynamically
const { FarmPlot } = await import('../src/entities/FarmPlot.js');

const inventory = new InventorySystem(16);
const clock = new WorldClock(1, 'spring');
const farming = new FarmingSystem(mockScene, inventory, clock);

// Test 1: Register Plot
const plot1 = new FarmPlot(mockScene, 'plot_test_1', 3, 8, 'grass');
farming.registerPlot(plot1);
assert.strictEqual(farming.getPlot('plot_test_1'), plot1);
assert.strictEqual(plot1.soilState, 'grass');
console.log('✓ Test 1 Passed: Plot registration and initial grass state');

// Test 2: Till action
const tillAction = farming.getContextualAction(plot1, 'tool_hoe');
assert.strictEqual(tillAction.action, 'till');
const tillRes = farming.executeAction(plot1, 'tool_hoe');
assert.strictEqual(tillRes.success, true);
assert.strictEqual(plot1.soilState, 'tilled');
console.log('✓ Test 2 Passed: Tilling grass plot creates tilled soil');

// Test 3: Planting seeds
inventory.addItem('seed_sunroot', 2);
const plantAction = farming.getContextualAction(plot1, 'seed_sunroot');
assert.strictEqual(plantAction.action, 'plant');
const plantRes = farming.executeAction(plot1, 'seed_sunroot');
assert.strictEqual(plantRes.success, true);
assert.strictEqual(plot1.cropId, 'sunroot');
assert.strictEqual(plot1.growthStage, 1);
assert.strictEqual(inventory.getItemCount('seed_sunroot'), 1); // 1 consumed
console.log('✓ Test 3 Passed: Seed planting transitions plot to growth stage 1');

// Test 4: Watering plot
const waterAction = farming.getContextualAction(plot1, 'tool_watering_can');
assert.strictEqual(waterAction.action, 'water');
const waterRes = farming.executeAction(plot1, 'tool_watering_can');
assert.strictEqual(waterRes.success, true);
assert.strictEqual(plot1.soilState, 'watered');
assert.strictEqual(plot1.wateredOnDay, 1);
console.log('✓ Test 4 Passed: Watering transitions plot to watered state');

// Test 5: New day growth progression
// Advance day to 2 (sunny)
clock.advanceToMorning(); // Day 2
assert.strictEqual(clock.day, 2);
assert.strictEqual(plot1.growthStage, 2); // Advanced to sprout!
assert.strictEqual(plot1.soilState, 'tilled'); // Soil dried to tilled for new day
console.log('✓ Test 5 Passed: Crop grows to stage 2 and soil resets on dry new day');

// Water again on day 2
farming.executeAction(plot1, 'tool_watering_can');
assert.strictEqual(plot1.soilState, 'watered');

// Advance day to 3 (Day 3)
clock.advanceToMorning();
assert.strictEqual(plot1.growthStage, 3); // Leaf stage!
farming.executeAction(plot1, 'tool_watering_can');

// Advance day to 4 (Day 4)
clock.advanceToMorning();
assert.strictEqual(plot1.growthStage, 4); // Mature stage!
assert.strictEqual(plot1.canHarvest(), true);
console.log('✓ Test 6 Passed: Full growth cycle reaches mature stage 4');

// Test 7: Safe Harvest Cancellation when inventory is full
const fullInventory = new InventorySystem(16);
for (let i = 0; i < 16; i++) {
  fullInventory.addItem('stone', 99);
}
assert.strictEqual(fullInventory.isFull(), true);

const farmingFull = new FarmingSystem(mockScene, fullInventory, clock);
farmingFull.registerPlot(plot1);

const harvestFailRes = farmingFull.executeAction(plot1, null);
assert.strictEqual(harvestFailRes.success, false);
assert.strictEqual(harvestFailRes.reason, 'inventory_full');
assert.strictEqual(plot1.canHarvest(), true); // Crop MUST remain safely intact on plot!
assert.strictEqual(plot1.growthStage, 4);
console.log('✓ Test 7 Passed: Safe harvest protection aborts cleanly when inventory is full');

// Test 8: Successful harvest with available inventory space
const harvestSuccessRes = farming.executeAction(plot1, null);
assert.strictEqual(harvestSuccessRes.success, true);
assert.strictEqual(harvestSuccessRes.action, 'harvest');
assert.strictEqual(harvestSuccessRes.item, 'crop_sunroot');
assert.strictEqual(inventory.getItemCount('crop_sunroot') > 0, true);
assert.strictEqual(plot1.cropId, null);
assert.strictEqual(plot1.growthStage, 0);
assert.strictEqual(plot1.soilState, 'tilled'); // Plot remains tilled ready for next seed
console.log('✓ Test 8 Passed: Harvest extracts crop, rewards inventory, and leaves soil ready');

// Test 9: Dynamic tilling on unplotted land
const dynamicRes = farming.tillTile(15, 20);
assert.strictEqual(dynamicRes.success, true);
assert.strictEqual(dynamicRes.action, 'till');
const dynamicPlot = farming.getPlot('dynamic_plot_15_20');
assert.ok(dynamicPlot, 'dynamic plot registered in farming system');
assert.strictEqual(dynamicPlot.tileX, 15);
assert.strictEqual(dynamicPlot.tileY, 20);
assert.strictEqual(dynamicPlot.soilState, 'tilled');

// Reject duplicate till on same coordinates
const dupTill = farming.tillTile(15, 20);
assert.strictEqual(dupTill.success, false);
assert.strictEqual(dupTill.reason, 'already_tilled');
console.log('✓ Test 9 Passed: Dynamic tilling creates new plot and prevents duplicates');

// Test 10: Clear unplanted plot back to natural terrain
const clearRes = farming.clearPlot(dynamicPlot);
assert.strictEqual(clearRes.success, true);
assert.strictEqual(clearRes.action, 'clear');
assert.strictEqual(farming.getPlot('dynamic_plot_15_20'), null, 'cleared plot unregistered from farming system');
assert.strictEqual(farming.getPlotAt(15, 20), null, 'getPlotAt returns null for cleared coordinates');
console.log('✓ Test 10 Passed: Plot clearing unregisters and restores open ground');

console.log('All FarmingSystem unit tests PASSED successfully!\n');
