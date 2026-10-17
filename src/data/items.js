/**
 * Static Item Definitions for Seasons of Home
 * Canonical database for tools, seeds, harvested crops, materials, and quest items.
 */

export const ITEM_CATEGORIES = {
  TOOL: 'tool',
  SEED: 'seed',
  CROP: 'crop',
  RESOURCE: 'resource',
  CRAFTED: 'crafted',
  QUEST: 'quest'
};

export const ITEMS = {
  herb: {
    id: 'herb', name: 'Herba Lembah', category: 'resource', maxStack: 99,
    buyPrice: 8, sellPrice: 5, sellable: true, icon: 'asset/nature/forage_vine.png', description: 'Daun segar untuk masakan dan tonik.'
  },
  mushroom: {
    id: 'mushroom', name: 'Jamur Hutan', category: 'resource', maxStack: 99,
    buyPrice: 10, sellPrice: 6, sellable: true, icon: 'asset/nature/forage_mushroom.png', description: 'Jamur pangan dari hutan desa.'
  },
  fiber: {
    id: 'fiber', name: 'Serat Tanaman', category: 'resource', maxStack: 99,
    buyPrice: 6, sellPrice: 3, sellable: true, icon: 'asset/nature/forage_vine.png', description: 'Serat alami dari tumbuhan liar.'
  },
  silverfin: {
    id: 'silverfin', name: 'Silverfin', category: 'resource', maxStack: 99,
    buyPrice: 60, sellPrice: 45, sellable: true, icon: 'asset/items/item_riverfish.png', description: 'Ikan perak yang sesekali ditemukan di Kolam Nila.'
  },
  // Tools
  tool_hoe: {
    id: 'tool_hoe',
    name: 'Cangkul Petani',
    category: ITEM_CATEGORIES.TOOL,
    maxStack: 1,
    buyPrice: 0,
    sellPrice: 0,
    sellable: false,
    icon: 'asset/items/tool_hoe.png',
    textureKey: 'tool_hoe',
    description: 'Cangkul tempa kayu untuk menggemburkan tanah kebun.'
  },
  tool_watering_can: {
    id: 'tool_watering_can',
    name: 'Penyiram Seng',
    category: ITEM_CATEGORIES.TOOL,
    maxStack: 1,
    buyPrice: 0,
    sellPrice: 0,
    sellable: false,
    capacity: 5,
    icon: 'asset/items/tool_watering_can.png',
    textureKey: 'tool_watering_can',
    description: 'Penyiram air genggam sederhana berkapasitas 5 petak.'
  },
  tool_reinforced_can: {
    id: 'tool_reinforced_can',
    name: 'Penyiram Tembaga',
    category: ITEM_CATEGORIES.TOOL,
    maxStack: 1,
    buyPrice: 0,
    sellPrice: 0,
    sellable: false,
    capacity: 8,
    icon: 'asset/items/tool_reinforced_can.png',
    textureKey: 'tool_reinforced_can',
    description: 'Penyiram kokoh hasil upgrade di bengkel Bima. Kapasitas 8 petak.'
  },
  tool_fishing_rod: {
    id: 'tool_fishing_rod',
    name: 'Joran Bambu',
    category: ITEM_CATEGORIES.TOOL,
    maxStack: 1,
    buyPrice: 50,
    sellPrice: 20,
    sellable: false,
    icon: 'asset/items/tool_fishing_rod.png',
    textureKey: 'tool_fishing_rod',
    description: 'Joran pancing fleksibel berbahan bambu hutan pilihan.'
  },

  // Seeds
  seed_sunroot: {
    id: 'seed_sunroot',
    name: 'Bibit Sunroot',
    cropId: 'sunroot',
    category: ITEM_CATEGORIES.SEED,
    maxStack: 99,
    buyPrice: 15,
    sellPrice: 5,
    sellable: true,
    icon: 'asset/crops/crop_sunroot_stage1.png',
    textureKey: 'crop_sunroot_stage1',
    description: 'Bibit umbi manis kaya energi. Matang dalam 2 hari.'
  },
  seed_mossberry: {
    id: 'seed_mossberry',
    name: 'Bibit Mossberry',
    cropId: 'mossberry',
    category: ITEM_CATEGORIES.SEED,
    maxStack: 99,
    buyPrice: 20,
    sellPrice: 8,
    sellable: true,
    icon: 'asset/crops/crop_mossberry_stage1.png',
    textureKey: 'crop_mossberry_stage1',
    description: 'Bibit buah berry semak hutan. Matang dalam 3 hari.'
  },
  seed_goldenleaf: {
    id: 'seed_goldenleaf',
    name: 'Bibit Goldenleaf',
    cropId: 'goldenleaf',
    category: ITEM_CATEGORIES.SEED,
    maxStack: 99,
    buyPrice: 35,
    sellPrice: 12,
    sellable: true,
    icon: 'asset/crops/crop_goldenleaf_stage1.png',
    textureKey: 'crop_goldenleaf_stage1',
    description: 'Bibit tanaman berdaun emas aromatik. Matang dalam 4 hari.'
  },

  // Harvested Crops
  crop_sunroot: {
    id: 'crop_sunroot',
    name: 'Umbi Sunroot Segar',
    category: ITEM_CATEGORIES.CROP,
    maxStack: 99,
    buyPrice: 35,
    sellPrice: 28,
    sellable: true,
    icon: 'asset/items/item_sunroot.png',
    textureKey: 'item_sunroot',
    description: 'Umbi kuning renyah hasil panen kebun.'
  },
  crop_mossberry: {
    id: 'crop_mossberry',
    name: 'Mossberry Matang',
    category: ITEM_CATEGORIES.CROP,
    maxStack: 99,
    buyPrice: 45,
    sellPrice: 36,
    sellable: true,
    icon: 'asset/items/item_mossberry.png',
    textureKey: 'item_mossberry',
    description: 'Buah berry ungu berair manis segar.'
  },
  crop_goldenleaf: {
    id: 'crop_goldenleaf',
    name: 'Daun Goldenleaf Kering',
    category: ITEM_CATEGORIES.CROP,
    maxStack: 99,
    buyPrice: 75,
    sellPrice: 60,
    sellable: true,
    icon: 'asset/items/item_goldenleaf.png',
    textureKey: 'item_goldenleaf',
    description: 'Helai daun keemasan beraroma teh harum.'
  },

  // Raw Materials
  wood: {
    id: 'wood',
    name: 'Kayu Rimba',
    category: ITEM_CATEGORIES.RESOURCE,
    maxStack: 99,
    buyPrice: 10,
    sellPrice: 4,
    sellable: true,
    icon: 'asset/items/item_wood.png',
    textureKey: 'item_wood',
    description: 'Gelondongan kayu kuat dari pohon sekitar lembah.'
  },
  stone: {
    id: 'stone',
    name: 'Batu Kali',
    category: ITEM_CATEGORIES.RESOURCE,
    maxStack: 99,
    buyPrice: 8,
    sellPrice: 3,
    sellable: true,
    icon: 'asset/items/item_stone.png',
    textureKey: 'item_stone',
    description: 'Bongkahan batu padat untuk bahan kerajinan.'
  },
  ore: {
    id: 'ore',
    name: 'Bijih Logam',
    category: ITEM_CATEGORIES.RESOURCE,
    maxStack: 99,
    buyPrice: 25,
    sellPrice: 15,
    sellable: true,
    icon: 'asset/items/item_ore.png',
    textureKey: 'item_ore',
    description: 'Bijih mentah berkilau dari tambang batu embun.'
  },
  riverfish: {
    id: 'riverfish',
    name: 'Ikan Nila Sungai',
    category: ITEM_CATEGORIES.RESOURCE,
    maxStack: 99,
    buyPrice: 30,
    sellPrice: 22,
    sellable: true,
    icon: 'asset/items/item_riverfish.png',
    textureKey: 'item_riverfish',
    description: 'Ikan air tawar segar tangkapan dari Kolam Nila.'
  },

  // Crafted & Cooked Items
  herb_soup: {
    id: 'herb_soup',
    name: 'Sup Herbal Segar',
    category: ITEM_CATEGORIES.CRAFTED,
    maxStack: 99,
    buyPrice: 50,
    sellPrice: 40,
    sellable: true,
    icon: 'asset/items/item_herb_soup.png',
    textureKey: 'item_herb_soup',
    description: 'Sup hangat berkhasiat memulihkan kesegaran tubuh.'
  },
  berry_pie: {
    id: 'berry_pie',
    name: 'Pai Berry Panggang',
    category: ITEM_CATEGORIES.CRAFTED,
    maxStack: 99,
    buyPrice: 70,
    sellPrice: 55,
    sellable: true,
    icon: 'asset/items/item_berry_pie.png',
    textureKey: 'item_berry_pie',
    description: 'Kue pai manis renyah dengan isian selai mossberry.'
  },
  dew_tonic: {
    id: 'dew_tonic',
    name: 'Tonik Embun Pagi',
    category: ITEM_CATEGORIES.CRAFTED,
    maxStack: 99,
    buyPrice: 90,
    sellPrice: 75,
    sellable: true,
    icon: 'asset/items/item_dew_tonic.png',
    textureKey: 'item_dew_tonic',
    description: 'Ramuan alkimia penambah fokus dan kecepatan kerja.'
  },
  lantern_frame: {
    id: 'lantern_frame',
    name: 'Kerangka Lentera Kayu',
    category: ITEM_CATEGORIES.QUEST,
    maxStack: 10,
    buyPrice: 0,
    sellPrice: 0,
    sellable: false,
    icon: 'asset/items/item_lantern_frame.png',
    textureKey: 'item_lantern_frame',
    description: 'Rangka lentera festival buatan tangan untuk malam panen desa.'
  },
  planter_box: {
    id: 'planter_box',
    name: 'Kotak Semai Kayu',
    category: ITEM_CATEGORIES.CRAFTED,
    maxStack: 10,
    buyPrice: 40,
    sellPrice: 25,
    sellable: true,
    icon: 'asset/items/item_planter_box.png',
    textureKey: 'item_planter_box',
    description: 'Wadah kayu rapi untuk menata bibit tanaman di beranda.'
  }
};

export function getItemDefinition(itemId) {
  return ITEMS[itemId] || null;
}
