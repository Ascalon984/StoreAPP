import { create } from "zustand";

interface CategoryBottomSheetStore {
  isOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

export const useCategoryBottomSheetStore = create<CategoryBottomSheetStore>(
  (set) => ({
    isOpen: false,
    openSheet: () => set({ isOpen: true }),
    closeSheet: () => set({ isOpen: false }),
  }),
);
