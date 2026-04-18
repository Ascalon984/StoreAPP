import { create } from 'zustand';

interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
}

interface DeliveryStore {
  deliveryInfo: DeliveryInfo;
  updateDeliveryInfo: (info: Partial<DeliveryInfo>) => void;
  setLocation: (lat: number, lng: number) => void;
  getAddressFromCoords: (lat: number, lng: number) => Promise<void>;
  isLoadingLocation: boolean;
  setIsLoadingLocation: (loading: boolean) => void;
}

export const useDeliveryStore = create<DeliveryStore>((set) => ({
  deliveryInfo: {
    name: '',
    phone: '',
    address: '',
    lat: null,
    lng: null,
  },

  updateDeliveryInfo: (info) =>
    set((state) => ({
      deliveryInfo: { ...state.deliveryInfo, ...info },
    })),

  setLocation: (lat, lng) =>
    set((state) => ({
      deliveryInfo: { ...state.deliveryInfo, lat, lng },
    })),

  getAddressFromCoords: async (lat, lng) => {
    // Loading state dikelola sepenuhnya oleh CheckoutModal (UI Layer)
    // untuk menghindari race condition

    const response = await fetch(
      // PERBAIKAN 1: lon=${lon} diganti lon=${lng}
      // PERBAIKAN 2: ditambahkan accept-language=id agar alamat dalam Bahasa Indonesia
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`
    );
    
    const data = await response.json();

    // PERBAIKAN 3: Nominatim mengembalikan { error: "..." } jika gagal, lempar error agar ditangkap UI
    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.address) {
      throw new Error('Data alamat kosong dari server.');
    }

    const addr = data.address;
    
    // PERBAIKAN 4: Menambahkan neighbourhood & town untuk cakupan area Indonesia yang lebih luas
    const address = [
      addr.road || '',
      addr.suburb || addr.village || addr.neighbourhood || '',
      addr.city || addr.town || addr.county || '',
      addr.state || '',
    ]
      .filter(Boolean)
      .join(', ');

    if (!address) {
      throw new Error('Gagal memetakan koordinat ke alamat yang valid.');
    }

    set((state) => ({
      deliveryInfo: { ...state.deliveryInfo, address },
    }));
  },

  isLoadingLocation: false,
  setIsLoadingLocation: (loading) => set({ isLoadingLocation: loading }),
}));