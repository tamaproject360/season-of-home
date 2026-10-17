/**
 * zoneDefinitions.js
 * Comprehensive multi-zone topology for Seasons of Home (Lembah Rimbun).
 * Defines 5 standalone, atmospheric zones:
 * 1. ZONE_FARM: Private expanded farmstead with unlimited dynamic tilling.
 * 2. ZONE_COTTAGE: Cozy cottage interior with sleeping bed and nusantara decorations.
 * 3. ZONE_VILLAGE: Village center and market with Nara, Bima, Suri, and festival square.
 * 4. ZONE_LAKE: Vast tranquil lake with extended wooden fishing pier.
 * 5. ZONE_MINE: Mountain foothills and mine cave entrance with rich ore formations.
 */

const contains = (x, y, rect) =>
  x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;

const tree = (tileX, tileY, slender = false) => ({
  textureKey: slender ? 'tree_slender_medium' : 'tree_tropical_large',
  tileX, tileY, displayHeight: slender ? 105 : 125, solid: true
});

const bush = (tileX, tileY, variant = 1) => ({
  textureKey: `foliage_bush_${variant}`, tileX, tileY, displayHeight: 24, solid: false
});

// ==========================================
// 1. ZONE_FARM (Kebun & Pekarangan Privat Joni)
// ==========================================
const farmLanes = [
  { x: 8, y: 10, w: 2, h: 5 },   // Doorstep to lane
  { x: 8, y: 14, w: 24, h: 2 },  // Main garden lane east to village exit
  { x: 15, y: 14, w: 2, h: 18 }  // Garden path south to lake exit
];

export const ZONE_FARM = {
  id: 'farm',
  name: 'Kebun Joni',
  width: 32,
  height: 32,
  spawnPoint: { tileX: 8.5, tileY: 12.5, facing: 'sw' },
  plaza: null,
  isPlaza: () => false,
  isPath: (x, y) => farmLanes.some(lane => contains(x, y, lane)),
  isWater: (x, y) => x >= 4 && x <= 7 && y >= 20 && y <= 24, // Farm pond for watering can refilling
  tillableBounds: { minX: 8, maxX: 29, minY: 7, maxY: 29 },
  isTillable: function (x, y) {
    if (x < this.tillableBounds.minX || x > this.tillableBounds.maxX) return false;
    if (y < this.tillableBounds.minY || y > this.tillableBounds.maxY) return false;
    if (this.isPath(x, y) || this.isWater(x, y)) return false;
    return true;
  },

  buildings: [
    {
      id: 'joni_cottage',
      textureKey: 'joni_cottage',
      tileX: 6,
      tileY: 6,
      footprintW: 4,
      footprintH: 4,
      scale: 0.20,
      isSolid: true,
      origin: { x: 0.5, y: 0.92 }
    }
  ],

  // Initial starter hoed plots for new game (12 plots)
  plots: Array.from({ length: 12 }, (_, index) => ({
    id: `plot_${String(index + 1).padStart(2, '0')}`,
    tileX: 10 + (index % 4),
    tileY: 17 + Math.floor(index / 4),
    initialSoil: 'tilled'
  })),

  trees: [
    // Perimeter fence of trees
    ...[2, 6, 10, 14, 18, 22, 26, 30].map(x => tree(x, 2, x % 4 === 0)),
    ...[6, 10, 18, 22, 26, 30].map(y => tree(2, y, y % 4 === 0)),
    ...[6, 10, 18, 22, 26].map(x => tree(x, 30, x % 4 === 0)),
    ...[6, 10, 18, 22, 26].map(y => tree(30, y, y % 4 === 0)),

    // Garden framing greenery
    tree(5, 5, true),
    tree(11, 5),
    tree(5, 18, true),
    bush(5, 10),
    bush(11, 10, 2),
    bush(12, 19, 3),
    bush(18, 24, 1)
  ],

  resources: [
    { id: 'farm_twig_1', type: 'foraging', itemId: 'wood', count: 2, hits: 1, tileX: 12, tileY: 26, textureKey: 'forage_twig', displayHeight: 22, solid: false },
    { id: 'farm_vine_1', type: 'foraging', itemId: 'fiber', count: 2, hits: 1, tileX: 20, tileY: 27, textureKey: 'forage_vine', displayHeight: 24, solid: false },
    { id: 'farm_herb_1', type: 'foraging', itemId: 'herb', count: 2, hits: 1, tileX: 25, tileY: 10, textureKey: 'forage_vine', displayHeight: 24, solid: false }
  ],

  interactives: [
    {
      id: 'cottage_door',
      tileX: 7.5,
      tileY: 10.5,
      type: 'door',
      targetZone: 'cottage',
      targetSpawn: { tileX: 6.5, tileY: 10.5, facing: 'ne' },
      priority: 60,
      prompt: 'Masuk ke Dalam Pondok [E]'
    },
    {
      id: 'farm_to_village_portal',
      tileX: 31,
      tileY: 15.0,
      type: 'portal',
      targetZone: 'village',
      targetSpawn: { tileX: 2.5, tileY: 16.5, facing: 'se' },
      priority: 55,
      prompt: 'Jalan Menuju Pasar Desa [E]'
    },
    {
      id: 'farm_to_lake_portal',
      tileX: 15.5,
      tileY: 31,
      type: 'portal',
      targetZone: 'lake',
      targetSpawn: { tileX: 15.5, tileY: 2.5, facing: 'se' },
      priority: 55,
      prompt: 'Jalan Menuju Danau Lembah [E]'
    },
    {
      id: 'farm_pond_spot',
      tileX: 6.5,
      tileY: 19.5,
      type: 'water_source',
      priority: 50,
      prompt: 'Kolam Air Segar Kebun [E]'
    }
  ],

  npcs: []
};

// ==========================================
// 2. ZONE_COTTAGE (Interior Pondok Joni)
// ==========================================
export const ZONE_COTTAGE = {
  id: 'cottage',
  name: 'Interior Pondok Joni',
  width: 14,
  height: 14,
  spawnPoint: { tileX: 6.5, tileY: 10.5, facing: 'ne' },
  plaza: null,
  isInterior: true,
  isPlaza: () => false,
  isPath: () => false,
  isWater: () => false,
  isTillable: () => false,

  buildings: [
    {
      id: 'joni_bed',
      textureKey: 'joni_bed',
      tileX: 4,
      tileY: 4,
      footprintW: 2,
      footprintH: 3,
      scale: 0.22,
      isSolid: true,
      origin: { x: 0.5, y: 0.85 }
    },
    {
      id: 'woven_rug',
      textureKey: 'woven_rug',
      tileX: 6,
      tileY: 6,
      footprintW: 2,
      footprintH: 2,
      scale: 0.20,
      isSolid: false,
      groundProp: true,
      origin: { x: 0.5, y: 0.5 }
    },
    {
      id: 'plant_pot',
      textureKey: 'plant_pot',
      tileX: 8,
      tileY: 4,
      footprintW: 1,
      footprintH: 1,
      scale: 0.16,
      isSolid: true,
      origin: { x: 0.5, y: 0.85 }
    }
  ],

  plots: [],
  trees: [],
  resources: [],

  interactives: [
    {
      id: 'cottage_bed',
      tileX: 4.5,
      tileY: 5.5,
      type: 'bed',
      priority: 60,
      prompt: 'Istirahat di Ranjang Pondok [E]'
    },
    {
      id: 'cottage_exit_door',
      tileX: 6.5,
      tileY: 11.5,
      type: 'door',
      targetZone: 'farm',
      targetSpawn: { tileX: 8.5, tileY: 11.5, facing: 'sw' },
      priority: 60,
      prompt: 'Keluar ke Kebun [E]'
    }
  ],

  npcs: []
};

// ==========================================
// 3. ZONE_VILLAGE (Pasar & Alun-Alun Desa)
// ==========================================
const villagePlaza = { tileX: 13, tileY: 12, width: 8, height: 8 };
const villageLanes = [
  { x: 1, y: 15, w: 13, h: 2 },   // West entrance from farm
  { x: 16, y: 2, w: 2, h: 11 },   // North entrance from mountain/mine
  { x: 16, y: 19, w: 2, h: 14 },  // South entrance to lake
  { x: 9, y: 12, w: 5, h: 2 },    // Nara stall doorstep connecting to plaza
  { x: 20, y: 12, w: 5, h: 2 },   // Bima workshop doorstep connecting to plaza
  { x: 18, y: 19, w: 2, h: 4 }    // Suri pavilion doorstep connecting to plaza
];

export const ZONE_VILLAGE = {
  id: 'village',
  name: 'Pasar & Alun-Alun Desa',
  width: 34,
  height: 34,
  spawnPoint: { tileX: 3.5, tileY: 16.0, facing: 'se' },
  plaza: villagePlaza,
  isPlaza: (x, y) => contains(x, y, villagePlaza),
  isPath: (x, y) => villageLanes.some(lane => contains(x, y, lane)) || contains(x, y, villagePlaza),
  isWater: () => false,
  isTillable: () => false,

  buildings: [
    {
      id: 'nara_stall',
      textureKey: 'nara_stall',
      tileX: 8,
      tileY: 8,
      footprintW: 4,
      footprintH: 4,
      scale: 0.18,
      isSolid: true,
      origin: { x: 0.5, y: 0.90 },
      attachments: [
        { textureKey: 'lantern_unlit', x: 0.09, y: 0.46, height: 22 },
        { textureKey: 'lantern_unlit', x: 0.59, y: 0.60, height: 22 }
      ]
    },
    {
      id: 'bima_workshop',
      textureKey: 'bima_workshop',
      tileX: 22,
      tileY: 8,
      footprintW: 4,
      footprintH: 4,
      scale: 0.20,
      isSolid: true,
      origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'suri_pavilion',
      textureKey: 'suri_pavilion',
      tileX: 20,
      tileY: 20,
      footprintW: 3,
      footprintH: 3,
      scale: 0.15,
      isSolid: true,
      origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'forest_gateway',
      textureKey: 'forest_gateway',
      tileX: 15,
      tileY: 1,
      footprintW: 4,
      footprintH: 2,
      scale: 0.16,
      isSolid: false,
      origin: { x: 0.5, y: 0.90 },
      collisionCells: [{ x: 0, y: 1 }, { x: 3, y: 1 }]
    }
  ],

  plots: [],

  trees: [
    ...[2, 6, 26, 30].map(x => tree(x, 3)),
    ...[6, 10, 22, 26, 30].map(y => tree(2, y)),
    ...[6, 10, 22, 26, 30].map(y => tree(31, y)),
    ...[6, 10, 22, 26].map(x => tree(x, 31)),
    tree(6, 18, true),
    tree(27, 18, true),
    bush(7, 13),
    bush(26, 11, 2),
    bush(19, 25, 3),
    bush(25, 23, 1)
  ],

  resources: [
    { id: 'village_twig_1', type: 'foraging', itemId: 'wood', count: 2, hits: 1, tileX: 5, tileY: 25, textureKey: 'forage_twig', displayHeight: 22, solid: false },
    { id: 'village_herb_1', type: 'foraging', itemId: 'herb', count: 2, hits: 1, tileX: 25, tileY: 25, textureKey: 'forage_vine', displayHeight: 24, solid: false }
  ],

  interactives: [
    {
      id: 'nara_shop',
      tileX: 9.5,
      tileY: 13.5,
      type: 'shop',
      priority: 50,
      prompt: 'Kios Nara [E]'
    },
    {
      id: 'bima_anvil',
      tileX: 24.5,
      tileY: 12.5,
      type: 'crafting',
      priority: 50,
      prompt: 'Meja Kerajinan Bima [E]'
    },
    {
      id: 'festival_board',
      tileX: 17.0,
      tileY: 16.0,
      type: 'festival',
      priority: 45,
      prompt: 'Papan Festival Panen [E]'
    },
    {
      id: 'village_to_farm_portal',
      tileX: 1.5,
      tileY: 15.5,
      type: 'portal',
      targetZone: 'farm',
      targetSpawn: { tileX: 30.5, tileY: 15.0, facing: 'sw' },
      priority: 55,
      prompt: 'Kembali ke Kebun Joni [E]'
    },
    {
      id: 'village_to_mine_portal',
      tileX: 16.5,
      tileY: 2.0,
      type: 'portal',
      targetZone: 'mine',
      targetSpawn: { tileX: 15.5, tileY: 29.5, facing: 'ne' },
      priority: 55,
      prompt: 'Gerbang Hutan ke Gunung & Tambang [E]'
    },
    {
      id: 'village_to_lake_portal',
      tileX: 16.5,
      tileY: 32.5,
      type: 'portal',
      targetZone: 'lake',
      targetSpawn: { tileX: 23.5, tileY: 2.5, facing: 'se' },
      priority: 55,
      prompt: 'Jalan Menuju Danau Lembah [E]'
    }
  ],

  npcs: [
    {
      id: 'suri',
      name: 'Nenek Suri',
      title: 'Pemandu Kebun Komunitas',
      workplaceId: 'suri_pavilion',
      tileX: 21.5,
      tileY: 24.5,
      facing: 'se'
    },
    {
      id: 'bima',
      name: 'Paman Bima',
      title: 'Pandai Besi & Tukang Kayu',
      workplaceId: 'bima_workshop',
      tileX: 25.5,
      tileY: 12.5,
      facing: 'sw'
    },
    {
      id: 'nara',
      name: 'Nara',
      title: 'Pengelola Kios Desa',
      workplaceId: 'nara_stall',
      tileX: 8.5,
      tileY: 14.0,
      facing: 'sw'
    }
  ]
};

// ==========================================
// 4. ZONE_LAKE (Danau Lembah & Dermaga Memancing)
// ==========================================
const lakeLanes = [
  { x: 14, y: 1, w: 3, h: 9 },   // North entrance from farm
  { x: 22, y: 1, w: 3, h: 9 },   // North entrance from village
  { x: 14, y: 9, w: 10, h: 2 }   // Shoreline promenade
];

export const ZONE_LAKE = {
  id: 'lake',
  name: 'Danau Lembah',
  width: 32,
  height: 32,
  spawnPoint: { tileX: 15.5, tileY: 3.5, facing: 'se' },
  plaza: null,
  isPlaza: () => false,
  isPath: (x, y) => lakeLanes.some(lane => contains(x, y, lane)),
  isWater: (x, y) => x >= 4 && x <= 27 && y >= 12 && y <= 30,
  isTillable: () => false,

  buildings: [
    {
      id: 'fishing_pier',
      textureKey: 'fishing_pier',
      tileX: 14,
      tileY: 10,
      footprintW: 3,
      footprintH: 10,
      renderAnchor: { tileX: 15.5, tileY: 15.0 },
      scale: 0.16,
      flipX: true,
      groundProp: true,
      isSolid: false,
      origin: { x: 0.5, y: 0.42 },
      walkableCells: Array.from({ length: 30 }, (_, i) => ({ x: i % 3, y: Math.floor(i / 3) }))
    }
  ],

  plots: [],

  trees: [
    ...[2, 6, 10, 19, 26, 30].map(x => tree(x, 2)),
    ...[6, 10, 14, 18, 22, 26].map(y => tree(2, y)),
    ...[6, 10, 14, 18, 22, 26].map(y => tree(29, y)),
    bush(11, 8),
    bush(18, 8, 2),
    bush(25, 8, 3)
  ],

  resources: [
    { id: 'lake_twig_1', type: 'foraging', itemId: 'wood', count: 3, hits: 1, tileX: 8, tileY: 8, textureKey: 'forage_twig', displayHeight: 22, solid: false },
    { id: 'lake_vine_1', type: 'foraging', itemId: 'fiber', count: 2, hits: 1, tileX: 23, tileY: 9, textureKey: 'forage_vine', displayHeight: 24, solid: false }
  ],

  interactives: [
    {
      id: 'fishing_spot',
      tileX: 15.5,
      tileY: 19.5,
      type: 'fishing',
      priority: 55,
      prompt: 'Dermaga Memancing Ikan Nila [E]'
    },
    {
      id: 'lake_to_farm_portal',
      tileX: 15.5,
      tileY: 1.5,
      type: 'portal',
      targetZone: 'farm',
      targetSpawn: { tileX: 15.5, tileY: 30.0, facing: 'ne' },
      priority: 55,
      prompt: 'Kembali ke Kebun Joni [E]'
    },
    {
      id: 'lake_to_village_portal',
      tileX: 23.5,
      tileY: 1.5,
      type: 'portal',
      targetZone: 'village',
      targetSpawn: { tileX: 16.5, tileY: 31.5, facing: 'ne' },
      priority: 55,
      prompt: 'Menuju Pasar & Desa [E]'
    }
  ],

  npcs: []
};

// ==========================================
// 5. ZONE_MINE (Kaki Gunung & Gua Tambang)
// ==========================================
const mineLanes = [
  { x: 14, y: 4, w: 4, h: 27 } // Mountain trail climbing south to north
];

export const ZONE_MINE = {
  id: 'mine',
  name: 'Kaki Gunung & Gua Tambang',
  width: 32,
  height: 32,
  spawnPoint: { tileX: 15.5, tileY: 29.5, facing: 'ne' },
  plaza: null,
  isPlaza: () => false,
  isPath: (x, y) => mineLanes.some(lane => contains(x, y, lane)),
  isWater: () => false,
  isTillable: () => false,

  buildings: [
    {
      id: 'mine_gateway',
      textureKey: 'forest_gateway',
      tileX: 14,
      tileY: 3,
      footprintW: 4,
      footprintH: 2,
      scale: 0.18,
      isSolid: false,
      origin: { x: 0.5, y: 0.90 }
    }
  ],

  plots: [],

  trees: [
    ...[2, 6, 10, 22, 26, 30].map(x => tree(x, 2, true)),
    ...[6, 10, 14, 18, 22, 26].map(y => tree(2, y, true)),
    ...[6, 10, 14, 18, 22, 26].map(y => tree(29, y, true)),
    bush(10, 12),
    bush(22, 16, 2),
    bush(11, 24, 3)
  ],

  resources: [
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `mine_ore_node_0${i + 1}`,
      type: 'mining',
      itemId: i % 2 === 0 ? 'ore' : 'stone',
      count: i % 2 === 0 ? 2 : 3,
      hits: 3,
      tileX: 8 + (i % 2) * 14 + (i > 3 ? 2 : 0),
      tileY: 8 + Math.floor(i / 2) * 5,
      textureKey: 'ore_node_intact',
      displayHeight: 32,
      solid: true
    })),
    { id: 'mine_mushroom_1', type: 'foraging', itemId: 'mushroom', count: 3, hits: 1, tileX: 20, tileY: 10, textureKey: 'forage_mushroom', displayHeight: 22, solid: false },
    { id: 'mine_mushroom_2', type: 'foraging', itemId: 'mushroom', count: 2, hits: 1, tileX: 11, tileY: 20, textureKey: 'forage_mushroom', displayHeight: 22, solid: false }
  ],

  interactives: [
    {
      id: 'mine_cave_portal',
      tileX: 15.5,
      tileY: 4.5,
      type: 'portal',
      priority: 60,
      prompt: 'Mulut Gua Tambang Lembah [E]'
    },
    {
      id: 'mine_to_village_portal',
      tileX: 15.5,
      tileY: 31.0,
      type: 'portal',
      targetZone: 'village',
      targetSpawn: { tileX: 16.5, tileY: 3.5, facing: 'sw' },
      priority: 55,
      prompt: 'Kembali ke Pasar Desa [E]'
    }
  ],

  npcs: []
};

// Zone Registry Dictionary
export const ZONES = {
  farm: ZONE_FARM,
  cottage: ZONE_COTTAGE,
  village: ZONE_VILLAGE,
  lake: ZONE_LAKE,
  mine: ZONE_MINE
};

/**
 * Get Zone definition by id with fallback to ZONE_FARM.
 * @param {string} id
 * @returns {typeof ZONE_FARM}
 */
export function getZoneDefinition(id) {
  return ZONES[id] || ZONE_FARM;
}
