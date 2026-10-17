import { RECIPES } from '../data/recipes.js';
import { inventoryTransaction } from './inventoryTransaction.js';

export class CraftingSystem {
  constructor(inventory, wallet, toolLevel) {
    this.inventory = inventory;
    this.wallet = wallet;
    this.toolLevel = toolLevel;
  }

  craft(recipeId, station = 'crafting') {
    const recipe = RECIPES[recipeId];
    if (!recipe) return { success: false, message: 'Resep tidak dikenal.' };
    if ((recipe.station || 'crafting') !== station) return { success: false, message: 'Resep ini memerlukan stasiun yang sesuai di pondok.' };
    const upgrade = recipeId === 'watering_can_upgrade';
    if (upgrade && (this.toolLevel.wateringCan >= 2 || this.inventory.hasItem('tool_reinforced_can'))) {
      return { success: false, message: 'Penyiram tembaga sudah dimiliki.' };
    }
    const result = inventoryTransaction(this.inventory, this.wallet, {
      ...recipe, coinDelta: -recipe.coins,
      commit: () => { if (upgrade) this.toolLevel.wateringCan = 2; }
    });
    if (result.success) result.message = `${recipe.name} berhasil dibuat!`;
    return result;
  }
}
