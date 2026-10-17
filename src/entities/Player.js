import { tileToScreen } from '../world/isoMath.js';

/**
 * Player Entity (Joni)
 * Controls player state, isometric coordinate mapping, and animations.
 */
export class Player {
  constructor(scene, spawnTileX, spawnTileY, facing = 'se') {
    this.scene = scene;
    this.tileX = spawnTileX;
    this.tileY = spawnTileY;
    this.facing = facing;
    this.vx = 0;
    this.vy = 0;
    this.active = true;

    // Screen coordinates from initial tile
    const screenPos = tileToScreen(this.tileX, this.tileY);
    this.x = screenPos.x;
    this.y = screenPos.y;

    // Sprite setup (frame size 313x313, scale 0.26, feet anchor at bottom center x:0.5, y:0.92)
    this.sprite = scene.add.sprite(this.x, this.y, 'joni_spritesheet', 0);
    this.sprite.setOrigin(0.5, 0.92);
    this.sprite.setScale(0.26);

    this.registerAnimations();
    this.playIdleAnimation();
  }

  registerAnimations() {
    const anims = this.scene.anims;
    if (anims.exists('joni-walk-se')) return; // Already registered

    const rowMap = {
      sw: 0, // frames 0..3 (Front-left / South-West)
      se: 1, // frames 4..7 (Front-right / South-East)
      nw: 2, // frames 8..11 (Back-left / North-West)
      ne: 3  // frames 12..15 (Back-right / North-East)
    };

    for (const [dir, row] of Object.entries(rowMap)) {
      const base = row * 4;
      // Idle: single frame or 2-frame
      anims.create({
        key: `joni-idle-${dir}`,
        frames: [{ key: 'joni_spritesheet', frame: base }],
        frameRate: 1,
        repeat: -1
      });

      // Walk cycle: [Walk 1, Idle, Walk 2, Idle]
      anims.create({
        key: `joni-walk-${dir}`,
        frames: [
          { key: 'joni_spritesheet', frame: base + 1 },
          { key: 'joni_spritesheet', frame: base },
          { key: 'joni_spritesheet', frame: base + 2 },
          { key: 'joni_spritesheet', frame: base }
        ],
        frameRate: 6,
        repeat: -1
      });

      // Action: frame 3
      anims.create({
        key: `joni-action-${dir}`,
        frames: [{ key: 'joni_spritesheet', frame: base + 3 }],
        frameRate: 4,
        repeat: 0
      });
    }
  }

  setFacingFromVector(dirX, dirY) {
    if (dirX === 0 && dirY === 0) return;

    // Isometric 8-way to 4 cardinal sprite visual directions
    if (dirX > 0 && dirY >= 0) {
      this.facing = 'se';
    } else if (dirX <= 0 && dirY > 0) {
      this.facing = 'sw';
    } else if (dirX >= 0 && dirY < 0) {
      this.facing = 'ne';
    } else if (dirX < 0 && dirY <= 0) {
      this.facing = 'nw';
    }
  }

  updatePosition(newTileX, newTileY, isMoving) {
    this.tileX = newTileX;
    this.tileY = newTileY;

    // Convert tile coordinates to screen coordinates
    const screenPos = tileToScreen(this.tileX, this.tileY);
    this.x = screenPos.x;
    this.y = screenPos.y;

    this.sprite.setPosition(this.x, this.y);

    // Update animations
    const targetAnim = isMoving ? `joni-walk-${this.facing}` : `joni-idle-${this.facing}`;
    if (this.sprite.anims.currentAnim?.key !== targetAnim) {
      this.sprite.play(targetAnim, true);
    }
  }

  playIdleAnimation() {
    this.sprite.play(`joni-idle-${this.facing}`, true);
  }

  playActionAnimation(onComplete) {
    this.sprite.play(`joni-action-${this.facing}`, true);
    if (onComplete) {
      this.sprite.once('animationcomplete', onComplete);
    }
  }

  syncScreenPosition() {
    const screenPos = tileToScreen(this.tileX, this.tileY);
    this.x = screenPos.x;
    this.y = screenPos.y;
    if (this.sprite && typeof this.sprite.setPosition === 'function') {
      this.sprite.setPosition(this.x, this.y);
    }
  }

  getFootY() {
    return this.y;
  }
}
