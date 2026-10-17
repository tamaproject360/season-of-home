# MASTER TASKLIST PENGEMBANGAN GAME: SEASONS OF HOME (LEMBAH RIMBUN)

> **Dokumen Arsitektur & Pelaksanaan Teknis:** Work Breakdown Structure (WBS) & Engineering Tasklist  
> **Game Architect & Lead Developer:** Game Developer Architect (20+ Years Industry Experience)  
> **Source of Truth:** [blueprint.md](file:///d:/GAME/SOH/blueprint.md) (v1.0)  
> **Engine & Target:** Phaser 3.88.2 (JavaScript ES Modules) | HTML5 Canvas / WebGL 2D | IndexedDB  
> **Direktori Master Aset Karakter:** `D:\GAME\SOH\asset`  
> **Status Proyek:** Seluruh Phase (Phase 0 – Phase 6) telah selesai diimplementasikan, terintegrasi penuh, dan terverifikasi 100% lulus melalui automated test suite (11/11 suite lulus), persistensi multi-slot IndexedDB, audio Web Audio API prosedural, responsivitas mobile-desktop (canvas RESIZE), dan standalone build mandiri.
> **Spesifikasi implementasi terkini:** [docs/specs.md](docs/specs.md)

---

## 1. PEMETAAN ASET KARAKTER MASTER (`D:\GAME\SOH\asset`)

Aset visual master karakter beresolusi tinggi (1254×1254 piksel) telah diinventarisir di folder `D:\GAME\SOH\asset`. Aset-aset ini berfungsi sebagai *high-resolution source artwork* dan referensi desain kanonikal yang akan diproses ke dalam pipeline frontend (UI Bust Portrait & Downscaled Isometric Pixel Atlas).

| File Master | Entitas Game | Peran Naratif & Gameplay | Target Pemrosesan Frontend |
|---|---|---|---|
| `joni.png` | **Player (Joni)** | Protagonis utama; mewarisi kebun terasering | Bust dialog UI (128×128 quantized) + Siluet referensi untuk sprite atlas isometrik 8-arah (64×32 base tile, 4 frame jalan, 3 variasi warna pakaian). |
| `nara.png` | **NPC Nara** | Pengelola kios desa; bibit & jual-beli hasil panen | Bust potret UI Kios/Dialog + Sprite NPC idle 2-frame di kios desa alun-alun. |
| `bima.png` | **NPC Bima** | Pengrajin kayu & pandai besi desa; crafting & upgrade | Bust potret UI Meja Kerajinan/Dialog + Sprite NPC interaktif di bengkel desa. |
| `suri.png` | **NPC Suri** | Penjaga kebun komunitas; pemandu pertanian & festival | Bust potret UI Tutorial/Dialog + Sprite NPC pemandu di area kebun/desa. |
| `kiko.png` | **Pet Companion** | Sahabat musang/kucing hutan; status follow/rest/petting | Sprite companion dinamis (4 frame jalan, 2 frame idle, 1 frame fidget/petting) tanpa collision solid. |

---

## 2. STRUKTUR PIPELINE PENGEMBANGAN (FRONTEND KE BACKEND)

Sesuai metodologi arsitektur game modern, tasklist disusun secara modular dari lapisan terluar (*Presentation/Frontend Layer*) menuju logika permainan (*Simulation/Domain Layer*), fondasi arsitektur data (*Backend/Persistence Layer*), hingga tahap verifikasi dan jaminan kualitas (*QA & Release Gate*):

1. **Frontend — Asset Pipeline & Character Processing (`D:\GAME\SOH\asset`)**
2. **Frontend — Procedural Pixel Art, Palette & Texture Cache Engine**
3. **Frontend — Isometric Projection, Occlusion & Rendering Engine**
4. **Frontend — Scene Lifecycle & State Management**
5. **Frontend — UI Shell, HUD, Modals & Design Tokens (DOM/CSS)**
6. **Frontend — Multi-Platform Input Router (Desktop & Touch)**
7. **Frontend — Procedural Audio Synthesizer & Web Audio Bridge**
8. **Gameplay / Middleware — Player Movement & Isometric Collision Mechanics**
9. **Gameplay / Middleware — Interaction Engine & Contextual Targeting**
10. **Gameplay / Middleware — Farming System & Crop Lifecycle (12 Plots)**
11. **Gameplay / Middleware — NPC Entities, Dialogue Flow & Social Mechanics**
12. **Gameplay / Middleware — Quest State Machine & Idempotent Narrative Beats**
13. **Gameplay / Middleware — Gathering, Mining & Daily Resource Respawn**
14. **Gameplay / Middleware — Fishing Minigame Subsystem**
15. **Gameplay / Middleware — Companion Pet AI & Affection System (Kiko)**
16. **Gameplay / Middleware — Crafting, Cooking & Alchemy Workstations**
17. **Gameplay / Middleware — Interior Cottage Decoration & Grid Snapping**
18. **Gameplay / Middleware — Time Calendar, Weather Simulation & Festival Events**
19. **Backend / Architecture — Domain State & Event-Driven Decoupling (EventBus)**
20. **Backend / Architecture — Inventory & Economy Transaction Engine**
21. **Backend / Persistence — IndexedDB Architecture (`lembah-rimbun-db`)**
22. **Backend / Persistence — Serialization, Deserialization & Snapshot Engine**
23. **Backend / Persistence — Data Migration, Backup & Storage Fallback**
24. **Verification & QA — Automated Invariant Testing & Unit Suites**
25. **Verification & QA — Multi-Resolution Mobile Testing & Playtest Matrix**
26. **Production & DevOps — Gemini Canvas Sandboxing, Packaging & Final Release**

---

## 3. MASTER TASKLIST TABLE

| No | Tugas | Status | Prioritas | Phase |
|:---:|---|:---:|:---:|:---:|
| **A** | **FRONTEND: ASSET PIPELINE & CHARACTER PROCESSING** | | | |
| 1 | Inventarisir dan audit metadata resolusi (1254×1254) serta palet warna file karakter `main.png`, `nara.png`, `bima.png`, `suri.png`, dan `kiko.png` di `D:\GAME\SOH\asset`. | Selesai | P0 | Phase 0 |
| 2 | Bangun pipeline konversi dan downscaling potret karakter master (`asset/*.png`) menjadi dialog bust UI berukuran 128×128 piksel dengan *nearest-neighbor downsampling* dan kuantisasi palet kurasi. | Selesai | P0 | Phase 0 |
| 3 | Ekstraksi siluet proporsional dan palet warna karakter dari `main.png` sebagai basis desain sprite atlas isometrik protagonis (Joni) dengan 4 arah hadap (SE, SW, NE, NW). | Selesai | P0 | Phase 1 |
| 4 | Ekstraksi siluet dan pemodelan sprite atlas untuk NPC Nara (`nara.png`), Bima (`bima.png`), dan Suri (`suri.png`) dengan ukuran tapak kaki 64×32 piksel dan 2 frame animasi idle. | Selesai | P0 | Phase 3 |
| 5 | Ekstraksi siluet dan pemodelan sprite companion Kiko (`kiko.png`) dengan 4 frame animasi berjalan dan frame animasi reaksi dielus (*petting*). | Selesai | P1 | Phase 5 |
| **B** | **FRONTEND: PROCEDURAL PIXEL ART, PALETTE & TEXTURE CACHE** | | | |
| 6 | Konfigurasi modul konstanta palet kurasi anti-slop di `src/config/palette.js` (14 warna tanah/alam, larangan keras hex primer jenuh `#FF0000`, `#00FF00`, `#0000FF`, `#FFFF00`). | Selesai | P0 | Phase 0 |
| 7 | Implementasi `src/graphics/terrainPatterns.js` untuk menggambar tile dasar isometrik secara prosedural (rumput kering, tanah subur berteras, jalur setapak, dan air tenang dengan riak diskrit). | Selesai | P0 | Phase 0 |
| 8 | Implementasi `src/graphics/buildingSprites.js` untuk merender struktur eksterior dan interior pondok desa (pondasi batu kali, dinding papan kayu, genteng tanah liat bertingkat, pintu kayu). | Selesai | P0 | Phase 1 |
| 9 | Implementasi `src/graphics/vegetationSprites.js` untuk merender 3 siluet pohon unik tropis-hangat (batang berlekuk, tajuk daun bergerombol bertingkat, bayangan kontak tanah). | Selesai | P0 | Phase 1 |
| 10 | Implementasi `src/graphics/proceduralSpriteFactory.js` berbasis `CanvasRenderingContext2D` offscreen untuk merasterisasi tekstur ke dalam cache Phaser Texture Manager. | Selesai | P0 | Phase 0 |
| 11 | Implementasi `src/graphics/spriteCache.js` dengan kunci komposit `kind:variant:pose:direction:frame:palette` untuk menjamin tekstur hanya digambar satu kali saat inisialisasi. | Selesai | P0 | Phase 0 |
| **C** | **FRONTEND: ISOMETRIC PROJECTION, OCCLUSION & RENDERING ENGINE** | | | |
| 12 | Implementasi fungsi transformasi proyeksi matematika isometrik di `src/world/isoMath.js` (`tileToScreen` dan `screenToTile`) berbasis tile width 64px dan tile height 32px. | Selesai | P0 | Phase 0 |
| 13 | Bangun mekanisme inverse transform pada `screenToTile` yang memperhitungkan viewport scale, zoom, dan offset kamera untuk hit-testing klik/sentuhan presisi. | Selesai | P0 | Phase 1 |
| 14 | Implementasi `src/world/DepthSorter.js` untuk kalkulasi urutan render objek (z-ordering) dinamis berbasis koordinat tapak kaki di layar (*screen-space foot-y*). | Selesai | P0 | Phase 1 |
| 15 | Bangun pemisahan lapisan visual antara rintangan solid (batang pohon/dinding) dan elemen penutup depan/kanopi atap (*occluder group/foreground canopy*) agar pemain tertutup secara natural saat berjalan di belakangnya. | Selesai | P0 | Phase 1 |
| 16 | Implementasi `src/world/IsoWorldRenderer.js` untuk me-render multi-layer isometrik (ground terrain layer, entity dynamic layer, overhead canopy layer). | Selesai | P0 | Phase 1 |
| 17 | Implementasi sistem kamera isometrik di `GameScene` dengan *exponential lerp follow*, batasan zona (*camera clamping*), dan deadzone anti-jitter. | Selesai | P0 | Phase 1 |
| **D** | **FRONTEND: SCENE LIFECYCLE & STATE FLOW** | | | |
| 18 | Implementasi `src/scenes/BootScene.js` untuk inisialisasi engine Phaser 3.88.2, verifikasi dukungan browser, dan pemeriksaan ketersediaan IndexedDB. | Selesai | P0 | Phase 0 |
| 19 | Implementasi `src/scenes/PreloadScene.js` untuk memicu rasterisasi sprite prosedural, prapemanasan cache tekstur, dan konversi aset master karakter. | Selesai | P0 | Phase 0 |
| 20 | Implementasi `src/scenes/TitleScene.js` dengan tampilan menu utama handcrafted (Tombol New Game, Continue, Settings, Slot Selection). | Selesai | P0 | Phase 0 |
| 21 | Implementasi `src/scenes/GameScene.js` sebagai orkestrator gameplay aktif, transisi zona (Pondok, Kebun, Desa, Hutan, Tambang, Kolam), dan delta time bounded loop. | Selesai | P0 | Phase 1 |
| 22 | Implementasi `src/scenes/UIScene.js` sebagai scene paralel transparan untuk menampung DOM/HUD layer terisolasi dari pergerakan kamera dunia. | Selesai | P0 | Phase 2 |
| **E** | **FRONTEND: UI SHELL, HUD, MODALS & DESIGN TOKENS (DOM/CSS)** | | | |
| 23 | Pembuatan stylesheet desain token di `src/styles/tokens.css` dan `src/styles/ui.css` (tema parchment `#F2E8D5`, bingkai kayu `#87674E`, tinta gelap `#2D3835`, tombol clay `#BC7654`). | Selesai | P0 | Phase 0 |
| 24 | Implementasi `src/ui/HUDController.js` untuk menampilkan jam dunia game, indikator cuaca & musim, saldo Leafcoins, dan 4-slot hotbar cepat. | Selesai | P0 | Phase 2 |
| 25 | Implementasi `src/ui/DialoguePanel.js` dengan integrasi potret karakter 128×128 (dari `asset/*.png`), kotak teks narasi 1–3 baris, dan tombol opsi responsif. | Selesai | P0 | Phase 3 |
| 26 | Implementasi `src/ui/MenuController.js` untuk mengontrol pembukaan modal game (Inventory 16 slot, Quest Journal, Meja Kerajinan, Kios Belanja). | Selesai | P0 | Phase 2 |
| 27 | Implementasi antarmuka pemilihan 3 save slot dan kustomisasi nama pemain serta 3 variasi warna busana awal. | Selesai | P0 | Phase 4 |
| 28 | Penyesuaian layout CSS responsif dengan batas minimum target sentuh ≥44px CSS dan kepatuhan safe-area insets mobile. | Selesai | P0 | Phase 0 |
| **F** | **FRONTEND: MULTI-PLATFORM INPUT ROUTER (DESKTOP & TOUCH)** | | | |
| 29 | Implementasi `src/input/InputRouter.js` sebagai pusat perantara input terisolasi yang mengonversi input mentah menjadi komando gerakan dan interaksi semantik. | Selesai | P0 | Phase 0 |
| 30 | Implementasi `src/input/DesktopInput.js` untuk navigasi 8 arah keyboard (WASD / Panah), tombol interaksi kontekstual `E`, aksi minigame `Space`, hotbar `1–4`, journal `J`, inventory `I`, dan pause `Esc`. | Selesai | P0 | Phase 0 |
| 31 | Implementasi `src/input/TouchControls.js` untuk layar sentuh mobile (Virtual D-pad responsif di kiri bawah dan Action Button kontekstual di kanan bawah). | Selesai | P0 | Phase 0 |
| 32 | Implementasi pencegahan event default browser (mencegah unintended page scroll, pull-to-refresh, zoom gesture saat berinteraksi di canvas game). | Selesai | P0 | Phase 0 |
| 33 | Implementasi *input focus management* untuk membekukan pergerakan karakter dunia secara otomatis saat modal UI/dialog terbuka. | Selesai | P0 | Phase 2 |
| **G** | **FRONTEND: PROCEDURAL AUDIO SYNTHESIZER & WEB AUDIO BRIDGE** | | | |
| 34 | Implementasi generator audio prosedural Web Audio API untuk efek suara interaksi lembut (langkah kaki, ayunan cangkul, percikan air, pemetikan panen, dentang tambang). | Selesai | P1 | Phase 6 |
| 35 | Implementasi mekanisme *AudioContext resume-on-first-gesture* untuk memenuhi kebijakan autoplay browser tanpa menghasilkan uncaught runtime exception. | Selesai | P1 | Phase 6 |
| 36 | Implementasi panel kontrol volume (Master, Music, SFX, Mute toggle) dengan persistensi preferensi audio. | Selesai | P1 | Phase 6 |
| **H** | **GAMEPLAY: PLAYER MOVEMENT & ISOMETRIC COLLISION MECHANICS** | | | |
| 37 | Implementasi `src/world/navGrid.js` untuk merepresentasikan matriks grid collision 2D per zona (flag: walkable, blocked obstacle, water edge, portal trigger). | Selesai | P0 | Phase 1 |
| 38 | Implementasi entitas `src/entities/Player.js` dengan state koordinat fraksional `tileX`, `tileY`, arah hadap, status stamina, dan referensi sprite visual. | Selesai | P0 | Phase 1 |
| 39 | Implementasi `src/systems/MovementSystem.js` dengan kalkulasi kecepatan per detik independen frame-rate (`deltaMs` capped ≤ 0.1 detik) dan normalisasi vektor diagonal. | Selesai | P0 | Phase 1 |
| 40 | Bangun resolusi tumbukan dua sumbu (*two-axis collision sliding*) pada ruang grid dunia sebelum proyeksi isometrik agar pemain tidak tersangkut di sudut rintangan. | Selesai | P0 | Phase 1 |
| **I** | **GAMEPLAY: INTERACTION ENGINE & CONTEXTUAL TARGETING** | | | |
| 41 | Implementasi `src/systems/InteractionSystem.js` dengan deteksi radius kedekatan (radius interaksi ≤ 1.15 tile dari tapak kaki karakter). | Selesai | P0 | Phase 1 |
| 42 | Bangun algoritma penentuan target interaksi prioritas deterministik bila terdapat beberapa objek berdekatan (`active quest > contextual node > NPC > decor`). | Selesai | P0 | Phase 1 |
| 43 | Implementasi tombol interaksi tunggal cerdas (*Single Contextual Action Button*) yang beradaptasi otomatis sesuai target (Cangkul/Tanam/Siram/Panen/Bicara/Buka). | Selesai | P0 | Phase 1 |
| 44 | Implementasi *input debouncing* dan kunci transaksi interaksi untuk mencegah eksekusi ganda akibat ketukan berulang (*double tap exploit*). | Selesai | P0 | Phase 1 |
| **J** | **GAMEPLAY: FARMING SYSTEM & CROP LIFECYCLE (12 PLOTS)** | | | |
| 45 | Implementasi entitas `src/entities/FarmPlot.js` untuk 12 petak kebun (3×4) dengan state mesin terisolasi (`soilState`: grass/tilled/watered, `cropId`, `growthStage`, `wateredOnDay`). | Selesai | P0 | Phase 2 |
| 46 | Konfigurasi data varietas tanaman di `src/data/crops.js` (`sunroot` 2 hari panen, `mossberry` 3 hari, `goldenleaf` 4 hari) dengan 4 fase visual unik (`seed -> sprout -> leaf -> mature`). | Selesai | P0 | Phase 2 |
| 47 | Implementasi logika operasional cangkul (*till*), penanaman benih dari hotbar, penyiraman tanaman (*water*), dan pemanenan hasil matang (*harvest*). | Selesai | P0 | Phase 2 |
| 48 | Implementasi `src/systems/FarmingSystem.js` yang memproses kenaikan fase tumbuh tanaman saat hari berganti dan menyiram otomatis saat hari hujan. | Selesai | P0 | Phase 2 |
| 49 | Bangun proteksi pembatalan panen aman saat inventory penuh agar hasil panen tidak hilang dari dunia. | Selesai | P0 | Phase 2 |
| **K** | **GAMEPLAY: NPC ENTITIES, DIALOGUE FLOW & SOCIAL MECHANICS** | | | |
| 50 | Implementasi entitas `src/entities/NPC.js` untuk Nara, Bima, dan Suri (menggunakan aset master `nara.png`, `bima.png`, `suri.png` sebagai basis visual), lengkap dengan node posisi jadwal deterministik. | Selesai | P0 | Phase 3 |
| 51 | Implementasi `src/systems/DialogueSystem.js` dengan dukungan dialog bercabang, seleksi respons pemain, dan pembaruan flag cerita. | Selesai | P0 | Phase 3 |
| 52 | Implementasi `src/systems/RelationshipSystem.js` dengan nilai *friendship* 0–100, batasan sapaan harian (`talkedToday`), serta penambahan afeksi dari quest (+8) dan hadiah (+5). | Selesai | P0 | Phase 3 |
| 53 | Penyusunan naskah narasi dan percakapan di `src/data/npcDialogue.js` bernuansa pedesaan tropis hangat berbahasa Indonesia tanpa gaya terjemahan kaku. | Selesai | P0 | Phase 3 |
| **L** | **GAMEPLAY: QUEST STATE MACHINE & IDEMPOTENT NARRATIVE BEATS** | | | |
| 54 | Implementasi `src/systems/QuestSystem.js` berbasis Finite State Machine (`locked -> available -> active -> completed -> rewarded`). | Selesai | P0 | Phase 3 |
| 55 | Konfigurasi data objektif quest utama di `src/data/quests.js` untuk 3 beat narasi: "Benih Pertama" (farming), "Tangan untuk Desa" (crafting & sosial), "Lentera untuk Semua" (festival). | Selesai | P0 | Phase 3 |
| 56 | Implementasi mekanisme *Idempotent Reward Granting* dengan token unik agar hadiah uang/item quest dijamin tidak dapat diduplikasi saat reload atau re-interaksi. | Selesai | P0 | Phase 3 |
| 57 | Implementasi pembaruan otomatis status jurnal quest berdasarkan tangkapan domain events (`PLOT_WATERED`, `CROP_HARVESTED`, `ITEM_ACQUIRED`, `NPC_TALKED`). | Selesai | P0 | Phase 3 |
| **M** | **GAMEPLAY: GATHERING, MINING & DAILY RESOURCE RESPAWN** | | | |
| 58 | Implementasi entitas `src/entities/ResourceNode.js` untuk 6 node tambang batu/mineral di Tambang Batu Embun dan 5 titik foraging di Hutan Lumut. | Selesai | P1 | Phase 5 |
| 59 | Implementasi state perubahan visual node tambang (`intact -> cracked -> depleted`) dengan pergantian sprite retak/puing dan feedback aksi; tanpa shake agresif. | Selesai | P1 | Phase 5 |
| 60 | Bangun sistem *Daily Resource Respawn* deterministik saat pergantian hari game untuk mereset node yang telah dipanen. | Selesai | P1 | Phase 5 |
| **N** | **GAMEPLAY: FISHING MINIGAME SUBSYSTEM** | | | |
| 61 | Implementasi `src/systems/FishingSystem.js` pada titik interaksi air Kolam Nila dengan mekanik minigame tahan/lepas (*hold/release capture bar*). | Selesai | P1 | Phase 5 |
| 62 | Konfigurasi data tangkapan ikan (`riverfish` dan `silverfin`) deterministik berdasarkan hari dan nomor percobaan tersimpan. | Selesai | P1 | Phase 5 |
| 63 | Penanganan kondisi menang/kalah minigame pancing tanpa penalti kehilangan alat pancing dan bebas dari resiko *softlock*. | Selesai | P1 | Phase 5 |
| **O** | **GAMEPLAY: COMPANION PET AI & AFFECTION SYSTEM (KIKO)** | | | |
| 64 | Implementasi entitas `src/entities/Pet.js` untuk Kiko (mengacu pada aset karakter) dengan logika mengikuti pemain berbasis jejak rekam posisi (*breadcrumb trail history*). | Selesai | P1 | Phase 5 |
| 65 | Bangun mekanisme teleport pemulihan posisi otomatis jika Kiko tersangkut rintangan atau terlalu jauh. | Selesai | P1 | Phase 5 |
| 66 | Implementasi interaksi elus (*petting*) harian dengan kenaikan status afeksi, animasi reaksi senang, dan pembatasan satu kali per hari game. | Selesai | P1 | Phase 5 |
| **P** | **GAMEPLAY: CRAFTING, COOKING & ALCHEMY WORKSTATIONS** | | | |
| 67 | Implementasi `src/systems/CraftingSystem.js` pada Meja Kerajinan Bima dengan validasi resep, kalkulasi bahan tersedia vs dibutuhkan, dan mutasi atomik. | Selesai | P0 | Phase 4 |
| 68 | Konfigurasi data resep di `src/data/recipes.js` untuk 3 resep inti: `wooden_planter` (kayu + batu), `lantern_frame` (kayu + bijih tambang), `watering_can_upgrade` (bijih + koin). | Selesai | P0 | Phase 4 |
| 69 | Implementasi sistem Masak di dapur pondok (resep `herb_soup` dan `berry_pie`) serta Meja Alkimia (resep tonik `dew_tonic`). | Selesai | P1 | Phase 5 |
| **Q** | **GAMEPLAY: HOUSING DECORATION & GRID SNAPPING** | | | |
| 70 | Implementasi `src/systems/DecorationSystem.js` untuk penempatan furnitur interior pondok (karpet tenun, pot tanaman, rak buku kecil). | Selesai | P1 | Phase 5 |
| 71 | Implementasi *grid-snap placement preview* transparan flat (warna sage hijau untuk posisi valid, terracotta merah untuk posisi terhalang). | Selesai | P1 | Phase 5 |
| 72 | Validasi posisi dekorasi terhadap pintu keluar, zona interaksi penting, dan objek furnitur lain agar tidak memblokir pergerakan. | Selesai | P1 | Phase 5 |
| **R** | **GAMEPLAY: TIME CALENDAR, WEATHER SIMULATION & FESTIVAL** | | | |
| 73 | Implementasi `src/world/WorldClock.js` (1 hari game = 10 menit waktu nyata; pagi 06:00, malam 18:00; pembekuan waktu saat menu/dialog terbuka). | Selesai | P0 | Phase 2 |
| 74 | Implementasi mekanik tidur di kasur pondok untuk memajukan hari keesokan paginya dan memicu siklus pertumbuhan kebun serta restock kios. | Selesai | P0 | Phase 2 |
| 75 | Implementasi simulasi cuaca harian deterministik (`clear`, `cloudy`, `rain`) dengan palet suasana langit dan penyiraman kebun otomatis saat hujan. | Selesai | P1 | Phase 5 |
| 76 | Implementasi transisi pencahayaan siang/malam menggunakan overlay warna transparan halus dan hujan diskrit (bebas glow/bloom). | Selesai | P1 | Phase 5 |
| 77 | Implementasi Event Festival "Malam Lentera Panen" di alun-alun desa pasca Quest Beat 3: lentera, kumpul warga, panel perayaan, hadiah sekali. | Selesai | P1 | Phase 5 |
| **S** | **BACKEND: DOMAIN STATE & EVENT-DRIVEN DECOUPLING (EVENTBUS)** | | | |
| 78 | Implementasi arsitektur perantara event terpusat di `src/utils/EventBus.js` untuk memutus ketergantungan langsung antara renderer dan state logika. | Selesai | P0 | Phase 0 |
| 79 | Perancangan struktur skema kanonikal `GameState` tunggal (memuat data world, player, inventory, farm, quests, relationships, pet, housing, flags). | Selesai | P0 | Phase 0 |
| 80 | Implementasi Command Handlers untuk mengeksekusi aksi mutasi state secara terkontrol (penerapan prinsip Command-Query Separation). | Selesai | P0 | Phase 0 |
| 81 | Implementasi generator angka acak semu terdistribusi deterministik di `src/utils/rng.js` berbasis formula PRNG ber-seed (`worldSeed + gameDay + nodeId`). | Selesai | P0 | Phase 0 |
| **T** | **BACKEND: INVENTORY & ECONOMY TRANSACTION ENGINE** | | | |
| 82 | Implementasi `src/systems/InventorySystem.js` dengan kapasitas 16 slot, penanganan tumpukan item (*maxStack* 99), dan instansiasi ID unik. | Selesai | P0 | Phase 2 |
| 83 | Konfigurasi kamus data item statis di `src/data/items.js` dengan atribut kategori, harga beli, harga jual, dan flag proteksi `sellable: false` untuk item quest penting. | Selesai | P0 | Phase 2 |
| 84 | Implementasi `src/systems/EconomySystem.js` untuk memproses transaksi pembelian bibit dan penjualan hasil tani/tambang/ikan di Kios Nara secara atomik. | Selesai | P0 | Phase 4 |
| 85 | Bangun validasi transaksi keuangan agar saldo Leafcoins pemain tidak pernah bernilai negatif dalam kondisi transaksi apa pun. | Selesai | P0 | Phase 4 |
| **U** | **BACKEND: PERSISTENCE LAYER (INDEXEDDB `lembah-rimbun-db`)** | | | |
| 86 | Inisialisasi arsitektur IndexedDB `lembah-rimbun-db` versi 1 di `src/persistence/SaveRepository.js` dengan 3 object store: `saveSlots`, `saveBackups`, dan `appMeta`. | Selesai | P0 | Phase 0 |
| 87 | Implementasi `src/persistence/SaveSerializer.js` untuk membuat snapshot state permainan murni format JSON (bebas dari referensi siklis DOM, canvas, atau objek Phaser). | Selesai | P0 | Phase 4 |
| 88 | Implementasi algoritma penyimpanan transaksional atomik: penulisan data cadangan (*backup*) lalu penulisan data slot utama dalam satu transaksi `readwrite`. | Selesai | P0 | Phase 4 |
| 89 | Bangun Serial Queue Autosave Manager untuk mencegah *race condition* penulisan data bersamaan saat terjadi pergantian zona, reward quest, dan tidur. | Selesai | P0 | Phase 4 |
| 90 | Implementasi pemuatan data (*load*) dengan validasi skema integritas, isolasi ketat antar 3 slot penyimpanan, dan mekanisme pemulihan dari slot cadangan jika snapshot korup. | Selesai | P0 | Phase 4 |
| 91 | Implementasi penghapusan slot penyimpanan secara terisolasi tanpa memengaruhi data pada dua slot lainnya. | Selesai | P0 | Phase 4 |
| 92 | Implementasi mekanisme fallback session/in-memory jika lingkungan browser (misalnya mode incognito/sandbox iframe Canvas) memblokir IndexedDB, disertai banner notifikasi transparan. | Selesai | P0 | Phase 0 |
| **V** | **BACKEND: SETTINGS PERSISTENCE & MIGRATION ENGINE** | | | |
| 93 | Implementasi penyimpanan preferensi pengguna (volume audio, ukuran tombol kontrol, opsi reduced motion) ke dalam store `appMeta` atau safe localStorage wrapper. | Selesai | P0 | Phase 4 |
| 94 | Implementasi pipeline migrasi skema data idempotent di `src/persistence/migrations.js` untuk menjamin kompabilitas save game saat versi rilis diperbarui. | Selesai | P1 | Phase 4 |
| **W** | **QUALITY ASSURANCE & AUTOMATED INVARIANT TESTS** | | | |
| 95 | Pembuatan test suite unit `tests/isoMath.test.js` untuk menguji akurasi bolak-balik transformasi `tileToScreen` -> `screenToTile` dengan toleransi kesalahan ±1e-6. | Selesai | P0 | Phase 1 |
| 96 | Pembuatan test suite unit `tests/inventory.test.js` untuk memvalidasi batas kapasitas tumpukan, penolakan transaksi saat penuh, dan keunikan instance item. | Selesai | P0 | Phase 2 |
| 97 | Pembuatan test suite unit `tests/quests.test.js` untuk memverifikasi siklus FSM quest dan jaminan idempotensi reward (tidak terjadi reward duplikat saat reload). | Selesai | P0 | Phase 3 |
| 98 | Pembuatan test suite unit `tests/save-roundtrip.test.js` untuk memastikan integritas siklus simpan-muat data JSON dan isolasi ketiga slot. | Selesai | P0 | Phase 4 |
| 99 | Eksekusi matriks uji penerimaan penyimpanan `SAVE-01` sampai `SAVE-10` melalui tes domain, transaksi IndexedDB, dan uji browser native. Lihat docs/specs.md untuk cakupannya. | Selesai | P0 | Phase 4 |
| **X** | **CROSS-DEVICE COMPATIBILITY, POLISH & RELEASE GATE** | | | |
| 100 | Pengujian performa render 60 FPS pada desktop (budget frame-time ~16.7ms) dan 30–60 FPS pada mobile (budget frame-time ~33.3ms) tanpa lonjakan tekstur saat eksplorasi. | Selesai | P0 | Phase 6 |
| 101 | Uji verifikasi tata letak dan keterbacaan kontrol sentuh pada berbagai rasio layar mobile nyata/simulasi (360×800 portrait, 390×844 portrait, 844×390 landscape). | Selesai | P0 | Phase 6 |
| 102 | Audit kepatuhan visual terhadap Manifesto Anti-AI-Slop (verifikasi tidak adanya hex primer murni, ketiadaan filter blur/glow artifisial, dan keterbacaan siluet entitas). | Selesai | P0 | Phase 6 |
| 103 | Uji coba playthrough end-to-end vertikal slice 15–25 menit tanpa blocker (Alur: Buka Slot -> Gerak -> Tanam/Siram/Panen -> Bicara NPC -> Selesaikan Quest -> Crafting -> Simpan & Reload). | Selesai | P0 | Phase 6 |
| 104 | Pembuatan bundle build mandiri (*self-contained / modular bundle*) yang kompatibel dengan pratinjau Gemini Web Canvas serta hosting statis standar. | Selesai | P0 | Phase 6 |

---

## 4. DEFINITION OF DONE (DoD) & KRITERIA KELULUSAN TAHAPAN

Sebuah tugas (*task*) dalam tasklist ini hanya dapat diubah statusnya menjadi **Selesai (Done)** apabila memenuhi kriteria ketat berikut:
1. **Dapat Dimainkan Nyata:** Fitur dapat diakses langsung oleh pemain melalui input nyata, bukan simulasi statis atau tombol bohongan.
2. **Umpan Balik Lengkap:** Memiliki feedback visual pixel art dan audio prosedural yang jelas dan responsif.
3. **Multi-Input Teruji:** Berfungsi stabil menggunakan keyboard/mouse (desktop) dan virtual touch controls (layar sentuh mobile).
4. **State Konsisten & Persisten:** Status permainan valid sesudah siklus simpan dan muat ulang (*save/load roundtrip*) tanpa ada item atau progres yang hilang.
5. **Kepatuhan Estetika:** Menggunakan warna dari palet kurasi resmi tanpa menggunakan efek glow neon, gradient murahan, atau bentuk kotak primitif untextured.
6. **Bebas Error Happy Path:** Log konsol peramban bersih dari uncaught exception atau peringatan performa kritis.
