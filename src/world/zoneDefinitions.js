/**
 * Hand-authored village plan. Coordinates describe ground footprints, not roofs.
 * Farmstead west, shops around the central green, forest gate north, lake south.
 */
const plaza = { tileX: 17, tileY: 14, width: 7, height: 6 };
const lanes = [
  { x: 8, y: 14, w: 18, h: 2 },  // Farmstead -> village square
  { x: 16, y: 0, w: 2, h: 15 }, // North entrance -> square
  { x: 8, y: 11, w: 2, h: 4 },  // Cottage doorstep
  { x: 9, y: 15, w: 2, h: 10 }, // Farm lane stops before the grassy pond bank
  { x: 22, y: 12, w: 2, h: 3 }, // Market forecourt
  { x: 24, y: 15, w: 2, h: 11 },// Square -> workshop lane
  { x: 24, y: 24, w: 6, h: 2 }, // Workshop forecourt
  { x: 28, y: 22, w: 2, h: 3 }, // Workshop doorstep
  { x: 11, y: 24, w: 1, h: 2 }, // Lake-side bend around the pavilion
  { x: 11, y: 25, w: 5, h: 1 }, // Garden pavilion approach
  { x: 14, y: 25, w: 2, h: 3 }  // Pavilion doorstep
];
const contains = (x, y, rect) =>
  x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
const tree = (tileX, tileY, slender = false) => ({
  textureKey: slender ? 'tree_slender_medium' : 'tree_tropical_large',
  tileX, tileY, displayHeight: slender ? 105 : 125, solid: true
});
const bush = (tileX, tileY, variant = 1) => ({
  textureKey: `foliage_bush_${variant}`, tileX, tileY, displayHeight: 24, solid: false
});

export const ZONE_FARM = {
  id: 'farm',
  name: 'Desa Rimbun & Kebun Joni',
  width: 36,
  height: 36,
  spawnPoint: { tileX: 9.5, tileY: 13.5, facing: 'sw' },
  plaza,
  isPlaza: (x, y) => contains(x, y, { x: plaza.tileX, y: plaza.tileY, w: plaza.width, h: plaza.height }),
  isPath: (x, y) => lanes.some(lane => contains(x, y, lane)) ||
    contains(x, y, { x: plaza.tileX, y: plaza.tileY, w: plaza.width, h: plaza.height }),
  isWater: (x, y) => {
    if (x < 4 || x > 12 || y < 26 || y > 32) return false;
    // Rounded shore. The deck is a separate walkable layer ABOVE the water.
    if ((x === 4 || x === 12) && (y === 26 || y === 32)) return false;
    return true;
  },

  buildings: [
    {
      id: 'joni_cottage', textureKey: 'joni_cottage',
      tileX: 7, tileY: 7, footprintW: 4, footprintH: 4,
      scale: 0.20, isSolid: true, origin: { x: 0.5, y: 0.92 }
    },
    {
      id: 'suri_pavilion', textureKey: 'suri_pavilion',
      tileX: 12, tileY: 22, footprintW: 3, footprintH: 3,
      scale: 0.15, isSolid: true, origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'nara_stall', textureKey: 'nara_stall',
      tileX: 20, tileY: 8, footprintW: 4, footprintH: 4,
      scale: 0.18, isSolid: true, origin: { x: 0.5, y: 0.90 },
      // Hanging lamps are attached to stall posts, never placed on the ground.
      attachments: [
        { textureKey: 'lantern_unlit', x: 0.09, y: 0.46, height: 22 },
        { textureKey: 'lantern_unlit', x: 0.59, y: 0.60, height: 22 }
      ]
    },
    {
      id: 'bima_workshop', textureKey: 'bima_workshop',
      tileX: 26, tileY: 18, footprintW: 4, footprintH: 4,
      scale: 0.20, isSolid: true, origin: { x: 0.5, y: 0.90 }
    },
    {
      id: 'forest_gateway', textureKey: 'forest_gateway',
      tileX: 15, tileY: 1, footprintW: 4, footprintH: 2,
      scale: 0.16, isSolid: false, origin: { x: 0.5, y: 0.90 },
      collisionCells: [{ x: 0, y: 1 }, { x: 3, y: 1 }]
    },
    {
      id: 'fishing_pier', textureKey: 'fishing_pier',
      tileX: 9, tileY: 26, footprintW: 2, footprintH: 4,
      renderAnchor: { tileX: 9.5, tileY: 27.5 },
      scale: 0.13, flipX: true, groundProp: true,
      isSolid: false, origin: { x: 0.5, y: 0.42 },
      walkableCells: Array.from({ length: 8 }, (_, i) => ({ x: i % 2, y: Math.floor(i / 2) }))
    }
  ],

  // A compact 4x3 field with a service lane beside it, in the cottage's yard.
  plots: Array.from({ length: 12 }, (_, index) => ({
    id: `plot_${String(index + 1).padStart(2, '0')}`,
    tileX: 5 + index % 4,
    tileY: 17 + Math.floor(index / 4)
  })),

  trees: [
    // Boundary groves leave a conspicuous gap at the north entrance.
    ...[2, 6, 10, 13, 22, 26, 30, 33].map((x, i) => tree(x, 2, i % 2 === 1)),
    ...[6, 10, 14, 18, 22, 26, 30, 33].map((y, i) => tree(2, y, i % 2 === 0)),
    ...[6, 10, 14, 18, 22, 26, 30, 33].map((y, i) => tree(33, y, i % 2 === 1)),
    ...[6, 10, 14, 18, 22, 26, 30].map((x, i) => tree(x, 34, i % 2 === 0)),

    // Small, separated groups frame each neighbourhood, away from its frontage.
    tree(5, 6, true), tree(12, 5),
    tree(5, 22, true), tree(6, 24),
    tree(18, 25, true), tree(19, 29), tree(16, 31, true),
    tree(27, 6, true), tree(29, 9),
    tree(30, 26, true), tree(25, 30),

    // Shrubs occupy edges and back gardens, not the central green or roads.
    bush(6, 11), bush(12, 11, 2), bush(5, 15, 3),
    bush(13, 20), bush(12, 26, 2), bush(17, 28, 3),
    bush(19, 11, 2), bush(25, 10), bush(26, 13, 3),
    bush(26, 23, 2), bush(31, 22), bush(23, 27, 3),

  ],

  resources: [
    { id: 'forest_wood_01', type: 'foraging', itemId: 'wood', count: 3, hits: 1, tileX: 24, tileY: 29, textureKey: 'forage_twig', displayHeight: 22, solid: false },
    { id: 'forest_wood_02', type: 'foraging', itemId: 'wood', count: 3, hits: 1, tileX: 22, tileY: 31, textureKey: 'forage_twig', displayHeight: 22, solid: false },
    { id: 'forest_herb_01', type: 'foraging', itemId: 'herb', count: 3, hits: 1, tileX: 21, tileY: 28, textureKey: 'forage_vine', displayHeight: 24, solid: false },
    { id: 'forest_mushroom_01', type: 'foraging', itemId: 'mushroom', count: 2, hits: 1, tileX: 23, tileY: 33, textureKey: 'forage_mushroom', displayHeight: 22, solid: false },
    { id: 'forest_fiber_01', type: 'foraging', itemId: 'fiber', count: 3, hits: 1, tileX: 20, tileY: 32, textureKey: 'forage_vine', displayHeight: 24, solid: false },
    ...Array.from({ length: 6 }, (_, i) => ({ id: `mine_node_0${i + 1}`, type: 'mining',
      itemId: i % 2 ? 'ore' : 'stone', count: i % 2 ? 1 : 2, hits: 3,
      tileX: 27 + i % 3 * 2, tileY: 28 + Math.floor(i / 3) * 3,
      textureKey: 'ore_node_intact', displayHeight: 32, solid: true }))
  ],

  interactives: [
    { id: 'cottage_door', tileX: 8.5, tileY: 11.5, type: 'door', prompt: 'Pintu Masuk Pondok' },
    { id: 'cottage_bed', tileX: 9.5, tileY: 11.5, type: 'bed', priority: 60, prompt: 'Istirahat di Pondok [E]' },
    { id: 'fishing_spot', tileX: 9.5, tileY: 29, type: 'fishing', priority: 55, prompt: 'Dermaga Kolam Nila [E]' },
    { id: 'bima_anvil', tileX: 28.5, tileY: 22.5, type: 'crafting', priority: 50, prompt: 'Meja Kerajinan Bima [E]' },
    { id: 'nara_shop', tileX: 22.5, tileY: 12.5, type: 'shop', priority: 50, prompt: 'Kios Nara [E]' },
    { id: 'forest_gate', tileX: 16.5, tileY: 2.5, type: 'portal', prompt: 'Gerbang Hutan Lumut' },
    { id: 'festival_board', tileX: 18.5, tileY: 18.5, type: 'festival', priority: 42, prompt: 'Papan Festival Panen [E]' }
  ],
  npcs: [
    { id: 'suri', name: 'Nenek Suri', title: 'Pemandu Kebun Komunitas',
      workplaceId: 'suri_pavilion', tileX: 13.5, tileY: 26.5, facing: 'se' },
    { id: 'bima', name: 'Paman Bima', title: 'Pandai Besi & Tukang Kayu',
      workplaceId: 'bima_workshop', tileX: 27.5, tileY: 23.5, facing: 'sw' },
    { id: 'nara', name: 'Nara', title: 'Pengelola Kios Desa',
      workplaceId: 'nara_stall', tileX: 21.5, tileY: 13, facing: 'sw' }
  ]
};
