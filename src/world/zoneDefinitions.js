/**
 * Zone Definitions
 * Data-driven definitions of game zones, ground terrain, buildings, and interactive props.
 * Expansive 32x32 world uniting Joni's Farmstead, Desa Rimbun Plaza, Lake Pier, and Forest Gateway.
 */
export const ZONE_FARM = {
  id: 'farm',
  name: 'Lembah Rimbun & Kebun Joni',
  width: 32,
  height: 32,
  spawnPoint: { tileX: 7.5, tileY: 7.5, facing: 'se' },

  // Ground Path evaluation
  isPath: (tx, ty) => {
    // 1. Joni's cottage path to main road
    if (tx === 7 && ty >= 6 && ty <= 8) return true;
    // 2. Main East-West road connecting Farmstead to Village Plaza
    if (ty === 8 && tx >= 7 && tx <= 26) return true;
    // 3. South road leading past Farmland towards Fishing Lake
    if (tx === 7 && ty >= 8 && ty <= 22) return true;
    // 4. Path leading up to Suri's Pavilion
    if (tx === 13 && ty >= 6 && ty <= 8) return true;
    // 5. Path branching South-East to Bima's Workshop
    if (tx === 20 && ty >= 8 && ty <= 18) return true;
    // 6. Path heading East to Forest Gateway
    if (ty === 13 && tx >= 23 && tx <= 28) return true;
    if (tx === 23 && ty >= 8 && ty <= 13) return true;
    // 7. Village Plaza Courtyard paved ground
    if (tx >= 21 && tx <= 25 && ty >= 7 && ty <= 10) return true;
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
      tileX: 6,
      tileY: 4,
      footprintW: 3,
      footprintH: 3,
      scale: 0.23,
      isSolid: true,
      origin: { x: 0.5, y: 0.92 }
    },
    {
      id: 'suri_pavilion',
      textureKey: 'suri_pavilion',
      tileX: 12,
      tileY: 4,
      footprintW: 3,
      footprintH: 3,
      scale: 0.22,
      isSolid: true,
      origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'nara_stall',
      textureKey: 'nara_stall',
      tileX: 22,
      tileY: 5,
      footprintW: 3,
      footprintH: 3,
      scale: 0.22,
      isSolid: true,
      origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'bima_workshop',
      textureKey: 'bima_workshop',
      tileX: 19,
      tileY: 14,
      footprintW: 3,
      footprintH: 3,
      scale: 0.23,
      isSolid: true,
      origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'forest_gateway',
      textureKey: 'forest_gateway',
      tileX: 28,
      tileY: 12,
      footprintW: 2,
      footprintH: 2,
      scale: 0.23,
      isSolid: true,
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

  // 12 Farmland plots (3 columns x 4 rows)
  plots: [
    { id: 'plot_01', tileX: 4, tileY: 10 },
    { id: 'plot_02', tileX: 5, tileY: 10 },
    { id: 'plot_03', tileX: 6, tileY: 10 },
    { id: 'plot_04', tileX: 4, tileY: 11 },
    { id: 'plot_05', tileX: 5, tileY: 11 },
    { id: 'plot_06', tileX: 6, tileY: 11 },
    { id: 'plot_07', tileX: 4, tileY: 12 },
    { id: 'plot_08', tileX: 5, tileY: 12 },
    { id: 'plot_09', tileX: 6, tileY: 12 },
    { id: 'plot_10', tileX: 4, tileY: 13 },
    { id: 'plot_11', tileX: 5, tileY: 13 },
    { id: 'plot_12', tileX: 6, tileY: 13 }
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
    { textureKey: 'foliage_bush_2', tileX: 8, tileY: 9 },
    { textureKey: 'foliage_bush_3', tileX: 14, tileY: 8 },
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

    // Harvest Festival Lanterns in Village Plaza
    { textureKey: 'harvest_lantern', tileX: 19, tileY: 7 },
    { textureKey: 'harvest_lantern', tileX: 25, tileY: 7 },
    { textureKey: 'harvest_lantern', tileX: 19, tileY: 10 },
    { textureKey: 'harvest_lantern', tileX: 25, tileY: 10 }
  ],

  // Interactive points
  interactives: [
    {
      id: 'cottage_door',
      tileX: 7,
      tileY: 6.8,
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
      tileY: 17,
      type: 'crafting',
      priority: 50,
      prompt: 'Meja Kerajinan Bengkel Bima [E]'
    },
    {
      id: 'nara_shop',
      tileX: 23,
      tileY: 7.5,
      type: 'shop',
      priority: 50,
      prompt: 'Kios Pasar Desa Nara [E]'
    },
    {
      id: 'forest_gate',
      tileX: 28,
      tileY: 13,
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
      tileX: 13,
      tileY: 7,
      facing: 'sw'
    },
    {
      id: 'bima',
      name: 'Paman Bima',
      title: 'Pandai Besi & Tukang Kayu',
      tileX: 20,
      tileY: 18,
      facing: 'nw'
    },
    {
      id: 'nara',
      name: 'Nara',
      title: 'Pengelola Kios Desa',
      tileX: 23,
      tileY: 8,
      facing: 'sw'
    }
  ]
};
