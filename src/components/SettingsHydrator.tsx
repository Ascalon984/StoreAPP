'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface SettingsHydratorProps {
  settings: {
    waNumber: string;
    storeNameFirst: string;
    storeNameLast: string;
  };
}

/**
 * SettingsHydrator — menerima data settings dari SSR dan langsung
 * memprime Zustand store di client, mencegah duplicate fetch ke
 * /api/public/settings dari Navbar (mengurangi 1-2 request extra).
 *
 * Lighthouse fix: eliminasi duplicate /api/public/settings calls (3x → 1x)
 */
export default function SettingsHydrator({ settings }: SettingsHydratorProps) {
  useEffect(() => {
    const store = useSettingsStore.getState();
    // Hanya hydrate jika belum di-fetch (hindari override data yang lebih baru)
    if (!store.hasFetched) {
      useSettingsStore.setState({
        waNumber: settings.waNumber,
        storeNameFirst: settings.storeNameFirst,
        storeNameLast: settings.storeNameLast,
        hasFetched: true,
      });
    }
  }, [settings]);

  // Komponen ini tidak merender apapun — hanya side-effect
  return null;
}
