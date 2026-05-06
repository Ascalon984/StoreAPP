import { create } from 'zustand';

interface NavigationState {
  isReturningFromDetail: boolean;
  setIsReturningFromDetail: (value: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isReturningFromDetail: false,
  setIsReturningFromDetail: (value: boolean) => set({ isReturningFromDetail: value }),
}));
