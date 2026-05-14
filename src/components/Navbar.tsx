'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Bell } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useSearchStore } from '@/store/useSearchStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isProductDetail = pathname?.startsWith('/product/');
  const isCheckout = pathname === '/checkout';
  const isProfile = pathname === '/profile';
  const isOrders = pathname === '/orders';
  const isWishlist = pathname === '/wishlist';

  const [scrolledState, setScrolledState] = useState(false);
  // Jika di halaman product detail, navbar selalu dalam mode hide (compact)
  const scrolled = isProductDetail || scrolledState;
  const openSearch = useSearchStore((s) => s.openSearch);
  const { storeNameFirst, storeNameLast, waNumber, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ✅ Derived selector — hanya re-render saat angka berubah
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  // Scroll listener
  useEffect(() => {
    if (isProductDetail) return; // Tidak perlu listener di product detail karena selalu hide

    const handleScroll = () => {
      const offset = window.scrollY;
      // Animasi hide (compact) terpicu saat bottom sheet mencapai label 'Spesial Buat Kamu'
      if (offset > 380) {
        setScrolledState(true);
      } else if (offset < 330) {
        setScrolledState(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isProductDetail]);

  // ⌘K / Ctrl+K shortcut
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    },
    [openSearch]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isCheckout || isProfile || isOrders || isWishlist || isProductDetail) {
    return null;
  }

  return (
    <div className={`sticky top-0 z-50 w-full ${isProductDetail ? 'h-[48px]' : 'h-[58px]'}`}>
      <header
        className={`absolute top-0 w-full h-full flex items-center transition-colors duration-500 ease-in-out ${scrolled
          ? 'bg-[#064E3B] border-b-[1px] border-black/10 shadow-md'
          : 'bg-[#0B6B52] border-b-[1px] border-white/10'
          }`}
      >
        {/* Container Utama - Gunakan h-full agar semua elemen terpusat secara vertikal */}
        <div className="max-w-container mx-auto px-4 w-full flex items-center justify-between gap-3 h-full">

          {/* BAGIAN KIRI: LOGO & BRAND (Beradaptasi saat Search Memanjang) */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 active:scale-[0.98] transition-all duration-300"
          >
            {/* Logo: Mengecil saat scroll */}
            <div className={`relative flex-shrink-0 transition-[width,height] duration-500 ${scrolled ? 'w-8 h-8' : 'w-9 h-9'}`}>
              <Image src="/icons/logo toko.png" alt="Logo" fill className="object-contain" priority />
            </div>

            {/* Group Teks: Menggunakan max-width agar transisi lebih smooth daripada CSS Grid */}
            <div className={`flex flex-col justify-center transition-[max-width,opacity]
duration-500
ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${scrolled ? 'max-w-0 opacity-0' : 'max-w-[200px] transition-opacity duration-300 delay-100'
              }`}>
              <div className="min-w-max">
                <h1 className="font-black select-none leading-none tracking-tighter text-[19px] whitespace-nowrap">
                  <span className="text-white drop-shadow-md">{storeNameFirst}</span>
                  {storeNameLast && <span className="text-orange-400 drop-shadow-md ml-1">{storeNameLast}</span>}
                </h1>

                {/* Alamat tepat di bawah Brand */}
                <div className="flex items-center gap-1 text-white/90 font-medium text-[8.5px] leading-none pt-1">
                  <MapPin size={9} fill="currentColor" strokeWidth={0} className="flex-shrink-0" />
                  <span className="whitespace-nowrap">Telang Indah, Kamal</span>
                </div>
              </div>
            </div>
          </Link>

          {/* BAGIAN TENGAH & KANAN: Search Area & Actions */}
          <div className="flex-1 flex justify-end items-center gap-1 min-w-0">

            {/* Search Box Area - Diperhalus dengan Liquid Expansion */}
            <div className="relative flex items-center justify-end flex-1 h-9 min-w-0">
              <button
                onClick={openSearch}
                className={`
    relative flex items-center transition-all duration-700
    rounded-xl overflow-hidden origin-right /* KUNCI: Animasi dimulai dari sisi kanan */
    ${scrolled
                    ? 'w-full bg-white/95 h-8 px-3 shadow-md opacity-100 scale-x-100 blur-0'
                    : 'w-10 h-8 bg-white/0 opacity-0 scale-x-0 blur-sm justify-center pointer-events-none'
                  }
  `}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  transitionProperty: 'width, opacity, transform, background-color, blur'
                }}
              >
                {/* Teks Search: Muncul belakangan agar tidak terlihat 'terjepit' saat ekspansi */}
                <span className={`text-left font-medium text-[11px] text-emerald-900/60 transition-all duration-500 whitespace-nowrap ${scrolled ? 'opacity-100 translate-x-0 delay-300' : 'opacity-0 -translate-x-10'
                  }`}>
                  Cari di {storeNameFirst}...
                </span>

                {/* Icon Search di dalam Box: Mengikuti gerakan ujung kanan box */}
                <div className={`absolute right-0 w-10 h-full flex items-center justify-center transition-all duration-500 ${scrolled ? 'text-emerald-700 opacity-100' : 'text-white opacity-0'
                  }`}>
                  <Search size={16} strokeWidth={2.5} />
                </div>
              </button>

              {/* Icon Search PENGGANTI: Tetap diam di kanan saat posisi normal (Tidak Scrolled) */}
              {!scrolled && (
                <div className="absolute right-0 w-10 h-10 flex items-center justify-center text-white transition-opacity duration-300">
                  <Search size={20} strokeWidth={2} />
                </div>
              )}
            </div>

            {/* Actions: Bell & WhatsApp */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button className="relative p-2 text-white transition-all">
                <Bell size={20} strokeWidth={2} />
                <span className={`absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 ${scrolled ? 'border-[#064E3B]' : 'border-[#0B6B52]'}`} />
              </button>

            </div>
          </div>

        </div>
      </header>
    </div>
  );
}