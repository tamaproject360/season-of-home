import { getItemDefinition } from '../data/items.js';
import { getQuestDefinition } from '../data/quests.js';

/**
 * MenuController
 * Controls modals (16-slot Inventory Modal, Crafting, Journal).
 * Enforces input focus management: freezes player movement and world clock while open.
 */
export class MenuController {
  constructor(appContainer, inventory, worldClock, onFocusChange, questSystem = null) {
    this.container = appContainer;
    this.inventory = inventory;
    this.worldClock = worldClock;
    this.onFocusChange = onFocusChange; // (isMenuOpen: boolean) => void
    this.questSystem = questSystem;

    this.isOpen = false;
    this.isJournalOpen = false;
    this.selectedSlotIndex = null;

    this.initDOM();
    this.initJournalDOM();
    this.bindEvents();
  }

  initDOM() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.style.display = 'none';

    this.backdrop.innerHTML = `
      <div class="modal-window" id="inventory-modal">
        <div class="modal-header">
          <div class="modal-title">🎒 Tas Penyimpanan (16 Slot)</div>
          <button class="modal-close-btn" id="btn-close-inventory" title="Tutup (Esc)">✕</button>
        </div>
        <div class="inventory-grid" id="inventory-grid-container">
          <!-- 16 slots generated dynamically -->
        </div>
        <div class="inventory-details" id="inventory-item-details">
          <div class="item-title">Pilih item untuk melihat rincian</div>
          <div class="item-desc">Klik slot untuk memilih. Klik slot lain untuk memindahkan atau menumpuk item.</div>
        </div>
      </div>
    `;

    this.container.appendChild(this.backdrop);
    this.gridContainer = this.backdrop.querySelector('#inventory-grid-container');
    this.detailsContainer = this.backdrop.querySelector('#inventory-item-details');
    this.closeBtn = this.backdrop.querySelector('#btn-close-inventory');

    this.renderSlots();
  }

  initJournalDOM() {
    this.journalBackdrop = document.createElement('div');
    this.journalBackdrop.className = 'modal-backdrop';
    this.journalBackdrop.style.display = 'none';

    this.journalBackdrop.innerHTML = `
      <div class="modal-window" id="journal-modal" style="width: 580px;">
        <div class="modal-header">
          <div class="modal-title">📜 Jurnal Misi Desa</div>
          <button class="modal-close-btn" id="btn-close-journal" title="Tutup (Esc)">✕</button>
        </div>
        <div id="journal-quest-list" style="display:flex;flex-direction:column;gap:12px;max-height:360px;overflow-y:auto;padding-right:4px;">
          <!-- Rendered quests -->
        </div>
      </div>
    `;

    this.container.appendChild(this.journalBackdrop);
    this.questListContainer = this.journalBackdrop.querySelector('#journal-quest-list');
    this.journalCloseBtn = this.journalBackdrop.querySelector('#btn-close-journal');
  }

  bindEvents() {
    // Close button inventory
    this.closeBtn.addEventListener('click', () => {
      this.closeInventory();
    });

    // Close button journal
    if (this.journalCloseBtn) {
      this.journalCloseBtn.addEventListener('click', () => {
        this.closeJournal();
      });
    }

    // Close on backdrop click (outside window)
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.closeInventory();
      }
    });

    this.journalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.journalBackdrop) {
        this.closeJournal();
      }
    });

    // Open button on HUD
    const btnOpen = document.getElementById('btn-open-inventory');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        this.toggleInventory();
      });
    }

    const btnOpenJournal = document.getElementById('btn-open-journal');
    if (btnOpenJournal) {
      btnOpenJournal.addEventListener('click', () => {
        this.toggleJournal();
      });
    }

    // Keyboard 'I' for inventory, 'J' for journal, 'Escape' to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'i' || e.key === 'I') {
        this.toggleInventory();
      } else if (e.key === 'j' || e.key === 'J') {
        this.toggleJournal();
      } else if (e.key === 'Escape') {
        if (this.isOpen) this.closeInventory();
        if (this.isJournalOpen) this.closeJournal();
      }
    });

    // Sync when inventory updates
    this.inventory.onChange(() => {
      if (this.isOpen) {
        this.renderSlots();
      }
    });

    // Sync when quests update
    if (this.questSystem && this.questSystem.onChange) {
      this.questSystem.onChange(() => {
        if (this.isJournalOpen) {
          this.renderJournal();
        }
      });
    }
  }

  toggleJournal() {
    if (this.isJournalOpen) {
      this.closeJournal();
    } else {
      if (this.isOpen) this.closeInventory();
      this.openJournal();
    }
  }

  openJournal() {
    this.isJournalOpen = true;
    this.renderJournal();
    this.journalBackdrop.style.display = 'flex';
    if (this.onFocusChange) {
      this.onFocusChange(true);
    }
  }

  closeJournal() {
    this.isJournalOpen = false;
    this.journalBackdrop.style.display = 'none';
    if (!this.isOpen && this.onFocusChange) {
      this.onFocusChange(false);
    }
  }

  renderJournal() {
    if (!this.questListContainer || !this.questSystem) return;
    this.questListContainer.innerHTML = '';

    const allQuests = this.questSystem.getAllQuests();
    const visibleQuests = allQuests.filter(q => q.state !== 'locked');

    if (visibleQuests.length === 0) {
      this.questListContainer.innerHTML = `
        <div style="text-align:center;padding:20px;color:#87674E;font-style:italic;">
          Belum ada misi aktif. Bicaralah dengan warga desa (Nenek Suri, Paman Bima, atau Nara)!
        </div>
      `;
      return;
    }

    visibleQuests.forEach(q => {
      const def = getQuestDefinition(q.id);
      if (!def) return;

      const card = document.createElement('div');
      card.style.background = '#FCF9F2';
      card.style.border = '2px solid #87674E';
      card.style.borderRadius = '8px';
      card.style.padding = '12px 14px';

      const statusColor = q.state === 'completed' ? '#4C6B55' : (q.state === 'rewarded' ? '#87674E' : '#BC7654');
      const statusLabel = q.state === 'completed' ? 'Siap Lapor [✓]' : (q.state === 'rewarded' ? 'Selesai' : (q.state === 'active' ? 'Sedang Berjalan' : 'Tersedia'));

      let objectivesHtml = '';
      if (q.objectives && q.objectives.length > 0) {
        objectivesHtml = `
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">
            ${q.objectives.map(o => {
              const isDone = o.current >= o.target;
              return `
                <div style="font-size:13px;display:flex;align-items:center;color:${isDone ? '#4C6B55' : '#2D3835'};">
                  <span style="margin-right:6px;font-weight:bold;">${isDone ? '✓' : '○'}</span>
                  <span>${o.text} (${Math.min(o.current, o.target)}/${o.target})</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <strong style="font-size:16px;color:#304B43;">${def.title}</strong>
          <span style="font-size:11px;font-weight:bold;color:${statusColor};background:#EEE1C4;padding:2px 8px;border-radius:10px;">${statusLabel}</span>
        </div>
        <div style="font-size:12px;color:#87674E;margin-top:2px;">Pemberi: <strong>${def.giverName}</strong></div>
        <div style="font-size:13px;color:#555;margin-top:4px;line-height:1.4;">${def.description}</div>
        ${objectivesHtml}
      `;

      this.questListContainer.appendChild(card);
    });
  }

  toggleInventory() {
    if (this.isOpen) {
      this.closeInventory();
    } else {
      this.openInventory();
    }
  }

  openInventory() {
    this.isOpen = true;
    this.selectedSlotIndex = null;
    this.renderSlots();
    this.renderDetails(null);
    this.backdrop.style.display = 'flex';

    // Freeze game world and player input
    this.worldClock.freeze();
    if (this.onFocusChange) {
      this.onFocusChange(true);
    }
  }

  closeInventory() {
    this.isOpen = false;
    this.selectedSlotIndex = null;
    this.backdrop.style.display = 'none';

    // Unfreeze game world and player input
    this.worldClock.unfreeze();
    if (this.onFocusChange) {
      this.onFocusChange(false);
    }
  }

  renderSlots() {
    this.gridContainer.innerHTML = '';
    const slots = this.inventory.getSlots();

    slots.forEach((slot, idx) => {
      const slotEl = document.createElement('div');
      slotEl.className = 'inventory-slot';
      slotEl.dataset.index = String(idx);

      if (this.selectedSlotIndex === idx) {
        slotEl.classList.add('selected');
      }

      if (slot) {
        const itemDef = getItemDefinition(slot.itemId);
        if (itemDef) {
          const img = document.createElement('img');
          img.src = itemDef.icon;
          img.alt = itemDef.name;
          slotEl.appendChild(img);

          if (slot.count > 1) {
            const countEl = document.createElement('span');
            countEl.className = 'slot-count';
            countEl.textContent = String(slot.count);
            slotEl.appendChild(countEl);
          }
        }
      }

      // Slot click interaction (Select / Swap)
      slotEl.addEventListener('click', () => {
        this.handleSlotClick(idx);
      });

      this.gridContainer.appendChild(slotEl);
    });
  }

  handleSlotClick(index) {
    if (this.selectedSlotIndex === null) {
      // First click: select slot
      this.selectedSlotIndex = index;
      const slot = this.inventory.getSlot(index);
      this.renderDetails(slot ? getItemDefinition(slot.itemId) : null, slot);
      this.renderSlots();
    } else if (this.selectedSlotIndex === index) {
      // Clicked same slot: deselect
      this.selectedSlotIndex = null;
      this.renderDetails(null);
      this.renderSlots();
    } else {
      // Clicked second slot: SWAP / MERGE
      const fromIdx = this.selectedSlotIndex;
      const toIdx = index;
      this.inventory.swapSlots(fromIdx, toIdx);
      this.selectedSlotIndex = null;
      const targetSlot = this.inventory.getSlot(toIdx);
      this.renderDetails(targetSlot ? getItemDefinition(targetSlot.itemId) : null, targetSlot);
      this.renderSlots();
    }
  }

  renderDetails(itemDef, slot = null) {
    if (!itemDef) {
      this.detailsContainer.innerHTML = `
        <div class="item-title">Pilih item untuk melihat rincian</div>
        <div class="item-desc">Klik slot untuk memilih. Klik slot lain untuk memindahkan atau menumpuk item.</div>
      `;
      return;
    }

    const priceText = itemDef.sellable ? `Harga jual: ${itemDef.sellPrice} 🍃` : 'Tidak dapat dijual (Item penting)';
    const countText = slot ? ` • Jumlah: ${slot.count}` : '';
    this.detailsContainer.innerHTML = `
      <div class="item-title">${itemDef.name} <span style="font-size:12px;color:#87674E;">[${itemDef.category.toUpperCase()}]${countText}</span></div>
      <div class="item-desc">${itemDef.description}</div>
      <div style="font-size:12px;color:#BC7654;margin-top:4px;font-weight:600;">${priceText}</div>
    `;
  }

  destroy() {
    if (this.backdrop) this.backdrop.remove();
    if (this.journalBackdrop) this.journalBackdrop.remove();
  }
}
