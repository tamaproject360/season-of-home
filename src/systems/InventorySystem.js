import { getItemDefinition } from '../data/items.js';

/**
 * InventorySystem
 * 16-slot inventory management with stack merging, capacity safeguards, and serialization.
 */
export class InventorySystem {
  constructor(capacity = 16) {
    this.capacity = capacity;
    this.slots = new Array(capacity).fill(null);
    this.listeners = [];
    this.nextInstanceId = 1;
  }

  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  emitChange() {
    for (const listener of this.listeners) {
      try {
        listener(this.slots);
      } catch (err) {
        console.error('[InventorySystem] Listener error:', err);
      }
    }
  }

  getSlots() {
    return this.slots;
  }

  getSlot(index) {
    if (index < 0 || index >= this.capacity) return null;
    return this.slots[index];
  }

  getItemCount(itemId) {
    let total = 0;
    for (const slot of this.slots) {
      if (slot && slot.itemId === itemId) {
        total += slot.count;
      }
    }
    return total;
  }

  hasItem(itemId, count = 1) {
    return this.getItemCount(itemId) >= count;
  }

  isFull() {
    return this.slots.every(slot => slot !== null);
  }

  getFreeSlotCount() {
    return this.slots.filter(slot => slot === null).length;
  }

  /**
   * Add item to inventory with safe stack merging and capacity check.
   * If inventory cannot fit all items, it adds what it can and returns remaining.
   * @param {string} itemId
   * @param {number} count
   * @returns {{ success: boolean, added: number, remaining: number }}
   */
  addItem(itemId, count = 1) {
    if (count <= 0) return { success: true, added: 0, remaining: 0 };
    const itemDef = getItemDefinition(itemId);
    if (!itemDef) {
      console.warn(`[InventorySystem] Item definition not found for: ${itemId}`);
      return { success: false, added: 0, remaining: count };
    }

    const maxStack = itemDef.maxStack || 99;
    let remaining = count;

    // 1. Try to merge into existing stacks of same item
    if (maxStack > 1) {
      for (let i = 0; i < this.capacity; i++) {
        const slot = this.slots[i];
        if (slot && slot.itemId === itemId && slot.count < maxStack) {
          const space = maxStack - slot.count;
          const toAdd = Math.min(space, remaining);
          slot.count += toAdd;
          remaining -= toAdd;
          if (remaining === 0) break;
        }
      }
    }

    // 2. Put remaining in empty slots
    if (remaining > 0) {
      for (let i = 0; i < this.capacity; i++) {
        if (this.slots[i] === null) {
          const toAdd = Math.min(maxStack, remaining);
          this.slots[i] = {
            instanceId: `item_${this.nextInstanceId++}`,
            itemId,
            count: toAdd
          };
          remaining -= toAdd;
          if (remaining === 0) break;
        }
      }
    }

    const added = count - remaining;
    if (added > 0) {
      this.emitChange();
    }

    return {
      success: remaining === 0,
      added,
      remaining
    };
  }

  /**
   * Remove item count across inventory slots
   */
  removeItem(itemId, count = 1) {
    if (!this.hasItem(itemId, count)) return false;

    let remaining = count;
    for (let i = 0; i < this.capacity; i++) {
      const slot = this.slots[i];
      if (slot && slot.itemId === itemId) {
        if (slot.count <= remaining) {
          remaining -= slot.count;
          this.slots[i] = null;
        } else {
          slot.count -= remaining;
          remaining = 0;
        }
        if (remaining === 0) break;
      }
    }

    this.emitChange();
    return true;
  }

  /**
   * Remove count from a specific slot index
   */
  removeAtSlot(index, count = 1) {
    const slot = this.getSlot(index);
    if (!slot || count <= 0) return false;

    if (slot.count <= count) {
      this.slots[index] = null;
    } else {
      slot.count -= count;
    }

    this.emitChange();
    return true;
  }

  /**
   * Swap two slots or merge if same item type
   */
  swapSlots(fromIndex, toIndex) {
    if (fromIndex === toIndex) return false;
    if (fromIndex < 0 || fromIndex >= this.capacity || toIndex < 0 || toIndex >= this.capacity) {
      return false;
    }

    const fromSlot = this.slots[fromIndex];
    const toSlot = this.slots[toIndex];

    if (!fromSlot && !toSlot) return false;

    // Check merge opportunity
    if (fromSlot && toSlot && fromSlot.itemId === toSlot.itemId) {
      const itemDef = getItemDefinition(fromSlot.itemId);
      const maxStack = itemDef ? itemDef.maxStack : 99;
      const space = maxStack - toSlot.count;

      if (space > 0) {
        const toMove = Math.min(space, fromSlot.count);
        toSlot.count += toMove;
        fromSlot.count -= toMove;

        if (fromSlot.count === 0) {
          this.slots[fromIndex] = null;
        }
        this.emitChange();
        return true;
      }
    }

    // Direct swap
    this.slots[fromIndex] = toSlot;
    this.slots[toIndex] = fromSlot;
    this.emitChange();
    return true;
  }

  serialize() {
    return {
      capacity: this.capacity,
      slots: this.slots.map(s => s ? { ...s } : null),
      nextInstanceId: this.nextInstanceId
    };
  }

  deserialize(data) {
    if (!data || !Array.isArray(data.slots)) return false;
    this.capacity = data.capacity || 16;
    this.slots = data.slots.map(s => s ? { ...s } : null);
    this.nextInstanceId = data.nextInstanceId || 1;
    this.emitChange();
    return true;
  }
}
