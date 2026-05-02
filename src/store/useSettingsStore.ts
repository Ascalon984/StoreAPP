import { create } from 'zustand';

interface SettingsStore {
  waNumber: string;
  storeNameFirst: string;
  storeNameLast: string;
  hasFetched: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  waNumber: '6281234567890',
  storeNameFirst: 'Palugada',
  storeNameLast: 'Store',
  hasFetched: false,

  fetchSettings: async () => {
    // Jangan fetch ulang jika sudah ada data (cache in-memory)
    if (get().hasFetched) return;

    try {
      // Tidak pakai ?t=Date.now() — biarkan ISR cache bekerja
      const res = await fetch('/api/public/settings');
      if (res.ok) {
        const data = await res.json();
        set({
          waNumber: data.waNumber,
          storeNameFirst: data.storeNameFirst,
          storeNameLast: data.storeNameLast,
          hasFetched: true,
        });
      }
    } catch (e) {
      console.error('Failed to fetch settings', e);
    }
  },
}));
