/**
 * Dynamic Depth Sorter
 * Uses screen-space foot-y position to sort isometric entities correctly.
 * Separates solid bases from overhead occluders (canopies and roofs).
 */
export class DepthSorter {
  constructor() {
    this.entities = [];
  }

  register(entity) {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
    }
  }

  unregister(entity) {
    const idx = this.entities.indexOf(entity);
    if (idx !== -1) {
      this.entities.splice(idx, 1);
    }
  }

  update() {
    // Sort all registered entities by their footY screen position
    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];
      if (ent.active && ent.getFootY) {
        // Depth base: 500 + screen foot Y
        const depth = 500 + Math.round(ent.getFootY());
        if (ent.sprite && ent.sprite.setDepth) {
          ent.sprite.setDepth(depth);
        }
      }
    }
  }
}
