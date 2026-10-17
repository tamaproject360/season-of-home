import { GAMEPLAY } from '../config/constants.js';
import { distance } from '../utils/math.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';

/**
 * InteractionSystem
 * Proximity-based target selection with deterministic prioritization and debouncing.
 * Integrates dynamic farm plots and static world interactives.
 */
export class InteractionSystem {
  constructor(interactives = [], farmingSystem = null, npcs = []) {
    this.interactives = interactives;
    this.farmingSystem = farmingSystem;
    this.npcs = npcs;
    this.currentTarget = null;
    this.lastTriggerTime = 0;
    this.debounceMs = 300;
  }

  setInteractives(interactives) {
    this.interactives = interactives;
  }

  setFarmingSystem(farmingSystem) {
    this.farmingSystem = farmingSystem;
  }

  setNPCs(npcs) {
    this.npcs = npcs;
  }

  update(player, activeItemId = null) {
    let closestTarget = null;
    let closestDist = GAMEPLAY.INTERACTION_RADIUS;

    // 1. Check dynamic farm plots
    if (this.farmingSystem) {
      for (const plot of this.farmingSystem.getPlots()) {
        const d = distance(player.tileX, player.tileY, plot.tileX, plot.tileY);
        if (d <= closestDist) {
          const action = this.farmingSystem.getContextualAction(plot, activeItemId);
          if (action) {
            closestDist = d;
            closestTarget = {
              type: 'farm_plot',
              plot,
              action,
              prompt: action.label,
              priority: action.priority || 50
            };
          }
        }
      }
    }

    // 2. Check Villager NPCs (Task 50 & 51)
    if (this.npcs) {
      for (const npc of this.npcs) {
        const d = distance(player.tileX, player.tileY, npc.tileX, npc.tileY);
        if (d <= closestDist) {
          const priority = 48; // Higher than generic props
          if (!closestTarget || priority > (closestTarget.priority || 0)) {
            closestDist = d;
            closestTarget = {
              type: 'npc',
              npc,
              prompt: `Bicara dengan ${npc.name} [E]`,
              priority
            };
          }
        }
      }
    }

    // 3. Check static interactives (portals, doors, bed)
    for (const item of this.interactives) {
      const d = distance(player.tileX, player.tileY, item.tileX, item.tileY);
      if (d <= closestDist) {
        // Deterministic priority tie-break
        const priority = item.priority || 40;
        if (!closestTarget || priority > (closestTarget.priority || 0)) {
          closestDist = d;
          closestTarget = {
            type: item.type || 'generic',
            item,
            prompt: item.prompt,
            priority
          };
        }
      }
    }

    if (this.currentTarget !== closestTarget) {
      this.currentTarget = closestTarget;
      EventBus.emit(EVENTS.CONTEXT_ACTION_CHANGED, {
        target: this.currentTarget,
        prompt: this.currentTarget ? this.currentTarget.prompt : null
      });
    }
  }

  triggerAction(player, activeItemId, onActionExecute) {
    const now = Date.now();
    if (now - this.lastTriggerTime < this.debounceMs) {
      return; // debounced
    }
    this.lastTriggerTime = now;

    if (this.currentTarget) {
      console.log('[InteractionSystem] Interacted with:', this.currentTarget.prompt);
      let result = null;

      if (this.currentTarget.type === 'farm_plot' && this.farmingSystem) {
        result = this.farmingSystem.executeAction(this.currentTarget.plot, activeItemId);
      } else if (this.currentTarget.type === 'npc') {
        if (this.currentTarget.npc && this.currentTarget.npc.facePlayer) {
          this.currentTarget.npc.facePlayer(player.tileX, player.tileY);
        }
        result = { action: 'talk', npc: this.currentTarget.npc };
      }

      if (onActionExecute) {
        onActionExecute(this.currentTarget, result);
      }
    }
  }
}
