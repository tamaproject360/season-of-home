import { normalize } from '../utils/math.js';

/**
 * DesktopInput
 * Handles keyboard input for 8-way movement and game action keys.
 */
export class DesktopInput {
  constructor(scene) {
    this.scene = scene;
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      arrowUp: Phaser.Input.Keyboard.KeyCodes.UP,
      arrowDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
      arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
      arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      journal: Phaser.Input.Keyboard.KeyCodes.J,
      inventory: Phaser.Input.Keyboard.KeyCodes.I,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC
    });
  }

  getMovementVector() {
    let dx = 0;
    let dy = 0;

    const up = this.keys.up.isDown || this.keys.arrowUp.isDown;
    const down = this.keys.down.isDown || this.keys.arrowDown.isDown;
    const left = this.keys.left.isDown || this.keys.arrowLeft.isDown;
    const right = this.keys.right.isDown || this.keys.arrowRight.isDown;

    if (up) dy -= 1;
    if (down) dy += 1;
    if (left) dx -= 1;
    if (right) dx += 1;

    return normalize(dx, dy);
  }

  isInteractJustPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.interact);
  }
}
