import { QUESTS, getQuestDefinition } from '../data/quests.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';

export const QUEST_STATES = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REWARDED: 'rewarded'
};

/**
 * QuestSystem
 * Finite State Machine orchestrating narrative quest progression,
 * domain event tracking, and idempotent reward granting.
 */
export class QuestSystem {
  constructor(inventory, relationshipSystem) {
    this.inventory = inventory;
    this.relationshipSystem = relationshipSystem;

    this.questStates = {};
    this.claimedRewardTokens = new Set();
    this.listeners = [];

    this.initQuests();
    this.bindDomainEvents();
  }

  initQuests() {
    for (const [id, def] of Object.entries(QUESTS)) {
      this.questStates[id] = {
        id,
        state: id === 'quest_beat_1' ? QUEST_STATES.AVAILABLE : QUEST_STATES.LOCKED,
        objectives: def.objectives.map(o => ({ ...o }))
      };
    }
  }

  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  emitChange() {
    for (const listener of this.listeners) {
      try {
        listener(this.getAllQuests());
      } catch (err) {
        console.error('[QuestSystem] Listener error:', err);
      }
    }
  }

  bindDomainEvents() {
    // 1. Water plot event
    EventBus.on(EVENTS.PLOT_WATERED, () => {
      this.handleObjectiveProgress('water_plot', 1);
    });

    // 2. Crop harvested event
    EventBus.on(EVENTS.CROP_HARVESTED, ({ itemId, count }) => {
      if (itemId === 'crop_sunroot') {
        this.handleObjectiveProgress('harvest_sunroot', count);
        this.handleObjectiveProgress('donate_sunroot', count);
      } else if (itemId === 'crop_mossberry') {
        this.handleObjectiveProgress('donate_mossberry', count);
      }
    });

    // 3. Item acquired event
    EventBus.on(EVENTS.ITEM_ACQUIRED, ({ itemId, count }) => {
      if (itemId === 'wood') {
        this.handleObjectiveProgress('collect_wood', count);
      } else if (itemId === 'stone') {
        this.handleObjectiveProgress('collect_stone', count);
      }
    });

    // 4. NPC Talk event
    EventBus.on(EVENTS.NPC_TALKED, ({ npcId }) => {
      if (npcId === 'suri') {
        this.handleObjectiveProgress('deliver_suri', 1);
      } else if (npcId === 'bima') {
        this.handleObjectiveProgress('talk_bima', 1);
      } else if (npcId === 'nara') {
        this.handleObjectiveProgress('celebrate_nara', 1);
      }
    });
  }

  handleObjectiveProgress(objectiveId, amount = 1) {
    let changed = false;
    for (const q of Object.values(this.questStates)) {
      if (q.state === QUEST_STATES.ACTIVE) {
        for (const obj of q.objectives) {
          if (obj.id === objectiveId && obj.current < obj.target) {
            obj.current = Math.min(obj.target, obj.current + amount);
            changed = true;
            console.log(`[QuestSystem] Progress in ${q.id} -> ${obj.id}: ${obj.current}/${obj.target}`);
          }
        }
        // Check if all objectives completed
        const allDone = q.objectives.every(o => o.current >= o.target);
        if (allDone) {
          q.state = QUEST_STATES.COMPLETED;
          changed = true;
          console.log(`[QuestSystem] Quest ${q.id} objectives COMPLETED!`);
        }
      }
    }
    if (changed) {
      this.emitChange();
    }
  }

  getQuest(questId) {
    return this.questStates[questId] || null;
  }

  getAllQuests() {
    return Object.values(this.questStates);
  }

  getActiveQuests() {
    return Object.values(this.questStates).filter(q => q.state === QUEST_STATES.ACTIVE);
  }

  startQuest(questId) {
    const q = this.getQuest(questId);
    if (!q || (q.state !== QUEST_STATES.AVAILABLE && q.state !== QUEST_STATES.LOCKED)) {
      return false;
    }
    q.state = QUEST_STATES.ACTIVE;
    console.log(`[QuestSystem] Quest started: ${questId}`);
    this.emitChange();
    return true;
  }

  /**
   * Idempotent Reward Granting
   * Guarantees reward is granted exactly once per quest token.
   */
  claimReward(questId) {
    const q = this.getQuest(questId);
    if (!q) return { success: false, reason: 'unknown_quest' };

    const token = `reward_token_${questId}`;
    if (this.claimedRewardTokens.has(token) || q.state === QUEST_STATES.REWARDED) {
      console.warn(`[QuestSystem] Idempotent protection: Reward for ${questId} already claimed!`);
      return { success: false, reason: 'already_claimed' };
    }

    const def = getQuestDefinition(questId);
    if (!def) return { success: false, reason: 'missing_definition' };

    // Mark as claimed immediately
    this.claimedRewardTokens.add(token);
    q.state = QUEST_STATES.REWARDED;

    // 1. Grant items to inventory
    if (def.rewards.items && this.inventory) {
      for (const it of def.rewards.items) {
        this.inventory.addItem(it.itemId, it.count);
      }
    }

    // 2. Grant friendship
    if (def.rewards.friendship && this.relationshipSystem) {
      this.relationshipSystem.addPoints(
        def.rewards.friendship.npcId,
        def.rewards.friendship.amount
      );
    }

    // 3. Unlock next quest if available
    if (def.nextQuestId && this.questStates[def.nextQuestId]) {
      this.questStates[def.nextQuestId].state = QUEST_STATES.AVAILABLE;
    }

    console.log(`[QuestSystem] Reward granted for ${questId} with token ${token}.`);
    this.emitChange();

    return {
      success: true,
      coins: def.rewards.coins || 0,
      rewards: def.rewards
    };
  }

  serialize() {
    return {
      questStates: { ...this.questStates },
      claimedRewardTokens: Array.from(this.claimedRewardTokens)
    };
  }

  deserialize(data) {
    if (!data) return;
    if (data.questStates) this.questStates = { ...data.questStates };
    if (Array.isArray(data.claimedRewardTokens)) {
      this.claimedRewardTokens = new Set(data.claimedRewardTokens);
    }
    this.emitChange();
  }
}
