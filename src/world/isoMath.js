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
  // Account for camera scroll and zoom
  const zoom = camera ? camera.zoom : 1;
  const scrollX = camera ? camera.scrollX : 0;
  const scrollY = camera ? camera.scrollY : 0;
  
  const sx = (worldX + scrollX) / zoom;
  const sy = (worldY + scrollY) / zoom;
  return screenToTile(sx, sy, originX, originY);
}
