/** Escape user-provided text inserted into DOM templates. */
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/** Render the shared settings form used by the title and pause menus. */
export function settingsMarkup(settings) {
  return `<form class="phase4-form" data-settings-form>
    <label>Ukuran teks<select name="textScale">${[1, 1.25, 1.5].map(n =>
    `<option value="${n}" ${settings.textScale === n ? 'selected' : ''}>${n * 100}%</option>`).join('')}</select></label>
    <label>Ukuran kontrol sentuh<select name="touchControlSize">${[1, 1.25, 1.5].map(n =>
    `<option value="${n}" ${settings.touchControlSize === n ? 'selected' : ''}>${n * 100}%</option>`).join('')}</select></label>
    <label class="checkbox-label"><input type="checkbox" name="reducedMotion" ${settings.reducedMotion ? 'checked' : ''}> Kurangi animasi</label>
    <label class="checkbox-label"><input type="checkbox" name="muted" ${settings.muted ? 'checked' : ''}> Matikan seluruh suara (mute)</label>
    ${[['masterVolume', 'Volume utama'], ['musicVolume', 'Volume musik'], ['sfxVolume', 'Volume efek suara']].map(([key, title]) =>
    `<label>${title}<input type="range" name="${key}" min="0" max="100" value="${Math.round(settings[key] * 100)}"></label>`).join('')}
    <button type="submit" class="phase4-button">Simpan pengaturan</button>
  </form>`;
}

/** Convert settings form fields to the typed preference payload. */
export function readSettings(form) {
  const data = new FormData(form);
  return { textScale: Number(data.get('textScale')), touchControlSize: Number(data.get('touchControlSize')),
    muted: data.has('muted'), reducedMotion: data.has('reducedMotion'), masterVolume: Number(data.get('masterVolume')) / 100,
    musicVolume: Number(data.get('musicVolume')) / 100, sfxVolume: Number(data.get('sfxVolume')) / 100 };
}
