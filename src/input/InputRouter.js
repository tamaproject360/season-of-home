import { DesktopInput } from './DesktopInput.js';
import { TouchControls } from './TouchControls.js';
import { normalize } from '../utils/math.js';

/**
 * InputRouter
 * Unifies Desktop (keyboard) and Touch inputs, manages modal input freezing.
 */
export class InputRouter {
  constructor(scene) {
    this.scene = scene;
    this.desktop = new DesktopInput(scene);
    this.touch = new TouchControls();
    this.isFrozen = false;
  }

  setFrozen(frozen) {
    this.isFrozen = frozen;
  }

  getMovementVector() {
    if (this.isFrozen) {
      return { x: 0, y: 0 };
    }

    const dVec = this.desktop.getMovementVector();
    const tVec = this.touch.getMovementVector();

    const combinedX = dVec.x + tVec.x;
    const combinedY = dVec.y + tVec.y;

    return normalize(combinedX, combinedY);
  }

  isActionRequested() {
    if (this.isFrozen) return false;
    return this.desktop.isInteractJustPressed() || this.touch.consumeActionPress();
  }
}
