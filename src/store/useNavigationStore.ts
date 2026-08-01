import { create } from 'zustand';

type CheckoutSource = 'product' | 'cart' | 'cart-confirmed' | null;

interface NavigationState {
  isReturningFromDetail: boolean;
  setIsReturningFromDetail: (value: boolean) => void;
  checkoutSource: CheckoutSource;
  setCheckoutSource: (source: CheckoutSource) => void;
  /** True saat salah satu sub-page profil (overlay fullscreen) sedang terbuka */
  profileSubPageOpen: boolean;
  setProfileSubPageOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isReturningFromDetail: false,
  setIsReturningFromDetail: (value: boolean) => set({ isReturningFromDetail: value }),
  checkoutSource: null,
  setCheckoutSource: (source: CheckoutSource) => set({ checkoutSource: source }),
  profileSubPageOpen: false,
  setProfileSubPageOpen: (open: boolean) => set({ profileSubPageOpen: open }),
}));
