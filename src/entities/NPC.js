import { tileToScreen } from '../world/isoMath.js';

/**
 * NPC Entity
 * Represents interactive villagers (Nara, Bima, Suri) with idle animations,
 * depth sorting, and dialogue hooks.
 */
export class NPC {
  constructor(scene, config) {
    this.scene = scene;
    this.id = config.id;
    this.name = config.name;
    this.title = config.title || 'Warga Desa';
    this.tileX = config.tileX;
    this.tileY = config.tileY;
    this.facing = config.facing || 'sw';
    this.textureKey = config.textureKey || `${config.id}_spritesheet`;
    this.portraitKey = config.portraitKey || `${config.id}_bust`;
    this.active = true;

    // Screen coordinates
    const screenPos = tileToScreen(this.tileX, this.tileY);
    this.x = screenPos.x;
    this.y = screenPos.y;

    const rowMap = { sw: 0, se: 1, nw: 2, ne: 3 };
    const initialFrame = (rowMap[this.facing] || 0) * 4;

    // Sprite setup
    this.sprite = scene.add.sprite(this.x, this.y, this.textureKey, initialFrame);
    this.sprite.setOrigin(0.5, 0.92);
    this.sprite.setScale(0.26);
    this.sprite.setDepth(500 + Math.round(this.y));

    this.registerAnimations();
    this.playIdleAnimation();
  }

  registerAnimations() {
    const anims = this.scene.anims;
    const rowMap = {
      sw: 0,
      se: 1,
      nw: 2,
      ne: 3
    };

    for (const [dir, row] of Object.entries(rowMap)) {
      const base = row * 4;
      const animKey = `${this.id}-idle-${dir}`;
      if (!anims.exists(animKey)) {
        anims.create({
          key: animKey,
          frames: [
            { key: this.textureKey, frame: base },
            { key: this.textureKey, frame: base + 1 }
          ],
          frameRate: 2,
          repeat: -1
        });
      }
    }
  }

  playIdleAnimation() {
    const animKey = `${this.id}-idle-${this.facing}`;
    if (this.scene.anims.exists(animKey)) {
      this.sprite.play(animKey, true);
    }
  }

  setFacing(facing) {
    this.facing = facing;
    this.playIdleAnimation();
  }

  facePlayer(playerTileX, playerTileY) {
    const dx = playerTileX - this.tileX;
    const dy = playerTileY - this.tileY;
    if (dx > 0 && dy >= 0) this.facing = 'se';
    else if (dx <= 0 && dy > 0) this.facing = 'sw';
    else if (dx >= 0 && dy < 0) this.facing = 'ne';
    else if (dx < 0 && dy <= 0) this.facing = 'nw';
    this.playIdleAnimation();
  }

  getFootY() {
    return this.y;
  }

  syncScreenPosition() {
    const screenPos = tileToScreen(this.tileX, this.tileY);
    this.x = screenPos.x;
    this.y = screenPos.y;
    this.sprite.setPosition(this.x, this.y);
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
