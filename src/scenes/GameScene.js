import { ZONE_FARM } from '../world/zoneDefinitions.js';
import { NavGrid } from '../world/navGrid.js';
import { DepthSorter } from '../world/DepthSorter.js';
import { IsoWorldRenderer } from '../world/IsoWorldRenderer.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { InputRouter } from '../input/InputRouter.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { WorldClock } from '../world/WorldClock.js';
import { FarmingSystem } from '../systems/FarmingSystem.js';
import { RelationshipSystem } from '../systems/RelationshipSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';

/**
 * GameScene
 * Main gameplay scene orchestrating the active zone, player movement,
 * agricultural farming loop, time progression, and camera.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    console.log('[GameScene] Initializing Phase 2 Agricultural & Phase 3 Social Core...');

    // 1. Navigation grid and Depth sorter
    this.navGrid = new NavGrid(ZONE_FARM.width, ZONE_FARM.height);
    this.depthSorter = new DepthSorter();

    // 2. Core simulation systems
    this.inventory = new InventorySystem(16);
    this.worldClock = new WorldClock(1, 'spring');
    this.farmingSystem = new FarmingSystem(this, this.inventory, this.worldClock);
    this.relationshipSystem = new RelationshipSystem();
    this.questSystem = new QuestSystem(this.inventory, this.relationshipSystem);
    this.dialogueSystem = new DialogueSystem(this.questSystem, this.relationshipSystem);
    this.activeItem = null;

    // 3. Isometric World Renderer with dynamic farm plots
    this.worldRenderer = new IsoWorldRenderer(this, this.navGrid, this.depthSorter);
    this.worldRenderer.buildZone(ZONE_FARM, this.farmingSystem);

    // 4. Spawn Player (Joni) & NPCs (Suri, Bima, Nara)
    const spawn = ZONE_FARM.spawnPoint;
    this.player = new Player(this, spawn.tileX, spawn.tileY, spawn.facing);
    this.depthSorter.register(this.player);

    this.npcs = [];
    if (ZONE_FARM.npcs) {
      for (const npcDef of ZONE_FARM.npcs) {
        const npc = new NPC(this, npcDef);
        this.npcs.push(npc);
        this.depthSorter.register(npc);
        this.navGrid.setSolid(Math.floor(npcDef.tileX), Math.floor(npcDef.tileY), true);
      }
    }

    // 5. Input router and systems
    this.inputRouter = new InputRouter(this);
    this.movementSystem = new MovementSystem(this.navGrid);
    this.interactionSystem = new InteractionSystem(ZONE_FARM.interactives, this.farmingSystem, this.npcs);

    // 6. Camera follow setup with exponential lerp and deadzone
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.0);

    // 7. Seed initial player starter inventory
    this.seedStarterInventory();

    // 8. Seed initial farm plots for instant player gratification
    this.seedStarterPlots();

    // 9. Launch UI Scene (HUD, Hotbar, Inventory Modal, Dialogue Panel)
    this.scene.launch('UIScene', {
      inventory: this.inventory,
      worldClock: this.worldClock,
      farmingSystem: this.farmingSystem,
      questSystem: this.questSystem,
      dialogueSystem: this.dialogueSystem,
      gameScene: this
    });

    // 10. Debug keys (P for player position, Z for quick sleep)
    this.input.keyboard.on('keydown-P', () => {
      console.log(`[Player Position] Tile: (${this.player.tileX.toFixed(2)}, ${this.player.tileY.toFixed(2)}) Facing: ${this.player.facing}`);
    });

    this.input.keyboard.on('keydown-Z', () => {
      this.sleepAndAdvanceDay();
    });

    console.log('[GameScene] Phase 2 Farming & Inventory loop active.');
  }

  seedStarterInventory() {
    // 4 hotbar starter items
    this.inventory.addItem('tool_hoe', 1);
    this.inventory.addItem('tool_watering_can', 1);
    this.inventory.addItem('seed_sunroot', 3);
    this.inventory.addItem('seed_mossberry', 2);
  }

  seedStarterPlots() {
    // Plot 1: Planted Sunroot (Stage 2: sprout)
    const p1 = this.farmingSystem.getPlot('plot_01');
    if (p1) {
      p1.plant('sunroot', 1);
      p1.water(1);
      p1.growthStage = 2;
      p1.updateVisuals();
    }

    // Plot 2: Mature Mossberry (Stage 4: ready to harvest)
    const p2 = this.farmingSystem.getPlot('plot_02');
    if (p2) {
      p2.plant('mossberry', 1);
      p2.growthStage = 4;
      p2.updateVisuals();
    }
  }

  sleepAndAdvanceDay() {
    this.worldClock.advanceToMorning();
    if (this.relationshipSystem) {
      this.relationshipSystem.onNewDay();
    }
    const uiScene = this.scene.get('UIScene');
    if (uiScene && uiScene.showToast) {
      uiScene.showToast(`Selamat pagi! Hari ke-${this.worldClock.day} dimulai (${this.worldClock.weather}).`);
    }
  }

  update(time, deltaMs) {
    if (!this.player || !this.player.active) return;

    // 1. Advance World Clock
    const deltaSec = Math.min(deltaMs / 1000, 0.1);
    this.worldClock.update(deltaSec);

    // 2. Get input
    const inputVec = this.inputRouter.getMovementVector();

    // 3. Update movement
    this.movementSystem.update(this.player, inputVec, deltaMs);

    // 4. Update interaction proximity with currently equipped item
    const activeItemId = this.activeItem ? this.activeItem.id : null;
    this.interactionSystem.update(this.player, activeItemId);

    // 5. Trigger contextual action if pressed
    if (this.inputRouter.isActionRequested()) {
      this.interactionSystem.triggerAction(this.player, activeItemId, (target, result) => {
        // Play tool swing / work animation
        this.player.playActionAnimation(() => {
          this.player.playIdleAnimation();
        });

        const uiScene = this.scene.get('UIScene');

        if (target.type === 'bed') {
          this.sleepAndAdvanceDay();
        } else if (target.type === 'npc') {
          if (this.dialogueSystem) {
            this.dialogueSystem.startDialogue(target.npc);
          }
        } else if (result && result.message) {
          if (uiScene && uiScene.showToast) {
            uiScene.showToast(result.message);
          }
        }
      });
    }

    // 6. Update depth sorting based on foot-y
    this.depthSorter.update();
  }
}
