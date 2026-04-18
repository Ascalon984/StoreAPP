import { create } from 'zustand';

interface ToastStore {
  message: string;
  isVisible: boolean;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  message: '',
  isVisible: false,
  showToast: (message) => {
    set({ message, isVisible: true });
    setTimeout(() => set({ isVisible: false }), 2500);
  },
  hideToast: () => set({ isVisible: false }),
}));
