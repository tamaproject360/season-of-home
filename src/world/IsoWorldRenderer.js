import { tileToScreen } from './isoMath.js';
import { TILE } from '../config/constants.js';
import { FarmPlot } from '../entities/FarmPlot.js';

/**
 * IsoWorldRenderer
 * Renders isometric and top-down terrain, buildings, vegetation, and manages occlusion.
 */
export class IsoWorldRenderer {
  constructor(scene, navGrid, depthSorter) {
    this.scene = scene;
    this.navGrid = navGrid;
    this.depthSorter = depthSorter;
    this.groundTiles = [];
    this.props = [];
    this.groundElements = [];
    this.roadElements = [];
    this.buildingElements = [];
    this.treeElements = [];
    this.roadGraphics = null;
    this.zoneDef = null;
    this.farmingSystem = null;
  }

  buildZone(zoneDef, farmingSystem = null) {
    this.zoneDef = zoneDef;
    this.farmingSystem = farmingSystem;

    // Reuse the earthy pixels of the source path, but clip a complete diamond.
    // The source stripe itself cannot connect along both isometric axes.
    for (const [key, sourceKey, sampleY] of [
      ['village_dirt', 'dirt_path_tile', 92],
      ['village_water', 'pond_water_tile', 85]
    ]) {
      if (this.scene.textures.exists(key)) continue;
      const source = this.scene.textures.get(sourceKey).getSourceImage();
      const texture = this.scene.textures.createCanvas(key, 128, 64);
      const ctx = texture.getContext();
      ctx.imageSmoothingEnabled = false;
      ctx.beginPath();
      ctx.moveTo(64, 0);
      ctx.lineTo(128, 32);
      ctx.lineTo(64, 64);
      ctx.lineTo(0, 32);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(source, 110, sampleY, 120, 28, 0, 0, 128, 64);
      texture.refresh();
    }

    // 1. Render Ground Terrain (depth 10..20)
    for (let ty = 0; ty < zoneDef.height; ty++) {
      for (let tx = 0; tx < zoneDef.width; tx++) {
        const screenPos = tileToScreen(tx, ty);
        const isWater = zoneDef.isWater ? zoneDef.isWater(tx, ty) : false;

        if (isWater) {
          // Tranquil pond water tile
          const water = this.scene.add.image(screenPos.x, screenPos.y, 'village_water');
          water.setOrigin(0.5, 0.5);
          water.setDisplaySize(TILE.WIDTH + 0.2, TILE.HEIGHT + 0.2);
          water.setDepth(15);
          this.groundTiles.push(water);
          this.groundElements.push({ sprite: water, tx, ty, isWater: true });
          this.navGrid.setSolid(tx, ty, true);
        } else {
          // Base grass terrain tile
          const grass = this.scene.add.image(screenPos.x, screenPos.y, 'grass_tile');
          grass.setOrigin(0.5, 0.5);
          grass.setDisplaySize(64, 38);
          grass.setDepth(10);
          this.groundTiles.push(grass);
          this.groundElements.push({ sprite: grass, tx, ty, isWater: false });
        }
      }
    }

    // Connected dirt surfaces
    const roads = this.scene.add.graphics().setDepth(21);
    this.roadGraphics = roads;
    for (let ty = 0; ty < zoneDef.height; ty++) {
      for (let tx = 0; tx < zoneDef.width; tx++) {
        if (!zoneDef.isPath(tx, ty) || zoneDef.isWater(tx, ty)) continue;
        const { x, y } = tileToScreen(tx, ty);
        const corners = [
          { x, y: y - TILE.HEIGHT / 2 },
          { x: x + TILE.WIDTH / 2, y },
          { x, y: y + TILE.HEIGHT / 2 },
          { x: x - TILE.WIDTH / 2, y }
        ];
        const path = this.scene.add.image(x, y, 'village_dirt');
        path.setDisplaySize(TILE.WIDTH, TILE.HEIGHT);
        path.setDepth(20);
        if (!zoneDef.isPlaza?.(tx, ty)) path.setTint(0xEBDFCC);
        this.groundTiles.push(path);
        this.roadElements.push({ sprite: path, tx, ty, isPlaza: zoneDef.isPlaza?.(tx, ty) });

        const neighbours = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        roads.lineStyle(1, 0x796B4C, 0.85);
        neighbours.forEach(([dx, dy], index) => {
          if (!zoneDef.isPath(tx + dx, ty + dy)) {
            const a = corners[index];
            const b = corners[(index + 1) % 4];
            roads.lineBetween(a.x, a.y, b.x, b.y);
          }
        });
      }
    }
    this.groundTiles.push(roads);

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
      const renderTileX = bldg.renderAnchor?.tileX ?? centerTileX;
      const renderTileY = bldg.renderAnchor?.tileY ?? centerTileY;
      const screenPos = tileToScreen(renderTileX, renderTileY);

      const sprite = this.scene.add.image(screenPos.x, screenPos.y, bldg.textureKey);
      const origin = bldg.origin || { x: 0.5, y: 0.90 };
      sprite.setOrigin(origin.x, origin.y);
      sprite.setScale(bldg.scale || 0.23);
      if (bldg.flipX) sprite.setFlipX(true);

      // Register solid collision in NavGrid
      if (bldg.isSolid !== false) {
        this.navGrid.setSolidRect(bldg.tileX, bldg.tileY, bldg.footprintW, bldg.footprintH, true);
      }
      for (const cell of bldg.collisionCells || []) {
        this.navGrid.setSolid(bldg.tileX + cell.x, bldg.tileY + cell.y, true);
      }
      for (const cell of bldg.walkableCells || []) {
        this.navGrid.setSolid(bldg.tileX + cell.x, bldg.tileY + cell.y, false);
      }

      // Base foot-y for accurate building depth occlusion
      const footY = tileToScreen(centerTileX, bldg.tileY + bldg.footprintH).y;
      const propObj = {
        sprite,
        active: true,
        getFootY: () => footY
      };
      if (bldg.groundProp) sprite.setDepth(40);
      else this.depthSorter.register(propObj);
      this.props.push(propObj);

      // Small hanging props inherit their building's position and occlusion.
      const attachedProps = [];
      for (const attachment of bldg.attachments || []) {
        const left = sprite.x - sprite.displayWidth * origin.x;
        const top = sprite.y - sprite.displayHeight * origin.y;
        const decor = this.scene.add.image(
          left + sprite.displayWidth * attachment.x,
          top + sprite.displayHeight * attachment.y,
          attachment.textureKey
        );
        decor.setOrigin(0.5, 0);
        decor.setScale(attachment.height / decor.height);
        const attachedProp = { sprite: decor, active: true, getFootY: () => footY + 1 };
        this.depthSorter.register(attachedProp);
        this.props.push(attachedProp);
        attachedProps.push({ sprite: decor, config: attachment, propObj: attachedProp });
      }

      this.buildingElements.push({
        sprite,
        bldg,
        centerTileX,
        centerTileY,
        renderTileX,
        renderTileY,
        origin,
        propObj,
        attachments: attachedProps
      });
    }

    // 4. Render Trees, Foliage, Ore Nodes, Logs & Lanterns
    for (const tree of [...zoneDef.trees, ...(zoneDef.resources || [])]) {
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
      if (tree.displayHeight) sprite.setScale(tree.displayHeight / sprite.height);

      // Solid collision for trees, logs, and ore nodes
      if (isSolid) {
        this.navGrid.setSolid(tree.tileX, tree.tileY, true);
      }

      const propObj = {
        sprite,
        definition: tree,
        active: true,
        getFootY: () => screenPos.y
      };
      this.depthSorter.register(propObj);
      this.props.push(propObj);

      this.treeElements.push({
        sprite,
        propObj,
        tree,
        originY,
        offsetY: tree.offsetY || 0
      });
    }
  }

  /**
   * Refresh all rendered world elements when camera projection mode changes.
   * @param {'isometric' | 'topdown'} mode
   */
  refreshProjection(mode) {
    if (!this.zoneDef) return;
    const isTopDown = mode === 'topdown';
    const orthoSize = TILE.ORTHO_SIZE || 48;

    // 1. Reposition Ground Terrain Tiles
    for (const elem of this.groundElements) {
      const pos = tileToScreen(elem.tx, elem.ty, 0, 0, mode);
      elem.sprite.setPosition(pos.x, pos.y);
      if (isTopDown) {
        elem.sprite.setDisplaySize(orthoSize + 0.2, orthoSize + 0.2);
      } else {
        if (elem.isWater) {
          elem.sprite.setDisplaySize(TILE.WIDTH + 0.2, TILE.HEIGHT + 0.2);
        } else {
          elem.sprite.setDisplaySize(64, 38);
        }
      }
    }

    // 2. Reposition Road Tiles and Redraw Borders
    if (this.roadGraphics) {
      this.roadGraphics.clear();
      this.roadGraphics.lineStyle(1, 0x796B4C, 0.85);

      for (const elem of this.roadElements) {
        const pos = tileToScreen(elem.tx, elem.ty, 0, 0, mode);
        elem.sprite.setPosition(pos.x, pos.y);

        if (isTopDown) {
          elem.sprite.setDisplaySize(orthoSize, orthoSize);
          const half = orthoSize / 2;
          const corners = [
            { x: pos.x, y: pos.y - half },
            { x: pos.x + half, y: pos.y },
            { x: pos.x, y: pos.y + half },
            { x: pos.x - half, y: pos.y }
          ];
          const neighbours = [[0, -1], [1, 0], [0, 1], [-1, 0]];
          neighbours.forEach(([dx, dy], index) => {
            if (!this.zoneDef.isPath(elem.tx + dx, elem.ty + dy)) {
              const a = corners[index];
              const b = corners[(index + 1) % 4];
              this.roadGraphics.lineBetween(a.x, a.y, b.x, b.y);
            }
          });
        } else {
          elem.sprite.setDisplaySize(TILE.WIDTH, TILE.HEIGHT);
          const corners = [
            { x: pos.x, y: pos.y - TILE.HEIGHT / 2 },
            { x: pos.x + TILE.WIDTH / 2, y: pos.y },
            { x: pos.x, y: pos.y + TILE.HEIGHT / 2 },
            { x: pos.x - TILE.WIDTH / 2, y: pos.y }
          ];
          const neighbours = [[0, -1], [1, 0], [0, 1], [-1, 0]];
          neighbours.forEach(([dx, dy], index) => {
            if (!this.zoneDef.isPath(elem.tx + dx, elem.ty + dy)) {
              const a = corners[index];
              const b = corners[(index + 1) % 4];
              this.roadGraphics.lineBetween(a.x, a.y, b.x, b.y);
            }
          });
        }
      }
    }

    // 3. Reposition Farm Plots
    if (this.farmingSystem) {
      for (const plot of this.farmingSystem.plots.values()) {
        if (typeof plot.updateProjection === 'function') {
          plot.updateProjection(mode);
        }
      }
    }

    // 4. Reposition Buildings and Attached Decorations
    for (const elem of this.buildingElements) {
      const pos = tileToScreen(elem.renderTileX, elem.renderTileY, 0, 0, mode);
      elem.sprite.setPosition(pos.x, pos.y);
      const footY = tileToScreen(elem.centerTileX, elem.bldg.tileY + elem.bldg.footprintH, 0, 0, mode).y;
      elem.propObj.getFootY = () => footY;

      for (const att of elem.attachments) {
        const left = elem.sprite.x - elem.sprite.displayWidth * elem.origin.x;
        const top = elem.sprite.y - elem.sprite.displayHeight * elem.origin.y;
        att.sprite.setPosition(
          left + elem.sprite.displayWidth * att.config.x,
          top + elem.sprite.displayHeight * att.config.y
        );
        att.propObj.getFootY = () => footY + 1;
      }
    }

    // 5. Reposition Trees, Foliage, and Resource Nodes
    for (const elem of this.treeElements) {
      const pos = tileToScreen(elem.tree.tileX, elem.tree.tileY, 0, 0, mode);
      elem.sprite.setPosition(pos.x, pos.y - (elem.offsetY || 0));
      elem.propObj.getFootY = () => pos.y;
    }
  }
}
