import { tileToScreen } from './isoMath.js';
import { TILE } from '../config/constants.js';
import { FarmPlot } from '../entities/FarmPlot.js';

/**
 * IsoWorldRenderer
 * Renders isometric terrain, buildings, vegetation, and manages occlusion.
 */
export class IsoWorldRenderer {
  constructor(scene, navGrid, depthSorter) {
    this.scene = scene;
    this.navGrid = navGrid;
    this.depthSorter = depthSorter;
    this.groundTiles = [];
    this.props = [];
  }

  buildZone(zoneDef, farmingSystem = null) {
    // 1. Render Ground Terrain (depth 10..20)
    for (let ty = 0; ty < zoneDef.height; ty++) {
      for (let tx = 0; tx < zoneDef.width; tx++) {
        const screenPos = tileToScreen(tx, ty);
        const isWater = zoneDef.isWater ? zoneDef.isWater(tx, ty) : false;
        const isPath = zoneDef.isPath ? zoneDef.isPath(tx, ty) : false;

        if (isWater) {
          // Tranquil pond water tile
          const water = this.scene.add.image(screenPos.x, screenPos.y, 'grass_tile');
          water.setOrigin(0.5, 0.5);
          water.setDisplaySize(64, 38);
          water.setTint(0x4D7A78);
          water.setDepth(15);
          this.groundTiles.push(water);
          this.navGrid.setSolid(tx, ty, true);
        } else {
          // Base grass terrain tile
          const grass = this.scene.add.image(screenPos.x, screenPos.y, 'grass_tile');
          grass.setOrigin(0.5, 0.5);
          grass.setDisplaySize(64, 38);
          grass.setDepth(10);
          this.groundTiles.push(grass);

          // Dirt pathway tile overlay
          if (isPath) {
            const path = this.scene.add.image(screenPos.x, screenPos.y, 'dirt_path_tile');
            path.setOrigin(0.5, 0.5);
            path.setDisplaySize(64, 40);
            path.setDepth(20);
            this.groundTiles.push(path);
          }
        }
      }
    }

    // 2. Render 12 Farmland Plots (from zoneDef.plots)
    if (farmingSystem) {
      for (const plot of zoneDef.plots) {
        const farmPlot = new FarmPlot(this.scene, plot.id, plot.tileX, plot.tileY, plot.initialSoil || 'tilled');
        farmingSystem.registerPlot(farmPlot);
        this.groundTiles.push(farmPlot.plotSprite);
      }
    } else {
      for (const plot of zoneDef.plots) {
        const screenPos = tileToScreen(plot.tileX, plot.tileY);
        const plotImg = this.scene.add.image(screenPos.x, screenPos.y, 'plot_tilled');
        plotImg.setOrigin(0.5, 0.5);
        plotImg.setDisplaySize(64, 41);
        plotImg.setDepth(30);
        this.groundTiles.push(plotImg);
      }
    }

    // 3. Render Static Buildings & Landmark Structures
    for (const bldg of zoneDef.buildings) {
      const centerTileX = bldg.tileX + bldg.footprintW / 2;
      const centerTileY = bldg.tileY + bldg.footprintH / 2;
      const screenPos = tileToScreen(centerTileX, centerTileY);

      const sprite = this.scene.add.image(screenPos.x, screenPos.y, bldg.textureKey);
      const origin = bldg.origin || { x: 0.5, y: 0.90 };
      sprite.setOrigin(origin.x, origin.y);
      sprite.setScale(bldg.scale || 0.23);

      // Register solid collision in NavGrid
      if (bldg.isSolid !== false) {
        this.navGrid.setSolidRect(bldg.tileX, bldg.tileY, bldg.footprintW, bldg.footprintH, true);
      }

      // Base foot-y for accurate building depth occlusion
      const footY = tileToScreen(centerTileX, bldg.tileY + bldg.footprintH).y;
      const propObj = {
        sprite,
        active: true,
        getFootY: () => footY
      };
      this.depthSorter.register(propObj);
      this.props.push(propObj);
    }

    // 4. Render Trees, Foliage, Ore Nodes, Logs & Lanterns
    for (const tree of zoneDef.trees) {
      const screenPos = tileToScreen(tree.tileX, tree.tileY);
      const isLantern = tree.textureKey === 'lantern_unlit' || tree.textureKey === 'lantern_lit';

      let scale = tree.scale || 0.14;
      let originY = tree.originY ?? 0.92;
      let isSolid = tree.solid !== false;

      if (isLantern) {
        scale = tree.scale || 0.035;
        originY = tree.originY ?? 1;
        isSolid = false;
      } else if (!tree.scale) {
        if (tree.textureKey.startsWith('foliage_bush')) {
          scale = 0.12;
          originY = 0.85;
          isSolid = false;
        } else if (tree.textureKey === 'fallen_log') {
          scale = 0.12;
          originY = 0.78;
        } else if (tree.textureKey === 'mining_ore_node') {
          scale = 0.14;
          originY = 0.85;
        }
      }

      const sprite = this.scene.add.image(
        screenPos.x,
        screenPos.y - (tree.offsetY || 0),
        tree.textureKey
      );
      sprite.setOrigin(0.5, originY);
      sprite.setScale(scale);

      // Solid collision for trees, logs, and ore nodes
      if (isSolid) {
        this.navGrid.setSolid(tree.tileX, tree.tileY, true);
      }

      const propObj = {
        sprite,
        active: true,
        getFootY: () => screenPos.y
      };
      this.depthSorter.register(propObj);
      this.props.push(propObj);
    }
  }
}
