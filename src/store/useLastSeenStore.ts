import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/lib/types";

interface LastSeenStore {
  items: Product[];
  addLastSeen: (product: Product) => void;
  clearLastSeen: () => void;
}

export const useLastSeenStore = create<LastSeenStore>()(
  persist(
    (set, get) => ({
      items: [],
      addLastSeen: (product) => {
        const items = get().items;
        // Hapus produk jika sudah ada di list untuk dinaikkan ke paling atas
        const filteredItems = items.filter((item) => item.id !== product.id);
        
        // Tambahkan produk di awal (paling baru)
        const newItems = [product, ...filteredItems];
        
        // Batasi maksimal 30 produk
        if (newItems.length > 30) {
          newItems.pop(); // Hapus yang paling lama
        }
        
        set({ items: newItems });
      },
      clearLastSeen: () => set({ items: [] }),
    }),
    {
      name: "last-seen-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
