import assert from 'node:assert';
import { InventorySystem } from '../src/systems/InventorySystem.js';
import { RelationshipSystem } from '../src/systems/RelationshipSystem.js';
import { QuestSystem, QUEST_STATES } from '../src/systems/QuestSystem.js';
import { EventBus, EVENTS } from '../src/utils/EventBus.js';

console.log('--- Running QuestSystem Unit Tests ---');

// Test 1: Initial state & FSM baseline
const inv = new InventorySystem(16);
const rel = new RelationshipSystem();
const quests = new QuestSystem(inv, rel);

const q1 = quests.getQuest('quest_beat_1');
const q2 = quests.getQuest('quest_beat_2');
const q3 = quests.getQuest('quest_beat_3');

assert.ok(q1, 'Quest 1 must exist');
assert.strictEqual(q1.state, QUEST_STATES.AVAILABLE, 'Quest 1 should be available initially');
assert.strictEqual(q2.state, QUEST_STATES.LOCKED, 'Quest 2 should be locked initially');
assert.strictEqual(q3.state, QUEST_STATES.LOCKED, 'Quest 3 should be locked initially');
console.log('✓ Test 1 Passed: Initial quest states verified (AVAILABLE -> LOCKED -> LOCKED)');

// Test 2: Starting a quest transitions to ACTIVE
const startSuccess = quests.startQuest('quest_beat_1');
assert.strictEqual(startSuccess, true);
assert.strictEqual(quests.getQuest('quest_beat_1').state, QUEST_STATES.ACTIVE);
console.log('✓ Test 2 Passed: Quest starts and enters ACTIVE state');

// Test 3: Objective progress through domain events
const initialSuriAffinity = rel.getPoints('suri');

// Objective 1: water_plot
EventBus.emit(EVENTS.PLOT_WATERED, {});
assert.strictEqual(quests.getQuest('quest_beat_1').objectives[0].current, 1);
assert.strictEqual(quests.getQuest('quest_beat_1').state, QUEST_STATES.ACTIVE, 'Not all objectives done yet');

// Objective 2: harvest_sunroot
EventBus.emit(EVENTS.CROP_HARVESTED, { itemId: 'crop_sunroot', count: 1 });
assert.strictEqual(quests.getQuest('quest_beat_1').objectives[1].current, 1);
assert.strictEqual(quests.getQuest('quest_beat_1').state, QUEST_STATES.ACTIVE);

// Objective 3: deliver_suri (NPC talked)
EventBus.emit(EVENTS.NPC_TALKED, { npcId: 'suri' });
assert.strictEqual(quests.getQuest('quest_beat_1').objectives[2].current, 1);

// Quest should now be COMPLETED!
assert.strictEqual(quests.getQuest('quest_beat_1').state, QUEST_STATES.COMPLETED);
console.log('✓ Test 3 Passed: Domain events drive objectives to completion');

// Test 4: Idempotent Reward Granting
const initialMossberrySeeds = inv.getItemCount('seed_mossberry');
const claim1 = quests.claimReward('quest_beat_1');

assert.strictEqual(claim1.success, true);
assert.strictEqual(quests.getQuest('quest_beat_1').state, QUEST_STATES.REWARDED);
assert.strictEqual(inv.getItemCount('seed_mossberry'), initialMossberrySeeds + 2, 'Rewarded 2 mossberry seeds');
assert.strictEqual(rel.getPoints('suri'), initialSuriAffinity + 8, 'Rewarded +8 friendship points');
assert.strictEqual(quests.getQuest('quest_beat_2').state, QUEST_STATES.AVAILABLE, 'Quest 2 unlocked');
console.log('✓ Test 4 Passed: Reward granted, inventory & friendship updated, next quest unlocked');

// Test 5: Re-claiming reward is strictly blocked (Idempotency guarantee)
const claim2 = quests.claimReward('quest_beat_1');
assert.strictEqual(claim2.success, false);
assert.strictEqual(claim2.reason, 'already_claimed');
assert.strictEqual(inv.getItemCount('seed_mossberry'), initialMossberrySeeds + 2, 'Item count unchanged');
assert.strictEqual(rel.getPoints('suri'), initialSuriAffinity + 8, 'Friendship points unchanged');
console.log('✓ Test 5 Passed: Idempotency prevents duplicate reward grant');

// Test 6: Serialization & deserialization state persistence
const serialized = quests.serialize();
const inv2 = new InventorySystem(16);
const rel2 = new RelationshipSystem();
const restoredQuests = new QuestSystem(inv2, rel2);
restoredQuests.deserialize(serialized);

assert.strictEqual(restoredQuests.getQuest('quest_beat_1').state, QUEST_STATES.REWARDED);
assert.strictEqual(restoredQuests.getQuest('quest_beat_2').state, QUEST_STATES.AVAILABLE);

// Attempting duplicate claim on restored system must also be rejected
const claimRestored = restoredQuests.claimReward('quest_beat_1');
assert.strictEqual(claimRestored.success, false);
assert.strictEqual(claimRestored.reason, 'already_claimed');
console.log('✓ Test 6 Passed: State roundtrip preserves quest progression and idempotency tokens');

// Test 7: Full narrative beat chain (Quest 2 -> Quest 3)
// Start Quest 2
restoredQuests.startQuest('quest_beat_2');
assert.strictEqual(restoredQuests.getQuest('quest_beat_2').state, QUEST_STATES.ACTIVE);

EventBus.emit(EVENTS.ITEM_ACQUIRED, { itemId: 'wood', count: 3 });
EventBus.emit(EVENTS.ITEM_ACQUIRED, { itemId: 'stone', count: 2 });
EventBus.emit(EVENTS.NPC_TALKED, { npcId: 'bima' });

assert.strictEqual(restoredQuests.getQuest('quest_beat_2').state, QUEST_STATES.COMPLETED);
const claimBeat2 = restoredQuests.claimReward('quest_beat_2');
assert.strictEqual(claimBeat2.success, true);
assert.strictEqual(restoredQuests.getQuest('quest_beat_3').state, QUEST_STATES.AVAILABLE);
console.log('✓ Test 7 Passed: Narrative progression seamlessly chains Beat 1 -> Beat 2 -> Beat 3');

console.log('All QuestSystem unit tests PASSED successfully!');
