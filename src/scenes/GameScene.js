import { ZONE_FARM } from '../world/zoneDefinitions.js';
import { NavGrid } from '../world/navGrid.js';
import { DepthSorter } from '../world/DepthSorter.js';
import { IsoWorldRenderer } from '../world/IsoWorldRenderer.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { InputRouter } from '../input/InputRouter.js';
import { CameraControls } from '../input/CameraControls.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { WorldClock } from '../world/WorldClock.js';
import { FarmingSystem } from '../systems/FarmingSystem.js';
import { RelationshipSystem } from '../systems/RelationshipSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { CraftingSystem } from '../systems/CraftingSystem.js';
import { StorageRepo } from '../persistence/SaveRepository.js';
import { SaveManager } from '../persistence/SaveManager.js';
import { createNewSave, captureSave, restoreSave } from '../persistence/SaveSerializer.js';
import { DEFAULT_SETTINGS, applySettings } from '../persistence/SettingsRepository.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { LifeWorld } from '../world/LifeWorld.js';
import { AudioSystem } from '../systems/AudioSystem.js';

/**
 * GameScene
 * Main gameplay scene orchestrating the active zone, player movement,
 * agricultural farming loop, time progression, and camera.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data = {}) {
    this.initialSave = data.save || createNewSave();
    this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
  }

  create() {
    console.log('[GameScene] Initializing Phase 4 persistent village...');
    applySettings(this.settings, this.game);
    this.wallet = { coins: this.initialSave.player.coins };

    // 1. Navigation grid and Depth sorter
    this.navGrid = new NavGrid(ZONE_FARM.width, ZONE_FARM.height);
    this.depthSorter = new DepthSorter();

    // 2. Core simulation systems
    this.inventory = new InventorySystem(16);
    this.worldClock = new WorldClock(1, 'spring');
    this.farmingSystem = new FarmingSystem(this, this.inventory, this.worldClock);
    this.relationshipSystem = new RelationshipSystem();
    this.questSystem = new QuestSystem(this.inventory, this.relationshipSystem, this.wallet);
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
    this.cameraControls = new CameraControls(this);

    // Restore only after collision and NPC footprints are built. New-game data
    // already contains its starter plots and supplies; loading never reseeds them.
    restoreSave(this, this.initialSave);
    if (this.inventory.hasItem('tool_reinforced_can')) this.profile.toolLevel.wateringCan = 2;
    this.economy = new EconomySystem(this.inventory, this.wallet);
    this.crafting = new CraftingSystem(this.inventory, this.wallet, this.profile.toolLevel);
    this.saveManager = new SaveManager({
      repository: StorageRepo,
      capture: () => captureSave(this),
      onStatus: status => this.scene.get('UIScene').hudController?.setSaveStatus(status),
      onSaved: saved => { this.saveData.revision = saved.revision; this.saveData.updatedAt = saved.updatedAt; }
    });
    this.lifeWorld = new LifeWorld(this);
    this.audio = new AudioSystem(() => this.settings);
    this.interactionSystem.setExtraTargets(() => this.lifeWorld.getTargets());
    this.saveSubscriptions = [
      this.inventory.onChange(() => {
        if (this.inventory.hasItem('tool_reinforced_can')) this.profile.toolLevel.wateringCan = 2;
        this.saveManager.request();
      }),
      this.questSystem.onChange(() => this.saveManager.request()),
      this.worldClock.on('day', () => { this.relationshipSystem.onNewDay(); this.saveManager.request(); }),
      EventBus.on(EVENTS.SAVE_REQUESTED, () => this.saveManager.request()),
      EventBus.on(EVENTS.NPC_TALKED, () => this.saveManager.request()),
      EventBus.on(EVENTS.QUEST_REWARDED, ({ flags = [] }) => {
        flags.forEach(flag => { this.saveData.flags[flag] = true; });
        this.saveManager.save().catch(() => {});
      }),
      ...[EVENTS.PLOT_WATERED, EVENTS.PLOT_TILLED, EVENTS.CROP_PLANTED, EVENTS.CROP_HARVESTED]
        .map(event => EventBus.on(event, () => this.saveManager.request()))
    ];
    this.autosaveTimer = this.time.addEvent({ delay: 15000, loop: true, callback: () => {
      if (!this.inputRouter.isFrozen) this.saveManager.save().catch(() => {});
    } });
    this.onVisibilityChange = () => {
      if (document.hidden) {
        this.wasFrozenBeforeHide = this.inputRouter.isFrozen;
        this.inputRouter.setFrozen(true); this.worldClock.freeze();
      } else if (this.wasFrozenBeforeHide !== undefined) {
        this.inputRouter.setFrozen(this.wasFrozenBeforeHide);
        if (!this.wasFrozenBeforeHide) this.worldClock.unfreeze();
        this.wasFrozenBeforeHide = undefined;
      }
    };
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.events.once('shutdown', () => {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      this.scene.stop('UIScene');
      this.saveManager.dispose();
      this.saveSubscriptions.forEach(unsubscribe => unsubscribe());
      this.questSystem.destroy();
      this.lifeWorld.destroy();
      this.audio.dispose();
      this.inputRouter.destroy();
    });

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

    console.log('[GameScene] Phase 4 systems active.');
  }

  sleepAndAdvanceDay() {
    this.worldClock.advanceToMorning();
    this.saveManager.save().catch(() => {});
    const uiScene = this.scene.get('UIScene');
    if (uiScene && uiScene.showToast) {
      uiScene.showToast(`Selamat pagi! Hari ke-${this.worldClock.day} dimulai (${this.worldClock.weather}).`);
    }
  }

  update(time, deltaMs) {
    if (!this.player || !this.player.active) return;

    // 1. Advance World Clock
    const deltaSec = Math.min(deltaMs / 1000, 0.1);
    this.cameraControls.update(deltaMs);
    if (!this.inputRouter.isFrozen) this.playtimeSeconds += deltaSec;
    this.worldClock.update(deltaSec);
    this.lifeWorld.update(deltaSec);
    this.audio.update(deltaSec, { moving: Math.hypot(this.player.vx, this.player.vy) > 0.05, paused: this.inputRouter.isFrozen });

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
        const sound = { till: 'hoe', plant: 'hoe', water: 'water', harvest: 'harvest', talk: 'talk' }[result?.action];
        if (sound) this.audio.play(sound);
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
        } else if (target.type === 'shop') {
          uiScene.phase4Panels.openShop();
        } else if (target.type === 'crafting') {
          uiScene.phase4Panels.openCraft();
        } else if (this.lifeWorld.interact(target)) {
          // LifeWorld dispatches resource, home, pet, fishing and festival actions.
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
