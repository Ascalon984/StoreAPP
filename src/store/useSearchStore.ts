import { create } from 'zustand';

interface SearchStore {
  query: string;
  isOpen: boolean;
  recentSearches: string[];
  setQuery: (query: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
  setRecentSearches: (searches: string[]) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  isOpen: false,
  recentSearches: [],
  setQuery: (query) => set({ query }),
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, query: '' }),
  setRecentSearches: (searches) => set({ recentSearches: searches }),
  addRecentSearch: (term) => {
    if (!term.trim()) return;
    const searches = get().recentSearches.filter((s) => s !== term);
    const updated = [term, ...searches].slice(0, 5);
    set({ recentSearches: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  },
  clearRecentSearches: () => {
    set({ recentSearches: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentSearches');
    }
  },
}));
