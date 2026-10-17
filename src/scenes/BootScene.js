import { StorageRepo } from '../persistence/SaveRepository.js';

/**
 * BootScene
 * Probes browser capabilities and IndexedDB availability.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  async create() {
    console.log('[BootScene] Booting Seasons of Home (Lembah Rimbun)...');

    // Probe IndexedDB
    const probe = await StorageRepo.init();
    const banner = document.getElementById('system-banner');

    if (banner) {
      if (probe.fallback) {
        banner.style.display = 'block';
        banner.style.backgroundColor = '#BC7654';
        banner.style.color = '#EEE1C4';
        banner.textContent = 'Mode Sandboxed: Progres disimpan sementara untuk sesi ini.';
      } else {
        banner.style.display = 'block';
        banner.textContent = 'Storage Persisten Aktif (IndexedDB: lembah-rimbun-db)';
        setTimeout(() => {
          banner.style.display = 'none';
        }, 3000);
      }
    }

    // Transition to asset preloading
    this.scene.start('PreloadScene');
  }
}
