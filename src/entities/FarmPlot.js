import { getCropDefinition } from '../data/crops.js';
import { tileToScreen } from '../world/isoMath.js';

/**
 * FarmPlot Entity
 * Manages an individual 64x32 isometric agricultural plot.
 * State machine: soilState ('grass' | 'tilled' | 'watered'), cropId, growthStage (0..4).
 */
export class FarmPlot {
  constructor(scene, id, tileX, tileY, initialSoil = 'tilled') {
    this.scene = scene;
    this.id = id;
    this.tileX = tileX;
    this.tileY = tileY;

    this.soilState = initialSoil; // 'grass' (untilled), 'tilled', 'watered'
    this.cropId = null;
    this.growthStage = 0; // 0 = empty, 1 = seed, 2 = sprout, 3 = leaf, 4 = mature
    this.plantedDay = -1;
    this.wateredOnDay = -1;

    // Screen coordinates
    const screenPos = tileToScreen(this.tileX, this.tileY);
    this.x = screenPos.x;
    this.y = screenPos.y;

    // Visual sprites
    this.plotSprite = scene.add.image(this.x, this.y, this.getPlotTextureKey());
    this.plotSprite.setOrigin(0.5, 0.5);
    this.plotSprite.setDisplaySize(64, 41);
    this.plotSprite.setDepth(30);

    this.cropSprite = scene.add.image(this.x, this.y - 6, 'crop_sunroot_stage1');
    this.cropSprite.setOrigin(0.5, 0.85);
    this.cropSprite.setScale(0.18);
    this.cropSprite.setDepth(35);
    this.cropSprite.setVisible(false);

    this.updateVisuals();
  }

  getPlotTextureKey() {
    switch (this.soilState) {
      case 'watered':
        return 'plot_watered';
      case 'tilled':
        return 'plot_tilled';
      case 'grass':
      default:
        return 'plot_untilled';
    }
  }

  updateVisuals() {
    this.plotSprite.setTexture(this.getPlotTextureKey());

    if (this.cropId && this.growthStage > 0) {
      const cropDef = getCropDefinition(this.cropId);
      if (cropDef) {
        const tex = `crop_${this.cropId}_stage${this.growthStage}`;
        if (this.scene.textures.exists(tex)) {
          this.cropSprite.setTexture(tex);
        }
        // Adjust scale slightly based on stage
        const stageScale = 0.14 + (this.growthStage * 0.02);
        this.cropSprite.setScale(stageScale);
        this.cropSprite.setVisible(true);
      }
    } else {
      this.cropSprite.setVisible(false);
    }
  }

  till() {
    if (this.soilState === 'grass') {
      this.soilState = 'tilled';
      this.updateVisuals();
      return true;
    }
    return false;
  }

  plant(cropId, currentDay) {
    if (this.soilState !== 'grass' && this.cropId === null) {
      this.cropId = cropId;
      this.growthStage = 1; // Seed stage
      this.plantedDay = currentDay;
      this.updateVisuals();
      return true;
    }
    return false;
  }

  water(currentDay) {
    if (this.soilState === 'tilled' || (this.soilState === 'watered' && this.wateredOnDay !== currentDay)) {
      this.soilState = 'watered';
      this.wateredOnDay = currentDay;
      this.updateVisuals();
      return true;
    }
    return false;
  }

  canHarvest() {
    return this.cropId !== null && this.growthStage === 4;
  }

  harvest() {
    if (!this.canHarvest()) return null;

    const cropDef = getCropDefinition(this.cropId);
    if (!cropDef) return null;

    // Compute yield
    const count = Math.floor(Math.random() * (cropDef.maxYield - cropDef.minYield + 1)) + cropDef.minYield;
    const harvestedCropId = cropDef.harvestItemId;

    // Reset crop state
    const result = {
      itemId: harvestedCropId,
      count
    };

    this.cropId = null;
    this.growthStage = 0;
    this.plantedDay = -1;
    this.updateVisuals();

    return result;
  }

  onNewDay(day, weather) {
    // 1. If it was watered yesterday, and has a crop, grow the crop
    if (this.cropId && this.growthStage > 0 && this.growthStage < 4) {
      const wasWatered = (this.wateredOnDay === day - 1);
      if (wasWatered) {
        this.growthStage++;
      }
    }

    // 2. Weather effect
    if (weather === 'rain') {
      if (this.soilState !== 'grass') {
        this.soilState = 'watered';
        this.wateredOnDay = day;
      }
    } else {
      // Normal day: soil dries out from watered back to tilled
      if (this.soilState === 'watered') {
        this.soilState = 'tilled';
      }
    }

    this.updateVisuals();
  }

  serialize() {
    return {
      id: this.id,
      tileX: this.tileX,
      tileY: this.tileY,
      soilState: this.soilState,
      cropId: this.cropId,
      growthStage: this.growthStage,
      plantedDay: this.plantedDay,
      wateredOnDay: this.wateredOnDay
    };
  }

  deserialize(data) {
    if (!data) return;
    this.soilState = data.soilState || 'tilled';
    this.cropId = data.cropId || null;
    this.growthStage = data.growthStage || 0;
    this.plantedDay = data.plantedDay || -1;
    this.wateredOnDay = data.wateredOnDay || -1;
    this.updateVisuals();
  }

  updateProjection(mode) {
    const screenPos = tileToScreen(this.tileX, this.tileY, 0, 0, mode);
    this.x = screenPos.x;
    this.y = screenPos.y;
    if (this.plotSprite) {
      this.plotSprite.setPosition(this.x, this.y);
      if (mode === 'topdown') {
        this.plotSprite.setDisplaySize(48, 48);
      } else {
        this.plotSprite.setDisplaySize(64, 41);
      }
    }
    if (this.cropSprite) {
      this.cropSprite.setPosition(this.x, this.y - 6);
    }
  }

  destroy() {
    if (this.plotSprite) this.plotSprite.destroy();
    if (this.cropSprite) this.cropSprite.destroy();
  }
}
