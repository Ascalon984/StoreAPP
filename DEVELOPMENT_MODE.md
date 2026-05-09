# Dokumentasi Mode Pengembangan Lokal - Pemutusan Koneksi Sementara

**Tanggal**: 8 Mei 2026  
**Status**: Mode Pengembangan - Semua Koneksi Database & API Dinonaktifkan  
**Tujuan**: Menjalankan aplikasi di localhost dengan aman tanpa ketergantungan eksternal

---

## 📋 Ringkasan Perubahan

Aplikasi telah dionfigurasi untuk berjalan di **localhost tanpa koneksi ke Admin API atau database eksternal**. Semua endpoint API sekarang mengembalikan mock data yang tersimpan lokal.

### Status Koneksi
- ❌ **Admin API**: Dinonaktifkan
- ❌ **Database Eksternal**: Dinonaktifkan
- ✅ **Mock Data Lokal**: Diaktifkan
- ✅ **Frontend (React)**: Berfungsi Penuh
- ✅ **UI/UX Features**: Berfungsi Penuh

---

## 🔧 Perubahan File Konfigurasi

### 1. `.env.local` - Environment Variables

**Status**: ✅ Diperbarui

```bash
# [DISABLED FOR LOCAL DEVELOPMENT] Admin API URL for syncing orders and reviews
# NEXT_PUBLIC_ADMIN_API_URL=https://admin-store-murex.vercel.app

# WhatsApp Configuration
WA_NUMBER=6281234567890
SITE_URL=https://palugada.store

# [LOCAL DEVELOPMENT MODE]
# All API routes are using mock data from src/lib/data.ts
# Database connections are disabled
# To enable production connections, uncomment NEXT_PUBLIC_ADMIN_API_URL above
```

**Perubahan:**
- Komentar `NEXT_PUBLIC_ADMIN_API_URL` untuk mencegah koneksi ke API eksternal
- Menambahkan catatan pengembangan untuk referensi tim

---

## 📡 API Routes yang Dinonaktifkan

Semua route API telah dimodifikasi untuk menggunakan mock data lokal. Berikut daftar lengkapnya:

### 1. **Banners API** - `/api/public/banners`

| Aspek | Detail |
|-------|--------|
| **File** | `src/app/api/public/banners/route.ts` |
| **Metode** | GET |
| **Status** | ✅ Menggunakan mock data dari `data.ts` |
| **Respons** | Array banner dari `banners[]` dalam `lib/data.ts` |

**Kode:**
```typescript
// [DISABLED] Admin API Connection - Using mock data for local development
// Semua fetch ke Admin API dikomentar
// Mengembalikan: banners dari lib/data.ts
return NextResponse.json(banners, {...});
```

---

### 2. **Categories API** - `/api/public/categories`

| Aspek | Detail |
|-------|--------|
| **File** | `src/app/api/public/categories/route.ts` |
| **Metode** | GET |
| **Status** | ✅ Menggunakan mock data dari `data.ts` |
| **Respons** | Array kategori dari `categories[]` dalam `lib/data.ts` |

**Kode:**
```typescript
// [DISABLED] Admin API Connection - Using mock data for local development
return NextResponse.json(categories, {...});
```

---

### 3. **Products API** - `/api/public/products`

| Aspek | Detail |
|-------|--------|
| **File** | `src/app/api/public/products/route.ts` |
| **Metode** | GET |
| **Status** | ✅ Menggunakan mock data dengan filter lokal |
| **Respons** | Array produk (dengan filtering berdasarkan category query param) |

**Fitur:**
- Mendukung filter kategori: `?category=snack`, `?category=minuman`, dll
- Filter default: `category=all` (semua produk)
- Tidak ada caching, data selalu fresh

**Kode:**
```typescript
// [LOCAL DEVELOPMENT] Returning mock data from data.ts
const filtered = category === 'all' 
  ? products 
  : products.filter(p => p.category === category);
return NextResponse.json(filtered, {...});
```

---

### 4. **Product Detail API** - `/api/public/products/[slug]`

| Aspek | Detail |
|-------|--------|
| **File** | `src/app/api/public/products/[slug]/route.ts` |
| **Metode** | GET |
| **Status** | ✅ Menggunakan mock data dengan pencarian by slug |
| **Respons** | Single product object atau error 404 |

**Kode:**
```typescript
// [LOCAL DEVELOPMENT] Returning mock data from data.ts
const product = products.find(p => p.slug === params.slug);
if (!product) {
  return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}
return NextResponse.json(product);
```

---

### 5. **Reviews API** - `/api/public/reviews`

| Aspek | Detail |
|-------|--------|
| **File** | `src/app/api/public/reviews/route.ts` |
| **Metode** | GET, POST |
| **Status** | ✅ Mock responses, tidak tersimpan |
| **Respons (GET)** | Array kosong (tidak ada review di mode dev) |
| **Respons (POST)** | Mock success response dengan ID sementara |

**Catatan Penting:**
- GET endpoint mengembalikan `{ reviews: [] }` (array kosong)
- POST endpoint menerima review tetapi **tidak menyimpannya**
- Review ditampilkan dengan pesan: "Review diterima (mode development - tidak tersimpan)"
- Setiap review mendapat ID temporary dari `Date.now()`

**Kode GET:**
```typescript
// [LOCAL DEVELOPMENT] Returning empty reviews for local development
console.log('[LOCAL DEV] Fetching reviews - API disabled, returning empty array');
return NextResponse.json({ reviews: [] });
```

**Kode POST:**
```typescript
// [LOCAL DEVELOPMENT] Mock response for local development
console.log('[LOCAL DEV] Review submitted (not persisted):', body);
return NextResponse.json({
  success: true,
  message: 'Review diterima (mode development - tidak tersimpan)',
  data: { id: Date.now().toString(), ...body }
});
```

---

### 6. **Review Vote API** - `/api/public/reviews/[id]/vote`

| Aspek | Detail |
|-------|--------|
| **File** | `src/app/api/public/reviews/[id]/vote/route.ts` |
| **Metode** | POST |
| **Status** | ✅ Mock response, tidak tersimpan |
| **Respons** | Success dengan mock vote data |

**Fitur:**
- Menerima body: `{ type: 'like' \| 'dislike' }`
- Validasi input: hanya accept 'like' atau 'dislike'
- Tidak tersimpan ke database
- Return: `{ success: true, data: { id, type, votes: 0 } }`

**Kode:**
```typescript
// [LOCAL DEVELOPMENT] Mock response for local development
console.log('[LOCAL DEV] Review vote received (not persisted):', { reviewId, type });
return NextResponse.json({ 
  success: true, 
  data: { id: params.id, type, votes: 0 } 
});
```

---

### 7. **Settings API** - `/api/public/settings`

| Aspek | Detail |
|-------|--------|
| **File** | `src/app/api/public/settings/route.ts` |
| **Metode** | GET |
| **Status** | ✅ Menggunakan mock data + env variables |
| **Respons** | Object dengan `waNumber`, `storeNameFirst`, `storeNameLast` |

**Kode:**
```typescript
// [LOCAL DEVELOPMENT] Returning mock settings from environment or defaults
const settings = {
  waNumber: process.env.WA_NUMBER || '6281234567890',
  storeNameFirst: 'Palugada',
  storeNameLast: 'Store'
};
return NextResponse.json(settings, {...});
```

---

## 📊 Data Mock yang Digunakan

Semua mock data bersumber dari file: **`src/lib/data.ts`**

### Data yang Tersedia:

| Data | Jumlah | Kategori | Status |
|------|--------|----------|--------|
| **Banners** | 3 | - | ✅ Tersedia |
| **Categories** | 6 | all, snack, minuman, kebutuhan, atk, kebersihan | ✅ Tersedia |
| **Products** | 40+ | Semua kategori di atas | ✅ Tersedia |
| **Reviews** | 0 | - | ⚠️ Kosong (development) |
| **Settings** | 1 | - | ✅ Tersedia |

### Struktur Data Product

```typescript
{
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  rating: number;
  reviewCount: number;
  sold: number;
  stock: number;
  description: string;
}
```

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3001**

### 3. Akses Aplikasi

Buka browser dan kunjungi:
```
http://localhost:3001
```

---

## 📝 Console Logs untuk Debugging

Aplikasi akan menampilkan console logs spesifik untuk mode development:

```javascript
[LOCAL DEV] Fetching reviews - API disabled, returning empty array
[LOCAL DEV] Review submitted (not persisted): {...}
[LOCAL DEV] Review vote received (not persisted): {...}
```

Logs ini membantu mengidentifikasi endpoint mana yang sedang digunakan.

---

## ✨ Fitur yang Masih Berfungsi 100%

✅ **Semua fitur UI/UX berfungsi dengan normal:**

- Product Grid & Search
- Product Detail Page
- Filter & Sort
- Mini Cart
- Favorite System
- Settings/Configuration
- Navigation
- Toast Notifications

---

## ⚠️ Keterbatasan Mode Development

| Fitur | Status | Keterangan |
|-------|--------|-----------|
| **Review Submission** | ⚠️ Tidak Persisten | Bisa dikirim tapi tidak disimpan |
| **Review Voting** | ⚠️ Tidak Persisten | Bisa voting tapi tidak disimpan |
| **Order Processing** | ❌ Tidak Tersedia | Belum diimplementasikan |
| **Admin Sync** | ❌ Tidak Aktif | Admin API dinonaktifkan |
| **Real Database** | ❌ Tidak Terhubung | Menggunakan mock data saja |

---

## 🔄 Cara Mengembalikan ke Mode Production

### Step 1: Buka `.env.local`

```bash
# Uncomment NEXT_PUBLIC_ADMIN_API_URL
NEXT_PUBLIC_ADMIN_API_URL=https://admin-store-murex.vercel.app
```

### Step 2: Update Komentar

Hapus/uncomment semua kode yang dikomentar di dalam API routes:
- `/src/app/api/public/banners/route.ts`
- `/src/app/api/public/categories/route.ts`
- `/src/app/api/public/products/route.ts`
- `/src/app/api/public/products/[slug]/route.ts`
- `/src/app/api/public/reviews/route.ts`
- `/src/app/api/public/reviews/[id]/vote/route.ts`
- `/src/app/api/public/settings/route.ts`

### Step 3: Restart Server

```bash
npm run dev
```

---

## 📋 Checklist Implementasi

- [x] Komentar `NEXT_PUBLIC_ADMIN_API_URL` di `.env.local`
- [x] Nonaktifkan fetch ke Admin API di semua routes
- [x] Implementasi mock data dari `lib/data.ts` untuk banners
- [x] Implementasi mock data dari `lib/data.ts` untuk categories
- [x] Implementasi mock data dari `lib/data.ts` untuk products (dengan filter)
- [x] Implementasi mock data dari `lib/data.ts` untuk product detail
- [x] Mock response untuk GET reviews (empty array)
- [x] Mock response untuk POST reviews (tidak persisten)
- [x] Mock response untuk review voting (tidak persisten)
- [x] Mock response untuk settings (dari env + defaults)
- [x] Tambahkan console logs untuk debugging
- [x] Buat dokumentasi lengkap

---

## 🎯 Testing Recommendations

### 1. Test API Endpoints

```bash
# Test Banners
curl http://localhost:3001/api/public/banners

# Test Categories
curl http://localhost:3001/api/public/categories

# Test Products
curl http://localhost:3001/api/public/products
curl http://localhost:3001/api/public/products?category=snack

# Test Product Detail
curl http://localhost:3001/api/public/products/chitato-sapi-gulung

# Test Reviews
curl http://localhost:3001/api/public/reviews

# Test Settings
curl http://localhost:3001/api/public/settings
```

### 2. Test UI Features

- [ ] Filter products by category
- [ ] Search products
- [ ] View product details
- [ ] Try to add review (accept response dengan mock data)
- [ ] Try to vote review
- [ ] Check mini cart
- [ ] Check favorites
- [ ] Open settings

---

## 📞 Support & Next Steps

### Untuk Mengaktifkan Kembali:
1. Hubungi tim backend untuk memastikan Admin API siap
2. Uncomment `NEXT_PUBLIC_ADMIN_API_URL` di `.env.local`
3. Uncomment semua fetch calls di API routes
4. Test semua endpoint di production

### Untuk Debugging:
1. Buka browser DevTools (F12)
2. Cek Console tab untuk `[LOCAL DEV]` logs
3. Cek Network tab untuk response dari endpoints
4. Check aplikasi React tidak ada error

---

**Last Updated**: 8 Mei 2026  
**Mode**: Development - Local Safe Mode ✅  
**Ready for**: Local Testing & Frontend Development
