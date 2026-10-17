import assert from 'node:assert/strict';
import { InventorySystem } from '../src/systems/InventorySystem.js';
import { EconomySystem } from '../src/systems/EconomySystem.js';
import { CraftingSystem } from '../src/systems/CraftingSystem.js';

const bag = new InventorySystem(8);
const wallet = { coins: 80 };
const shop = new EconomySystem(bag, wallet);
const unchanged = action => {
  const before = JSON.stringify({ bag: bag.serialize(), wallet });
  assert.equal(action().success, false);
  assert.equal(JSON.stringify({ bag: bag.serialize(), wallet }), before);
};
for (const quantity of [0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
  unchanged(() => shop.buy('seed_sunroot', quantity));
}
unchanged(() => shop.buy('tool_hoe', 1));
assert.equal(shop.buy('seed_sunroot', 2).success, true);
assert.equal(wallet.coins, 50);
assert.equal(bag.getItemCount('seed_sunroot'), 2);
unchanged(() => shop.buy('seed_goldenleaf', 2));
unchanged(() => shop.sell('seed_sunroot', 3));
assert.equal(shop.sell('seed_sunroot', 1).success, true);
assert.equal(wallet.coins, 55);
bag.addItem('tool_hoe');
unchanged(() => shop.sell('tool_hoe', 1));

const tools = { wateringCan: 1 };
const craft = new CraftingSystem(bag, wallet, tools);
unchanged(() => craft.craft('wooden_planter'));
bag.addItem('wood', 6);
bag.addItem('stone', 2);
bag.addItem('ore', 3);
bag.addItem('tool_watering_can');
assert.equal(craft.craft('wooden_planter').success, true);
assert.equal(bag.getItemCount('planter_box'), 1);
assert.equal(craft.craft('lantern_frame').success, true);
assert.equal(bag.getItemCount('lantern_frame'), 1);
assert.equal(craft.craft('watering_can_upgrade').success, true);
assert.equal(tools.wateringCan, 2);
assert.equal(wallet.coins, 15);
assert.equal(bag.getItemCount('tool_watering_can'), 0);
assert.equal(bag.getItemCount('tool_reinforced_can'), 1);
unchanged(() => craft.craft('watering_can_upgrade'));

const full = new InventorySystem(1);
full.addItem('wood', 99);
const fullWallet = { coins: 100 };
const fullShop = new EconomySystem(full, fullWallet);
assert.equal(fullShop.buy('stone', 1).success, false);
assert.equal(fullWallet.coins, 100);
assert.equal(full.getItemCount('stone'), 0);
console.log('Transactions: buy/sell/craft/upgrade validation and atomic rollback PASS');
