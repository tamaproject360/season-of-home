import { normalize } from '../utils/math.js';

/**
 * TouchControls
 * Handles virtual D-pad and on-screen Action Button for mobile devices.
 */
export class TouchControls {
  constructor() {
    this.vector = { x: 0, y: 0 };
    this.actionPressed = false;
    this.setupListeners();
  }

  setupListeners() {
    const dpad = document.getElementById('virtual-dpad');
    const overlay = document.getElementById('touch-overlay');
    if (!dpad || !overlay) return;

    // Detect touch device or small screen and display overlay
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || window.innerWidth < 960) {
      overlay.style.display = 'block';
    }

    const setDir = (dx, dy) => {
      this.vector = normalize(dx, dy);
    };

    const clearDir = () => {
      this.vector = { x: 0, y: 0 };
    };

    const bindButton = (id, dx, dy) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        setDir(dx, dy);
      });
      btn.addEventListener('pointerup', clearDir);
      btn.addEventListener('pointercancel', clearDir);
    };

    bindButton('dpad-up', 0, -1);
    bindButton('dpad-down', 0, 1);
    bindButton('dpad-left', -1, 0);
    bindButton('dpad-right', 1, 0);
    bindButton('dpad-up-left', -1, -1);
    bindButton('dpad-up-right', 1, -1);
    bindButton('dpad-down-left', -1, 1);
    bindButton('dpad-down-right', 1, 1);

    const actionBtn = document.getElementById('btn-action');
    if (actionBtn) {
      actionBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.actionPressed = true;
      });
      actionBtn.addEventListener('pointerup', () => {
        this.actionPressed = false;
      });
    }
  }

  getMovementVector() {
    return this.vector;
  }

  consumeActionPress() {
    if (this.actionPressed) {
      this.actionPressed = false;
      return true;
    }
    return false;
  }
}
