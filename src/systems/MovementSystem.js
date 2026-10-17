import { GAMEPLAY } from '../config/constants.js';

/**
 * MovementSystem
 * Implements frame-independent exponential damping movement and two-axis collision.
 */
export class MovementSystem {
  constructor(navGrid) {
    this.navGrid = navGrid;
  }

  update(player, inputVector, deltaMs) {
    // Bound dt to prevent jumps on tab unfocus/focus
    const dt = Math.min(deltaMs / 1000, GAMEPLAY.MAX_DELTA_SECONDS);

    // Target velocity in tile space
    const targetVX = inputVector.x * GAMEPLAY.PLAYER_SPEED;
    const targetVY = inputVector.y * GAMEPLAY.PLAYER_SPEED;

    // Exponential velocity damping (smoothing)
    const follow = 1 - Math.exp(-GAMEPLAY.VELOCITY_DAMPING * dt);
    player.vx = player.vx + (targetVX - player.vx) * follow;
    player.vy = player.vy + (targetVY - player.vy) * follow;

    // Negligible velocity threshold
    if (Math.abs(player.vx) < 0.005) player.vx = 0;
    if (Math.abs(player.vy) < 0.005) player.vy = 0;

    const isMoving = Math.abs(player.vx) > 0.05 || Math.abs(player.vy) > 0.05;

    if (isMoving) {
      player.setFacingFromVector(inputVector.x, inputVector.y);

      // Desired movement in this frame (tile units)
      const moveX = player.vx * dt;
      const moveY = player.vy * dt;

      // Two-axis collision sliding
      const resolved = this.navGrid.resolveCollision(player.tileX, player.tileY, moveX, moveY, 0.35);
      player.updatePosition(resolved.x, resolved.y, true);
    } else {
      player.updatePosition(player.tileX, player.tileY, false);
    }
  }
}
