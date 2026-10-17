import { TitleMenu } from '../ui/TitleMenu.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super({ key: 'TitleScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#304B43');
    document.getElementById('touch-overlay').style.display = 'none';
    this.menu = new TitleMenu(this);
    this.events.once('shutdown', () => this.menu.destroy());
  }
}
