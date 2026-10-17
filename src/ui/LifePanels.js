import { RECIPES } from '../data/recipes.js';
import { getItemDefinition } from '../data/items.js';
import { DECORATIONS } from '../systems/DecorationSystem.js';

function roomMarkup() {
  const floor = Array.from({ length: 36 }, (_, i) => {
    const x = 180 + (i % 6 - Math.floor(i / 6)) * 26.6667;
    const y = 93.3333 + (i % 6 + Math.floor(i / 6)) * 13.3333;
    return `<path d="M${x},${y - 13.3333} l26.6667,13.3333 -26.6667,13.3333 -26.6667,-13.3333 Z" fill="${i % 3 ? '#A17C53' : '#AD895D'}" stroke="#75553C" stroke-width="0.6"/>
      <path d="M${x - 12},${y - 6} l26,13 M${x - 20},${y + 1} l26,13" stroke="#C49A68" stroke-width="0.7"/>`;
  }).join('');
  const beams = Array.from({ length: 7 }, (_, i) => {
    const x = 20 + i * 26.6667, y = 160 - i * 13.3333;
    const rx = 180 + i * 26.6667, ry = 80 + i * 13.3333;
    return `<path d="M${x},${y}v-65 M${rx},${ry}v-65" stroke="#59483B" stroke-width="3"/>`;
  }).join('');
  return `<svg viewBox="0 0 360 260" class="room-background" role="img" aria-label="Ruangan pondok isometrik dengan lantai kayu dan dinding belakang">
    <path d="M20,160 180,80 180,15 20,95Z" fill="#87674E" stroke="#59483B" stroke-width="4"/>
    <path d="M180,80 340,160 340,95 180,15Z" fill="#9F7A53" stroke="#59483B" stroke-width="4"/>
    ${beams}${floor}<path d="M20,160 180,240 340,160" fill="none" stroke="#59483B" stroke-width="5"/>
    <path d="M70,97 115,75 115,112 70,134Z" fill="#304B43" stroke="#59483B" stroke-width="4"/>
    <path d="M92,86v37 M71,114 114,92" stroke="#D9AE6B" stroke-width="3"/>
  </svg><img class="room-bed" src="asset/building/joni_bed.png" alt="Kasur pondok">`;
}

export class LifePanels {
  constructor(scene, host) {
    this.scene = scene; this.host = host; this.held = false; this.selectedItem = 'woven_rug';
    this.click = event => this.onClick(event);
    this.change = event => {
      if (event.target.matches('[data-decor-item]')) {
        this.selectedItem = event.target.value; this.selectedObject = null; this.openDecor();
      }
    };
    this.key = event => {
      if (host.active && host.kind === 'fishing' && event.code === 'Space') {
        event.preventDefault(); event.stopImmediatePropagation(); this.held = event.type === 'keydown';
      }
    };
    this.pointerDown = event => {
      if (event.target.closest('[data-reel]')) {
        event.preventDefault(); this.held = true;
      }
    };
    this.pointerUp = () => { this.held = false; };
    this.hover = event => {
      const cell = event.target.closest('[data-room-x]');
      if (!cell) return;
      const object = this.scene.decorations.state.placedObjects.find(o => o.objectId === this.selectedObject);
      const valid = this.scene.decorations.canPlace(object?.itemId || this.selectedItem,
        Number(cell.dataset.roomX), Number(cell.dataset.roomY), this.selectedObject);
      cell.classList.toggle('placement-valid', valid); cell.classList.toggle('placement-invalid', !valid);
      const ghost = host.root.querySelector('.decor-preview-footprint');
      if (ghost) {
        const x = Number(cell.dataset.roomX), y = Number(cell.dataset.roomY);
        ghost.style.left = `${50 + (x - y) * 7.4}%`;
        ghost.style.top = `${36 + (x + y) * 5.13}%`;
        ghost.style.display = 'block';
        ghost.classList.toggle('invalid', !valid);
        ghost.querySelector('img').src = DECORATIONS[object?.itemId || this.selectedItem].image;
      }
    };
    host.root.addEventListener('click', this.click);
    host.root.addEventListener('change', this.change);
    host.root.addEventListener('pointerdown', this.pointerDown);
    host.root.addEventListener('pointerup', this.pointerUp);
    host.root.addEventListener('pointercancel', this.pointerUp);
    host.root.addEventListener('pointerover', this.hover);
    window.addEventListener('keydown', this.key, true);
    window.addEventListener('keyup', this.key, true);
    window.addEventListener('pointerup', this.pointerUp, true);
    window.addEventListener('pointercancel', this.pointerUp, true);
    window.addEventListener('blur', this.pointerUp);
  }

  openHome() {
    this.host.kind = 'home';
    this.host.show('Pondok Joni', `<p>Selamat pulang. Pilih kegiatan di pondok.</p><div class="phase4-actions">
      <button class="phase4-button" data-station="cooking">Dapur · Memasak</button>
      <button class="phase4-button" data-station="alchemy">Meja Alkimia</button>
      <button class="phase4-button" data-decor>Dekorasi ruangan</button>
      <button class="phase4-button secondary" data-sleep>Tidur hingga besok</button></div>`);
  }

  openGuide() {
    this.host.kind = 'guide';
    this.host.show('Kegiatan di Lembah Rimbun', `<div class="phase4-actions">
      <p><strong>Pondok:</strong> gunakan pintu untuk memasak, meracik tonik, atau menata ruangan. Tempat tidur memajukan hari.</p>
      <p><strong>Kolam Nila:</strong> beli joran di Kios Nara lalu dekati ujung dermaga untuk memancing.</p>
      <p><strong>Hutan & Tambang:</strong> lima titik tumbuhan dan enam batu berada di rumpun luar desa. Bahan pulih setiap pagi.</p>
      <p><strong>Kiko:</strong> dekati untuk mengelusnya atau mengubah mode mengikuti / istirahat.</p>
      <button class="phase4-button" data-open-festival>Catatan Festival Panen</button></div>`);
  }

  openStation(station) {
    this.station = station; this.host.kind = station;
    this.host.show(station === 'cooking' ? 'Dapur Pondok' : 'Meja Alkimia', `<div class="trade-list">${Object.values(RECIPES)
      .filter(recipe => recipe.station === station).map(recipe => {
        const canCraft = recipe.inputs.every(i => this.scene.inventory.hasItem(i.itemId, i.count));
        return `<article class="recipe-row"><img src="${getItemDefinition(recipe.outputs[0].itemId).icon}" alt=""><div><h3>${recipe.name}</h3>
          <p>${recipe.inputs.map(i => `${getItemDefinition(i.itemId).name}: ${this.scene.inventory.getItemCount(i.itemId)}/${i.count}`).join(' · ')}</p></div>
          <button class="phase4-button" data-life-craft="${recipe.id}" ${canCraft ? '' : 'disabled'}>Buat</button></article>`;
      }).join('')}</div>`);
  }

  openPet() {
    this.host.kind = 'pet';
    const pet = this.scene.saveData.pet;
    this.host.show('Kiko, sahabat kebun', `<img class="character-preview" src="asset/characters/portraits/kiko_bust.png" alt="Kiko">
      <p>Afeksi: ${pet.affection}/100 · ${pet.mode === 'following' ? 'Mengikuti petani' : 'Beristirahat'}</p>
      <div class="phase4-actions"><button class="phase4-button" data-pet>Elus Kiko</button>
      <button class="phase4-button secondary" data-follow>${pet.mode === 'following' ? 'Istirahat di sini' : 'Ikuti aku'}</button></div>`);
  }

  openFishing() {
    this.host.kind = 'fishing';
    const result = this.scene.fishing.start();
    this.lastFishingStatus = null;
    this.held = false;
    this.host.beforeClose = () => { this.scene.fishing.cancel(); this.held = false; };
    this.scene.saveManager.request();
    this.host.show('Memancing di Kolam Nila', result.success ? `<p>Tahan <strong>Spasi</strong> atau tombol di bawah untuk menaikkan kail. Lepas untuk menurunkannya. Ikuti zona ikan hijau.</p>
      <div class="fishing-track"><div class="fish-zone"></div><div class="fishing-hook"></div></div>
      <label>Hasil tangkapan<progress class="catch-progress" max="1" value="0.35"></progress></label>
      <p class="fishing-result" role="status">Pertahankan kail di dalam zona ikan.</p>
      <button class="phase4-button reel-button" data-reel>Tahan untuk menarik kail</button>
      <button class="phase4-button secondary" data-fish-again>Mulai ulang</button>` : `<p>${result.message}</p>`);
  }

  openDecor() {
    this.host.kind = 'decor';
    const state = this.scene.decorations.state;
    this.host.show('Dekorasi Interior Pondok', `<p>Pilih dekorasi lalu klik petak kosong. Klik dekorasi terpasang, lalu petak lain untuk memindahkan; atau angkat kembali. Pintu dan kasur tetap kosong.</p>
      <div class="room-preview">${roomMarkup()}
      ${state.placedObjects.map(object => `<img class="placed-decor" src="${DECORATIONS[object.itemId].image}" alt="${DECORATIONS[object.itemId].name}"
        style="left:${50 + (object.gridX - object.gridY) * 7.4}%;top:${36 + (object.gridX + object.gridY) * 5.13}%;z-index:${object.itemId === 'woven_rug' ? 1 : 3};">`).join('')}
        <div class="decor-preview-footprint" style="display:none;"><img alt="Pratinjau penempatan dekorasi"></div></div>
      <label>Dekorasi tersedia<select data-decor-item>${Object.entries(DECORATIONS).map(([id, def]) =>
        `<option value="${id}" ${this.selectedItem === id ? 'selected' : ''}>${def.name} (${state.storage[id]})</option>`).join('')}</select></label>
      ${this.selectedObject ? '<button class="phase4-button secondary" data-pickup>Angkat dekorasi terpilih</button>' : ''}
      <div class="room-grid" aria-label="Grid penempatan 6 kali 6">${Array.from({ length: 36 }, (_, i) => {
        const x = i % 6, y = Math.floor(i / 6);
        const object = state.placedObjects.find(o => { const def = DECORATIONS[o.itemId]; return x >= o.gridX && x < o.gridX + def.width && y >= o.gridY && y < o.gridY + def.height; });
        const reserved = x === 0 || y === 0 || x === 5 || y === 5 || x === 4 && y === 1;
        return `<button class="room-cell ${object?.objectId === this.selectedObject ? 'selected' : ''}" data-room-x="${x}" data-room-y="${y}" ${reserved ? 'disabled' : ''}
          aria-label="Petak ${x},${y}${object ? `: ${DECORATIONS[object.itemId].name}` : ''}">${object ? DECORATIONS[object.itemId].name : reserved ? '—' : '+'}</button>`;
      }).join('')}</div>`);
  }

  openFestival() {
    this.host.kind = 'festival';
    const unlocked = this.scene.saveData.flags.festival_unlocked;
    const celebrated = this.scene.saveData.world.festivalState.harvest_lantern_night === 'celebrated';
    this.host.show('Malam Lentera Panen', `<p>${celebrated ? 'Desa telah merayakan festival. Lentera kembali menyala setiap malam.' : unlocked ? 'Persiapan selesai! Warga berkumpul pukul 18:00 di alun-alun.' : 'Bantu Suri, Bima, dan Nara menyelesaikan tiga misi desa untuk membuka festival.'}</p>
      ${unlocked && !celebrated && !this.scene.worldClock.isNight() ? '<button class="phase4-button secondary" data-evening>Tunggu hingga pukul 18:00</button>' : ''}
      <button class="phase4-button" data-celebrate ${!unlocked || celebrated || !this.scene.worldClock.isNight() ? 'disabled' : ''}>Mulai perayaan</button>`);
  }

  onClick(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.dataset.station) this.openStation(button.dataset.station);
    else if (button.hasAttribute('data-decor')) this.openDecor();
    else if (button.hasAttribute('data-sleep')) { this.host.close(); this.scene.sleepAndAdvanceDay(); }
    else if (button.dataset.lifeCraft) {
      const result = this.scene.crafting.craft(button.dataset.lifeCraft, this.station);
      if (result.success) this.scene.audio.play('craft');
      this.host.message = result.message; this.openStation(this.station);
    } else if (button.hasAttribute('data-pet')) {
      const result = this.scene.petSystem.pet();
      if (result.success) this.scene.audio.play('pet');
      this.host.message = result.message;
      if (result.success && !this.scene.settings.reducedMotion) this.scene.pet.reactToPetting();
      this.scene.saveManager.request(); this.openPet();
    } else if (button.hasAttribute('data-follow')) {
      this.scene.petSystem.toggleFollow(); this.scene.saveManager.request(); this.openPet();
    } else if (button.hasAttribute('data-fish-again')) this.openFishing();
    else if (button.hasAttribute('data-evening')) {
      this.scene.worldClock.timeMinutes = 1080; this.scene.worldClock.emit('tick');
      this.scene.saveManager.request(); this.openFestival();
    } else if (button.hasAttribute('data-celebrate')) {
      this.host.message = this.scene.festival.activate().message;
      this.scene.lifeWorld.syncFestival(); this.scene.saveManager.save().catch(() => {}); this.openFestival();
    } else if (button.hasAttribute('data-life-map')) this.openGuide();
    else if (button.hasAttribute('data-open-festival')) this.openFestival();
    else if (button.hasAttribute('data-pickup')) {
      this.host.message = this.scene.decorations.pickUp(this.selectedObject).message;
      this.selectedObject = null; this.scene.saveManager.request(); this.openDecor();
    } else if (button.hasAttribute('data-room-x')) {
      const x = Number(button.dataset.roomX), y = Number(button.dataset.roomY);
      const occupied = this.scene.decorations.state.placedObjects.find(o => {
        const def = DECORATIONS[o.itemId]; return x >= o.gridX && x < o.gridX + def.width && y >= o.gridY && y < o.gridY + def.height;
      });
      if (occupied) { this.selectedObject = occupied.objectId; this.host.message = 'Pilih petak tujuan atau angkat dekorasi.'; }
      else {
        const result = this.selectedObject ? this.scene.decorations.move(this.selectedObject, x, y) : this.scene.decorations.place(this.selectedItem, x, y);
        this.host.message = result.message;
        if (result.success) { this.selectedObject = null; this.scene.saveManager.request(); }
      }
      this.openDecor();
    }
  }

  update(deltaSeconds) {
    if (!this.host.active || this.host.kind !== 'fishing') return;
    this.scene.fishing.update(deltaSeconds, this.held);
    const fish = this.scene.fishing;
    const zone = this.host.root.querySelector('.fish-zone');
    if (!zone) return;
    zone.style.left = `${(fish.target - 0.19) * 100}%`;
    this.host.root.querySelector('.fishing-hook').style.left = `${fish.position * 100}%`;
    this.host.root.querySelector('progress').value = fish.progress;
    if (fish.status !== 'active') {
      this.host.root.querySelector('.fishing-result').textContent = fish.message;
      if (fish.status === 'caught' && this.lastFishingStatus !== 'caught') this.scene.audio.play('fish');
      this.lastFishingStatus = fish.status;
    }
  }

  destroy() {
    this.scene.fishing.cancel();
    for (const [event, handler] of [['click', this.click], ['change', this.change], ['pointerdown', this.pointerDown],
      ['pointerup', this.pointerUp], ['pointercancel', this.pointerUp], ['pointerover', this.hover]]) this.host.root.removeEventListener(event, handler);
    window.removeEventListener('keydown', this.key, true); window.removeEventListener('keyup', this.key, true);
    window.removeEventListener('pointerup', this.pointerUp, true);
    window.removeEventListener('pointercancel', this.pointerUp, true);
    window.removeEventListener('blur', this.pointerUp);
  }
}
