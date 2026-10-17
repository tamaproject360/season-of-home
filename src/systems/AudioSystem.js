const SOUNDS = {
  step: [125, 0.045, 'triangle', 0.07], hoe: [185, 0.09, 'triangle', 0.12],
  water: [640, 0.12, 'sine', 0.08], harvest: [660, 0.16, 'sine', 0.12],
  mining: [310, 0.085, 'triangle', 0.13], talk: [420, 0.07, 'sine', 0.07],
  fish: [740, 0.2, 'sine', 0.11], pet: [560, 0.12, 'sine', 0.08], craft: [490, 0.13, 'triangle', 0.1]
};

/** Quiet procedural audio, created/resumed only from an actual user gesture. */
export class AudioSystem {
  constructor(getSettings, { contextFactory = globalThis.AudioContext || globalThis.webkitAudioContext,
    eventTarget = globalThis.window } = {}) {
    Object.assign(this, { getSettings, contextFactory, eventTarget });
    this.voices = new Set(); this.stepTime = 0; this.musicTime = 0; this.musicIndex = 0;
    this.gesture = () => { this.unlock().catch(() => {}); };
    eventTarget?.addEventListener('pointerdown', this.gesture, true);
    eventTarget?.addEventListener('keydown', this.gesture, true);
  }

  async unlock() {
    if (this.disposed || !this.contextFactory) return;
    try {
      if (!this.context) {
        this.context = new this.contextFactory();
        this.masterGain = this.context.createGain();
        this.sfxGain = this.context.createGain();
        this.musicGain = this.context.createGain();
        this.sfxGain.connect(this.masterGain); this.musicGain.connect(this.masterGain);
        this.masterGain.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') await this.context.resume();
      this.applyVolumes();
    } catch { /* Browsers may reject audio; gameplay remains fully available. */ }
  }

  applyVolumes() {
    if (!this.context || this.context.state === 'closed') return;
    const settings = this.getSettings();
    this.masterGain.gain.value = settings.muted ? 0 : settings.masterVolume;
    this.sfxGain.gain.value = settings.sfxVolume;
    this.musicGain.gain.value = settings.musicVolume;
  }

  tone(frequency, duration, type, volume, channel = 'sfx') {
    if (this.disposed || this.context?.state !== 'running' || this.voices.size >= 4) return false;
    const settings = this.getSettings();
    if (settings.muted || settings.masterVolume <= 0 || settings[channel === 'music' ? 'musicVolume' : 'sfxVolume'] <= 0) return false;
    this.applyVolumes();
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.linearRampToValueAtTime(frequency * 0.7, now + duration);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain); gain.connect(channel === 'music' ? this.musicGain : this.sfxGain);
    this.voices.add(oscillator);
    oscillator.onended = () => { this.voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(now); oscillator.stop(now + duration + 0.01);
    return true;
  }

  play(name) {
    const sound = SOUNDS[name];
    return sound ? this.tone(...sound) : false;
  }

  update(dt, { moving = false, paused = false } = {}) {
    this.applyVolumes();
    if (paused || this.context?.state !== 'running') return;
    this.stepTime += dt; this.musicTime += dt;
    if (moving && this.stepTime > 0.3) { this.play('step'); this.stepTime = 0; }
    if (this.musicTime > 4.5) {
      const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
      this.tone(melody[this.musicIndex++ % melody.length], 0.8, 'sine', 0.025, 'music');
      this.musicTime = 0;
    }
  }

  dispose() {
    this.disposed = true;
    this.eventTarget?.removeEventListener('pointerdown', this.gesture, true);
    this.eventTarget?.removeEventListener('keydown', this.gesture, true);
    for (const voice of this.voices) { try { voice.stop(); } catch { /* Already ended. */ } }
    this.voices.clear();
    this.context?.close().catch(() => {});
  }
}
