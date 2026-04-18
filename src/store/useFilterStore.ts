import { create } from 'zustand';

interface FilterStore {
  category: string;
  sort: string;
  setCategory: (category: string) => void;
  setSort: (sort: string) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  category: 'all',
  sort: 'popular',
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
}));
