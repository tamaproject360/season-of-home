import { VIEWPORT } from './config/constants.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

/**
 * Main Game Bootstrap
 * Pinned to Phaser 3.88.2 with Nearest-Neighbor Pixel Art rendering.
 */
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: VIEWPORT.WIDTH,
  height: VIEWPORT.HEIGHT,
  pixelArt: false,
  antialias: true,
  roundPixels: true,
  backgroundColor: '#304B43',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, PreloadScene, TitleScene, GameScene, UIScene]
};

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(config);
  window.__SOH_GAME__ = game;
  console.log('[Main] Seasons of Home game initialized successfully.');
});
