import { NPC_DIALOGUES } from '../data/npcDialogue.js';
import { QUEST_STATES } from './QuestSystem.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';

/**
 * DialogueSystem
 * Orchestrates branching dialogue trees, quest progression triggers,
 * relationship affinity bumps, and UI presentation via DialoguePanel.
 */
export class DialogueSystem {
  constructor(questSystem, relationshipSystem, showToastCallback = null) {
    this.questSystem = questSystem;
    this.relationshipSystem = relationshipSystem;
    this.showToast = showToastCallback;
    this.dialoguePanel = null;

    this.currentNPC = null;
    this.currentQuestId = null;
    this.currentNode = null;
  }

  setPanel(dialoguePanel) {
    this.dialoguePanel = dialoguePanel;
  }

  setShowToast(callback) {
    this.showToast = callback;
  }

  startDialogue(npc) {
    if (!npc || !npc.id) return;
    const npcId = npc.id;
    const data = NPC_DIALOGUES[npcId];
    if (!data) {
      console.warn(`[DialogueSystem] No dialogue data found for NPC: ${npcId}`);
      return;
    }

    this.currentNPC = npc;

    // 1. Record daily conversation affinity (+2 points once per day)
    const talkRes = this.relationshipSystem.recordDailyTalk(npcId);
    if (talkRes.added && this.showToast) {
      this.showToast(`+2 Hubungan dengan ${data.name}!`);
    }

    // 2. Emit domain event (advances talk/deliver quest objectives)
    EventBus.emit(EVENTS.NPC_TALKED, { npcId });

    // 3. Determine dialogue node based on Quest state
    let targetQuestId = null;
    let targetNode = null;

    if (data.quests) {
      for (const [questId, questTree] of Object.entries(data.quests)) {
        const questState = this.questSystem.getQuest(questId);
        if (!questState) continue;

        if (questState.state === QUEST_STATES.AVAILABLE) {
          targetQuestId = questId;
          targetNode = questTree.intro;
          break;
        } else if (questState.state === QUEST_STATES.ACTIVE) {
          targetQuestId = questId;
          targetNode = questTree.in_progress;
          break;
        } else if (questState.state === QUEST_STATES.COMPLETED) {
          targetQuestId = questId;
          targetNode = questTree.completed;
          break;
        }
      }
    }

    if (this.festivalActive) {
      targetQuestId = null;
      targetNode = { text: {
        suri: 'Lihat lentera-lentera itu! Kebun dan kebaikanmu membuat desa ini hangat kembali.',
        bima: 'Kerja kita terbayar malam ini. Terima kasih sudah membantu bengkel dan seluruh desa!',
        nara: 'Malam Lentera Panen akhirnya tiba! Mari menikmati hasil kerja kita bersama-sama.'
      }[npcId], options: [{ text: 'Selamat merayakan malam panen!', next: null }] };
    }

    // 4. Fallback to daily village greetings
    if (!targetNode) {
      targetQuestId = null;
      const greetings = data.greetings || ['Halo, Joni! Selamat menikmati hari di lembah.'];
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      targetNode = {
        text: randomGreeting,
        options: [
          { text: 'Senang berbicara denganmu, sampai jumpa!', next: null }
        ]
      };
    }

    this.currentQuestId = targetQuestId;
    this.renderNode(targetNode);
  }

  renderNode(node) {
    if (!this.dialoguePanel) {
      console.warn('[DialogueSystem] DialoguePanel not registered!');
      return;
    }

    this.currentNode = node;
    const npcId = this.currentNPC.id;
    const data = NPC_DIALOGUES[npcId];
    const points = this.relationshipSystem.getPoints(npcId);
    const stage = this.relationshipSystem.getStage(npcId);

    this.dialoguePanel.show({
      speaker: data.name,
      title: data.title,
      portraitUrl: data.portrait,
      affinityText: `${stage.name} (${points} ♥)`,
      text: node.text,
      options: node.options || [{ text: 'Lanjut [Space / E]', next: null }]
    });
  }

  handleOptionSelect(option) {
    if (!option) {
      this.closeDialogue();
      return;
    }

    // 1. Execute action triggers (e.g. ACCEPT_QUEST, CLAIM_REWARD)
    if (option.action === 'ACCEPT_QUEST' && this.currentQuestId) {
      this.questSystem.startQuest(this.currentQuestId);
      if (this.showToast) {
        this.showToast('Misi baru aktif! Periksa jurnal.');
      }
    } else if (option.action === 'CLAIM_REWARD' && this.currentQuestId) {
      const claimRes = this.questSystem.claimReward(this.currentQuestId);
      if (claimRes.success && this.showToast) {
        this.showToast(`Misi Selesai! Imbalan +${claimRes.coins} Koin Daun & Afeksi!`);
      } else if (this.showToast) {
        this.showToast(claimRes.message || 'Hadiah belum dapat diambil. Periksa tujuan misi dan ruang tas.');
      }
    }

    // 2. Branch to next node or close
    if (option.next && this.currentQuestId) {
      const npcId = this.currentNPC.id;
      const questTree = NPC_DIALOGUES[npcId].quests[this.currentQuestId];
      const nextNode = questTree ? questTree[option.next] : null;

      if (nextNode) {
        this.renderNode(nextNode);
        return;
      }
    }

    this.closeDialogue();
  }

  closeDialogue() {
    if (this.dialoguePanel) {
      this.dialoguePanel.close();
    }
    this.currentNPC = null;
    this.currentQuestId = null;
    this.currentNode = null;
  }
}
