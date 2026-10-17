import { inventoryTransaction } from './inventoryTransaction.js';

export class FestivalSystem {
  constructor({ flags, festivalState, clock, inventory, wallet, relationships }) {
    Object.assign(this, { flags, festivalState, clock, inventory, wallet, relationships });
  }

  activate() {
    if (!this.flags.festival_unlocked) return { success: false, message: 'Selesaikan misi Lentera untuk Semua bersama Nara terlebih dahulu.' };
    if (this.festivalState.harvest_lantern_night === 'celebrated') return { success: false, message: 'Festival sudah dirayakan. Lentera desa tetap menjadi kenangan.' };
    if (!this.clock.isNight()) return { success: false, message: 'Festival dimulai pukul 18:00. Kembalilah saat malam.' };
    const result = inventoryTransaction(this.inventory, this.wallet, { coinDelta: 100,
      commit: () => {
        this.festivalState.harvest_lantern_night = 'celebrated';
        for (const id of ['suri', 'bima', 'nara']) this.relationships?.addPoints(id, 8);
      }
    });
    if (result.success) result.message = 'Malam Lentera Panen dirayakan! +100 koin dan +8 hubungan dengan seluruh warga.';
    return result;
  }
}
