/**
 * 2D Navigation and Collision Grid
 * Resolves movements in world tile space before isometric projection.
 */
export class NavGrid {
  constructor(width = 16, height = 16) {
    this.width = width;
    this.height = height;
    // 2D grid matrix: 0 = walkable, 1 = solid obstacle, 2 = water edge / fence
    this.grid = Array.from({ length: height }, () => new Uint8Array(width));
    this.portalTriggers = [];
  }

  isWalkable(tx, ty) {
    const ix = Math.floor(tx);
    const iy = Math.floor(ty);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return false;
    }
    return this.grid[iy][ix] === 0;
  }

  setSolid(tx, ty, isSolid = true) {
    if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
      this.grid[ty][tx] = isSolid ? 1 : 0;
    }
  }

  setSolidRect(startX, startY, w, h, isSolid = true) {
    for (let y = startY; y < startY + h; y++) {
      for (let x = startX; x < startX + w; x++) {
        this.setSolid(x, y, isSolid);
      }
    }
  }

  /**
   * Two-axis collision resolution with sliding.
   * Tests X and Y independently to allow smooth sliding along walls and diagonal obstacles.
   */
  resolveCollision(currX, currY, moveX, moveY, radius = 0.35) {
    let nextX = currX + moveX;
    let nextY = currY + moveY;

    // Check bounds
    nextX = Math.max(radius, Math.min(this.width - 1 - radius, nextX));
    nextY = Math.max(radius, Math.min(this.height - 1 - radius, nextY));

    // Test X-axis movement
    const canMoveX =
      this.isWalkable(nextX - radius, currY - radius) &&
      this.isWalkable(nextX + radius, currY - radius) &&
      this.isWalkable(nextX - radius, currY + radius) &&
      this.isWalkable(nextX + radius, currY + radius);

    let resolvedX = canMoveX ? nextX : currX;

    // Test Y-axis movement with resolved X
    const canMoveY =
      this.isWalkable(resolvedX - radius, nextY - radius) &&
      this.isWalkable(resolvedX + radius, nextY - radius) &&
      this.isWalkable(resolvedX - radius, nextY + radius) &&
      this.isWalkable(resolvedX + radius, nextY + radius);

    let resolvedY = canMoveY ? nextY : currY;

    return { x: resolvedX, y: resolvedY };
  }
}
