import { create } from 'zustand';

interface FavoriteStore {
  favorites: string[];
  setFavorites: (faves: string[]) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  setFavorites: (faves) => set({ favorites: faves }),
  toggleFavorite: (productId) => {
    const favorites = get().favorites;
    let updated: string[];
    if (favorites.includes(productId)) {
      updated = favorites.filter((id) => id !== productId);
    } else {
      updated = [...favorites, productId];
    }
    set({ favorites: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(updated));
    }
  },
  isFavorite: (productId) => get().favorites.includes(productId),
}));
