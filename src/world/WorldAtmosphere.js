export class WorldAtmosphere {
  constructor(uiScene, gameScene) {
    this.ui = uiScene; this.game = gameScene; this.elapsed = 0; this.lastRainFrame = -1;
    this.shade = uiScene.add.rectangle(480, 270, 960, 540, 0x354D5C).setAlpha(0);
    this.rain = uiScene.add.graphics();
  }

  update(dt) {
    const width = this.ui.scale.width, height = this.ui.scale.height;
    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width; this.lastHeight = height;
      this.shade.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    }
    const clock = this.game.worldClock;
    const hour = clock.timeMinutes / 60;
    const night = hour >= 18 ? Math.min(0.32, 0.12 + (hour - 18) * 0.035) : hour < 6 ? 0.28 : 0;
    this.shade.setAlpha(Math.max(night, clock.weather === 'rain' ? 0.09 : clock.weather === 'cloudy' ? 0.025 : 0));
    const raining = clock.weather === 'rain' && !this.game.settings.reducedMotion;
    this.rain.setVisible(raining);
    if (!raining) return;
    this.elapsed += dt;
    const frame = Math.floor(this.elapsed * 8);
    if (frame === this.lastRainFrame) return;
    this.lastRainFrame = frame;
    this.rain.clear(); this.rain.lineStyle(1, 0xBCD1C8, 0.5);
    for (let i = 0; i < 20; i++) {
      const x = (i * 137 + frame * 3) % this.ui.scale.width, y = (i * 89 + frame * 21) % this.ui.scale.height;
      this.rain.lineBetween(x, y, x - 3, y + 8);
    }
  }
}
