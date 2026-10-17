import { inventoryTransaction } from './inventoryTransaction.js';

export class FishingSystem {
  constructor(inventory, wallet, clock, state) {
    Object.assign(this, { inventory, wallet, clock, state });
    this.state.attempts ||= 0;
    this.status = 'idle';
  }

  start() {
    if (!this.inventory.hasItem('tool_fishing_rod')) return { success: false, message: 'Beli Joran Bambu di Kios Nara terlebih dahulu (50 koin).' };
    this.state.attempts++;
    this.status = 'active'; this.elapsed = 0; this.progress = 0.35;
    this.position = 0.5; this.target = 0.5;
    return { success: true };
  }

  update(deltaSeconds, held) {
    if (this.status !== 'active') return;
    const dt = Math.min(deltaSeconds, 0.1);
    this.elapsed += dt;
    this.target = 0.5 + Math.sin(this.elapsed * 1.8 + this.state.attempts) * 0.28;
    this.position = Math.max(0, Math.min(1, this.position + (held ? 0.55 : -0.45) * dt));
    this.progress += (Math.abs(this.position - this.target) < 0.19 ? 0.19 : -0.09) * dt;
    this.progress = Math.max(0, Math.min(1, this.progress));
    if (this.progress >= 1) {
      this.status = 'caught';
      const itemId = (this.clock.day * 17 + this.state.attempts * 13) % 4 === 0 ? 'silverfin' : 'riverfish';
      const result = inventoryTransaction(this.inventory, this.wallet, { outputs: [{ itemId, count: 1 }] });
      this.message = result.success ? `Berhasil menangkap ${itemId === 'silverfin' ? 'Silverfin' : 'Ikan Nila'}!` : result.message;
      if (!result.success) this.status = 'full';
    } else if (this.progress <= 0 || this.elapsed >= 30) {
      this.status = 'escaped'; this.message = 'Ikan terlepas. Tidak ada alat atau item yang hilang.';
    }
  }

  cancel() { this.status = 'idle'; }
}
