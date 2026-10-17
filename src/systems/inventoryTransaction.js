import { InventorySystem } from './InventorySystem.js';
import { getItemDefinition } from '../data/items.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';

/** Stage all inputs/outputs before committing inventory, wallet and domain events together. */
export function inventoryTransaction(inventory, wallet, { inputs = [], outputs = [], coinDelta = 0, commit }) {
  const nextCoins = wallet.coins + coinDelta;
  if (!Number.isSafeInteger(coinDelta) || !Number.isSafeInteger(nextCoins) || nextCoins < 0) {
    return { success: false, message: 'Koin tidak cukup atau jumlah transaksi tidak valid.' };
  }
  const staged = new InventorySystem(inventory.capacity);
  staged.deserialize(inventory.serialize());
  for (const item of [...inputs, ...outputs]) {
    if (!getItemDefinition(item.itemId) || !Number.isSafeInteger(item.count) || item.count <= 0) {
      return { success: false, message: 'Item atau jumlah transaksi tidak valid.' };
    }
  }
  for (const item of inputs) {
    if (!staged.removeItem(item.itemId, item.count)) {
      return { success: false, message: 'Jumlah item atau bahan di tas belum cukup.' };
    }
  }
  for (const item of outputs) {
    if (!staged.addItem(item.itemId, item.count).success) {
      return { success: false, message: 'Tas penuh. Kosongkan ruang terlebih dahulu.' };
    }
  }
  // All observers see one complete inventory/wallet transition.
  inventory.slots = staged.slots;
  inventory.nextInstanceId = staged.nextInstanceId;
  wallet.coins = nextCoins;
  commit?.();
  inventory.emitChange();
  EventBus.emit(EVENTS.COINS_CHANGED, { coins: wallet.coins });
  for (const item of inputs) EventBus.emit(EVENTS.ITEM_SPENT, { ...item });
  for (const item of outputs) EventBus.emit(EVENTS.ITEM_ACQUIRED, { ...item });
  EventBus.emit(EVENTS.SAVE_REQUESTED, { reason: 'transaction' });
  return { success: true, message: 'Transaksi berhasil.' };
}
