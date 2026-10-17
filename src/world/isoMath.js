import { TILE, CAMERA_MODE } from '../config/constants.js';

export const PROJECTION_MODE = {
  ISOMETRIC: CAMERA_MODE?.ISOMETRIC ?? 'isometric',
  TOPDOWN: CAMERA_MODE?.TOPDOWN ?? 'topdown'
};

let currentProjectionMode = PROJECTION_MODE.ISOMETRIC;

/** Get the currently active projection mode ('isometric' or 'topdown'). */
export function getProjectionMode() {
  return currentProjectionMode;
}

/** Set the active projection mode. */
export function setProjectionMode(mode) {
  if (mode === PROJECTION_MODE.TOPDOWN || mode === PROJECTION_MODE.ISOMETRIC) {
    currentProjectionMode = mode;
  }
  return currentProjectionMode;
}

/**
 * Coordinate Projection from Tile (tx, ty) to Screen (x, y)
 * Supports 2:1 Isometric and 2D Orthogonal Top-Down modes.
 */
export function tileToScreen(tx, ty, originX = 0, originY = 0, mode = currentProjectionMode) {
  if (mode === PROJECTION_MODE.TOPDOWN) {
    const size = TILE.ORTHO_SIZE || 48;
    return {
      x: originX + tx * size,
      y: originY + ty * size
    };
  }
  return {
    x: originX + (tx - ty) * (TILE.WIDTH / 2),
    y: originY + (tx + ty) * (TILE.HEIGHT / 2)
  };
}

/**
 * Inverse Coordinate Projection from Screen (sx, sy) to Tile (tx, ty)
 */
export function screenToTile(sx, sy, originX = 0, originY = 0, mode = currentProjectionMode) {
  if (mode === PROJECTION_MODE.TOPDOWN) {
    const size = TILE.ORTHO_SIZE || 48;
    return {
      tx: (sx - originX) / size,
      ty: (sy - originY) / size
    };
  }
  const x = (sx - originX) / (TILE.WIDTH / 2);
  const y = (sy - originY) / (TILE.HEIGHT / 2);
  return {
    tx: (x + y) / 2,
    ty: (y - x) / 2
  };
}

/**
 * Converts world/screen coordinates under active camera to grid tile coordinates.
 */
export function worldScreenToTile(worldX, worldY, camera, originX = 0, originY = 0, mode = currentProjectionMode) {
  if (camera?.getWorldPoint) {
    const point = camera.getWorldPoint(worldX, worldY);
    return screenToTile(point.x, point.y, originX, originY, mode);
  }
  const zoom = camera?.zoom ?? 1;
  const centerX = (camera?.width ?? 0) / 2;
  const centerY = (camera?.height ?? 0) / 2;
  const sx = (worldX - (camera?.x ?? 0) - centerX) / zoom + centerX + (camera?.scrollX ?? 0);
  const sy = (worldY - (camera?.y ?? 0) - centerY) / zoom + centerY + (camera?.scrollY ?? 0);
  return screenToTile(sx, sy, originX, originY, mode);
}
