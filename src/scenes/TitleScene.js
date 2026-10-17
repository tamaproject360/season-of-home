import { VIEWPORT } from '../config/constants.js';

/**
 * TitleScene
 * Handcrafted title screen with start game and slot options.
 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const cx = VIEWPORT.WIDTH / 2;
    const cy = VIEWPORT.HEIGHT / 2;

    // Background panel (Parchment styled)
    this.add.rectangle(cx, cy, VIEWPORT.WIDTH, VIEWPORT.HEIGHT, 0x304B43);
    
    // Decorative frame
    this.add.rectangle(cx, cy, VIEWPORT.WIDTH - 40, VIEWPORT.HEIGHT - 40, 0xF2E8D5)
      .setStrokeStyle(4, 0x87674E);

    // Title text
    this.add.text(cx, cy - 130, 'SEASONS OF HOME', {
      fontFamily: 'Georgia, serif',
      fontSize: '44px',
      color: '#2D3835',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, cy - 80, '— Lembah Rimbun —', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#87674E',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Character preview portrait
    this.add.image(cx, cy - 10, 'joni_bust').setDisplaySize(96, 96);
    this.add.text(cx, cy + 50, 'Protagonis: Joni', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#59483B',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Start Button
    const startGame = () => {
      console.log('[TitleScene] Starting GameScene...');
      this.scene.start('GameScene');
    };

    this.createButton(cx, cy + 105, 'Mulai Petualangan', startGame);

    // Keyboard support: Enter or Space to start
    this.input.keyboard.once('keydown-ENTER', startGame);
    this.input.keyboard.once('keydown-SPACE', startGame);

    // Subtitle / instructions
    this.add.text(cx, cy + 175, 'Klik tombol atau tekan Enter/Spasi untuk mulai • WASD / Panah bergerak', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#697A77'
    }).setOrigin(0.5);
  }

  createButton(x, y, text, callback) {
    const btnBg = this.add.rectangle(x, y, 220, 44, 0xBC7654)
      .setStrokeStyle(2, 0xEEE1C4)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(x, y, text, {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#EEE1C4',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const hoverOn = () => { btnBg.fillColor = 0x9E5D40; };
    const hoverOut = () => { btnBg.fillColor = 0xBC7654; };

    btnBg.on('pointerover', hoverOn);
    btnBg.on('pointerout', hoverOut);
    btnText.on('pointerover', hoverOn);
    btnText.on('pointerout', hoverOut);

    btnBg.on('pointerdown', callback);
    btnText.on('pointerdown', callback);

    return btnBg;
  }
}
