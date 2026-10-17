import { getZoneDefinition, ZONES } from './zoneDefinitions.js';
import { NavGrid } from './navGrid.js';
import { NPC } from '../entities/NPC.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';

/**
 * ZoneManager
 * Orchestrates multi-zone lifecycle, camera transitions, and player teleportation.
 */
export class ZoneManager {
  constructor(scene) {
    this.scene = scene;
    this.currentZoneId = 'farm';
    this.currentZoneDef = ZONES.farm;
    this.isTransitioning = false;
  }

  getCurrentZone() {
    return this.currentZoneDef;
  }

  getCurrentZoneId() {
    return this.currentZoneId;
  }

  /**
   * Transitions player smoothly to target zone with camera fade and state re-mount.
   * @param {string} targetZoneId
   * @param {{ tileX: number, tileY: number, facing?: string }} [spawnCoord]
   */
  async changeZone(targetZoneId, spawnCoord = null) {
    if (this.isTransitioning) return;
    const nextZoneDef = getZoneDefinition(targetZoneId);
    if (!nextZoneDef) return;

    this.isTransitioning = true;
    const scene = this.scene;

    try {
      // 1. Freeze input and play transition audio cue
      if (scene.inputRouter) scene.inputRouter.setFrozen(true);
      if (scene.audio) scene.audio.play('hoe');

      // 2. Camera fade out (200ms) with safety timeout
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 300);
        scene.cameras.main.once('camerafadeoutcomplete', () => {
          clearTimeout(timer);
          resolve();
        });
        scene.cameras.main.fadeOut(200, 0, 0, 0);
      });

      // 3. Clear existing visual world entities
      if (scene.worldRenderer) {
        scene.worldRenderer.clearZone();
      }

      // 4. Update active zone state
      this.currentZoneId = targetZoneId;
      this.currentZoneDef = nextZoneDef;
      if (scene.saveData && scene.saveData.world) {
        scene.saveData.world.activeZone = targetZoneId;
      }

      // 5. Rebuild NavGrid for new zone dimensions
      scene.navGrid = new NavGrid(nextZoneDef.width, nextZoneDef.height);
      if (scene.movementSystem) {
        scene.movementSystem.navGrid = scene.navGrid;
      }

      // 6. Manage NPCs: unregister previous NPCs, spawn NPCs defined in this zone
      if (scene.npcs) {
        for (const npc of scene.npcs) {
          if (scene.depthSorter) scene.depthSorter.unregister(npc);
          if (npc.sprite) npc.sprite.destroy();
        }
        scene.npcs = [];
      }

      if (nextZoneDef.npcs && nextZoneDef.npcs.length > 0) {
        if (!scene.npcs) scene.npcs = [];
        for (const npcDef of nextZoneDef.npcs) {
          const npc = new NPC(scene, npcDef);
          scene.npcs.push(npc);
          if (scene.depthSorter) scene.depthSorter.register(npc);
          scene.navGrid.setSolid(Math.floor(npcDef.tileX), Math.floor(npcDef.tileY), true);
        }
      }

      // 7. Rebuild world terrain, buildings, vegetation, and resources
      const isFarm = targetZoneId === 'farm';
      scene.worldRenderer.navGrid = scene.navGrid;
      scene.worldRenderer.buildZone(nextZoneDef, isFarm ? scene.farmingSystem : null);

      // 8. Update interactives and NPCs in interaction system
      if (scene.interactionSystem) {
        scene.interactionSystem.setInteractives(nextZoneDef.interactives || []);
        scene.interactionSystem.setNPCs(scene.npcs || []);
        scene.interactionSystem.setActiveZone(nextZoneDef);
      }

      // 9. Update companion Pet visibility/position
      if (scene.pet) {
        if (isFarm) {
          scene.pet.sprite.setVisible(true);
          scene.pet.tileX = 9.5;
          scene.pet.tileY = 12.0;
          if (typeof scene.pet.syncScreenPosition === 'function') {
            scene.pet.syncScreenPosition();
          }
        } else {
          scene.pet.sprite.setVisible(false);
        }
      }

      // 9b. Update festival board/banners visibility in LifeWorld
      if (scene.lifeWorld && typeof scene.lifeWorld.updateZone === 'function') {
        scene.lifeWorld.updateZone(targetZoneId);
      }

      // 10. Position player at destination spawn
      const spawn = spawnCoord || nextZoneDef.spawnPoint;
      if (scene.player) {
        if (spawn.facing) scene.player.facing = spawn.facing;
        scene.player.vx = 0;
        scene.player.vy = 0;
        scene.player.updatePosition(spawn.tileX, spawn.tileY, false);
        scene.player.playIdleAnimation();
      }

      // 11. Center camera on player
      scene.cameras.main.centerOn(scene.player.x, scene.player.y);

      // 12. Camera fade in (200ms) with safety timeout
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 300);
        scene.cameras.main.once('camerafadeincomplete', () => {
          clearTimeout(timer);
          resolve();
        });
        scene.cameras.main.fadeIn(200, 0, 0, 0);
      });

      // Toast announcement of current zone
      const uiScene = scene.scene.get('UIScene');
      if (uiScene && uiScene.showToast) {
        uiScene.showToast(`Memasuki: ${nextZoneDef.name}`);
      }

      // Trigger autosave on zone transition
      if (scene.saveManager) {
        scene.saveManager.save().catch(() => {});
      }

      EventBus.emit(EVENTS.ZONE_CHANGED, { zoneId: targetZoneId, zoneName: nextZoneDef.name });
    } catch (err) {
      console.error('[ZoneManager] Gagal berpindah zona:', err);
      if (scene.cameras?.main) {
        scene.cameras.main.resetFX();
      }
    } finally {
      // 13. Always unfreeze input & reset isTransitioning flag
      if (scene.inputRouter) scene.inputRouter.setFrozen(false);
      this.isTransitioning = false;
    }
  }

  /**
   * Check if player has stepped onto a portal boundary.
   * @param {any} player
   */
  checkBoundaryPortals(player) {
    if (this.isTransitioning || !player) return;

    for (const item of (this.currentZoneDef.interactives || [])) {
      if (item.type === 'portal' && item.targetZone) {
        const dist = Math.hypot(player.tileX - item.tileX, player.tileY - item.tileY);
        if (dist <= 0.85) {
          this.changeZone(item.targetZone, item.targetSpawn);
          return;
        }
      }
    }
  }
}
