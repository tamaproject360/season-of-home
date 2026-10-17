import { getItemDefinition } from '../data/items.js';

/**
 * HUDController
 * Manages the DOM-based game HUD: World clock, season, weather icon, coins,
 * 4-slot quick hotbar, contextual action banner, and toast messages.
 */
export class HUDController {
  constructor(appContainer, inventory, worldClock) {
    this.container = appContainer;
    this.inventory = inventory;
    this.worldClock = worldClock;

    this.activeHotbarIndex = 0; // 0..3
    this.hotbarSlots = [null, null, null, null]; // mapped itemIds or slot references
    this.onHotbarChangeCallbacks = [];

    this.initDOM();
    this.bindEvents();
    this.updateClockDisplay();
    this.updateCoinsDisplay(80);
    this.syncHotbarWithInventory();
  }

  initDOM() {
    // 1. HUD Container
    this.hudElement = document.createElement('div');
    this.hudElement.id = 'hud-container';
    this.hudElement.innerHTML = `
      <div class="hud-group">
        <div class="hud-panel" id="hud-calendar">
          <span id="hud-season-text">Musim Semi • Hari 1</span>
        </div>
        <div class="hud-panel" id="hud-clock">
          <img id="hud-weather-icon" class="hud-weather-icon" src="asset/items/ui_weather_sunny.png" alt="Cuaca">
          <span id="hud-time-text">06:00</span>
        </div>
        <div class="hud-panel" id="hud-coins">
          <img src="asset/items/ui_leafcoin.png" style="width:18px;height:18px;" alt="Koin">
          <span id="hud-coins-text">80</span>
        </div>
      </div>
      <div class="hud-group">
        <button id="btn-open-journal" class="hud-btn" title="Buka Jurnal Misi (J)" style="margin-right:6px;">
          <span>📜 Jurnal [J]</span>
        </button>
        <button id="btn-open-inventory" class="hud-btn" title="Buka Tas (I)">
          <span>🎒 Tas [I]</span>
        </button>
      </div>
    `;
    this.container.appendChild(this.hudElement);

    // 2. Context Action Prompt
    this.contextPrompt = document.createElement('div');
    this.contextPrompt.id = 'context-prompt';
    this.contextPrompt.textContent = 'Interaksi [E]';
    this.container.appendChild(this.contextPrompt);

    // 3. Hotbar Container
    this.hotbarElement = document.createElement('div');
    this.hotbarElement.id = 'hotbar-container';
    this.hotbarElement.innerHTML = `
      <div class="hotbar-slot active" data-index="0">
        <span class="slot-key">1</span>
        <img src="" alt="" style="display:none;">
        <span class="slot-count" style="display:none;"></span>
      </div>
      <div class="hotbar-slot" data-index="1">
        <span class="slot-key">2</span>
        <img src="" alt="" style="display:none;">
        <span class="slot-count" style="display:none;"></span>
      </div>
      <div class="hotbar-slot" data-index="2">
        <span class="slot-key">3</span>
        <img src="" alt="" style="display:none;">
        <span class="slot-count" style="display:none;"></span>
      </div>
      <div class="hotbar-slot" data-index="3">
        <span class="slot-key">4</span>
        <img src="" alt="" style="display:none;">
        <span class="slot-count" style="display:none;"></span>
      </div>
    `;
    this.container.appendChild(this.hotbarElement);

    // 4. Toast Notifications Container
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.container.appendChild(this.toastContainer);
  }

  bindEvents() {
    // Listen to World Clock updates
    this.worldClock.on('tick', () => {
      this.updateClockDisplay();
    });

    this.worldClock.on('day', () => {
      this.updateClockDisplay();
    });

    // Listen to inventory changes
    this.inventory.onChange(() => {
      this.syncHotbarWithInventory();
    });

    // Hotbar click selection
    const slots = this.hotbarElement.querySelectorAll('.hotbar-slot');
    slots.forEach(slotEl => {
      slotEl.addEventListener('click', (e) => {
        const index = parseInt(slotEl.dataset.index, 10);
        this.setActiveHotbarSlot(index);
      });
    });

    // Keyboard 1..4 quick select
    window.addEventListener('keydown', (e) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        this.setActiveHotbarSlot(idx);
      }
    });
  }

  setActiveHotbarSlot(index) {
    if (index < 0 || index >= 4) return;
    this.activeHotbarIndex = index;

    const slots = this.hotbarElement.querySelectorAll('.hotbar-slot');
    slots.forEach((el, idx) => {
      if (idx === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    const activeItem = this.getActiveItem();
    for (const cb of this.onHotbarChangeCallbacks) {
      cb(activeItem);
    }
  }

  onHotbarChange(callback) {
    this.onHotbarChangeCallbacks.push(callback);
    return () => {
      this.onHotbarChangeCallbacks = this.onHotbarChangeCallbacks.filter(c => c !== callback);
    };
  }

  getActiveItem() {
    const slot = this.inventory.getSlot(this.activeHotbarIndex);
    if (!slot) return null;
    return getItemDefinition(slot.itemId);
  }

  syncHotbarWithInventory() {
    const slotEls = this.hotbarElement.querySelectorAll('.hotbar-slot');
    slotEls.forEach((slotEl, idx) => {
      const slot = this.inventory.getSlot(idx);
      const img = slotEl.querySelector('img');
      const countEl = slotEl.querySelector('.slot-count');

      if (slot) {
        const itemDef = getItemDefinition(slot.itemId);
        if (itemDef) {
          img.src = itemDef.icon;
          img.alt = itemDef.name;
          img.style.display = 'block';

          if (slot.count > 1) {
            countEl.textContent = String(slot.count);
            countEl.style.display = 'block';
          } else {
            countEl.style.display = 'none';
          }
        }
      } else {
        img.style.display = 'none';
        countEl.style.display = 'none';
      }
    });

    // Notify listeners of active item change
    const activeItem = this.getActiveItem();
    for (const cb of this.onHotbarChangeCallbacks) {
      cb(activeItem);
    }
  }

  updateClockDisplay() {
    const seasonNames = {
      spring: 'Musim Semi',
      summer: 'Musim Panas',
      autumn: 'Musim Gugur',
      winter: 'Musim Dingin'
    };
    const seasonText = seasonNames[this.worldClock.season] || 'Musim Semi';
    const seasonEl = document.getElementById('hud-season-text');
    if (seasonEl) {
      seasonEl.textContent = `${seasonText} • Hari ${this.worldClock.day}`;
    }

    const timeEl = document.getElementById('hud-time-text');
    if (timeEl) {
      timeEl.textContent = this.worldClock.getTimeString();
    }

    const weatherIcon = document.getElementById('hud-weather-icon');
    if (weatherIcon) {
      const weatherMap = {
        clear: 'asset/items/ui_weather_sunny.png',
        cloudy: 'asset/items/ui_weather_cloudy.png',
        rain: 'asset/items/ui_weather_rain.png'
      };
      weatherIcon.src = weatherMap[this.worldClock.weather] || weatherMap.clear;
    }
  }

  updateCoinsDisplay(coins) {
    const coinsEl = document.getElementById('hud-coins-text');
    if (coinsEl) {
      coinsEl.textContent = String(coins);
    }
  }

  setContextPrompt(text) {
    if (!text) {
      this.contextPrompt.style.display = 'none';
    } else {
      this.contextPrompt.textContent = text;
      this.contextPrompt.style.display = 'block';
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 2800);
  }

  destroy() {
    if (this.hudElement) this.hudElement.remove();
    if (this.hotbarElement) this.hotbarElement.remove();
    if (this.contextPrompt) this.contextPrompt.remove();
    if (this.toastContainer) this.toastContainer.remove();
  }
}
