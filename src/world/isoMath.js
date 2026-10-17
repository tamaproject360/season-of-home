import { TILE } from '../config/constants.js';

/**
 * Isometric Mathematical Projection & Coordinate Conversion
 * Adheres strictly to 2:1 dimetric projection (TILE.WIDTH = 64, TILE.HEIGHT = 32).
 */

export function tileToScreen(tx, ty, originX = 0, originY = 0) {
  return {
    x: originX + (tx - ty) * (TILE.WIDTH / 2),
    y: originY + (tx + ty) * (TILE.HEIGHT / 2)
  };
}

export function screenToTile(sx, sy, originX = 0, originY = 0) {
  const x = (sx - originX) / (TILE.WIDTH / 2);
  const y = (sy - originY) / (TILE.HEIGHT / 2);
  return {
    tx: (x + y) / 2,
    ty: (y - x) / 2
  };
}

export function worldScreenToTile(worldX, worldY, camera, originX = 0, originY = 0) {
  if (camera?.getWorldPoint) {
    const point = camera.getWorldPoint(worldX, worldY);
    return screenToTile(point.x, point.y, originX, originY);
  }
  const zoom = camera?.zoom ?? 1;
  const centerX = (camera?.width ?? 0) / 2;
  const centerY = (camera?.height ?? 0) / 2;
  const sx = (worldX - (camera?.x ?? 0) - centerX) / zoom + centerX + (camera?.scrollX ?? 0);
  const sy = (worldY - (camera?.y ?? 0) - centerY) / zoom + centerY + (camera?.scrollY ?? 0);
  return screenToTile(sx, sy, originX, originY);
}
