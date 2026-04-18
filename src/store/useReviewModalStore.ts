import { create } from 'zustand';

interface ReviewModalStore {
  isOpen: boolean;
  productSlug: string | null;
  openModal: (productSlug?: string) => void;
  closeModal: () => void;
}

export const useReviewModalStore = create<ReviewModalStore>((set) => ({
  isOpen: false,
  productSlug: null,
  openModal: (productSlug) => set({ isOpen: true, productSlug: productSlug || null }),
  closeModal: () => set({ isOpen: false, productSlug: null }),
}));
