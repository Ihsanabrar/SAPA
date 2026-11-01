# 🎓 SAPA — Sentral Aplikasi Pelayanan Akademik

SAPA adalah platform layanan kampus terintegrasi berbasis web yang dirancang untuk mempermudah mahasiswa dalam mengakses berbagai layanan akademik, informasi, dan kebutuhan kampus dalam satu genggaman.

Project ini dibuat menggunakan **Vanilla HTML, CSS, dan JavaScript** (tanpa framework) dengan mengimplementasikan *LocalStorage* sebagai simulasi database. Aplikasi ini dimulai dari kondisi bersih (*Fresh State*), sehingga setiap notifikasi dan data akademik muncul murni dari interaksi pengguna.

## ✨ Fitur Utama

### 1. 📚 Layanan Akademik Interaktif
- **Isi KRS:** Pilih mata kuliah dengan validasi otomatis (anti-bentrok jadwal, batas maksimal 24 SKS, dan cek kuota kelas).
- **Lihat KHS:** Tabel nilai per semester dengan kalkulasi IPK dan total SKS secara *real-time*.
- **Jadwal Kuliah:** Grid jadwal mingguan yang otomatis menyesuaikan dengan mata kuliah yang diambil di KRS.

### 2. 🏢 Layanan Kemahasiswaan
- **Beasiswa:** Cari info beasiswa, lihat persyaratan, dan ajukan pendaftaran langsung dari aplikasi.
- **Surat Akademik:** Form pengajuan surat (Aktif Kuliah, Cuti, dll) dengan pelacakan status.
- **Perpustakaan Digital:** Katalog buku, fitur pinjam, dan pengembalian buku.
- **Pembayaran UKT & Klinik Kampus:** Simulasi pembayaran tagihan dan *booking* jadwal konsultasi kesehatan.

### 3. 🛒 SAPA Market (Marketplace)
- Katalog produk kampus (Merchandise, Buku, Tiket Event).
- Fitur **Keranjang Belanja** (Cart Drawer) dan **Checkout**.
- Halaman riwayat pesanan dengan detail transaksi dan fitur cetak *invoice*.

### 4. ⚡ UX & UI Modern
- **Dark Mode:** Mendukung tema terang, gelap, dan otomatis mengikuti sistem operasi.
- **Global Search:** Pencarian cepat ke seluruh layanan, mata kuliah, dan produk (Shortcut: `Ctrl + K` atau `/`).
- **Notifikasi Dinamis:** Notifikasi di beranda (Hero Section) dan *navbar* muncul otomatis sesuai aktivitas pengguna.
- **Logo & Branding:** Menggunakan aset logo kustom yang dioptimalkan untuk Favicon, Navbar, dan PWA.

### 5. 🚀 PWA & Aksesibilitas
- **Progressive Web App (PWA):** Dapat di-install ke *homescreen* perangkat dan memiliki halaman *offline* khusus.
- **Aksesibilitas (a11y):** Dilengkapi *Focus Trap* pada modal, *Skip Link*, dukungan `prefers-reduced-motion`, dan navigasi keyboard yang ramah.

---

## 🛠️ Teknologi yang Digunakan

- **HTML5:** Struktur semantik.
- **CSS3:** Custom Properties (Variabel CSS), Flexbox, CSS Grid, Animasi, dan Media Queries (Responsive).
- **Vanilla JavaScript (ES6+):** Logika aplikasi, DOM Manipulation, Event Handling, dan Intersection Observer.
- **LocalStorage API:** Penyimpanan data lokal (simulasi database).
- **Service Worker:** Untuk dukungan mode *offline* (PWA).

---

## 📂 Struktur Project

```text
SAPA/
├── index.html           # Halaman Beranda
├── layanan.html         # Halaman Daftar Layanan
├── profil.html          # Halaman Profil Mahasiswa
├── pesanan.html         # Halaman Riwayat Pesanan
├── pengaturan.html      # Halaman Pengaturan Aplikasi
├── offline.html         # Fallback page jika tidak ada internet
├── manifest.json        # Konfigurasi PWA
├── sw.js                # Service Worker (Cache offline)
├── logo.png             # Aset Logo Aplikasi
├── css/
│   ├── style.css        # Styling utama & variabel tema (termasuk dark mode)
│   ├── components.css   # Styling komponen UI (modal, button, tabel, toast)
│   ├── pages.css        # Styling khusus halaman profil, pesanan, dll
│   └── refined.css      # Styling perbaikan UI (override logo, border-radius, dll)
└── js/
    ├── data.js          # Data master & logika bisnis (CRUD LocalStorage)
    ├── app.js           # Logika UI utama, interaksi halaman, & modal
    ├── enhance.js       # Fitur tambahan (Dark mode, Global Search, PWA)
    └── pages.js         # Logika khusus untuk halaman profil/pesanan/pengaturan
