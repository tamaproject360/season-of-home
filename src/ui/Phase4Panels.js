import { ITEMS, getItemDefinition } from '../data/items.js';
import { RECIPES, SHOP_STOCK } from '../data/recipes.js';
import { SettingsRepository, applySettings } from '../persistence/SettingsRepository.js';
import { StorageRepo } from '../persistence/SaveRepository.js';
import { escapeHtml, settingsMarkup, readSettings } from './settingsView.js';

export class Phase4Panels {
  constructor(scene, uiScene) {
    this.scene = scene;
    this.ui = uiScene;
    this.active = false;
    this.root = document.createElement('div');
    this.root.className = 'modal-backdrop phase4-backdrop';
    this.root.style.display = 'none';
    document.getElementById('app-container').appendChild(this.root);
    this.root.addEventListener('click', event => this.onClick(event));
    this.root.addEventListener('submit', event => this.onSubmit(event));
    this.keyHandler = event => {
      if (event.key === 'Escape') {
        if (this.ui.dialoguePanel.active || this.ui.menuController.isOpen || this.ui.menuController.isJournalOpen) return;
        event.preventDefault(); event.stopImmediatePropagation();
        if (this.busy) return;
        if (this.active) this.close(); else this.openPause();
      } else if (event.key === 'Tab' && this.active) {
        const elements = [...this.root.querySelectorAll('button:not(:disabled), input, select')];
        if (!elements.length) return;
        if (event.shiftKey && document.activeElement === elements[0]) {
          event.preventDefault(); elements.at(-1).focus();
        } else if (!event.shiftKey && document.activeElement === elements.at(-1)) {
          event.preventDefault(); elements[0].focus();
        }
      }
    };
    window.addEventListener('keydown', this.keyHandler, true);
  }

  show(title, content) {
    if (!this.active) this.previousFocus = document.activeElement;
    this.ui.menuController.closeInventory();
    this.ui.menuController.closeJournal();
    this.active = true;
    this.scene.inputRouter.setFrozen(true);
    this.scene.worldClock.freeze();
    this.root.style.display = 'flex';
    this.root.innerHTML = `<section class="modal-window phase4-window" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <header class="modal-header"><h2 class="modal-title">${escapeHtml(title)}</h2><button class="phase4-button secondary" data-close aria-label="Tutup">Tutup ×</button></header>
      <div class="phase4-message" role="status">${escapeHtml(this.message || '')}</div>${content}</section>`;
    this.root.querySelector('button')?.focus();
  }

  close() {
    if (this.busy) return;
    this.beforeClose?.(); this.beforeClose = null;
    this.active = false; this.root.style.display = 'none'; this.message = '';
    this.scene.inputRouter.setFrozen(false);
    this.scene.worldClock.unfreeze();
    this.previousFocus?.focus?.();
  }

  openShop(tab = 'buy') {
    this.kind = 'shop'; this.tab = tab;
    const ids = tab === 'buy' ? SHOP_STOCK : Object.keys(ITEMS).filter(id => ITEMS[id].sellable && this.scene.inventory.hasItem(id));
    this.show('Kios Nara', `<p class="phase4-balance">Saldo: ${this.scene.wallet.coins} koin daun</p>
      <nav class="phase4-tabs"><button class="phase4-button ${tab === 'sell' ? 'secondary' : ''}" data-tab="buy">Beli</button><button class="phase4-button ${tab === 'buy' ? 'secondary' : ''}" data-tab="sell">Jual</button></nav>
      <div class="trade-list">${ids.length ? ids.map(id => {
        const item = ITEMS[id];
        return `<article class="trade-row"><img src="${item.icon}" alt=""><div><strong>${item.name}</strong><p>${tab === 'buy' ? item.buyPrice : item.sellPrice} koin / buah · Di tas: ${this.scene.inventory.getItemCount(id)}</p></div>
          <label>Jumlah<input type="number" min="1" max="${tab === 'sell' ? this.scene.inventory.getItemCount(id) : 999}" step="1" value="1" data-quantity="${id}" aria-label="Jumlah ${item.name}"></label>
          <button class="phase4-button" data-trade="${id}">${tab === 'buy' ? 'Beli' : 'Jual'}</button></article>`;
      }).join('') : '<p>Belum ada hasil atau bahan yang dapat dijual.</p>'}</div>`);
  }

  openCraft() {
    this.kind = 'craft';
    this.show('Bengkel Bima', `<p class="phase4-balance">Saldo: ${this.scene.wallet.coins} koin · Penyiram level ${this.scene.profile.toolLevel.wateringCan}</p>
      <div class="trade-list">${Object.values(RECIPES).filter(recipe => !recipe.station || recipe.station === 'crafting').map(recipe => {
        const enough = this.scene.wallet.coins >= recipe.coins && recipe.inputs.every(i => this.scene.inventory.hasItem(i.itemId, i.count));
        const upgraded = recipe.id === 'watering_can_upgrade' && this.scene.inventory.hasItem('tool_reinforced_can');
        return `<article class="recipe-row"><img src="${getItemDefinition(recipe.outputs[0].itemId).icon}" alt=""><div><h3>${recipe.name}</h3>
          <p>${recipe.inputs.map(i => `${getItemDefinition(i.itemId).name}: ${this.scene.inventory.getItemCount(i.itemId)}/${i.count}`).join(' · ')}</p>
          <p>Biaya: ${recipe.coins} koin${upgraded ? ' · Sudah ditingkatkan' : ''}</p></div>
          <button class="phase4-button" data-craft="${recipe.id}" ${!enough || upgraded ? 'disabled' : ''}>Buat</button></article>`;
      }).join('')}</div>`);
  }

  openPause() {
    if (this.ui.dialoguePanel.active) return;
    this.kind = 'pause';
    this.show('Istirahat sejenak', `<p>${escapeHtml(this.scene.profile.name)} · Slot ${this.scene.saveData.slotId} · Hari ${this.scene.worldClock.day}</p>
      <div class="phase4-actions"><button class="phase4-button" data-save>Simpan / Coba lagi</button>
      <button class="phase4-button secondary" data-settings>Pengaturan</button>
      <button class="phase4-button secondary" data-life-map>Catatan desa & kegiatan Phase 5</button>
      <button class="phase4-button secondary" data-exit>Simpan & kembali ke judul</button>
      <button class="phase4-button secondary" data-close>Lanjut bermain</button></div>`);
  }

  openSettings() { this.kind = 'settings'; this.show('Pengaturan', settingsMarkup(this.scene.settings)); }

  async perform(action, redraw) {
    if (this.busy) return;
    this.busy = true;
    this.root.querySelectorAll('button').forEach(b => { b.disabled = true; });
    try { await action(); }
    catch (error) { this.message = error.message; }
    finally { this.busy = false; if (this.active) redraw?.(); }
  }

  onClick(event) {
    const button = event.target.closest('button');
    if (!button || this.busy) return;
    if (button.hasAttribute('data-close')) this.close();
    else if (button.dataset.tab) this.openShop(button.dataset.tab);
    else if (button.dataset.trade) {
      const id = button.dataset.trade;
      const quantity = Number(this.root.querySelector(`[data-quantity="${id}"]`).value);
      const result = this.scene.economy[this.tab](id, quantity);
      if (result.success) this.scene.audio.play('talk');
      this.message = result.message; this.openShop(this.tab);
    } else if (button.dataset.craft) {
      const result = this.scene.crafting.craft(button.dataset.craft);
      if (result.success) this.scene.audio.play('craft');
      this.message = result.message; this.openCraft();
    } else if (button.hasAttribute('data-settings')) this.openSettings();
    else if (button.hasAttribute('data-save')) this.perform(async () => {
      await this.scene.saveManager.save();
      this.message = StorageRepo.usingFallback ? 'Disimpan hanya untuk sesi ini.' : 'Progres berhasil disimpan.';
    }, () => this.openPause());
    else if (button.hasAttribute('data-exit')) this.perform(async () => {
      await this.scene.saveManager.save();
      this.scene.scene.start('TitleScene');
    }, () => this.openPause());
  }

  onSubmit(event) {
    event.preventDefault();
    if (!event.target.hasAttribute('data-settings-form')) return;
    const values = readSettings(event.target);
    this.perform(async () => {
      this.scene.settings = await new SettingsRepository(StorageRepo).save(values);
      applySettings(this.scene.settings, this.scene.game);
      this.message = 'Pengaturan disimpan.';
    }, () => this.openSettings());
  }

  destroy() { this.active = false; window.removeEventListener('keydown', this.keyHandler, true); this.root.remove(); }
}
