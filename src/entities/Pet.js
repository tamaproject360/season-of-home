import { NPC } from './NPC.js';
import { tileToScreen } from '../world/isoMath.js';

export class Pet extends NPC {
  constructor(scene, state, player) {
    const position = state.position || { tileX: player.tileX + 1, tileY: player.tileY };
    super(scene, { id: 'kiko', name: 'Kiko', ...position, facing: 'sw' });
    this.state = state;
    this.sprite.setScale(0.15);
    this.breadcrumbs = [];
    this.sampleTime = 0;
    this.stuckSeconds = 0;
    for (const [row, direction] of ['sw', 'se', 'nw', 'ne'].entries()) {
      if (!scene.anims.exists(`kiko-walk-${direction}`)) scene.anims.create({
        key: `kiko-walk-${direction}`, frames: [0, 1, 2, 0].map(frame => ({ key: this.textureKey, frame: row * 4 + frame })),
        frameRate: 6, repeat: -1
      });
    }
  }

  update(deltaSeconds, player, navGrid) {
    const dt = Math.min(deltaSeconds, 0.1);
    this.sampleTime += dt;
    if (this.sampleTime >= 0.15) {
      this.sampleTime = 0;
      const last = this.breadcrumbs.at(-1);
      if (!last || Math.hypot(last.x - player.tileX, last.y - player.tileY) > 0.2) {
        this.breadcrumbs.push({ x: player.tileX, y: player.tileY });
        if (this.breadcrumbs.length > 30) this.breadcrumbs.shift();
      }
    }
    let moving = false;
    if (this.state.mode === 'following') {
      if (Math.hypot(this.tileX - player.tileX, this.tileY - player.tileY) > 8) {
        this.tileX = player.tileX; this.tileY = player.tileY;
        this.breadcrumbs = [];
      }
      const target = this.breadcrumbs[0];
      if (target) {
        const dx = target.x - this.tileX, dy = target.y - this.tileY;
        const distance = Math.hypot(dx, dy);
        if (distance < 0.2) this.breadcrumbs.shift();
        else if (Math.hypot(player.tileX - this.tileX, player.tileY - this.tileY) > 0.9) {
          const speed = Math.min(distance, dt * 3.8);
          const next = navGrid.resolveCollision(this.tileX, this.tileY, dx / distance * speed, dy / distance * speed, 0.15);
          moving = Math.hypot(next.x - this.tileX, next.y - this.tileY) > 0.001;
          this.tileX = next.x; this.tileY = next.y;
          this.facing = dy >= 0 ? (dx > 0 ? 'se' : 'sw') : (dx > 0 ? 'ne' : 'nw');
        }
      }
    }
    if (this.state.mode === 'following' && !moving && Math.hypot(this.tileX - player.tileX, this.tileY - player.tileY) > 3) {
      this.stuckSeconds += dt;
      if (this.stuckSeconds > 3) {
        this.tileX = player.tileX; this.tileY = player.tileY; this.breadcrumbs = []; this.stuckSeconds = 0;
      }
    } else this.stuckSeconds = 0;
    const current = tileToScreen(this.tileX, this.tileY);
    this.x = current.x; this.y = current.y;
    this.sprite.setPosition(this.x, this.y);
    this.sprite.play(`kiko-${moving ? 'walk' : 'idle'}-${this.facing}`, true);
    this.state.position = { tileX: this.tileX, tileY: this.tileY };
  }

  reactToPetting() {
    this.scene.tweens.add({ targets: this.sprite, y: this.sprite.y - 5, duration: 120, yoyo: true, repeat: 1 });
  }
}
