# Rencana Implementasi: Fitur Camera Angle (Isometrik & Top-Down)

- **Dokumen Desain:** `docs/superpowers/specs/2026-10-17-camera-angle-design.md`
- **Tujuan:** Mengintegrasikan mode proyeksi kamera ganda (Isometrik 2:1 & Top-Down 2D) dengan tombol pintas keyboard `C` dan tombol toggle HUD.

---

## Task Breakdown

### Task 1: Ekstensi Proyeksi Matematika & Mode Kamera (`src/world/isoMath.js`)
- **Tujuan:** Menambahkan dukungan mode proyeksi `isometric` dan `topdown` dengan fungsi getter/setter dan invariant round-trip.
- **File:** `src/world/isoMath.js`, `src/config/constants.js`, `tests/isoMath.test.js`
- **Langkah:**
  1. Tambahkan konstanta `TILE.ORTHO_SIZE = 48` pada `src/config/constants.js`.
  2. Implementasikan enum `PROJECTION_MODE = { ISOMETRIC: 'isometric', TOPDOWN: 'topdown' }` dan variabel state proyeksi aktif di `src/world/isoMath.js`.
  3. Perbarui `tileToScreen`, `screenToTile`, dan `worldScreenToTile` untuk memperhitungkan mode aktif.
  4. Perbarui test suite `tests/isoMath.test.js` untuk menguji invariant round-trip kedua mode.
- **Verifikasi:** `node tests/isoMath.test.js` lulus 100%.

### Task 2: Dukungan Transformasi Proyeksi pada World Renderer (`src/world/IsoWorldRenderer.js`)
- **Tujuan:** Mengizinkan pembaruan dinamis posisi ubin ground, air, jalan, bangunan, dan petak kebun saat mode berubah.
- **File:** `src/world/IsoWorldRenderer.js`
- **Langkah:**
  1. Simpan metadata ubin ground dan objek prop `(gridX, gridY)` saat `buildZone`.
  2. Implementasikan metode `refreshProjection(mode)` yang mereposisi seluruh sprite ubin dan prop sesuai rumus proyeksi aktif.
  3. Sesuaikan ukuran dan skala ubin pada mode `topdown` agar rapi dan tanpa celah.
- **Verifikasi:** Script node test dan visual render check.

### Task 3: Sinkronisasi Posisi Entitas (`Player`, `NPC`, `Pet`, `FarmPlot`, `ResourceNode`)
- **Tujuan:** Memastikan seluruh entitas dinamis merespons pergantian proyeksi.
- **File:** `src/entities/Player.js`, `src/entities/NPC.js`, `src/entities/Pet.js`, `src/entities/FarmPlot.js`, `src/entities/ResourceNode.js`
- **Langkah:**
  1. Pastikan metode `updateScreenPosition()` atau saat update tick selalu memanggil `tileToScreen(this.tileX, this.tileY)` menggunakan mode aktif.
  2. Tambahkan metode `onProjectionChanged(mode)` bila diperlukan untuk pembaruan posisi instan.
- **Verifikasi:** `npm test` lulus tanpa regresi.

### Task 4: Kontrol Keyboard & Handler Transisi Kamera (`CameraControls.js`, `DesktopInput.js`, `GameScene.js`)
- **Tujuan:** Menangani penekanan tombol `C` untuk toggle angle dan memperbarui kamera fokus.
- **File:** `src/input/CameraControls.js`, `src/input/DesktopInput.js`, `src/scenes/GameScene.js`
- **Langkah:**
  1. Tangkap key `KeyC` di `CameraControls.js` / `DesktopInput.js`.
  2. Panggil `gameScene.toggleCameraAngle()` yang memicu:
     - Pergantian mode proyeksi di `isoMath.js`.
     - Pemanggilan `isoWorldRenderer.refreshProjection(newMode)`.
     - Pembaruan instan posisi seluruh entitas.
     - Penyesuaian zoom dasar kamera bila diperlukan agar skala proporsional.
     - Emit event `CAMERA_ANGLE_CHANGED` ke `EventBus`.
- **Verifikasi:** `node tests/cameraControls.test.js`.

### Task 5: Tombol Toggle HUD (`HUDController.js`, `ui.css`)
- **Tujuan:** Menampilkan tombol `[📷 ISO]` / `[📷 TOP]` di HUD dekat kontrol zoom untuk akses visual dan pengguna layar sentuh mobile.
- **File:** `src/ui/HUDController.js`, `src/styles/ui.css`
- **Langkah:**
  1. Tambahkan elemen tombol toggle `<button id="camera-angle-btn" class="hud-pill-btn">📷 ISO</button>` di samping tombol zoom HUD.
  2. Hubungkan event click untuk memanggil `toggleCameraAngle()`.
  3. Tanggapi event `CAMERA_ANGLE_CHANGED` untuk memperbarui label tombol (`📷 ISO` $\leftrightarrow$ `📷 TOP`).
- **Verifikasi:** Cek DOM click dan responsive tests.

### Task 6: Pengujian Unit, Dokumentasi & Commit/Push
- **Tujuan:** Menguji seluruh test suite, memperbarui `docs/specs.md`, `task.md`, `README.md`, `docs/changelog.md`, restart server, dan push ke GitHub.
- **Verifikasi:** `npm test` (semua test suites), `npm run test:build`.
