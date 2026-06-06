import { create } from 'zustand';
import { Product } from '@/lib/types';
import { mockFavorites } from '@/lib/data';



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
