# Changelog

## 2026-10-17

- Relayout desa, jalur menyambung, skala pohon/bangunan/dekorasi, gerbang dan posisi NPC.
- Danau tanpa petak rumput internal; deck dermaga memiliki lapisan render dan collision tersendiri.
- Zoom scroll/keyboard dan indikator zoom.
- Phase 4: slot/nama/busana, ekonomi/crafting atomik, validasi snapshot, backup/recovery, autosave serial, preferences.
- Phase 5: gathering/mining, Kiko, fishing, cooking/alchemy, interior dekoratif, cuaca/malam, festival dan persistence-nya.
- Perbaikan layar terkunci mobile: canvas memenuhi viewport menggunakan RESIZE, kamera menyesuaikan ukuran, kontrol/HUD mengikuti perangkat aktif.
- Pengujian Node dan IndexedDB native browser; detail acceptance di `specs.md`.
- Phase 6 selesai: Web Audio API procedural synthesizer (autoplay-safe), live volume slider persistence, standalone build scripts (`scripts/build.mjs`, `scripts/serve.mjs`), dan lulus 100% 11 unit test suites + build test.
- Pembaruan dokumen kanonikal: `task.md` (104/104 tugas Selesai), `docs/specs.md` (arsitektur menyeluruh, alur kerja dan model data Mermaid, konvensi kode, pedoman repository), `README.md` (standar industri, badge, matriks fitur lengkap, panduan kontrol dan pengujian), serta `docs/task.md`.
- Penambahan JSDoc typing pada modul persistence, transaction, settings, serta fallback portrait aman pada `DialoguePanel.js` untuk mencegah warning gambar kosong di browser.
- Rollback: Membatalkan fitur sudut kamera ganda dan mengembalikan rendering proyeksi isometrik 2:1 murni yang stabil dan konsisten.
- **Phase 7 Selesai (Multi-Zone World Partitioning & Dynamic Free-Form Farming):**
  - **Partisi 5 Zona Mandiri:** Memecah dunia menjadi 5 zona terpisah dengan atmosfer unik: Kebun Privat Joni (`farm`, 32×32), Interior Pondok Joni (`cottage`, 14×14), Pasar & Alun-Alun Desa (`village`, 34×34), Danau Lembah (`lake`, 32×32), dan Kaki Gunung & Gua Tambang (`mine`, 32×32).
  - **Sistem Cangkul Bebas (Free-Form Dynamic Tilling):** Menghapus batas petak statis 12 petak. Pemain dapat menggunakan cangkul (`tool_hoe`) di area rumput/tanah mana saja di kebun Joni (`[E] Cangkul Tanah Baru`) untuk memperluas lahan garapan tanpa batas.
  - **Pembersihan Lahan (Scythe / Arit):** Pemain dapat mengembalikan petak tanah kosong kembali menjadi rumput alami menggunakan cangkul/arit (`clearPlot`).
  - **Komponen ZoneManager:** Mengorkestrasi transisi antar-zona dengan efek fade-out (200ms) dan fade-in (200ms), SFX cangkul/langkah pintu, pembersihan dan pembangunan visual dunia, pergantian NavGrid, dan reposisi posisi pemain.
  - **Persistensi Multi-Zona:** Menyimpan zona aktif pemain (`activeZone`) dan seluruh petak sawah dinamis ke dalam IndexedDB.
  - **Automated Testing Suite (12 Test Suites):** Memperbarui `tests/zoneLayout.test.js` untuk memvalidasi kelima zona, memperbarui `tests/farming.test.js` untuk uji `tillTile` dan `clearPlot`, serta menambahkan `tests/zoneTransitions.test.js` untuk uji portal dua arah dan ZoneManager. Seluruh 12 test suite lulus 100%.
