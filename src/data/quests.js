/**
 * Canonical Quest Configuration for Seasons of Home
 * 3 Narrative Beats: "Benih Pertama", "Tangan untuk Desa", "Lentera untuk Semua".
 */

export const QUESTS = {
  quest_beat_1: {
    id: 'quest_beat_1',
    title: 'Benih Pertama',
    giver: 'suri',
    giverName: 'Nenek Suri',
    description: 'Rawat kebun warisan: gemburkan tanah, tanam bibit Sunroot, sirami setiap hari, dan perlihatkan hasil panenmu pada Nenek Suri.',
    objectives: [
      { id: 'water_plot', text: 'Sirami petak kebun yang ditanami', target: 1, current: 0 },
      { id: 'harvest_sunroot', text: 'Panen 1 umbi Sunroot segar', target: 1, current: 0 },
      { id: 'deliver_suri', text: 'Tunjukkan hasil panen kepada Nenek Suri', target: 1, current: 0 }
    ],
    rewards: {
      coins: 40,
      items: [{ itemId: 'seed_mossberry', count: 2 }],
      friendship: { npcId: 'suri', amount: 8 }
    },
    nextQuestId: 'quest_beat_2'
  },

  quest_beat_2: {
    id: 'quest_beat_2',
    title: 'Tangan untuk Desa',
    giver: 'bima',
    giverName: 'Paman Bima',
    description: 'Bantu bengkel desa mengumpulkan 3 Kayu Rimba dan 2 Batu Kali untuk persiapan rangka lentera festival.',
    objectives: [
      { id: 'collect_wood', text: 'Kumpulkan 3 Kayu Rimba di tas', target: 3, current: 0 },
      { id: 'collect_stone', text: 'Kumpulkan 2 Batu Kali di tas', target: 2, current: 0 },
      { id: 'talk_bima', text: 'Bicara pada Paman Bima di bengkel', target: 1, current: 0 }
    ],
    rewards: {
      coins: 60,
      items: [{ itemId: 'tool_reinforced_can', count: 1 }],
      friendship: { npcId: 'bima', amount: 8 }
    },
    nextQuestId: 'quest_beat_3'
  },

  quest_beat_3: {
    id: 'quest_beat_3',
    title: 'Lentera untuk Semua',
    giver: 'nara',
    giverName: 'Nara',
    description: 'Lengkapi bekal seserahan festival Malam Lentera Panen dengan menyumbangkan 1 Sunroot dan 1 Mossberry matang ke Kios Nara.',
    objectives: [
      { id: 'donate_sunroot', text: 'Kumpulkan 1 Umbi Sunroot matang', target: 1, current: 0 },
      { id: 'donate_mossberry', text: 'Kumpulkan 1 Buah Mossberry matang', target: 1, current: 0 },
      { id: 'celebrate_nara', text: 'Bicara pada Nara untuk meresmikan kesiapan festival', target: 1, current: 0 }
    ],
    rewards: {
      coins: 100,
      friendship: { npcId: 'nara', amount: 8 },
      flags: ['festival_unlocked']
    },
    nextQuestId: null
  }
};

export function getQuestDefinition(questId) {
  return QUESTS[questId] || null;
}
