# 📋 Dokumentasi Flow & Fitur Aplikasi E-Commerce

Berikut adalah hasil kerapian dari flow aplikasi yang Anda jabarkan. Dokumen ini dibagi per bagian agar mudah dibaca oleh tim UI/UX maupun developer.

## 1. Splash Screen & Authentication
- **Splash Screen**: Layar pembuka aplikasi (biasanya memiliki logika untuk *auto-redirect* ke Auth atau Home jika sudah *login*).
- **Auth Page (Masuk & Daftar)**:
  - Terdapat *tab* **Masuk** dan **Daftar**.
  - Terdapat shortcut login via **Google / Facebook**.
  - **Flow Shortcut**: Jika klik shortcut tapi belum terdaftar -> user akan diarahkan untuk input `username`.
  - **Primary ID**: Menggunakan `username`.
  - **Flow Daftar Manual**: Memerlukan input form `username`, `email`, dan `password`.
- **Lupa Password**:
  - Fasilitas reset password menggunakan OTP berdurasi 1 menit.
  - **Validasi**: Jika user meminta ulang kode (resend) untuk email/no hp yang sama sebelum 1 menit habis, durasi timer OTP **tidak akan tereset** (melanjutkan timer yang sedang berjalan).

## 2. Home Screen Page
- **Header**: Menampilkan avatar pengguna dan Nama Lengkap (bukan username) yang diambil dari halaman profil.
- **Notifikasi (Bell Icon)**:
  - **Aktivitas**: Notifikasi status checkout (pesanan berhasil/gagal).
  - **Promo**: Notifikasi diskon untuk produk yang ada di *wishlist/favorit* user.
- **Banner Slider**: Autoplay *banner slide* setiap 5 detik (diatur melalui *Control Panel/Admin*).
- **Kategori (Row Button)**: Button kategori yang dapat digeser (*scroll horizontal*). Kategori "Semua" bersifat *hardcoded* di posisi awal, sisanya diatur melalui CP.
- **Katalog Produk (Card)**: Menampilkan Harga, Coretan Harga (Diskon), Unit Terjual, dan Summary Rating. (Data produk dari CP, sementara personalisasi/rekomendasi didapat dari aktivitas belanja user).

## 3. Product Detail Page
- **Header / Action**: Fitur button *Share* dan *Add to Favorite* (Love).
- **Informasi Utama Produk**: Menampilkan harga utama, coretan diskon, unit terjual, dan sisa stok.
- **Variasi Produk**: Hanya berupa label tulisan (*no image*) agar hemat tempat, dan bisa disembunyikan (*collapse*) menggunakan *dropdown*.
- **Deskripsi Produk**: Penjelasan rincian barang.
- **Shortcut Hubungi Penjual**:
  - Tombol untuk langsung bertanya spesifikasi produk yang diarahkan ke halaman CS Chat.
  - **Fitur Snap**: Melampirkan kartu produk secara otomatis di dalam chat.
  - **Quick Chat Chips**: "Ketersediaan stok", "Tanggal kadaluarsa", "Pengiriman same day".
- **Ulasan Produk**:
  - Jumlah ulasan dan *Summary Rating* (1-5).
  - *Bar chart* distribusi untuk melihat jumlah penilai per kategori rating (bintang 1-5).
  - List Komentar: Sensor sebagian karakter username (misal: a***b), isi komentar, timestamp, dan tombol *thumbs up / down*.
- **Bottom Action (CTA)**: Tombol **"Add to Cart"** dan **"Pesan Sekarang"**.

## 4. Halaman Favorit (Wishlist)
- **Dynamic Row Filter**: Filter baris dinamis berdasarkan kategori produk yang telah disimpan user. (Tidak *hardcoded* agar tidak terjadi *error/inkonsistensi* jika admin menghapus suatu kategori di CP).
- **Produk Item Row**:
  - Button *Love*: Jika di-klik menjadi *inactive*, produk otomatis terhapus dari favorit.
  - Button *Cart*: Untuk langsung memasukkan barang ke keranjang.

## 5. Halaman Profil (Profile Page)
- **Header Profil**:
  - Foto Avatar: Bisa diklik/ditap untuk membuka *modal* area crop gambar dan konfirmasi.
  - Nama Lengkap: Diambil dari bagian data pribadi.
  - Username: Diambil dari data registrasi awal.
- **Shortcut Pusat Bantuan (CS)**:
  - Tombol *Message Circle More* di pojok kanan atas menuju CS umum.
  - **Quick Chat Chips**: "Jam operasional", "Metode pembayaran", "Cara membatalkan pesanan", "Hubungi admin".
- **Dynamic Metrik Pengguna**:
  - Jika profil belum lengkap (< 5/5): Menampilkan chart kelengkapan profil (berdasarkan Nama, Email, No. Telp, Foto Profil).
  - Jika profil lengkap (5/5): Otomatis terganti (*swap*) menjadi **Metrik Aktivitas Belanja** (Jumlah pesanan, Jumlah produk favorit, Jumlah ulasan).
- **Pengaturan Akun**:
  - Row Dropdown **Data Pribadi**: Nama, Email, No Telp.
  - Row Dropdown **Alamat**: Maksimal 3 alamat dengan *radio button*. (Alamat tidak bisa dihapus jika hanya tersisa 1).
  - Row Dropdown **Preferensi Notifikasi**: Toggle on/off untuk *Update Pesanan* dan *Promo & Penawaran*.
- **Informasi Lainnya**:
  - Modal / Hyperlink: **Kebijakan & Privasi**
  - Modal / Hyperlink: **Tentang Aplikasi**
- **Action Button**: Log Out Akun.

## 6. Halaman Keranjang & Checkout (Checkout Page)
*(Lihat bagian analisis di bawah mengenai Halaman Keranjang)*
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
- **Action Button**: Tombol **"Bayar Sekarang"** (Hanya menjadi *aktif/clickable* setelah semua form wajib di atas terisi).

## 7. Riwayat Pembelian Page (Order History)
- **Filter Tab**: Semua, Diproses, Selesai, Dibatalkan.
- **Grouping Pesanan**: Tampilan list dibagi berdasarkan *Dynamic Date* (Bulan dan Tahun pemesanan).
- **Multiple Items Card**: Jika pemesanan (Order ID) dilakukan di waktu yang sama namun berisi >1 jenis produk, item-item tersebut digabung ke dalam 1 card dengan fitur *carousel scroll*. Diwakili 1 Order ID dan Timestamp.
- **Status & Actions**:
  - **Selesai**: Memiliki button **"Beri Ulasan"** (rating akan diterapkan ke semua produk dalam pesanan tersebut sekaligus) dan **"Beli Lagi"**.
  - **Diproses**: Hanya memiliki 1 button **"Hubungi Penjual"** yang diarahkan ke CS Chat. Memiliki fitur *snap product* pesanan, dengan **Quick Chat Chips**: "Keberadaan pesanan", "Proses pesanan", "Pengajuan perubahan alamat".
  - **Dibatalkan**: Hanya memiliki 1 button **"Beli Lagi"**.

---

# 💡 Koreksi & Fitur UI/UX yang Mungkin Terlewat

Setelah menganalisis flow di atas, alur aplikasi yang Anda rancang sudah sangat komprehensif, logis, dan detail. Namun, berdasarkan standar *best practice* UI/UX aplikasi e-commerce, ada beberapa poin fungsional maupun visual yang sepertinya terlewat dari penjabaran Anda:

### 1. Halaman Keranjang Belanja (Cart Page)
Anda menyebutkan adanya tombol _"Add Cart"_ (di halaman produk) dan _"Button Cart"_ (di halaman favorit). Anda juga menjelaskan _"Checkout Page"_. Namun, Anda **melewatkan penjelasan Halaman Keranjang (Cart) itu sendiri**. 
- Sebelum benar-benar masuk ke halaman Checkout, user biasanya akan diarahkan ke *Cart Page* untuk:
  - Memilih produk mana saja yang ingin di-checkout hari ini (biasanya menggunakan **Checkbox** di samping tiap produk).
  - Mengubah kuantitas atau menghapus produk.
  - Melihat kalkulasi **Subtotal Sementara** di bagian *Bottom bar* sebelum menekan tombol "Beli" atau "Checkout".

### 2. Fitur Pencarian Produk (Search Bar)
Di **Home Screen**, Anda belum menyebutkan adanya komponen **Pencarian (Search Bar)**. Di sebagian besar aplikasi e-commerce, _Search Bar_ ditempatkan secara statis di atas (Header) agar user dapat menemukan barang spesifik secara instan.

### 3. Galeri Gambar (Image Slider) di Detail Produk
Di bagian **Product Detail**, Anda sangat mendetail terkait komponen harga, variasi yang collapse, deskripsi, hingga rating. Namun, fitur visual utamanya yaitu **Product Image Gallery (Galeri Gambar Produk)** tidak disebutkan. Idealnya di bagian paling atas halaman *Product Detail* ada *swipeable carousel* yang memungkinkan user melihat foto produk dari berbagai sudut (serta mendukung fitur *zoom* atau buka *fullscreen*).

### 4. Penanganan State Kosong (Empty States)
Dari perspektif pengembangan aplikasi (UI/UX), Anda harus menyediakan tampilan **Empty State** (biasanya berupa ilustrasi + teks penjelas singkat) untuk:
- Halaman Favorit apabila belum ada produk yang disukai.
- Riwayat Pemesanan apabila user sama sekali belum pernah berbelanja.
- Notifikasi yang masih belum ada aktivitas.
- Keranjang belanja yang kosong.

### 5. Dialog Konfirmasi Destruktif / Warning
Mengingat beberapa tindakan bersifat menghentikan alur atau merubah data, diperlukan *Confirmation Dialog* (Modal / Bottom Sheet) untuk:
- Ketika user menekan tombol **Log Out Akun**.
- Ketika menghapus alamat di profil.
- Ketika menghapus produk dari keranjang belanja.
- Ketika user menekan _Back_ saat sudah setengah jalan mengisi form Checkout.

### 6. Animasi Transisi & Loading Data
Mengingat ada banyak data dari *Control Panel* (Banner, List Produk, Kategori Dinamis), penting untuk menyertakan UI transisi seperti *Skeleton Loading* (efek *shimmer* kotak/garis saat memuat data) agar layar tidak *blank* putih saat loading jaringan lambat.
