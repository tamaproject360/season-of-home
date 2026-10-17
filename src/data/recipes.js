export const RECIPES = {
  herb_soup: {
    id: 'herb_soup', name: 'Sup Herba', station: 'cooking', coins: 0,
    inputs: [{ itemId: 'herb', count: 2 }, { itemId: 'mushroom', count: 1 }], outputs: [{ itemId: 'herb_soup', count: 1 }]
  },
  berry_pie: {
    id: 'berry_pie', name: 'Pai Beri', station: 'cooking', coins: 0,
    inputs: [{ itemId: 'crop_mossberry', count: 2 }, { itemId: 'wood', count: 1 }], outputs: [{ itemId: 'berry_pie', count: 1 }]
  },
  dew_tonic: {
    id: 'dew_tonic', name: 'Tonik Embun', station: 'alchemy', coins: 0,
    inputs: [{ itemId: 'herb', count: 2 }, { itemId: 'ore', count: 1 }], outputs: [{ itemId: 'dew_tonic', count: 1 }]
  },
  wooden_planter: {
    id: 'wooden_planter', name: 'Kotak Semai Kayu', coins: 0,
    inputs: [{ itemId: 'wood', count: 3 }, { itemId: 'stone', count: 2 }],
    outputs: [{ itemId: 'planter_box', count: 1 }]
  },
  lantern_frame: {
    id: 'lantern_frame', name: 'Rangka Lentera Festival', coins: 0,
    inputs: [{ itemId: 'wood', count: 3 }, { itemId: 'ore', count: 1 }],
    outputs: [{ itemId: 'lantern_frame', count: 1 }]
  },
  watering_can_upgrade: {
    id: 'watering_can_upgrade', name: 'Upgrade Penyiram Tembaga', coins: 40,
    inputs: [{ itemId: 'tool_watering_can', count: 1 }, { itemId: 'ore', count: 2 }],
    outputs: [{ itemId: 'tool_reinforced_can', count: 1 }]
  }
};

// Materials keep the Phase 4 workshop accessible before gathering arrives in Phase 5.
export const SHOP_STOCK = ['seed_sunroot', 'seed_mossberry', 'seed_goldenleaf', 'tool_fishing_rod', 'wood', 'stone', 'ore', 'herb', 'mushroom'];
