import { create } from 'zustand';
import { Product } from '@/lib/types';

// ── Mock data (ganti dengan API fetch di production) ──
const mockFavorites: Product[] = [
  {
    id: 'fav-1', slug: 'chitato-bbq-68g',
    name: 'Chitato Rasa BBQ 68g',
    price: 15000, originalPrice: 18000,
    category: 'Snack', rating: 4.8, reviewCount: 234, sold: 1250, stock: 50,
    description: 'Keripik kentang renyah rasa BBQ khas Amerika.',
    images: [],
  },
  {
    id: 'fav-2', slug: 'teh-botol-sosro-350ml',
    name: 'Teh Botol Sosro 350ml',
    price: 5000, originalPrice: 6000,
    category: 'Minuman', rating: 4.9, reviewCount: 1820, sold: 8900, stock: 200,
    description: 'Minuman teh kemasan botol legendaris.',
    images: [],
  },
  {
    id: 'fav-3', slug: 'indomie-goreng-spesial',
    name: 'Indomie Goreng Spesial',
    price: 3500, originalPrice: undefined,
    category: 'Kebutuhan', rating: 4.7, reviewCount: 4500, sold: 25000, stock: 500,
    description: 'Mi goreng instan rasa spesial favorit Indonesia.',
    images: [],
  },
  {
    id: 'fav-4', slug: 'pena-pilot-g2-hitam',
    name: 'Pena Pilot G2 0.5mm Hitam',
    price: 22000, originalPrice: 28000,
    category: 'Alat Tulis', rating: 4.6, reviewCount: 310, sold: 980, stock: 75,
    description: 'Pena gel premium dengan tinta hitam pekat.',
    images: [],
  },
  {
    id: 'fav-5', slug: 'oreo-original-137g',
    name: 'Oreo Original 137g',
    price: 18000, originalPrice: 20000,
    category: 'Snack', rating: 4.5, reviewCount: 892, sold: 3200, stock: 120,
    description: 'Biskuit sandwich krim vanila ikonik.',
    images: [],
  },
  {
    id: 'fav-6', slug: 'aqua-600ml',
    name: 'AQUA Air Mineral 600ml',
    price: 4000, originalPrice: undefined,
    category: 'Minuman', rating: 4.9, reviewCount: 7600, sold: 42000, stock: 1000,
    description: 'Air mineral alami dari pegunungan.',
    images: [],
  },
  {
    id: 'fav-7', slug: 'sabun-lifebuoy-80g',
    name: 'Sabun Lifebuoy Total 10 80g',
    price: 6500, originalPrice: 8000,
    category: 'Kebutuhan', rating: 4.4, reviewCount: 560, sold: 2100, stock: 300,
    description: 'Sabun mandi antibakteri dengan perlindungan 10 kuman.',
    images: [],
  },
  {
    id: 'fav-8', slug: 'buku-tulis-sidu-58-lembar',
    name: 'Buku Tulis Sidu 58 Lembar',
    price: 5000, originalPrice: undefined,
    category: 'Alat Tulis', rating: 4.3, reviewCount: 1100, sold: 5500, stock: 400,
    description: 'Buku tulis bergaris berkualitas untuk pelajar.',
    images: [],
  },
  {
    id: 'fav-9', slug: 'buku-tulis-sidu-57-lembar',
    name: 'Buku Tulis Sidu 58 Lembar',
    price: 5000, originalPrice: undefined,
    category: 'Alat Tulis', rating: 4.3, reviewCount: 1100, sold: 5500, stock: 400,
    description: 'Buku tulis bergaris berkualitas untuk pelajar.',
    images: [],
  },
];

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  removeItems: (productIds: string[]) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: mockFavorites,
  addItem: (product) => {
    if (!get().isInWishlist(product.id)) {
      set({ items: [product, ...get().items] });
    }
  },
  removeItem: (productId) =>
    set({ items: get().items.filter((p) => p.id !== productId) }),
  removeItems: (productIds) =>
    set({ items: get().items.filter((p) => !productIds.includes(p.id)) }),
  isInWishlist: (productId) =>
    get().items.some((p) => p.id === productId),
  toggleItem: (product) => {
    if (get().isInWishlist(product.id)) {
      get().removeItem(product.id);
    } else {
      get().addItem(product);
    }
  },
}));
