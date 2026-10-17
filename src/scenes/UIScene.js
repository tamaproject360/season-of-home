import { HUDController } from '../ui/HUDController.js';
import { MenuController } from '../ui/MenuController.js';
import { DialoguePanel } from '../ui/DialoguePanel.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';

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

    // 2. Initialize Menu Controller with input freeze callback & questSystem
    this.menuController = new MenuController(
      appContainer,
      this.inventory,
      this.worldClock,
      (isMenuOpen) => {
        if (this.gameScene && this.gameScene.inputRouter) {
          this.gameScene.inputRouter.setFrozen(isMenuOpen);
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
    EventBus.on(EVENTS.CONTEXT_ACTION_CHANGED, ({ target, prompt }) => {
      this.hudController.setContextPrompt(prompt);
    });

    // 5. Expose showToast method
    this.showToast = (msg) => this.hudController.showToast(msg);
  }

  update(time, deltaMs) {
    // DOM HUD is event-driven
  }

  shutdown() {
    if (this.hudController) this.hudController.destroy();
    if (this.menuController) this.menuController.destroy();
    if (this.dialoguePanel) this.dialoguePanel.destroy();
  }
}
