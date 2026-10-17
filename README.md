<div align="center">

# 🌾 Seasons of Home (Lembah Rimbun)

**A cozy, restorative 2D isometric rural life simulation game inspired by tropical Indonesian village heritage.**

[![Phaser 3.88.2](https://img.shields.io/badge/Phaser-3.88.2-8b5cf6?style=for-the-badge&logo=phaser&logoColor=white)](https://phaser.io/)
[![JavaScript ES2022+](https://img.shields.io/badge/JavaScript-ES2022+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Zero-Build Architecture](https://img.shields.io/badge/Build-ESM%20Native%20%7C%20Zero--Bundler-10b981?style=for-the-badge&logo=esbuild&logoColor=white)](docs/specs.md)
[![Tests Passing](https://img.shields.io/badge/Tests-11%2F11%20Suites%20Passing-success?style=for-the-badge&logo=vitest&logoColor=white)](#-pengujian-unit-otomatis)
[![Platform](https://img.shields.io/badge/Platform-Desktop%20%7C%20Mobile%20Responsive-f59e0b?style=for-the-badge&logo=html5&logoColor=white)](index.html)
[![License: ISC](https://img.shields.io/badge/License-ISC-3b82f6?style=for-the-badge)](package.json)

<br/>

<p align="center">
  <img src="asset/characters/portraits/suri_bust.png" width="120" alt="Nenek Suri" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="asset/characters/portraits/joni_bust.png" width="120" alt="Joni" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="asset/characters/portraits/nara_bust.png" width="120" alt="Nara" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="asset/characters/portraits/bima_bust.png" width="120" alt="Paman Bima" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="asset/characters/portraits/kiko_bust.png" width="120" alt="Kiko" />
</p>

*Menghidupkan kembali kebun warisan kakek di lembah terasering berbukit, bersahabat dengan warga desa, bertualang bersama Kiko, dan menyambut tradisi Malam Lentera Panen.*

</div>

---

## 📖 Daftar Isi

- [✨ Gambaran Proyek](#-gambaran-proyek)
- [🎮 Fitur Utama & Progress Terkini](#-fitur-utama--progress-terkini)
- [🛠️ Tech Stack & Arsitektur](#️-tech-stack--arsitektur)
- [🗺️ Tata Letak Dunia (36×36 Lembah Rimbun)](#️-tata-letak-dunia-3636-lembah-rimbun)
- [🕹️ Kontrol & Panduan Bermain](#️-kontrol--panduan-bermain)
- [🚀 Menjalankan Permainan & Build Produksi](#-menjalankan-permainan--build-produksi)
- [🧪 Pengujian Unit Otomatis (11 Suites)](#-pengujian-unit-otomatis)
- [📁 Struktur Repositori](#-struktur-repositori)

---

## ✨ Gambaran Proyek

**Seasons of Home (Lembah Rimbun)** adalah permainan simulasi kehidupan pedesaan isometrik 2D berbasis peramban web modern. Berlatar belakang di sebuah lembah pegunungan tropis-hangat yang tenang, protagonis (**Joni**) kembali untuk memulihkan pondok kayu tua dan petak kebun terasering peninggalan sang kakek.

Permainan ini mengusung pendekatan **cozy restorative living**:
- ❌ **Tanpa Kekerasan & Tanpa Tekanan Waktu:** Tidak ada monster musuh, mekanik pertarungan, ancaman kematian (*permadeath*), atau penalti waktu yang menekan. Pemain bebas menikmati ritme hari sesuai tempo masing-masing.
- 🌿 **Nuansa Nusantara Otentik:** Memadukan arsitektur panggung kayu, dinding papan, genteng tanah liat bertingkat, sawah terasering berundak, komoditas lokal (*Sunroot*, *Mossberry*, *Goldenleaf*), serta tradisi perayaan syukur "Malam Lentera Panen".
- 🎨 **Manifesto Anti-AI-Slop:** Seluruh visual mengacu ketat pada 14 palet warna kurasi alami (*earthy & warm tokens*). Bebas dari warna primer jenuh menyengat, bebas dari filter blur/glow murahan, serta mengutamakan keterbacaan siluet pixel-art yang hangat.
- ⚡ **Zero-Build & Standalone Bundle:** Berjalan langsung melalui Native ES Modules (ESM) peramban murni tanpa build runtime, serta dilengkapi pipeline bundler mandiri (`npm run build`) yang menghasilkan bundle mandiri (`dist/`) siap hosting.

---

## 🎮 Fitur Utama & Progress Terkini

### 1. 🌾 Sistem Pertanian Terasering (12 Petak Kebun)
- **12 Petak Kebun Terisolasi (3×4):** Setiap petak memiliki state mesin mandiri (`grass` $\to$ `tilled` $\to$ `watered`).
- **Siklus 4 Fase Tumbuh:** *Seed (benih) $\to$ Sprout (tunas) $\to$ Leaf (daun) $\to$ Mature (siap panen)*.
- **Pergantian Hari & Cuaca:** Tanaman tumbuh otomatis saat pergantian hari (pukul 06:00) atau tersiram secara alami saat cuaca hujan.
- **Proteksi Panen Aman:** Mencegah hasil panen hilang apabila kapasitas tas inventaris sedang penuh (*Safe Harvest Abort*).

### 2. 🏡 Dunia Isometrik 36×36 & Two-Axis Collision Sliding
- **True 2:1 Isometric Projection:** Perhitungan matematis presisi $64\text{px} \times 32\text{px}$ dengan *inverse screen-to-tile hit-testing*.
- **Dynamic Foot-Y Depth Sorting:** Z-ordering presisi berbasis tapak kaki ($500 + \text{footY}$) memastikan karakter dan NPC ter-render natural di depan maupun di belakang objek kanopi.
- **Two-Axis Collision Sliding:** NavGrid 2D dengan resolusi tumbukan dua sumbu independen agar karakter meluncur mulus di sepanjang dinding atau sudut rintangan tanpa tersangkut.
- **Responsivitas Layar:** Mode `Phaser.Scale.RESIZE` memenuhi layar secara adaptif, kontrol zoom kamera 50%–175%, serta pemisahan kontrol sentuh virtual D-pad dan hotbar pada perangkat mobile portrait.

### 3. 💬 Warga Desa, Dialog Bertutur Nusantara & Sistem Sosial
- **Tiga Karakter Ikonik:** **Nenek Suri** (penjaga kebun komunitas), **Nara** (pengelola kios bibit & hasil tani), dan **Paman Bima** (pandai besi & kerajinan).
- **Naskah Indonesia Pedesaan Hangat:** Ditulis dengan gaya tutur ramah nusantara yang santun dan mengalir natural tanpa gaya terjemahan kaku.
- **Potret Bust Pixel-Art (128×128):** Tampilan dialog modal bergaya kertas perkamen dengan animasi potret ekspresif.
- **Sistem Hubungan Warga (RelationshipSystem):** Skor afeksi 0–100, sapaan harian (`talkedToday` +2 poin), bonus misi (+8 poin), serta 3 tingkatan hubungan (*Kenalan*, *Sahabat Lembah*, *Keluarga Lembah*).

### 4. 📜 Finite State Machine Misi & Idempotent Rewards
- **3 Beat Narasi Terhubung:**
  1. *Benih Pertama (Nenek Suri):* Mencangkul, menanam, menyiram, dan memanen Sunroot.
  2. *Tangan untuk Desa (Paman Bima):* Mengumpulkan Kayu Rimba dan Batu Kali untuk rangka lentera desa.
  3. *Lentera untuk Semua (Nara):* Melengkapi seserahan hasil kebun matang menyambut Malam Lentera Panen.
- **Idempotent Reward Token:** Hadiah dilindungi token unik (`reward_token_${questId}`) yang menjamin imbalan uang, item, dan poin afeksi tidak dapat diduplikasi saat percakapan ulang atau muat ulang penyimpanan (*save reload*).

### 5. 🎒 Tas Inventaris 16-Slot, Hotbar & Jurnal Misi
- **Manajemen Slot Cerdas:** Fitur klik-pilih untuk menukar (*swap*) posisi atau menumpuk (*stack merge* hingga batas 99 item).
- **Quick Hotbar 4-Slot:** Akses instan cangkul, penyiram air, dan benih melalui tombol `1`–`4` atau ketukan layar sentuh.
- **Jurnal Misi (`J`):** Menampilkan daftar misi aktif, ceklis pemenuhan target `[✓]`, dan hadiah secara langsung.

### 6. 💾 Sistem Persistensi Multi-Slot IndexedDB (`lembah-rimbun-db`)
- **Tiga Slot Penyimpanan Independen:** Pemilihan slot, penamaan nama karakter pemain (hingga 24 karakter), dan 3 variasi warna busana awal.
- **Penyimpanan Transaksional Atomik:** Penulisan snapshot data cadangan (*backup*) lalu snapshot utama dalam satu transaksi `readwrite` IndexedDB yang aman.
- **Deteksi Korupsi & Pemulihan:** Validasi integritas skema data saat muat save, isolasi penghapusan slot tanpa memengaruhi slot lain, serta modal persetujuan pemulihan (*recovery consent*) jika file utama rusak.
- **Autosave Serial Queue & In-Memory Fallback:** Antrean autosave ter-debounce mencegah race condition, dilengkapi fallback in-memory session transparan jika IndexedDB diblokir browser sandbox/incognito.

### 7. ⛏️ Gathering Kayu/Batu & Minigame Memancing Kolam Nila
- **Node Tambang & Foraging:** 6 mineral tambang di Tambang Batu Embun (3 pukulan cangkul/beliung dengan visual retak/puing) dan 5 titik foraging di Hutan Lumut dengan reset deterministik tiap pagi.
- **Minigame Memancing Kolam Nila:** Mekanik tahan/lepas (*hold/release capture bar*) via Spasi atau tombol sentuh pada dermaga kolam nila. Tangkapan ikan (*Riverfish* & *Silverfin*) bersifat deterministik tanpa resiko kehilangan alat atau *softlock*.

### 8. 🐾 Sahabat Pendamping Kiko (Pet AI System)
- **Logika Mengikuti (Breadcrumb Trail AI):** Kiko mengikuti Joni secara dinamis dengan perekaman jalur langkah, status istirahat santai saat Joni diam, dan teleportasi pemulihan otomatis jika terpisah jauh atau terhalang.
- **Interaksi Elus Harian (*Petting*):** Pemain dapat mengelus Kiko sekali per hari game untuk meningkatkan status afeksi (+3 poin) disertai animasi reaksi senang. Status dan posisi Kiko tersimpan persisten.

### 9. 🔨 Meja Kerajinan, Memasak Dapur & Alkimia
- **Bengkel Besi Bima:** Resep kerajinan kotak pot tanaman (`planter_box`), rangka lentera (`lantern_frame`), dan peningkatan penyiram air (`watering_can_upgrade`).
- **Dapur Pondok & Meja Alkimia:** Memasak sup herba (*Herb Soup*), pai beri (*Berry Pie*), dan ramuan tonik embun (*Dew Tonic*).
- **Transaksi Validasi Atomik:** Seluruh kerajinan memvalidasi stok bahan dan ruang tas secara ketat sebelum mutasi dilakukan (*no item loss*).

### 10. 🛋️ Dekorasi Interior Pondok & Cuaca/Malam Lentera Panen
- **Interior Pondok (Grid 6×6):** Penempatan furnitur (karpet tenun, pot tanaman, rak) dengan pratinjau grid flat (hijau sage jika valid, terakota merah jika terhalang pintu/kasur).
- **Simulasi Cuaca & Siang/Malam:** Siklus cuaca deterministik (cerah, berawan, hujan penyiram tanaman) dengan overlay langit malam transparan halus tanpa efek glow berlebihan.
- **Festival Malam Lentera Panen:** Terbuka setelah penyelesaian misi ketiga. Alun-alun desa dihiasi lentera temaram, warga desa berkumpul, dan perayaan ditutup dengan pembagian hadiah festival.

### 11. 🎵 Synthesizer Audio Prosedural Web Audio API
- **Efek Suara Prosedural Halus:** Efek langkah kaki, ayunan cangkul, percikan air, petikan panen, dan dentang tambang disintesis langsung menggunakan Web Audio API tanpa dependensi file audio eksternal yang berat.
- **Autoplay-Safe Bridge:** Memenuhi kebijakan autoplay browser modern dengan mengaktifkan konteks audio secara aman pada interaksi/gesture pertama pengguna.
- **Pengaturan Suara Komprehensif:** Panel pengaturan volume suara (Master, Music, SFX) dengan saklar Mute yang tersimpan pada preferensi `appMeta`.

---

## 🛠️ Tech Stack & Arsitektur

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER (DOM/CSS)                      │
│   HUDController  •  MenuController  •  DialoguePanel  •  LifePanels    │
│   TitleMenu      •  Phase4Panels    •  SettingsView   •  CSS Tokens    │
│   (Parchment UI, Touch Targets ≥ 44px, Safe-Area & Viewport Adaptive)  │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ EventBus / Input Freeze
┌───────────────────────────────────▼────────────────────────────────────┐
│                       SCENE LIFECYCLE (Phaser 3.88.2)                  │
│   BootScene ──► PreloadScene ──► TitleScene ──► GameScene (RESIZE)     │
│                                                     │        │         │
│                                                     ▼        ▼         │
│                                                  UIScene  WorldClock   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         DOMAIN SIMULATION SYSTEMS                      │
│   MovementSystem      • InteractionSystem  • FarmingSystem (12 Plots)  │
│   RelationshipSystem  • QuestSystem (FSM)  • DialogueSystem            │
│   EconomySystem       • CraftingSystem     • FishingSystem             │
│   ResourceSystem      • PetSystem (Kiko)   • DecorationSystem (Grid)   │
│   FestivalSystem      • AudioSystem (WebAudio API)                     │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       BACKEND & PERSISTENCE LAYER                      │
│   SaveRepository (IndexedDB) • SaveSerializer • SaveManager (Autosave) │
│   SettingsRepository         • Schema Migrations (Idempotent)          │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       WORLD & GEOMETRY FOUNDATION                      │
│   isoMath (2:1 64x32)  • NavGrid (Two-Axis Sliding) • DepthSorter      │
│   IsoWorldRenderer     • ZoneDefinitions (36x36 Desa Lembah Rimbun)    │
│   WorldAtmosphere      • LifeWorld Interactions                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Tata Letak Dunia (36×36 Lembah Rimbun)

Peta permainan berukuran **36×36 ubin isometrik** dengan konektivitas jalan setapak selebar 2 tile yang menghubungkan seluruh fasilitas desa:

```
                                  [UTARA]
                         (14,4) Paviliun Suri ── [Nenek Suri]
                                   │
  (5,5) Pondok Joni ───────────────┴─────────────── (24,5) Kios Pasar ── [Nara]
         │ (Kasur & Dekorasi)      │                       │
  (4,10) 12 Petak Kebun            │                 Alun-alun Desa
         │ (Terasering)            │              (Lentera Festival)
         │                         │                       │
  (6,22) Dermaga Pancing           └─────────────── (20,15) Bengkel Besi ── [Bima]
         │ (Kolam Nila)                                    │
  [BARAT]└───────────────────────────────────────── (30,12) Gerbang Hutan & Tambang [TIMUR]
                                  [SELATAN]
```

---

## 🕹️ Kontrol & Panduan Bermain

Permainan mendukung kontrol penuh menggunakan **Keyboard / Mouse** maupun **Layar Sentuh (Touchscreen)**:

| Aksi | Keyboard (Desktop) | Kontrol Sentuh (Mobile) |
|---|---|---|
| **Navigasi Karakter** | `W`, `A`, `S`, `D` atau `Tombol Panah` | Virtual D-Pad (Kiri Bawah) |
| **Aksi Kontekstual** | Tombol `E` atau `Spasi` | Tombol Aksi Bulat (Kanan Bawah) |
| **Pilih Slot Hotbar** | Angka `1`, `2`, `3`, `4` | Ketuk Slot Hotbar |
| **Buka/Tutup Tas (16 Slot)** | Tombol `I` | Tombol `🎒 Tas [I]` di HUD |
| **Buka/Tutup Jurnal Misi** | Tombol `J` | Tombol `📜 Jurnal [J]` di HUD |
| **Ganti Sudut Kamera (Angle)** | Tombol `C` (Isometrik $\leftrightarrow$ Top-Down) | Tombol `📷 [C]` di HUD |
| **Kontrol Zoom Kamera** | Scroll Mouse atau Tombol `+` / `-` (Reset `0`) | Tombol Zoom `[100%]` di HUD |
| **Pilih Opsi Dialog** | Angka `1`–`9` / `E` / `Spasi` | Ketuk Pilihan Opsi Dialog |
| **Tidur & Maju ke Pagi** | Dekati Kasur Pondok lalu tekan `E` | Dekati Kasur lalu ketuk Aksi |
| **Buka Pengaturan Suara** | Tombol Pengaturan di Menu Utama / HUD | Ketuk Ikon Pengaturan di HUD |
| **Tutup Modal / Batalkan** | Tombol `Esc` | Tombol `✕` di Pojok Modal |

---

## 🚀 Menjalankan Permainan & Build Produksi

### 1. Clone Repositori
```bash
git clone https://github.com/tamaproject360/season-of-home.git
cd season-of-home
```

### 2. Jalankan Server Pengembangan Lokal
Pilih salah satu metode berikut:

**Opsi A (Node.js npm — Rekomendasi):**
```bash
npm start
```

**Opsi B (Python 3):**
```bash
python -m http.server 8080 --directory "d:\GAME\SOH"
```

Buka di peramban: `http://localhost:8080`

### 3. Membangun Bundle Produksi Mandiri (`dist/`)
Untuk menghasilkan distribusi bundle statis mandiri bebas dependensi:
```bash
npm run build
```
Bundle akan terkompilasi ke dalam folder `dist/` lengkap dengan manifest integritas berkas (`build-manifest.json`).

Jalankan preview bundle produksi:
```bash
npm run preview
# Membuka http://localhost:8001
```

---

## 📁 Struktur Repositori

```
d:\GAME\SOH\
├── index.html                  # Entry point aplikasi web & mounting canvas Phaser
├── package.json                # Dependensi, konfigurasi test runner, & build scripts
├── blueprint.md                # Dokumen master game design v1.0
├── task.md                     # Master WBS tasklist (Phase 0 - 6 selesai 100%)
├── asset/                      # Seluruh aset visual pixel-art terpotong
│   ├── building/               # Bangunan eksterior & interior (pondok, kios, bengkel)
│   ├── characters/             # Spritesheets karakter 4x4 (313x313) & potret bust 128x128
│   ├── crops/                  # Varietas tanaman (Sunroot, Mossberry, Goldenleaf stage 1-4)
│   ├── items/                  # Perkakas pertanian, bibit, hasil panen, material tambang
│   ├── nature/                 # Pohon tropis, semak, node tambang, lentera festival
│   └── terrain/                # Ubin rumput, jalan tanah, petak kebun, dermaga pancing
├── docs/                       # Dokumentasi arsitektur resmi
│   ├── specs.md                # Spesifikasi arsitektur komprehensif untuk Agentic AI
│   ├── task.md                 # Checkpoint log penyelesaian fase
│   └── changelog.md            # Log riwayat perubahan proyek berkelanjutan
├── lib/
│   └── phaser.min.js           # Bundle Phaser engine 3.88.2 lokal
├── scripts/                    # Skrip otomasi rilis
│   ├── build.mjs               # Script build bundle mandiri ke dist/
│   └── serve.mjs               # Server lokal preview berbasis Node.js
├── src/                        # Sumber kode aplikasi permainan (Native ESM)
│   ├── config/                 # Parameter konfigurasi & palet kurasi anti-slop
│   ├── data/                   # Katalog tanaman, item, misi narasi, dialog, & resep
│   ├── entities/               # Player (Joni), NPC, Kiko (Pet), FarmPlot, & ResourceNode
│   ├── input/                  # Router input multi-platform (Desktop, Touch, & Camera)
│   ├── persistence/            # Arsitektur IndexedDB (SaveRepo, Serializer, Settings, Migrasi)
│   ├── scenes/                 # BootScene, PreloadScene, TitleScene, GameScene, & UIScene
│   ├── styles/                 # Desain token CSS (tokens.css) & layout UI (ui.css)
│   ├── systems/                # 14 subsistem domain simulasi gameplay & Web Audio API
│   ├── ui/                     # Kontroler HUD, Menu Tas/Jurnal, Dialog, Kios, & Pengaturan
│   ├── utils/                  # EventBus pub/sub, rumus jarak, & PRNG deterministik
│   └── world/                  # Matematika 2:1, NavGrid, DepthSorter, Kalender, & Suasana
└── tests/                      # Suite unit test otomatis
```



<div align="center">
  <sub>Dibangun dengan dedikasi untuk menghadirkan pengalaman simulasi pedesaan Nusantara yang menenangkan dan hangat.</sub><br/>
  <strong>Seasons of Home © 2026 Lembah Rimbun Project</strong>
</div>
