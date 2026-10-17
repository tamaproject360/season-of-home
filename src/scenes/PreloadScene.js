/**
 * PreloadScene
 * Loads all game assets generated and organized in the asset directory.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    console.log('[PreloadScene] Loading game assets...');

    // Progress bar display
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x304B43, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xBC7654, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 - 10, 310 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // 1. Character Spritesheets (4x4 uniform 313x313 frames)
    const charSheets = ['joni', 'nara', 'bima', 'suri', 'kiko'];
    charSheets.forEach(char => {
      this.load.spritesheet(`${char}_spritesheet`, `asset/characters/${char}_spritesheet.png`, {
        frameWidth: 313,
        frameHeight: 313
      });
    });

    // 2. Character Portraits
    this.load.image('joni_bust', 'asset/characters/portraits/joni_bust.png');
    this.load.image('nara_bust', 'asset/characters/portraits/nara_bust.png');
    this.load.image('bima_bust', 'asset/characters/portraits/bima_bust.png');
    this.load.image('suri_bust', 'asset/characters/portraits/suri_bust.png');
    this.load.image('kiko_bust', 'asset/characters/portraits/kiko_bust.png');

    // 3. Buildings
    this.load.image('joni_cottage', 'asset/building/joni_cottage.png');
    this.load.image('cottage_interior', 'asset/building/cottage_interior.png');
    this.load.image('bima_workshop', 'asset/building/bima_workshop.png');
    this.load.image('nara_stall', 'asset/building/nara_stall.png');
    this.load.image('suri_pavilion', 'asset/building/suri_pavilion.png');
    this.load.image('forest_gateway', 'asset/building/forest_gateway.png');

    // 4. Terrain & Farm plots
    this.load.image('grass_tile', 'asset/terrain/grass_tile.png');
    this.load.image('dirt_path_tile', 'asset/terrain/dirt_path_tile.png');
    this.load.image('farmland_plots', 'asset/terrain/farmland_plots.png');
    this.load.image('plot_tilled', 'asset/terrain/plot_tilled.png');
    this.load.image('plot_watered', 'asset/terrain/plot_watered.png');
    this.load.image('plot_untilled', 'asset/terrain/plot_untilled.png');
    this.load.image('fishing_pier', 'asset/terrain/fishing_pier.png');

    // 5. Nature & Vegetation
    this.load.image('tree_tropical_large', 'asset/nature/tree_tropical_large.png');
    this.load.image('tree_slender_medium', 'asset/nature/tree_slender_medium.png');
    this.load.image('foliage_bush_1', 'asset/nature/foliage_bush_1.png');
    this.load.image('foliage_bush_2', 'asset/nature/foliage_bush_2.png');
    this.load.image('foliage_bush_3', 'asset/nature/foliage_bush_3.png');
    this.load.image('fallen_log', 'asset/nature/fallen_log.png');
    this.load.image('mining_ore_node', 'asset/nature/mining_ore_node.png');
    this.load.image('lantern_unlit', 'asset/nature/lantern_unlit.png');
    this.load.image('lantern_lit', 'asset/nature/lantern_lit.png');

    // 6. Crops & Stages
    for (let s = 1; s <= 4; s++) {
      this.load.image(`crop_sunroot_stage${s}`, `asset/crops/crop_sunroot_stage${s}.png`);
      this.load.image(`crop_mossberry_stage${s}`, `asset/crops/crop_mossberry_stage${s}.png`);
      this.load.image(`crop_goldenleaf_stage${s}`, `asset/crops/crop_goldenleaf_stage${s}.png`);
    }

    // 7. Items, Tools & Furniture
    this.load.image('tool_hoe', 'asset/items/tool_hoe.png');
    this.load.image('tool_watering_can', 'asset/items/tool_watering_can.png');
    this.load.image('tool_reinforced_can', 'asset/items/tool_reinforced_can.png');
    this.load.image('tool_fishing_rod', 'asset/items/tool_fishing_rod.png');
    this.load.image('ui_leafcoin', 'asset/items/ui_leafcoin.png');
    this.load.image('joni_bed', 'asset/building/joni_bed.png');
    this.load.image('woven_rug', 'asset/building/woven_rug.png');
    this.load.image('plant_pot', 'asset/building/plant_pot.png');
  }

  create() {
    console.log('[PreloadScene] Assets loaded successfully.');
    this.scene.start('TitleScene');
  }
}
