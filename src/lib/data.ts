import { Product, Category, Review, Banner } from './types';

export const banners: Banner[] = [
  {
    id: '1',
    title: 'Token PLN Murah',
    subtitle: 'Beli token listrik dengan harga termurah, proses instan',
    image: '/banners/b-PLN.jpg',
  },
  {
    id: '2',
    title: 'Aqua Terpercaya',
    subtitle: 'Paket internet stabil dengan kecepatan tinggi',
    image: '/banners/b-Aqua.jpg',
  },
  {
    id: '3',
    title: 'Telkomsel Terbaik',
    subtitle: 'Jaringan luas dengan sinyal kuat di mana-mana',
    image: '/banners/b-Telkomsel.jpg',
  },
];

export const categories: Category[] = [
  { id: 'all', name: 'Semua', icon: 'LayoutGrid' },
  { id: 'pulsa', name: 'Pulsa', icon: 'Smartphone' },
  { id: 'data', name: 'Data', icon: 'Wifi' },
  { id: 'pln', name: 'PLN', icon: 'Zap' },
  { id: 'game', name: 'Game', icon: 'Gamepad2' },
  { id: 'ewallet', name: 'Ewallet', icon: 'Wallet' },
  { id: 'voucher', name: 'Voucher', icon: 'Ticket' },
  { id: 'sosmed', name: 'Sosmed', icon: 'MessageCircle' },
  { id: 'tools', name: 'Peralatan', icon: 'Wrench' },
];

export const products: Product[] = [
  {
    id: 'p1', slug: 'pulsa-telkomsel-5k', name: 'Pulsa Telkomsel 5.000',
    price: 6500, originalPrice: 7000, category: 'pulsa',
    rating: 4.9, reviewCount: 342, sold: 1250, stock: 99,
    description: 'Pulsa Telkomsel nominal 5.000. Proses otomatis 24 jam. Masuk dalam 1-5 menit setelah pembayaran dikonfirmasi.',
  },
  {
    id: 'p2', slug: 'pulsa-telkomsel-10k', name: 'Pulsa Telkomsel 10.000',
    price: 11500, originalPrice: 12000, category: 'pulsa',
    rating: 4.8, reviewCount: 289, sold: 980, stock: 99,
    description: 'Pulsa Telkomsel nominal 10.000. Proses otomatis 24 jam. Masuk dalam 1-5 menit setelah pembayaran dikonfirmasi.',
  },
  {
    id: 'p3', slug: 'pulsa-telkomsel-25k', name: 'Pulsa Telkomsel 25.000',
    price: 26000, originalPrice: 27000, category: 'pulsa',
    rating: 4.8, reviewCount: 215, sold: 856, stock: 99,
    description: 'Pulsa Telkomsel nominal 25.000. Proses otomatis 24 jam.',
  },
  {
    id: 'p4', slug: 'pulsa-telkomsel-50k', name: 'Pulsa Telkomsel 50.000',
    price: 50500, originalPrice: 52000, category: 'pulsa',
    rating: 4.9, reviewCount: 178, sold: 734, stock: 99,
    description: 'Pulsa Telkomsel nominal 50.000. Proses otomatis 24 jam.',
  },
  {
    id: 'p5', slug: 'pulsa-xl-10k', name: 'Pulsa XL Axiata 10.000',
    price: 11000, originalPrice: 11500, category: 'pulsa',
    rating: 4.7, reviewCount: 156, sold: 623, stock: 99,
    description: 'Pulsa XL Axiata nominal 10.000. Proses otomatis 24 jam.',
  },
  {
    id: 'p6', slug: 'pulsa-indosat-25k', name: 'Pulsa Indosat 25.000',
    price: 25500, originalPrice: 26500, category: 'pulsa',
    rating: 4.7, reviewCount: 134, sold: 521, stock: 99,
    description: 'Pulsa Indosat Ooredoo nominal 25.000. Proses otomatis 24 jam.',
  },
  {
    id: 'd1', slug: 'data-telkomsel-1gb', name: 'Paket Data Telkomsel 1GB 30 Hari',
    price: 15000, originalPrice: 18000, category: 'data',
    rating: 4.6, reviewCount: 198, sold: 876, stock: 99,
    description: 'Paket data Telkomsel 1GB masa aktif 30 hari. Berlaku di seluruh jaringan.',
  },
  {
    id: 'd2', slug: 'data-xl-2gb', name: 'Paket Data XL 2GB 30 Hari',
    price: 25000, originalPrice: 28000, category: 'data',
    rating: 4.5, reviewCount: 145, sold: 654, stock: 99,
    description: 'Paket data XL Axiata 2GB masa aktif 30 hari.',
  },
  {
    id: 'd3', slug: 'data-indosat-3gb', name: 'Paket Data Indosat 3GB 30 Hari',
    price: 30000, originalPrice: 35000, category: 'data',
    rating: 4.6, reviewCount: 167, sold: 543, stock: 99,
    description: 'Paket data Indosat Freedom 3GB masa aktif 30 hari.',
  },
  {
    id: 'pln1', slug: 'token-pln-20k', name: 'Token PLN 20.000',
    price: 21000, originalPrice: 22000, category: 'pln',
    rating: 4.8, reviewCount: 267, sold: 1120, stock: 99,
    description: 'Token listrik PLN nominal Rp20.000. Proses instan, langsung masuk ke meter.',
  },
  {
    id: 'pln2', slug: 'token-pln-50k', name: 'Token PLN 50.000',
    price: 51000, originalPrice: 52500, category: 'pln',
    rating: 4.9, reviewCount: 312, sold: 1543, stock: 99,
    description: 'Token listrik PLN nominal Rp50.000. Proses instan.',
  },
  {
    id: 'pln3', slug: 'token-pln-100k', name: 'Token PLN 100.000',
    price: 101000, originalPrice: 103000, category: 'pln',
    rating: 4.9, reviewCount: 198, sold: 987, stock: 99,
    description: 'Token listrik PLN nominal Rp100.000. Proses instan.',
  },
  {
    id: 'g1', slug: 'ml-86-diamonds', name: 'Mobile Legends 86 Diamonds',
    price: 20000, originalPrice: 22000, category: 'game',
    rating: 4.8, reviewCount: 456, sold: 2340, stock: 99,
    description: 'Top up 86 Diamonds Mobile Legends Bang Bang. Masuk langsung ke akun game.',
  },
  {
    id: 'g2', slug: 'ff-100-diamonds', name: 'Free Fire 100 Diamonds',
    price: 15000, originalPrice: 17000, category: 'game',
    rating: 4.7, reviewCount: 389, sold: 1876, stock: 99,
    description: 'Top up 100 Diamonds Garena Free Fire. Proses instan.',
  },
  {
    id: 'g3', slug: 'pubgm-60-uc', name: 'PUBG Mobile 60 UC',
    price: 16000, originalPrice: 18000, category: 'game',
    rating: 4.6, reviewCount: 234, sold: 1234, stock: 99,
    description: 'Top up 60 UC PUBG Mobile. Masuk langsung ke akun.',
  },
  {
    id: 'g4', slug: 'genshin-60-genesis', name: 'Genshin Impact 60 Genesis Crystal',
    price: 16000, originalPrice: 17500, category: 'game',
    rating: 4.8, reviewCount: 178, sold: 876, stock: 99,
    description: 'Top up 60 Genesis Crystal Genshin Impact.',
  },
  {
    id: 'e1', slug: 'gopay-50k', name: 'Saldo GoPay 50.000',
    price: 50500, originalPrice: 51500, category: 'ewallet',
    rating: 4.8, reviewCount: 234, sold: 1567, stock: 99,
    description: 'Top up saldo GoPay Rp50.000. Masuk langsung ke akun Gojek/GoPay.',
  },
  {
    id: 'e2', slug: 'ovo-100k', name: 'Saldo OVO 100.000',
    price: 100500, originalPrice: 102000, category: 'ewallet',
    rating: 4.7, reviewCount: 187, sold: 1234, stock: 99,
    description: 'Top up saldo OVO Rp100.000. Proses cepat.',
  },
  {
    id: 'e3', slug: 'dana-50k', name: 'Saldo DANA 50.000',
    price: 50500, originalPrice: 51500, category: 'ewallet',
    rating: 4.7, reviewCount: 156, sold: 987, stock: 99,
    description: 'Top up saldo DANA Rp50.000.',
  },
  {
    id: 'e4', slug: 'shopeepay-25k', name: 'Saldo ShopeePay 25.000',
    price: 25500, originalPrice: 26000, category: 'ewallet',
    rating: 4.6, reviewCount: 134, sold: 876, stock: 99,
    description: 'Top up saldo ShopeePay Rp25.000.',
  },
  {
    id: 'v1', slug: 'google-play-50k', name: 'Voucher Google Play 50.000',
    price: 49000, originalPrice: 50000, category: 'voucher',
    rating: 4.8, reviewCount: 198, sold: 1345, stock: 50,
    description: 'Kode voucher Google Play Store senilai Rp50.000.',
  },
  {
    id: 'v2', slug: 'netflix-50k', name: 'Voucher Netflix 50.000',
    price: 50000, originalPrice: 55000, category: 'voucher',
    rating: 4.7, reviewCount: 145, sold: 876, stock: 30,
    description: 'Voucher Netflix senilai Rp50.000 untuk perpanjang langganan.',
  },
  {
    id: 's1', slug: 'youtube-premium-1bln', name: 'YouTube Premium 1 Bulan',
    price: 30000, originalPrice: 49000, category: 'sosmed',
    rating: 4.9, reviewCount: 267, sold: 1876, stock: 20,
    description: 'Langganan YouTube Premium 1 bulan. Bebas iklan, bisa download video.',
  },
  {
    id: 't1', slug: 'spotify-premium-1bln', name: 'Spotify Premium 1 Bulan',
    price: 25000, originalPrice: 49900, category: 'tools',
    rating: 4.9, reviewCount: 345, sold: 2345, stock: 15,
    description: 'Langganan Spotify Premium 1 bulan. Dengarkan musik tanpa iklan tanpa batas dan sepuasnya.',
  },
];

function generateReviewDate(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

export const defaultReviews: Review[] = [
  { id: 'r1', productId: 'all', name: 'Ahmad', rating: 5, comment: 'Proses cepat, admin ramah', createdAt: generateReviewDate(1), isVerified: true },
  { id: 'r2', productId: 'all', name: 'Rizky', rating: 5, comment: 'Langsung masuk, aman banget', createdAt: generateReviewDate(3), isVerified: true },
  { id: 'r3', productId: 'all', name: 'Dewi', rating: 4, comment: 'Harga murah, worth it', createdAt: generateReviewDate(24), isVerified: true },
  { id: 'r4', productId: 'all', name: 'Budi', rating: 5, comment: 'Udah langganan di sini', createdAt: generateReviewDate(48), isVerified: true },
  { id: 'r5', productId: 'all', name: 'Sari', rating: 4, comment: 'Pelayanan oke, respon cepat', createdAt: generateReviewDate(72), isVerified: true },
  { id: 'r6', productId: 'all', name: 'Fikri', rating: 5, comment: 'Mantap, pulsa langsung masuk', createdAt: generateReviewDate(96), isVerified: true },
  { id: 'r7', productId: 'all', name: 'Naina', rating: 5, comment: 'Recommended seller!', createdAt: generateReviewDate(120), isVerified: true },
  { id: 'r8', productId: 'all', name: 'Dimas', rating: 4, comment: 'Proses lumayan cepat', createdAt: generateReviewDate(144), isVerified: true },
  { id: 'r9', productId: 'all', name: 'Putri', rating: 5, comment: 'Sudah beli berkali-kali, selalu lancar', createdAt: generateReviewDate(168), isVerified: true },
  { id: 'r10', productId: 'all', name: 'Wahyu', rating: 5, comment: 'Top up game paling murah di sini', createdAt: generateReviewDate(192), isVerified: true },
  { id: 'r11', productId: 'all', name: 'Rina', rating: 4, comment: 'Harga bersaing, proses oke', createdAt: generateReviewDate(240), isVerified: true },
  { id: 'r12', productId: 'all', name: 'Andi', rating: 5, comment: 'Fast response, admin helpful banget', createdAt: generateReviewDate(288), isVerified: true },
  { id: 'r13', productId: 'all', name: 'Maya', rating: 5, comment: 'Token PLN langsung masuk, top!', createdAt: generateReviewDate(336), isVerified: true },
  { id: 'r14', productId: 'all', name: 'Fajar', rating: 4, comment: 'Produk sesuai deskripsi', createdAt: generateReviewDate(384), isVerified: true },
  { id: 'r15', productId: 'all', name: 'Lestari', rating: 5, comment: 'Paling trusted, ga pernah gagal', createdAt: generateReviewDate(432), isVerified: true },
];
