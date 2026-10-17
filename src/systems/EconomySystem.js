import { getItemDefinition } from '../data/items.js';
import { SHOP_STOCK } from '../data/recipes.js';
import { inventoryTransaction } from './inventoryTransaction.js';

export class EconomySystem {
  constructor(inventory, wallet) {
    this.inventory = inventory;
    this.wallet = wallet;
  }

  buy(itemId, quantity = 1) {
    const item = getItemDefinition(itemId);
    if (!SHOP_STOCK.includes(itemId) || !Number.isSafeInteger(quantity) || quantity <= 0) {
      return { success: false, message: 'Pilihan barang atau jumlah pembelian tidak valid.' };
    }
    const result = inventoryTransaction(this.inventory, this.wallet, {
      outputs: [{ itemId, count: quantity }], coinDelta: -item.buyPrice * quantity
    });
    if (result.success) result.message = `Membeli ${quantity} ${item.name} (−${item.buyPrice * quantity} koin).`;
    return result;
  }

  sell(itemId, quantity = 1) {
    const item = getItemDefinition(itemId);
    if (!item?.sellable || !Number.isSafeInteger(quantity) || quantity <= 0) {
      return { success: false, message: 'Item ini tidak dapat dijual atau jumlahnya tidak valid.' };
    }
    const result = inventoryTransaction(this.inventory, this.wallet, {
      inputs: [{ itemId, count: quantity }], coinDelta: item.sellPrice * quantity
    });
    if (result.success) result.message = `Menjual ${quantity} ${item.name} (+${item.sellPrice * quantity} koin).`;
    return result;
  }
}
