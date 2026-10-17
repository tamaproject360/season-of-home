/**
 * Static Crop Definitions for Seasons of Home
 * Canonical database for crop growth rates, seed linkages, yield, and visual stages.
 */

export const CROPS = {
  sunroot: {
    id: 'sunroot',
    name: 'Sunroot',
    seedId: 'seed_sunroot',
    harvestItemId: 'crop_sunroot',
    daysToMature: 2,
    stagesCount: 4,
    minYield: 1,
    maxYield: 2,
    regrows: false,
    stageTextures: [
      'crop_sunroot_stage1',
      'crop_sunroot_stage2',
      'crop_sunroot_stage3',
      'crop_sunroot_stage4'
    ],
    description: 'Tanaman umbi yang menyerap sinar mentari tropis.'
  },
  mossberry: {
    id: 'mossberry',
    name: 'Mossberry',
    seedId: 'seed_mossberry',
    harvestItemId: 'crop_mossberry',
    daysToMature: 3,
    stagesCount: 4,
    minYield: 2,
    maxYield: 3,
    regrows: false,
    stageTextures: [
      'crop_mossberry_stage1',
      'crop_mossberry_stage2',
      'crop_mossberry_stage3',
      'crop_mossberry_stage4'
    ],
    description: 'Semak buah liar khas lereng bukit Lembah Rimbun.'
  },
  goldenleaf: {
    id: 'goldenleaf',
    name: 'Goldenleaf',
    seedId: 'seed_goldenleaf',
    harvestItemId: 'crop_goldenleaf',
    daysToMature: 4,
    stagesCount: 4,
    minYield: 1,
    maxYield: 1,
    regrows: false,
    stageTextures: [
      'crop_goldenleaf_stage1',
      'crop_goldenleaf_stage2',
      'crop_goldenleaf_stage3',
      'crop_goldenleaf_stage4'
    ],
    description: 'Tanaman langka beraroma madu dan teh pegunungan.'
  }
};

export function getCropDefinition(cropId) {
  return CROPS[cropId] || null;
}

export function getCropBySeedId(seedId) {
  return Object.values(CROPS).find(c => c.seedId === seedId) || null;
}
