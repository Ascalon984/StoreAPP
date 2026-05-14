import { create } from 'zustand';

type CheckoutSource = 'product' | 'cart' | null;

interface NavigationState {
  isReturningFromDetail: boolean;
  setIsReturningFromDetail: (value: boolean) => void;
  checkoutSource: CheckoutSource;
  setCheckoutSource: (source: CheckoutSource) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isReturningFromDetail: false,
  setIsReturningFromDetail: (value: boolean) => set({ isReturningFromDetail: value }),
  checkoutSource: null,
  setCheckoutSource: (source: CheckoutSource) => set({ checkoutSource: source }),
}));
