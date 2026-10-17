import { normalize } from '../utils/math.js';

/**
 * TouchControls
 * Handles virtual D-pad and on-screen Action Button for mobile devices.
 */
export class TouchControls {
  constructor() {
    this.vector = { x: 0, y: 0 };
    this.actionPressed = false;
    this.listeners = [];
    this.setupListeners();
  }

  setupListeners() {
    const listen = (element, event, callback) => {
      element.addEventListener(event, callback);
      this.listeners.push(() => element.removeEventListener(event, callback));
    };
    const dpad = document.getElementById('virtual-dpad');
    const overlay = document.getElementById('touch-overlay');
    if (!dpad || !overlay) return;

    // Detect touch device or small screen and display overlay
    const updateVisibility = () => {
      const isTouchDevice = navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches;
      overlay.style.display = isTouchDevice || window.innerWidth < 760 ? 'block' : 'none';
    };
    updateVisibility();
    listen(window, 'resize', updateVisibility);

    const setDir = (dx, dy) => {
      this.vector = normalize(dx, dy);
    };

    const clearDir = () => {
      this.vector = { x: 0, y: 0 };
    };

    const bindButton = (id, dx, dy) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      listen(btn, 'pointerdown', (e) => {
        e.preventDefault();
        setDir(dx, dy);
      });
      listen(btn, 'pointerup', clearDir);
      listen(btn, 'pointercancel', clearDir);
      listen(btn, 'pointerleave', clearDir);
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
      listen(actionBtn, 'pointerdown', (e) => {
        e.preventDefault();
        this.actionPressed = true;
      });
      listen(actionBtn, 'pointerup', () => {
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

  destroy() {
    this.listeners.forEach(remove => remove());
    this.listeners = [];
    this.vector = { x: 0, y: 0 };
    const overlay = document.getElementById('touch-overlay');
    if (overlay) overlay.style.display = 'none';
  }
}
