import { StorageRepo } from '../persistence/SaveRepository.js';
import { SettingsRepository, applySettings } from '../persistence/SettingsRepository.js';
import { createNewSave, OUTFITS } from '../persistence/SaveSerializer.js';
import { escapeHtml, settingsMarkup, readSettings } from './settingsView.js';

export class TitleMenu {
  constructor(scene) {
    this.scene = scene;
    this.settingsRepository = new SettingsRepository(StorageRepo);
    this.slots = [];
    this.message = '';
    this.mode = 'slots';
    this.root = document.createElement('div');
    this.root.className = 'title-screen';
    document.getElementById('app-container').appendChild(this.root);
    this.root.addEventListener('click', event => this.handleClick(event));
    this.root.addEventListener('submit', event => this.handleSubmit(event));
    this.ready = this.refresh();
  }

  async refresh() {
    try {
      this.settings = await this.settingsRepository.load();
      applySettings(this.settings, this.scene.game);
      this.slots = await StorageRepo.listSlots();
      this.render();
    } catch (error) { this.message = error.message; this.render(); }
  }

  render() {
    const title = this.mode === 'settings' ? 'Pengaturan' : this.mode === 'new' ? `Kebun Baru · Slot ${this.selectedSlot}` : 'Pilih kebunmu';
    let content = '';
    if (this.mode === 'new') {
      content = `<form class="phase4-form" data-new-form>
        <img class="character-preview" src="asset/characters/portraits/joni_bust.png" alt="Petani baru">
        <label>Nama petani<input name="playerName" maxlength="24" required value="Joni" autocomplete="off"></label>
        <fieldset class="outfit-options"><legend>Warna busana</legend>${Object.entries(OUTFITS).map(([id, outfit], i) =>
        `<label><input type="radio" name="appearanceId" value="${id}" ${i === 0 ? 'checked' : ''}>${outfit.name}</label>`).join('')}</fieldset>
        <p class="phase4-note">Bekal awal: 80 koin, alat tani, bibit, serta bahan kerajinan dari pondok.</p>
        <button class="phase4-button" type="submit">Mulai di Slot ${this.selectedSlot}</button>
      </form>`;
    } else if (this.mode === 'settings') {
      content = settingsMarkup(this.settings);
    } else {
      content = `<div class="save-slots">${this.slots.map(slot => `<article class="save-slot">
        <span class="eyebrow">SLOT ${slot.slotId}</span><h3>${escapeHtml(slot.occupied ? slot.name || 'Save perlu diperiksa' : 'Kebun baru')}</h3>
        <p>${slot.occupied ? `Hari ${Number(slot.day) || '?'} · Tersimpan lokal` : 'Mulai kisah pertanianmu di Lembah Rimbun.'}</p>
        <button class="phase4-button" data-${slot.occupied ? 'load' : 'new'}="${slot.slotId}">${slot.occupied ? 'Lanjutkan' : 'Buat kebun'}</button>
        ${slot.occupied ? `<button class="phase4-button secondary" data-delete="${slot.slotId}">Hapus slot</button>` : ''}
        ${this.confirmDelete === slot.slotId ? `<div class="confirm-box"><p>Hapus Slot ${slot.slotId} dan cadangannya?</p><button class="phase4-button" data-confirm-delete="${slot.slotId}">Ya, hapus</button><button class="phase4-button secondary" data-cancel>Batalkan</button></div>` : ''}
      </article>`).join('')}</div>
      ${this.recoverySlot ? `<button class="phase4-button" data-recover="${this.recoverySlot}">Pulihkan cadangan Slot ${this.recoverySlot}</button>` : ''}
      <button class="phase4-button secondary" data-settings>Pengaturan</button>`;
    }
    this.root.innerHTML = `<section class="title-card"><span class="eyebrow">KEHIDUPAN KECIL DI LEMBAH RIMBUN</span>
      <h1>Seasons of Home</h1><h2>${title}</h2>
      ${StorageRepo.usingFallback ? '<p class="confirm-box">Progres hanya disimpan untuk sesi ini karena penyimpanan browser tidak tersedia.</p>' : ''}
      <p class="phase4-message" role="status">${escapeHtml(this.message)}</p>${content}
      ${this.mode !== 'slots' ? '<button class="phase4-button secondary" data-back>Kembali ke pilihan slot</button>' : ''}
      <p class="phase4-note">WASD / panah: bergerak · E: aksi · Esc: menu · Scroll / + −: zoom · 0: reset</p>
    </section>`;
  }

  async run(action) {
    if (this.busy) return;
    this.busy = true;
    this.root.querySelectorAll('button').forEach(button => { button.disabled = true; });
    try { await action(); }
    catch (error) { this.message = error.message; if (!this.destroyed) this.render(); }
    finally {
      this.busy = false;
      this.root.querySelectorAll('button').forEach(button => { button.disabled = false; });
    }
  }

  handleClick(event) {
    const button = event.target.closest('button');
    if (!button || this.busy) return;
    if (button.dataset.new) {
      this.selectedSlot = Number(button.dataset.new); this.mode = 'new'; this.message = ''; this.render();
      this.root.querySelector('input[name="playerName"]').focus();
    } else if (button.dataset.load || button.dataset.recover) {
      const slot = Number(button.dataset.load || button.dataset.recover);
      this.run(async () => {
        try {
          const save = await StorageRepo.loadSlot(slot, { recover: Boolean(button.dataset.recover) });
          if (!save) throw new Error('Slot ini kosong.');
          this.scene.scene.start('GameScene', { save, settings: this.settings });
        } catch (error) {
          if (error.code === 'RECOVERY_REQUIRED') this.recoverySlot = slot;
          throw error;
        }
      });
    } else if (button.dataset.delete) {
      this.confirmDelete = Number(button.dataset.delete); this.render();
    } else if (button.dataset.confirmDelete) {
      this.run(async () => {
        await StorageRepo.deleteSlot(Number(button.dataset.confirmDelete));
        this.confirmDelete = null; this.recoverySlot = null; this.message = 'Slot berhasil dihapus.';
        await this.refresh();
      });
    } else if (button.hasAttribute('data-settings')) {
      this.mode = 'settings'; this.message = ''; this.render();
    } else if (button.hasAttribute('data-back') || button.hasAttribute('data-cancel')) {
      this.mode = 'slots'; this.confirmDelete = null; this.message = ''; this.render();
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (form.hasAttribute('data-new-form')) {
      const data = new FormData(form);
      this.run(async () => {
        const save = createNewSave({ slotId: this.selectedSlot, name: data.get('playerName'), appearanceId: data.get('appearanceId') });
        const saved = await StorageRepo.saveSlot(save);
        this.scene.scene.start('GameScene', { save: saved, settings: this.settings });
      });
    } else if (form.hasAttribute('data-settings-form')) {
      const values = readSettings(form);
      this.run(async () => {
        this.settings = await this.settingsRepository.save(values);
        applySettings(this.settings, this.scene.game);
        this.message = 'Pengaturan disimpan.'; this.render();
      });
    }
  }

  destroy() { this.destroyed = true; this.root.remove(); }
}
