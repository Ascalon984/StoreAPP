# 📋 Dokumentasi Flow & Fitur Aplikasi E-Commerce

Berikut adalah hasil kerapian dari flow aplikasi yang Anda jabarkan. Dokumen ini dibagi per bagian agar mudah dibaca oleh tim UI/UX maupun developer.

## 1. Splash Screen & Authentication

- **Splash Screen**: Layar pembuka aplikasi (biasanya memiliki logika untuk _auto-redirect_ ke Auth atau Home jika sudah _login_).
- **Auth Page (Masuk & Daftar)**:
  - Terdapat _tab_ **Masuk** dan **Daftar**.
  - Terdapat shortcut login via **Google / Facebook**.
  - **Flow Shortcut**: Jika klik shortcut tapi belum terdaftar -> user akan diarahkan untuk input `username`.
  - **Primary ID**: Menggunakan `username`.
  - **Flow Daftar Manual**: Memerlukan input form `username`, `email`, dan `password`.
- **Lupa Password**:
  - Fasilitas reset password menggunakan OTP berdurasi 1 menit.
  - **Validasi**: Jika user meminta ulang kode (resend) untuk email/no hp yang sama sebelum 1 menit habis, durasi timer OTP **tidak akan tereset** (melanjutkan timer yang sedang berjalan).

## 2. Home Screen Page

- **Header**: Menampilkan avatar pengguna dan Nama Lengkap (bukan username) yang diambil dari halaman profil.
- **Search Bar**: Ditempatkan di header untuk memudahkan user mencari produk spesifik secara real-time. Mendukung filter dan suggestion.
- **Notifikasi (Bell Icon)**:
  - **Aktivitas**: Notifikasi status checkout (pesanan berhasil/gagal).
  - **Promo**: Notifikasi diskon untuk produk yang ada di _wishlist/favorit_ user.
- **Banner Slider**: Autoplay _banner slide_ setiap 5 detik (diatur melalui _Control Panel/Admin_). Mendukung swipe manual untuk navigasi manual.
- **Kategori (Row Button)**: Button kategori yang dapat digeser (_scroll horizontal_). Kategori "Semua" bersifat _hardcoded_ di posisi awal, sisanya diatur melalui CP.
- **8 Produk Populer (Popular Products Section)**:
  - Menampilkan 8 produk paling populer dalam bentuk **grid 2 kolom** atau **carousel** sesuai design.
  - Setiap produk card menampilkan: Gambar, Nama, Harga, Coretan Harga (Diskon %), Unit Terjual, Summary Rating (bintang).
  - Dapat dilengkapi dengan **Mini Sticker/Badge** di sudut kartu untuk highlight status:
    - "Trending" (Trending badge)
    - "Flash Sale" (Sale badge)
    - "Best Seller" (Best seller badge)
    - Atau custom badge lainnya sesuai kebijakan promo
  - Data produk populer diambil dari CP berdasarkan algoritma terjual/rating/engagement.
- **Row Card Produk Diskon/Promo**:
  - Baris khusus yang menampilkan produk-produk yang sedang dalam periode **diskon atau promo aktif**.
  - Format tampilan: **Horizontal scrollable carousel** dengan card yang sama seperti katalog biasa.
  - Setiap card dapat menampilkan **badge countdown timer** untuk menunjukkan sisa waktu promo.
  - Data produk ini diambil dari CP berdasarkan periode promo yang aktif.
  - CTA: Tombol **"Lihat Semua"** untuk mengarahkan ke halaman kategori/filter promo.
- **Katalog Produk (Card) - Semua Produk**:
  - Menampilkan daftar lengkap produk dalam bentuk grid atau infinite scroll (sesuai design).
  - Setiap produk card menampilkan: Gambar, Nama, Harga, Coretan Harga (Diskon), Unit Terjual, Summary Rating.
  - Komponen **Infinite Scroll** atau **Load More** untuk menangani produk berjumlah banyak tanpa lag performa.
  - (Data produk dari CP, sementara personalisasi/rekomendasi didapat dari aktivitas belanja user).

## 3. Product Detail Page

- **Header / Action**: Fitur button _Share_ dan _Add to Favorite_ (Love).
- **Product Image Gallery**:
  - Swipeable carousel di bagian paling atas halaman untuk melihat foto produk dari berbagai sudut.
  - Mendukung fitur _zoom_ dan buka _fullscreen_.
  - Menampilkan thumbnail images di bawah untuk navigasi cepat.
- **Informasi Utama Produk**: Menampilkan harga utama, coretan diskon, unit terjual, dan sisa stok.
- **Variasi Produk**: Hanya berupa label tulisan (_no image_) agar hemat tempat, dan bisa disembunyikan (_collapse_) menggunakan _dropdown_.
- **Deskripsi Produk**: Penjelasan rincian barang.
- **Shortcut Hubungi Penjual**:
  - Tombol untuk langsung bertanya spesifikasi produk yang diarahkan ke halaman CS Chat.
  - **Fitur Snap**: Melampirkan kartu produk secara otomatis di dalam chat.
  - **Quick Chat Chips**: "Ketersediaan stok", "Tanggal kadaluarsa", "Pengiriman same day".
- **Ulasan Produk**:
  - Jumlah ulasan dan _Summary Rating_ (1-5).
  - _Bar chart_ distribusi untuk melihat jumlah penilai per kategori rating (bintang 1-5).
  - List Komentar: Sensor sebagian karakter username (misal: a*\*\*b), isi komentar, timestamp, dan tombol *thumbs up / down\*.
- **Bottom Action (CTA)**: Tombol **"Add to Cart"** dan **"Pesan Sekarang"**.

## 4. Halaman Favorit (Wishlist)

- **Dynamic Row Filter**: Filter baris dinamis berdasarkan kategori produk yang telah disimpan user. (Tidak _hardcoded_ agar tidak terjadi _error/inkonsistensi_ jika admin menghapus suatu kategori di CP).
- **Produk Item Row**:
  - Button _Love_: Jika di-klik menjadi _inactive_, produk otomatis terhapus dari favorit.
  - Button _Cart_: Untuk langsung memasukkan barang ke keranjang.

## 5. Halaman Profil (Profile Page)

- **Header Profil**:
  - Foto Avatar: Bisa diklik/ditap untuk membuka _modal_ area crop gambar dan konfirmasi.
  - Nama Lengkap: Diambil dari bagian data pribadi.
  - Username: Diambil dari data registrasi awal.
- **Shortcut Pusat Bantuan (CS)**:
  - Tombol _Message Circle More_ di pojok kanan atas menuju CS umum.
  - **Quick Chat Chips**: "Jam operasional", "Metode pembayaran", "Cara membatalkan pesanan", "Hubungi admin".
- **Dynamic Metrik Pengguna**:
  - Jika profil belum lengkap (< 5/5): Menampilkan chart kelengkapan profil (berdasarkan Nama, Email, No. Telp, Foto Profil).
  - Jika profil lengkap (5/5): Otomatis terganti (_swap_) menjadi **Metrik Aktivitas Belanja** (Jumlah pesanan, Jumlah produk favorit, Jumlah ulasan).
- **Pengaturan Akun**:
  - Row Dropdown **Data Pribadi**: Nama, Email, No Telp.
  - Row Dropdown **Alamat**: Maksimal 3 alamat dengan _radio button_. (Alamat tidak bisa dihapus jika hanya tersisa 1).
  - Row Dropdown **Preferensi Notifikasi**: Toggle on/off untuk _Update Pesanan_ dan _Promo & Penawaran_.
- **Informasi Lainnya**:
  - Modal / Hyperlink: **Kebijakan & Privasi**
  - Modal / Hyperlink: **Tentang Aplikasi**
- **Action Button**: Log Out Akun.

## 6. Halaman Keranjang Belanja (Cart Page)

- **Daftar Produk Keranjang**:
  - Menampilkan semua produk yang telah ditambahkan ke keranjang.
  - Setiap item dilengkapi dengan **Checkbox** untuk memilih produk yang ingin di-checkout.
  - Fitur untuk mengubah kuantitas produk menggunakan stepper (`-` dan `+`).
  - Tombol **Hapus** untuk menghapus produk dari keranjang.
- **Ringkasan Harga (Bottom Bar)**:
  - Menampilkan kalkulasi **Subtotal Sementara** berdasarkan produk yang dipilih (checked).
  - Breakdown: subtotal produk, diskon, biaya potensial.
- **Action Button**: Tombol **"Lanjut ke Checkout"** (aktif hanya jika minimal 1 produk dipilih).
- **Empty State**: Jika keranjang kosong, tampilkan ilustrasi dan teks "Keranjang Anda kosong. Mulai belanja sekarang!"

## 7. Halaman Checkout (Checkout Page)

- **Alamat Pengiriman**:
  - Dropdown daftar alamat yang diambil dari data profil, disertai tombol sinkronisasi alamat.
  - Terdapat info nama user dan nomor telepon penerima.
- **Ringkasan Pesanan (Order Summary)**:
  - List produk beserta info harga dan coretan diskon.
  - Komponen _stepper_ (`-` dan `+`) untuk kalkulasi subtotal per unit produk.
- **Total Pembayaran**: Menampilkan akumulasi biaya produk termasuk perhitungan biaya kirim.
- **Metode Pembayaran (Payment Gateway)**:
  - COD (Bayar di Tempat)
  - E-Wallet
  - Virtual Account / Bank Elektronik
- **Action Button**: Tombol **"Bayar Sekarang"** (Hanya menjadi _aktif/clickable_ setelah semua form wajib di atas terisi).

## 8. Riwayat Pembelian Page (Order History)

- **Filter Tab**: Semua, Diproses, Selesai, Dibatalkan.
- **Grouping Pesanan**: Tampilan list dibagi berdasarkan _Dynamic Date_ (Bulan dan Tahun pemesanan).
- **Multiple Items Card**: Jika pemesanan (Order ID) dilakukan di waktu yang sama namun berisi >1 jenis produk, item-item tersebut digabung ke dalam 1 card dengan fitur _carousel scroll_. Diwakili 1 Order ID dan Timestamp.
- **Status & Actions**:
  - **Selesai**: Memiliki button **"Beri Ulasan"** (rating akan diterapkan ke semua produk dalam pesanan tersebut sekaligus) dan **"Beli Lagi"**.
  - **Diproses**: Hanya memiliki 1 button **"Hubungi Penjual"** yang diarahkan ke CS Chat. Memiliki fitur _snap product_ pesanan, dengan **Quick Chat Chips**: "Keberadaan pesanan", "Proses pesanan", "Pengajuan perubahan alamat".
  - **Dibatalkan**: Hanya memiliki 1 button **"Beli Lagi"**.

---

# � Spesifikasi Control Panel Admin untuk Home Screen

Bagian ini menjelaskan fitur dan konfigurasi yang diperlukan di Control Panel Admin untuk mengelola komponen-komponen Home Screen.

## 1. Manajemen Banner Slider

- **Input**: Upload gambar banner atau link gambar eksternal.
- **Konfigurasi**:
  - Interval autoplay (default: 5 detik).
  - Mendukung swipe/gesture manual.
  - Urutan tampilan banner (drag-and-drop atau input nomor urut).
- **Fitur Tambahan**:
  - Preview tampilan banner di berbagai ukuran layar.
  - Soft delete / publish/unpublish banner tanpa menghapus data.

## 2. Manajemen Kategori Produk

- **Input**: Nama kategori, icon/gambar kategori.
- **Konfigurasi**:
  - Kategori "Semua" bersifat _hardcoded_ di posisi pertama (tidak dapat diubah).
  - Urutan kategori sisanya dapat diatur (drag-and-drop atau numbering).
  - Soft delete / aktif-nonaktifkan kategori.
- **Fitur Tambahan**:
  - Preview urutan kategori seperti yang akan tampil di aplikasi.

## 3. Manajemen 8 Produk Populer

- **Algoritma Pengambilan Data**:
  - Otomatis berdasarkan metrik: Jumlah terjual, rating, engagement (views/favorites).
  - Opsi manual: Admin dapat memilih produk spesifik untuk ditampilkan.
- **Konfigurasi**:
  - Set minimum/maximum metrics untuk penentuan "populer".
  - Jadwal refresh data (real-time, hourly, daily).
  - Urutan tampilan produk (jika manual selection).
- **Mini Sticker/Badge Management**:
  - Tentukan label badge: "Trending", "Flash Sale", "Best Seller", atau custom.
  - Set kriteria otomatis untuk setiap badge (misalnya: >100 terjual = "Best Seller").
  - Opsi manual: Admin menambahkan badge secara manual per produk.
  - Warna dan desain badge dapat dikonfigurasi.

## 4. Manajemen Row Card Produk Diskon/Promo

- **Input Promo**:
  - Pilih produk yang ikut dalam promo.
  - Set persentase diskon atau harga khusus.
  - Tentukan periode promo (tanggal dan jam mulai/berakhir).
  - Label promo (misal: "Flash Sale 50%", "Limited Offer", dll).
- **Konfigurasi Tampilan**:
  - Tampilan carousel horizontal dengan scroll.
  - Jumlah produk yang ditampilkan per halaman carousel.
  - Menampilkan badge countdown timer untuk sisa waktu promo.
  - CTA button "Lihat Semua" untuk mengarahkan ke halaman filter promo.
- **Fitur Tambahan**:
  - Filter promo berdasarkan kategori atau jenis diskon.
  - Jadwal publikasi otomatis (schedule publish/unpublish promo).
  - Analitik: tracking jumlah klik, views, dan conversion per promo.

## 5. Manajemen Katalog Semua Produk

- **Data yang Ditampilkan**:
  - Gambar produk, nama, harga asli, harga diskon, persentase diskon.
  - Unit terjual, summary rating (bintang).
  - Stock availability status.
- **Konfigurasi Pagination**:
  - Tentukan jumlah produk per halaman (default: 20-30 produk).
  - Implementasi infinite scroll atau load more button.
  - Preload data untuk optimasi performa.
- **Filter & Sort Options** (untuk admin):
  - Filter berdasarkan kategori, status stok, range harga.
  - Sort: terbaru, terpopuler, harga (asc/desc), rating tertinggi.

## 6. Manajemen Data Produk Umum

- **Data Dasar Produk**:
  - SKU/ID Produk (unique identifier).
  - Nama produk, deskripsi singkat, deskripsi lengkap.
  - Harga asli (base price) dan harga jual (selling price).
  - Kategori (single/multiple).
  - Stock/inventory management.
- **Gambar Produk**:
  - Upload multiple images (gallery).
  - Set primary/thumbnail image.
  - Optimasi ukuran dan format gambar otomatis.
- **Metadata Produk** (untuk perhitungan badge & rekomendasi):
  - Unit terjual (tracking dari transaksi).
  - Jumlah review & average rating.
  - Jumlah favorit/wishlist.
  - Engagement metrics (views, clicks).

---

# 🎨 Standar UI/UX Components & Patterns

Bagian ini menjelaskan komponen-komponen UI dan pattern yang harus diterapkan di seluruh aplikasi untuk konsistensi dan user experience yang baik.

## 1. Empty States

Tampilan kosong harus ditampilkan pada halaman-halaman berikut dengan ilustrasi + teks penjelas singkat:

- **Halaman Favorit**: "Belum ada produk favorit. Mulai tambahkan produk favorit sekarang!"
- **Halaman Riwayat Pemesanan**: "Belum ada riwayat pembelian. Mulai berbelanja sekarang!"
- **Halaman Notifikasi**: "Tidak ada notifikasi baru saat ini."
- **Halaman Keranjang**: "Keranjang Anda kosong. Mulai belanja sekarang!"

## 2. Confirmation Dialog / Warning Modal

Tampilkan **Confirmation Dialog** (Modal / Bottom Sheet) untuk tindakan-tindakan destruktif:

- **Log Out Akun**: Konfirmasi "Anda yakin ingin keluar?"
- **Hapus Alamat di Profil**: Konfirmasi "Hapus alamat ini secara permanen?"
- **Hapus Produk dari Keranjang**: Konfirmasi "Hapus produk dari keranjang?"
- **Back saat Checkout**: Konfirmasi "Pesanan belum selesai. Batalkan checkout?" (jika ada data yang belum tersimpan).

## 3. Loading States & Skeleton Loading

Gunakan **Skeleton Loading** (efek shimmer) untuk menampilkan placeholder saat memuat data:

- **Home Screen**: Loading untuk banner, kategori, popular products, promo section, dan katalog produk.
- **Product Detail Page**: Loading untuk image gallery, info produk, reviews, dan ratings.
- **Cart Page**: Loading untuk list produk dan kalkulasi harga.
- **Checkout Page**: Loading untuk data alamat, pilihan kurir, dan metode pembayaran.

Benefits:

- Memberikan feedback visual saat jaringan lambat.
- Mencegah layar blank putih yang membuat user bingung.
- Meningkatkan perceived performance.

## 4. Search Bar Implementation

**Lokasi**: Header di Home Screen (sticky/tetap terlihat saat scroll).

**Fitur**:

- Real-time search suggestions berdasarkan input user.
- Hasil pencarian difilter berdasarkan kategori (opsional).
- History pencarian user (jika disimpan di local storage).
- Kemampuan clear input dengan 1 klik.

**Behavior**:

- Klik pada suggestion otomatis navigate ke product detail atau hasil pencarian.
- Tekan Enter untuk menampilkan hasil pencarian lengkap.

---
