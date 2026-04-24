import { create } from 'zustand';

interface SettingsStore {
  waNumber: string;
  storeNameFirst: string;
  storeNameLast: string;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  waNumber: '6281234567890', // Default
  storeNameFirst: 'Palugada', // Default
  storeNameLast: 'Store',
  fetchSettings: async () => {
    try {
      const res = await fetch(`/api/public/settings?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        set({ waNumber: data.waNumber, storeNameFirst: data.storeNameFirst, storeNameLast: data.storeNameLast });
      }
    } catch (e) {
      console.error('Failed to fetch settings', e);
    }
  },
}));
