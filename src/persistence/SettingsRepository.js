export const DEFAULT_SETTINGS = {
  masterVolume: 0.7, musicVolume: 0.5, sfxVolume: 0.8,
  muted: false, reducedMotion: false, textScale: 1, touchControlSize: 1
};

export class SettingsRepository {
  constructor(repository) { this.repository = repository; }

  normalize(values = {}) {
    const result = { ...DEFAULT_SETTINGS };
    for (const key of ['masterVolume', 'musicVolume', 'sfxVolume']) {
      if (Number.isFinite(values[key])) result[key] = Math.max(0, Math.min(1, values[key]));
    }
    result.reducedMotion = values.reducedMotion === true;
    result.muted = values.muted === true;
    if ([1, 1.25, 1.5].includes(values.textScale)) result.textScale = values.textScale;
    if ([1, 1.25, 1.5].includes(values.touchControlSize)) result.touchControlSize = values.touchControlSize;
    return result;
  }

  async load() { return this.normalize(await this.repository.getAppMeta('settings') || {}); }
  async save(values) {
    const result = this.normalize({ ...await this.load(), ...values });
    await this.repository.setAppMeta('settings', result);
    return result;
  }
}

/** Apply persisted accessibility and volume preferences to the DOM and engine. */
export function applySettings(settings, game = null) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--font-size-sm', `${13 * settings.textScale}px`);
    root.style.setProperty('--font-size-md', `${16 * settings.textScale}px`);
    root.style.setProperty('--touch-scale', String(settings.touchControlSize));
    root.classList.toggle('reduced-motion', settings.reducedMotion);
  }
  if (game?.sound) game.sound.volume = settings.muted ? 0 : settings.masterVolume;
}
