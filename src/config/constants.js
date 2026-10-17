/**
 * Engine and Game Architecture Constants
 */
export const VIEWPORT = {
  WIDTH: 960,
  HEIGHT: 540
};

export const TILE = {
  WIDTH: 64,
  HEIGHT: 32,
  ORTHO_SIZE: 48
};

export const CAMERA_MODE = {
  ISOMETRIC: 'isometric',
  TOPDOWN: 'topdown'
};

export const GAMEPLAY = {
  // Movement speed in world tiles per second
  PLAYER_SPEED: 3.5,
  
  // Exponential damping factor for smooth movement
  VELOCITY_DAMPING: 12.0,
  
  // Maximum delta time step (100ms) to prevent simulation explosions on tab-switch
  MAX_DELTA_SECONDS: 0.1,
  
  // Interaction radius from player feet in tile units
  INTERACTION_RADIUS: 1.15,
  
  // Game day duration in seconds (10 minutes real time = 1 game day)
  DAY_DURATION_SECONDS: 600,
  
  // Starting coins
  STARTING_COINS: 80,
  
  // Inventory capacity
  INVENTORY_CAPACITY: 16
};

export const STORAGE_KEYS = {
  DB_NAME: 'lembah-rimbun-db',
  DB_VERSION: 1,
  SETTINGS: 'lembah-rimbun.settings.v1'
};
