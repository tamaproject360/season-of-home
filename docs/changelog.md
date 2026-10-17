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
