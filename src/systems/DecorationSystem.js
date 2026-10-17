export const DECORATIONS = {
  woven_rug: { name: 'Karpet Tenun', image: 'asset/building/woven_rug.png', width: 2, height: 2 },
  plant_pot: { name: 'Pot Pakis', image: 'asset/building/plant_pot.png', width: 1, height: 1 },
  small_shelf: { name: 'Rak Buku', image: 'asset/building/wall_shelf.png', width: 1, height: 1 }
};

export class DecorationSystem {
  constructor(state) {
    this.state = state;
    this.state.placedObjects ||= [];
    this.state.storage ||= { woven_rug: 1, plant_pot: 1, small_shelf: 1 };
    this.state.nextObjectId ||= Math.max(0, ...this.state.placedObjects.map(object => Number(object.objectId.split('_').at(-1)) || 0)) + 1;
  }

  canPlace(itemId, x, y, ignoreId = null) {
    const def = DECORATIONS[itemId];
    if (!def || !Number.isInteger(x) || !Number.isInteger(y) || x < 1 || y < 1 ||
      x + def.width > 5 || y + def.height > 5) return false;
    // The bed at the back-right and the doorway at the front remain reserved.
    if (x <= 4 && x + def.width > 4 && y <= 1 && y + def.height > 1) return false;
    return !this.state.placedObjects.some(object => {
      if (object.objectId === ignoreId) return false;
      const other = DECORATIONS[object.itemId];
      return x < object.gridX + other.width && x + def.width > object.gridX &&
        y < object.gridY + other.height && y + def.height > object.gridY;
    });
  }

  place(itemId, x, y) {
    if (!this.canPlace(itemId, x, y) || !(this.state.storage[itemId] > 0)) {
      return { success: false, message: 'Penempatan tidak valid, terhalang, atau dekorasi tidak tersedia.' };
    }
    this.state.storage[itemId]--;
    this.state.placedObjects.push({ objectId: `decor_${this.state.nextObjectId++}`, itemId, gridX: x, gridY: y, rotation: 0 });
    return { success: true, message: 'Dekorasi ditempatkan.' };
  }

  move(objectId, x, y) {
    const object = this.state.placedObjects.find(o => o.objectId === objectId);
    if (!object || !this.canPlace(object.itemId, x, y, objectId)) return { success: false, message: 'Posisi baru tidak valid.' };
    object.gridX = x; object.gridY = y;
    return { success: true, message: 'Dekorasi dipindahkan.' };
  }

  pickUp(objectId) {
    const index = this.state.placedObjects.findIndex(o => o.objectId === objectId);
    if (index < 0) return { success: false, message: 'Dekorasi tidak ditemukan.' };
    const [object] = this.state.placedObjects.splice(index, 1);
    this.state.storage[object.itemId]++;
    return { success: true, message: 'Dekorasi dikembalikan ke penyimpanan pondok.' };
  }
}
