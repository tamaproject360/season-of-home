/**
 * Zone Definitions
 * Data-driven definitions of game zones, ground terrain, buildings, and interactive props.
 * 32x32 world joining Joni's Farmstead, the village hub, Lake Pier, and Forest Gateway.
 */
export const ZONE_FARM = {
  id: 'farm',
  name: 'Lembah Rimbun & Kebun Joni',
  width: 32,
  height: 32,
  spawnPoint: { tileX: 7.5, tileY: 9.5, facing: 'se' },

  // Ground Path evaluation
  isPath: (tx, ty) => {
    // Main lane through the farmyard to the village plaza.
    if (ty === 9 && tx >= 6 && tx <= 29) return true;

    // Cottage entrance and the lane beside the community plots.
    if (tx === 6 && ty >= 7 && ty <= 14) return true;

    // Short approach to Suri's pavilion; the path stays outside its footprint.
    if (tx === 14 && ty >= 7 && ty <= 9) return true;

    // Bima's workshop has a clear approach along its east side.
    if (tx === 21 && ty >= 9 && ty <= 18) return true;

    // Village plaza and its eastbound exit road.
    if (tx >= 20 && tx <= 24 && ty >= 9 && ty <= 11) return true;

    // South trail to the fishing pier.
    if (tx === 7 && ty >= 9 && ty <= 22) return true;
    return false;
  },

  // Pond Water evaluation (South-West)
  isWater: (tx, ty) => {
    // Lake boundary around x:4..11, y:22..27
    if (tx >= 4 && tx <= 11 && ty >= 22 && ty <= 27) {
      // Keep wooden pier walkway accessible
      if (tx >= 7 && tx <= 8 && ty >= 22 && ty <= 24) return false;
      return true;
    }
    return false;
  },

  // Static Buildings & Key Structures
  buildings: [
    {
      id: 'joni_cottage',
      textureKey: 'joni_cottage',
      tileX: 5,
      tileY: 4,
      footprintW: 3,
      footprintH: 3,
      scale: 0.17,
      isSolid: true,
      origin: { x: 0.5, y: 0.92 }
    },
    {
      id: 'suri_pavilion',
      textureKey: 'suri_pavilion',
      tileX: 11,
      tileY: 4,
      footprintW: 3,
      footprintH: 3,
      scale: 0.18,
      isSolid: true,
      origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'nara_stall',
      textureKey: 'nara_stall',
      tileX: 19,
      tileY: 5,
      footprintW: 3,
      footprintH: 3,
      scale: 0.18,
      isSolid: true,
      origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'bima_workshop',
      textureKey: 'bima_workshop',
      tileX: 18,
      tileY: 13,
      footprintW: 3,
      footprintH: 3,
      scale: 0.17,
      isSolid: true,
      origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'forest_gateway',
      textureKey: 'forest_gateway',
      tileX: 27,
      tileY: 7,
      footprintW: 2,
      footprintH: 2,
      scale: 0.14,
      // Keep the arch opening traversable so the forest path can pass through.
      isSolid: false,
      origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'fishing_pier',
      textureKey: 'fishing_pier',
      tileX: 6,
      tileY: 22,
      footprintW: 3,
      footprintH: 2,
      scale: 0.22,
      isSolid: false,
      origin: { x: 0.5, y: 0.88 }
    }
  ],

  // 12 Farmland plots (3 columns x 4 rows), set beside the cottage lane.
  plots: [
    { id: 'plot_01', tileX: 3, tileY: 11 },
    { id: 'plot_02', tileX: 4, tileY: 11 },
    { id: 'plot_03', tileX: 5, tileY: 11 },
    { id: 'plot_04', tileX: 3, tileY: 12 },
    { id: 'plot_05', tileX: 4, tileY: 12 },
    { id: 'plot_06', tileX: 5, tileY: 12 },
    { id: 'plot_07', tileX: 3, tileY: 13 },
    { id: 'plot_08', tileX: 4, tileY: 13 },
    { id: 'plot_09', tileX: 5, tileY: 13 },
    { id: 'plot_10', tileX: 3, tileY: 14 },
    { id: 'plot_11', tileX: 4, tileY: 14 },
    { id: 'plot_12', tileX: 5, tileY: 14 }
  ],

  // Vegetation, Nature Props, Mining Nodes, Lanterns & Logs
  trees: [
    // Perimeter boundary trees (North & West)
    { textureKey: 'tree_tropical_large', tileX: 1, tileY: 1 },
    { textureKey: 'tree_slender_medium', tileX: 5, tileY: 1 },
    { textureKey: 'tree_tropical_large', tileX: 10, tileY: 1 },
    { textureKey: 'tree_slender_medium', tileX: 17, tileY: 1 },
    { textureKey: 'tree_tropical_large', tileX: 25, tileY: 1 },
    { textureKey: 'tree_slender_medium', tileX: 30, tileY: 1 },
    { textureKey: 'tree_tropical_large', tileX: 1, tileY: 5 },
    { textureKey: 'tree_slender_medium', tileX: 1, tileY: 11 },
    { textureKey: 'tree_tropical_large', tileX: 1, tileY: 17 },
    { textureKey: 'tree_slender_medium', tileX: 1, tileY: 24 },
    { textureKey: 'tree_tropical_large', tileX: 1, tileY: 30 },

    // Perimeter boundary trees (East & South)
    { textureKey: 'tree_tropical_large', tileX: 30, tileY: 5 },
    { textureKey: 'tree_slender_medium', tileX: 30, tileY: 10 },
    { textureKey: 'tree_tropical_large', tileX: 30, tileY: 18 },
    { textureKey: 'tree_slender_medium', tileX: 30, tileY: 25 },
    { textureKey: 'tree_tropical_large', tileX: 30, tileY: 30 },
    { textureKey: 'tree_slender_medium', tileX: 6, tileY: 30 },
    { textureKey: 'tree_tropical_large', tileX: 14, tileY: 30 },
    { textureKey: 'tree_slender_medium', tileX: 20, tileY: 30 },
    { textureKey: 'tree_tropical_large', tileX: 26, tileY: 30 },

    // Forest grove near Gateway
    { textureKey: 'tree_tropical_large', tileX: 26, tileY: 15 },
    { textureKey: 'tree_slender_medium', tileX: 28, tileY: 18 },
    { textureKey: 'tree_tropical_large', tileX: 26, tileY: 20 },

    // Grove around lake & orchards
    { textureKey: 'tree_slender_medium', tileX: 10, tileY: 3 },
    { textureKey: 'tree_tropical_large', tileX: 16, tileY: 3 },
    { textureKey: 'tree_slender_medium', tileX: 3, tileY: 15 },
    { textureKey: 'tree_tropical_large', tileX: 3, tileY: 20 },
    { textureKey: 'tree_slender_medium', tileX: 12, tileY: 20 },

    // Bushes & foliage (walkable decor)
    { textureKey: 'foliage_bush_1', tileX: 3, tileY: 7 },
    { textureKey: 'foliage_bush_2', tileX: 8, tileY: 7 },
    { textureKey: 'foliage_bush_3', tileX: 16, tileY: 7 },
    { textureKey: 'foliage_bush_1', tileX: 18, tileY: 6 },
    { textureKey: 'foliage_bush_2', tileX: 26, tileY: 5 },
    { textureKey: 'foliage_bush_3', tileX: 22, tileY: 12 },
    { textureKey: 'foliage_bush_1', tileX: 18, tileY: 19 },
    { textureKey: 'foliage_bush_2', tileX: 23, tileY: 19 },
    { textureKey: 'foliage_bush_3', tileX: 12, tileY: 25 },

    // Fallen logs for gathering
    { textureKey: 'fallen_log', tileX: 12, tileY: 18 },
    { textureKey: 'fallen_log', tileX: 16, tileY: 25 },
    { textureKey: 'fallen_log', tileX: 5, tileY: 19 },

    // Mining ore nodes in mountain foothills
    { textureKey: 'mining_ore_node', tileX: 27, tileY: 23 },
    { textureKey: 'mining_ore_node', tileX: 29, tileY: 21 },
    { textureKey: 'mining_ore_node', tileX: 25, tileY: 26 },

    // Small, unlit lanterns decorate the plaza perimeter without blocking paths.
    { textureKey: 'lantern_unlit', tileX: 20, tileY: 8, scale: 0.035, originY: 1, offsetY: 24, solid: false },
    { textureKey: 'lantern_unlit', tileX: 24, tileY: 8, scale: 0.035, originY: 1, offsetY: 24, solid: false },
    { textureKey: 'lantern_unlit', tileX: 20, tileY: 12, scale: 0.035, originY: 1, offsetY: 24, solid: false },
    { textureKey: 'lantern_unlit', tileX: 24, tileY: 12, scale: 0.035, originY: 1, offsetY: 24, solid: false }
  ],

  // Interactive points
  interactives: [
    {
      id: 'cottage_door',
      tileX: 7,
      tileY: 7,
      type: 'door',
      prompt: 'Pintu Masuk Pondok'
    },
    {
      id: 'cottage_bed',
      tileX: 6,
      tileY: 6.8,
      type: 'bed',
      priority: 60,
      prompt: 'Tidur di Kasur [E]'
    },
    {
      id: 'fishing_spot',
      tileX: 8,
      tileY: 22.5,
      type: 'fishing',
      priority: 55,
      prompt: 'Dermaga Pancing Kolam Nila [E]'
    },
    {
      id: 'bima_anvil',
      tileX: 20,
      tileY: 16,
      type: 'crafting',
      priority: 50,
      prompt: 'Meja Kerajinan Bengkel Bima [E]'
    },
    {
      id: 'nara_shop',
      tileX: 22,
      tileY: 8,
      type: 'shop',
      priority: 50,
      prompt: 'Kios Pasar Desa Nara [E]'
    },
    {
      id: 'forest_gate',
      tileX: 29,
      tileY: 9,
      type: 'portal',
      prompt: 'Gerbang Hutan Lumut'
    }
  ],

  // Villager NPCs (Task 50)
  npcs: [
    {
      id: 'suri',
      name: 'Nenek Suri',
      title: 'Pemandu Kebun Komunitas',
      workplaceId: 'suri_pavilion',
      tileX: 13,
      tileY: 8,
      facing: 'sw'
    },
    {
      id: 'bima',
      name: 'Paman Bima',
      title: 'Pandai Besi & Tukang Kayu',
      workplaceId: 'bima_workshop',
      tileX: 20,
      tileY: 17,
      facing: 'nw'
    },
    {
      id: 'nara',
      name: 'Nara',
      title: 'Pengelola Kios Desa',
      workplaceId: 'nara_stall',
      tileX: 21,
      tileY: 8,
      facing: 'sw'
    }
  ]
};
