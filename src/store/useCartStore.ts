import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, CartItem } from "@/lib/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  buyNowItem: CartItem | null;

  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setBuyNowItem: (item: CartItem | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      buyNowItem: null,
      isOpen: false,

      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      setBuyNowItem: (item) => set({ buyNowItem: item }),
      addItem: (product) => {
        const items = get().items;
        const existing = items.find((item) => item.product.id === product.id);
        if (existing) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },
      removeItem: (productId) =>
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        buyNowItem: state.buyNowItem,
      }),
      onRehydrateStorage: () => (state) => {
        // dipanggil otomatis begitu data dari localStorage selesai dibaca
        state?.setHasHydrated(true);
      },
    },
  ),
);
