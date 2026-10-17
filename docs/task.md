# Checkpoint Pengembangan: Seasons of Home

- **Daftar Tugas Kanonikal:** [task.md](../task.md) (104/116 tugas Selesai - Phase 7 Aktif)
- **Spesifikasi Arsitektur:** [docs/specs.md](specs.md) | [Spesifikasi Multi-Zona & Cangkul Dinamis](superpowers/specs/2026-10-17-multi-zone-and-dynamic-farming-design.md)
- **Status Rilis:** Pengembangan Phase 7 (Multi-Zone & Free-Form Dynamic Farming)

## Ringkasan Pencapaian Seluruh Fase:

1. **Phase 0 & 1 — Engine & Foundation:**
   - Proyeksi isometrik 2:1 (64×32 tile), two-axis collision sliding pada NavGrid 2D.
   - Dynamic foot-y depth sorting ($500 + \text{footY}$), kamera follow lerp dengan batasan zona.
   - Multi-input router terisolasi: keyboard desktop (WASD / Panah / E / Space / hotkeys) dan virtual D-pad + action button sentuh mobile.
   - Palet kurasi anti-slop (14 warna ramah mata, larangan hex primer murni).

2. **Phase 2 & 3 — Gameplay, Pertanian & Narasi:**
   - Pertanian terasering 12 petak (3×4) dengan 4 siklus pertumbuhan (seed -> sprout -> leaf -> mature) dan pembatalan panen aman saat tas penuh.
   - Tas inventaris 16 slot (kapasitas stack 99, slot swap & merge), hotbar 4-slot.
   - Jam dunia siklus 24 jam dengan mekanik tidur di kasur memajukan hari.
   - Tiga NPC interaktif (Nenek Suri, Nara, Paman Bima) dengan potret pixel-art 128×128, dialog bertutur nusantara bercabang, dan skor afeksi (RelationshipSystem).
   - FSM Quest (3 beat cerita utama) dengan token hadiah idempoten anti-duplikasi.
   - Peta desa terpadu berukuran 36×36 tile dengan jalur setapak menyambung.

3. **Phase 4 — Persistensi IndexedDB Multi-Slot & Transaksi:**
   - IndexedDB `lembah-rimbun-db` dengan 3 slot independen, nama pemain custom, dan 3 pilihan busana.
   - Penyimpanan atomik snapshot primary + backup, consent pemulihan saat korup, isolasi hapus slot, dan fallback in-memory session.
   - Transaksi ekonomi (Kios Nara) dan kerajinan (Bengkel Bima) dengan validasi ketat dan atomic rollback jika inventaris penuh/saldo kurang.
   - Penyimpanan preferensi pengguna (volume audio, reduced motion, ukuran kontrol) pada store `appMeta`.

4. **Phase 5 — Ekosistem Kehidupan Lembah Rimbun:**
   - 5 titik foraging dan 6 node mineral tambang dengan 3 fase kerusakan (intact -> cracked -> depleted) serta reset deterministik pagi hari.
   - Companion Pet Kiko: breadcrumb trail following, resting, teleport pemulihan saat tersangkut, dan elus harian (+3 afeksi).
   - Minigame memancing di Kolam Nila (tahan/lepas Spasi atau sentuh), tangkapan deterministik, bebas resiko kehilangan alat atau softlock.
   - Dapur pondok (sup herba & pai beri) dan Meja Alkimia (tonik embun).
   - Dekorasi interior pondok (karpet tenun, pot tanaman, rak buku) dengan grid-snapping 6×6 dan preview validasi penempatan.
   - Cuaca deterministik (cerah, berawan, hujan menyiram kebun), siklus siang/malam transparan, dan festival "Malam Lentera Panen".

5. **Phase 6 — Audio, Polish Responsivitas, Build & QA:**
   - Web Audio API procedural synthesizer (langkah kaki, cangkul, air, panen, dentang tambang) dengan *resume-on-first-gesture* autoplay-safe dan kontrol audio volume slider.
   - Canvas responsif penuh menggunakan `Phaser.Scale.RESIZE`, adaptasi zoom kamera responsif, dan pemisahan hotbar/D-pad pada mode mobile portrait.
   - Script bundler mandiri `scripts/build.mjs` dan server preview `scripts/serve.mjs`.
   - 100% lulus 11 test suite unit otomatis (`npm test`) dan uji standalone build (`npm run test:build`).

6. **Phase 7 — Multi-Zone World Partitioning & Dynamic Free-Form Farming (Aktif):**
   - Pembagian 5 zona tematik mandiri: Kebun Joni (`zone_farm`), Interior Rumah (`zone_cottage_interior`), Pasar & Desa (`zone_village`), Danau Lembah (`zone_lake`), dan Kaki Gunung & Gua Tambang (`zone_mountain_mine`).
   - Sistem cangkul bebas tanpa batas petak statis: pemain dapat mencangkul petak mana saja di kebun Joni (`[E] Cangkul Tanah`) untuk memperluas lahan pertanian sesuka hati.
   - Transisi halus antar-zona dengan efek kamera fade-out/fade-in (200ms) dan pemindahan posisi pemain.
   - Persistensi status seluruh petak dinamis dan zona aktif pada IndexedDB.
