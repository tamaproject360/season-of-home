/**
 * Decoupled Domain Event Bus
 * Prevents direct coupling between Renderer, Systems, and Domain State.
 */
class EventBusClass {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (err) {
          console.error(`[EventBus] Error in listener for event '${event}':`, err);
        }
      }
    }
  }

  clear() {
    this.listeners.clear();
  }
}

export const EventBus = new EventBusClass();

export const EVENTS = {
  // World & Time
  DAY_ADVANCED: 'DAY_ADVANCED',
  WEATHER_CHANGED: 'WEATHER_CHANGED',
  ZONE_CHANGED: 'ZONE_CHANGED',

  // Farming & Exploration
  PLOT_WATERED: 'PLOT_WATERED',
  PLOT_TILLED: 'PLOT_TILLED',
  CROP_PLANTED: 'CROP_PLANTED',
  CROP_HARVESTED: 'CROP_HARVESTED',
  RESOURCE_DEPLETED: 'RESOURCE_DEPLETED',

  // Economy & Inventory
  ITEM_ACQUIRED: 'ITEM_ACQUIRED',
  ITEM_SPENT: 'ITEM_SPENT',
  COINS_CHANGED: 'COINS_CHANGED',

  // Social & Quests
  NPC_TALKED: 'NPC_TALKED',
  QUEST_PROGRESS: 'QUEST_PROGRESS',
  QUEST_REWARDED: 'QUEST_REWARDED',
  FESTIVAL_ACTIVATED: 'FESTIVAL_ACTIVATED',

  // System
  SAVE_REQUESTED: 'SAVE_REQUESTED',
  SAVE_COMPLETED: 'SAVE_COMPLETED',
  CONTEXT_ACTION_CHANGED: 'CONTEXT_ACTION_CHANGED'
};
