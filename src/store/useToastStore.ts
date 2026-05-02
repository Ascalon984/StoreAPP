import { create } from 'zustand';

// Definisikan tipe yang didukung
type ToastType = 'success' | 'error';

interface ToastStore {
  message: string;
  isVisible: boolean;
  type: ToastType; // Tambahkan ini
  showToast: (message: string, type?: ToastType) => void; // Update ini
  hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  message: '',
  isVisible: false,
  type: 'success', // Default ke success

  showToast: (message, type = 'success') => {
    // Set isVisible false dulu agar jika ada toast beruntun, 
    // useEffect di komponen Toast.tsx terpicu ulang
    set({ isVisible: false });

    // Gunakan setTimeout minimal agar transisi pergantian toast terasa smooth
    setTimeout(() => {
      set({ message, type, isVisible: true });
    }, 10);

    // Timer otomatis untuk menutup toast
    setTimeout(() => {
      set({ isVisible: false });
    }, 3000); // 3 detik biasanya standar ideal untuk membaca pesan
  },

  hideToast: () => set({ isVisible: false }),
}));
