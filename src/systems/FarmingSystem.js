import { getCropBySeedId, getCropDefinition } from '../data/crops.js';
import { getItemDefinition } from '../data/items.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { FarmPlot } from '../entities/FarmPlot.js';

/**
 * FarmingSystem
 * Orchestrates agricultural mechanics across all farm plots.
 * Enforces safe harvest cancellation when inventory is full and handles growth cycles.
 */
export class FarmingSystem {
  constructor(scene, inventory, worldClock) {
    this.scene = scene;
    this.inventory = inventory;
    this.worldClock = worldClock;
    this.plots = new Map(); // id -> FarmPlot

    // Bind to world clock daily cycle
    this.worldClock.on('day', ({ day, season, weather }) => {
      this.onNewDay(day, weather);
    });
  }

  registerPlot(farmPlot) {
    this.plots.set(farmPlot.id, farmPlot);
  }

  getPlot(id) {
    return this.plots.get(id) || null;
  }

  getPlots() {
    return Array.from(this.plots.values());
  }

  getPlotAt(tileX, tileY) {
    for (const plot of this.plots.values()) {
      if (plot.tileX === tileX && plot.tileY === tileY) {
        return plot;
      }
    }
    return null;
  }

  /**
   * Dynamically till a grass/soil tile in Joni's farmstead.
   * Creates a new FarmPlot entity on demand.
   * @param {number} tileX
   * @param {number} tileY
   */
  tillTile(tileX, tileY) {
    const existing = this.getPlotAt(tileX, tileY);
    if (existing) {
      if (existing.soilState === 'grass') {
        return this.executeAction(existing, 'tool_hoe');
      }
      return { success: false, reason: 'already_tilled' };
    }

    const id = `dynamic_plot_${tileX}_${tileY}`;
    const newPlot = new FarmPlot(this.scene, id, tileX, tileY, 'tilled');
    this.registerPlot(newPlot);

    if (this.scene && this.scene.worldRenderer && Array.isArray(this.scene.worldRenderer.groundTiles)) {
      this.scene.worldRenderer.groundTiles.push(newPlot.plotSprite);
    }

    EventBus.emit(EVENTS.PLOT_TILLED, { plot: newPlot });
    return {
      success: true,
      action: 'till',
      plot: newPlot,
      message: 'Tanah baru berhasil dicangkul gembur.'
    };
  }

  /**
   * Clear an unplanted plot back to natural grass using scythe or hoe.
   * @param {FarmPlot} plot
   */
  clearPlot(plot) {
    if (!plot) return { success: false, reason: 'no_plot' };
    if (plot.cropId === null && (plot.soilState === 'tilled' || plot.soilState === 'watered')) {
      plot.destroy();
      this.plots.delete(plot.id);
      return {
        success: true,
        action: 'clear',
        message: 'Lahan dibersihkan kembali menjadi rumput alami.'
      };
    }
    return { success: false, reason: 'has_crop' };
  }

  /**
   * Determine available action for a plot given current player inventory item
   */
  getContextualAction(plot, activeItemId) {
    if (!plot) return null;

    // 1. Ready to harvest
    if (plot.canHarvest()) {
      const cropDef = getCropDefinition(plot.cropId);
      return {
        action: 'harvest',
        label: `Panen ${cropDef ? cropDef.name : 'Tanaman'} [E]`,
        priority: 100
      };
    }

    // 2. Untilled grass
    if (plot.soilState === 'grass') {
      return {
        action: 'till',
        label: 'Cangkul Tanah [E]',
        priority: 80
      };
    }

    // 3. Tilled soil with no seed planted
    if (plot.cropId === null) {
      if (activeItemId && activeItemId.startsWith('seed_')) {
        const itemDef = getItemDefinition(activeItemId);
        return {
          action: 'plant',
          label: `Tanam ${itemDef ? itemDef.name : 'Bibit'} [E]`,
          seedId: activeItemId,
          priority: 90
        };
      }
      if (plot.soilState === 'tilled') {
        return {
          action: 'water',
          label: 'Siram Petak [E]',
          priority: 70
        };
      }
    }

    // 4. Planted crop that needs water
    if (plot.cropId !== null && plot.soilState === 'tilled') {
      return {
        action: 'water',
        label: 'Siram Tanaman [E]',
        priority: 85
      };
    }

    return null;
  }

  /**
   * Execute contextual farming action
   */
  executeAction(plot, activeItemId) {
    if (!plot) return { success: false, reason: 'no_plot' };

    // 1. Harvest action
    if (plot.canHarvest()) {
      const cropDef = getCropDefinition(plot.cropId);
      if (!cropDef) return { success: false, reason: 'unknown_crop' };

      // Safe harvest protection: Check inventory capacity before harvesting!
      const harvestItemId = cropDef.harvestItemId;
      const canFit = !this.inventory.isFull() || this.inventory.getItemCount(harvestItemId) > 0;

      if (!canFit) {
        console.warn('[FarmingSystem] Harvest blocked: Inventory is completely full!');
        return {
          success: false,
          reason: 'inventory_full',
          message: 'Tas Anda penuh! Kosongkan tas terlebih dahulu sebelum memanen.'
        };
      }

      // Safe to harvest
      const harvestResult = plot.harvest();
      if (harvestResult) {
        this.inventory.addItem(harvestResult.itemId, harvestResult.count);
        EventBus.emit(EVENTS.CROP_HARVESTED, {
          itemId: harvestResult.itemId,
          count: harvestResult.count
        });
        return {
          success: true,
          action: 'harvest',
          item: harvestResult.itemId,
          count: harvestResult.count,
          message: `Berhasil memanen ${harvestResult.count} ${cropDef.name}!`
        };
      }
    }

    // 2. Till action
    if (plot.soilState === 'grass') {
      plot.till();
      EventBus.emit(EVENTS.PLOT_TILLED, { plot });
      return {
        success: true,
        action: 'till',
        message: 'Tanah berhasil dicangkul gembur.'
      };
    }

    // 3. Plant action
    if (plot.cropId === null && activeItemId && activeItemId.startsWith('seed_')) {
      const crop = getCropBySeedId(activeItemId);
      if (crop) {
        if (this.inventory.hasItem(activeItemId, 1)) {
          this.inventory.removeItem(activeItemId, 1);
          plot.plant(crop.id, this.worldClock.day);
          EventBus.emit(EVENTS.CROP_PLANTED, { cropId: crop.id });
          return {
            success: true,
            action: 'plant',
            cropId: crop.id,
            message: `Berhasil menanam bibit ${crop.name}.`
          };
        }
      }
    }

    // 4. Water action
    if (plot.soilState === 'tilled') {
      plot.water(this.worldClock.day);
      EventBus.emit(EVENTS.PLOT_WATERED, { plot });
      return {
        success: true,
        action: 'water',
        message: 'Petak kebun berhasil disiram air segar.'
      };
    }

    return { success: false, reason: 'no_valid_action' };
  }

  onNewDay(day, weather) {
    console.log(`[FarmingSystem] Processing new day growth: Day ${day}, Weather: ${weather}`);
    let maturedCount = 0;

    for (const plot of this.plots.values()) {
      const wasMatureBefore = plot.canHarvest();
      plot.onNewDay(day, weather);
      if (!wasMatureBefore && plot.canHarvest()) {
        maturedCount++;
      }
    }

    if (maturedCount > 0) {
      console.log(`[FarmingSystem] ${maturedCount} tanaman siap dipanen hari ini!`);
    }
  }

  serialize() {
    const serializedPlots = [];
    for (const plot of this.plots.values()) {
      serializedPlots.push(plot.serialize());
    }
    return { plots: serializedPlots };
  }

  deserialize(data) {
    if (!data || !Array.isArray(data.plots)) return;
    for (const plotData of data.plots) {
      let plot = this.plots.get(plotData.id);
      if (!plot) {
        plot = new FarmPlot(this.scene, plotData.id, plotData.tileX, plotData.tileY, plotData.soilState || 'tilled');
        this.registerPlot(plot);
        if (this.scene && this.scene.worldRenderer && Array.isArray(this.scene.worldRenderer.groundTiles)) {
          this.scene.worldRenderer.groundTiles.push(plot.plotSprite);
        }
      }
      plot.deserialize(plotData);
    }
  }
}
