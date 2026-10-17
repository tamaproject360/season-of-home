# Desain Teknis: Dynamic Camera Angle (Isometrik & Top-Down)

- **Tanggal:** 17 Oktober 2026
- **Status:** Disetujui
- **Fitur:** Dukungan multi-angle kamera (Isometric 2:1 & Top-Down Orthogonal 2D) dengan shortcut keyboard `C` dan tombol toggle HUD `📷 [C]`.

---

## 1. Latar Belakang & Tujuan
Pemain membutuhkan fleksibilitas sudut pandang dalam mengamati tata letak perkebunan, navigasi pedesaan Lembah Rimbun, dan interaksi objek. Fitur ini menambahkan kemampuan beralih secara langsung antara sudut pandang standar **Isometrik 2:1** dan sudut pandang **Top-Down 2D (Ortogonal)** dengan satu tombol pintas keyboard atau sentuhan pada HUD.

---

## 2. Arsitektur & Spesifikasi Matematika

### 2.1 Konversi Proyeksi (`src/world/isoMath.js`)
Mendukung mode proyeksi aktif: `PROJECTION_MODE = { ISOMETRIC: 'isometric', TOPDOWN: 'topdown' }`.

1. **Mode Isometrik (2:1 Dimetric):**
   $$x = \text{originX} + (tx - ty) \cdot \frac{\text{TILE.WIDTH}}{2}$$
   $$y = \text{originY} + (tx + ty) \cdot \frac{\text{TILE.HEIGHT}}{2}$$
   Dimana $\text{TILE.WIDTH} = 64\text{px}$ dan $\text{TILE.HEIGHT} = 32\text{px}$.

2. **Mode Top-Down (2D Orthogonal):**
   $$x = \text{originX} + tx \cdot \text{TILE.ORTHO\_SIZE}$$
   $$y = \text{originY} + ty \cdot \text{TILE.ORTHO\_SIZE}$$
   Dimana $\text{TILE.ORTHO\_SIZE} = 48\text{px}$ (ukuran ubin grid kotak yang proporsional).

3. **Inverse Transformation (`screenToTile`):**
   - Mode Isometrik:
     $$x' = \frac{sx - \text{originX}}{\text{TILE.WIDTH} / 2}, \quad y' = \frac{sy - \text{originY}}{\text{TILE.HEIGHT} / 2}$$
     $$tx = \frac{x' + y'}{2}, \quad ty = \frac{y' - x'}{2}$$
   - Mode Top-Down:
     $$tx = \frac{sx - \text{originX}}{\text{TILE.ORTHO\_SIZE}}, \quad ty = \frac{sy - \text{originY}}{\text{TILE.ORTHO\_SIZE}}$$

---

## 3. Komponen yang Terpengaruh

1. **`src/world/isoMath.js`:**
   - Menyediakan getter/setter `setProjectionMode(mode)` dan `getProjectionMode()`.
   - Menambahkan parameter opsional `mode` pada `tileToScreen`, `screenToTile`, dan `worldScreenToTile`.

2. **`src/world/IsoWorldRenderer.js`:**
   - Menyimpan referensi ubin terrain, jalan, dekorasi, dan bangunan dengan metadata koordinat grid aslinya `(gridX, gridY)`.
   - Mengimplementasikan metode `refreshProjection(mode)` yang memperbarui `(x, y)` dan ukuran ubin sesuai proyeksi aktif.

3. **`src/entities/Player.js`, `NPC.js`, `Pet.js`, `FarmPlot.js`, `ResourceNode.js`:**
   - Memperbarui posisi koordinat visual layar saat proyeksi berubah menggunakan `tileToScreen`.

4. **`src/input/CameraControls.js` & `DesktopInput.js`:**
   - Mendaftarkan shortcut keyboard `C` untuk memanggil `toggleCameraAngle()`.
   - Menjaga fokus kamera pada pemain dengan interpolasi mulus saat sudut berubah.

5. **`src/ui/HUDController.js` & `src/styles/ui.css`:**
   - Menambahkan tombol kontrol di samping kontrol zoom: `[📷 ISO]` / `[📷 TOP]`.
   - Mengirim event `CAMERA_ANGLE_TOGGLED` ke `EventBus`.

---

## 4. Rencana Pengujian (Test Matrix)
- Unit test invariant matematika `tests/isoMath.test.js`:
  - Akurasi bolak-balik `tileToScreen` $\leftrightarrow$ `screenToTile` untuk mode `isometric` dan `topdown` (toleransi $\pm 10^{-6}$).
- Acceptance test `tests/cameraControls.test.js`:
  - Toggle keyboard `KeyC` memicu pergantian mode.
  - Button HUD `[📷 C]` memicu pergantian mode.
  - Posisi pemain di layar ter-update dengan benar.
