/**
 * RelationshipSystem
 * Manages villager friendship scores (0–100), friendship stages, daily conversation caps,
 * and narrative affinity increments.
 */

export const RELATIONSHIP_STAGES = [
  { stage: 0, name: 'Kenalan', minPoints: 0 },
  { stage: 1, name: 'Sahabat Lembah', minPoints: 30 },
  { stage: 2, name: 'Keluarga Lembah', minPoints: 70 }
];

export class RelationshipSystem {
  constructor() {
    this.scores = {
      suri: 10,  // Initial affinity for mentor
      bima: 0,
      nara: 0
    };
    this.talkedToday = new Set();
  }

  getPoints(npcId) {
    return this.scores[npcId] || 0;
  }

  getStage(npcId) {
    const pts = this.getPoints(npcId);
    if (pts >= 70) return RELATIONSHIP_STAGES[2];
    if (pts >= 30) return RELATIONSHIP_STAGES[1];
    return RELATIONSHIP_STAGES[0];
  }

  hasTalkedToday(npcId) {
    return this.talkedToday.has(npcId);
  }

  recordDailyTalk(npcId) {
    if (this.hasTalkedToday(npcId)) {
      return { added: false, current: this.getPoints(npcId) };
    }

    this.talkedToday.add(npcId);
    this.addPoints(npcId, 2); // Daily greeting +2
    return { added: true, pointsAdded: 2, current: this.getPoints(npcId) };
  }

  addPoints(npcId, amount) {
    if (this.scores[npcId] === undefined) {
      this.scores[npcId] = 0;
    }
    this.scores[npcId] = Math.min(100, Math.max(0, this.scores[npcId] + amount));
    return this.scores[npcId];
  }

  onNewDay() {
    this.talkedToday.clear();
    console.log('[RelationshipSystem] Daily talk flags reset for new day.');
  }

  serialize() {
    return {
      scores: { ...this.scores },
      talkedToday: Array.from(this.talkedToday)
    };
  }

  deserialize(data) {
    if (!data) return;
    if (data.scores) this.scores = { ...data.scores };
    if (Array.isArray(data.talkedToday)) {
      this.talkedToday = new Set(data.talkedToday);
    }
  }
}
