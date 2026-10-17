import { HUDController } from '../ui/HUDController.js';
import { MenuController } from '../ui/MenuController.js';
import { DialoguePanel } from '../ui/DialoguePanel.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { Phase4Panels } from '../ui/Phase4Panels.js';
import { StorageRepo } from '../persistence/SaveRepository.js';
import { LifePanels } from '../ui/LifePanels.js';
import { WorldAtmosphere } from '../world/WorldAtmosphere.js';

/**
 * UIScene
 * Parallel transparent scene orchestrating DOM-based HUD and modal controllers.
 * Freezes player input and world clock during modal interactions.
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  init(data = {}) {
    this.inventory = data ? data.inventory : null;
    this.worldClock = data ? data.worldClock : null;
    this.farmingSystem = data ? data.farmingSystem : null;
    this.questSystem = data ? data.questSystem : null;
    this.dialogueSystem = data ? data.dialogueSystem : null;
    this.gameScene = data ? data.gameScene : null;
  }

  create() {
    if (!this.inventory || !this.worldClock) {
      console.warn('[UIScene] Deferred: Waiting for GameScene initialization data.');
      return;
    }

    console.log('[UIScene] Initializing DOM HUD, Menu and Dialogue Panels...');
    const appContainer = document.getElementById('app-container');

    // Clean up any stale HUD DOM
    if (this.hudController) this.hudController.destroy();
    if (this.menuController) this.menuController.destroy();
    if (this.dialoguePanel) this.dialoguePanel.destroy();

    // 1. Initialize HUD Controller
    this.hudController = new HUDController(appContainer, this.inventory, this.worldClock);
    this.hudController.updateCoinsDisplay(this.gameScene.wallet.coins);
    this.hudController.setSaveStatus({ state: StorageRepo.usingFallback ? 'session' : 'saved',
      message: StorageRepo.usingFallback ? 'Progres hanya sesi ini' : this.gameScene.saveData.revision ? 'Tersimpan' : 'Belum tersimpan' });
    this.hudController.onCameraToggle(() => {
      this.gameScene?.toggleCameraAngle?.();
    });

    // 2. Initialize Menu Controller with input freeze callback & questSystem
    this.menuController = new MenuController(
      appContainer,
      this.inventory,
      this.worldClock,
      (isMenuOpen) => {
        if (this.gameScene && this.gameScene.inputRouter) {
          this.gameScene.inputRouter.setFrozen(isMenuOpen);
          if (isMenuOpen) this.worldClock.freeze(); else this.worldClock.unfreeze();
        }
      },
      this.questSystem
    );

    // 3. Initialize Dialogue Panel with input freeze callback (Task 25)
    this.dialoguePanel = new DialoguePanel(
      appContainer,
      (option, index) => {
        if (this.dialogueSystem) {
          this.dialogueSystem.handleOptionSelect(option);
        }
      },
      (isDialogueOpen) => {
        if (this.gameScene && this.gameScene.inputRouter) {
          this.gameScene.inputRouter.setFrozen(isDialogueOpen);
          if (isDialogueOpen) this.worldClock.freeze(); else this.worldClock.unfreeze();
        }
      }
    );

    if (this.dialogueSystem) {
      this.dialogueSystem.setPanel(this.dialoguePanel);
      this.dialogueSystem.setShowToast((msg) => this.showToast(msg));
    }

    // 3. Connect Hotbar active item to GameScene
    this.hudController.onHotbarChange((activeItem) => {
      if (this.gameScene) {
        this.gameScene.activeItem = activeItem;
      }
    });

    // Initial sync
    if (this.gameScene) {
      this.gameScene.activeItem = this.hudController.getActiveItem();
    }

    // 4. Connect Contextual Action Prompt
    this.unsubscribeContext = EventBus.on(EVENTS.CONTEXT_ACTION_CHANGED, ({ target, prompt }) => {
      this.hudController.setContextPrompt(prompt);
    });

    // 5. Expose showToast method
    this.showToast = (msg) => this.hudController.showToast(msg);
    this.phase4Panels = new Phase4Panels(this.gameScene, this);
    this.lifePanels = new LifePanels(this.gameScene, this.phase4Panels);
    this.atmosphere = new WorldAtmosphere(this, this.gameScene);
    document.getElementById('btn-open-pause').addEventListener('click', () => this.phase4Panels.openPause());
    this.unsubscribeCoins = EventBus.on(EVENTS.COINS_CHANGED, ({ coins }) => this.hudController.updateCoinsDisplay(coins));
    this.events.once('shutdown', () => this.shutdown());
  }

  update(time, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.1);
    this.lifePanels?.update(dt);
    this.atmosphere?.update(dt);
    if (this.gameScene?.cameraControls && this.hudController) {
      this.hudController.setZoomDisplay(this.gameScene.cameraControls.targetZoom);
    }
  }

  shutdown() {
    this.unsubscribeContext?.();
    this.unsubscribeCoins?.();
    this.lifePanels?.destroy();
    this.phase4Panels?.destroy();
    if (this.hudController) this.hudController.destroy();
    if (this.menuController) this.menuController.destroy();
    if (this.dialoguePanel) this.dialoguePanel.destroy();
  }
}
