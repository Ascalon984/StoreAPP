'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, MessageCircle, MapPin, Phone } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useSearchStore } from '@/store/useSearchStore';
import { WA_NUMBER } from '@/lib/constants';
import { useSettingsStore } from '@/store/useSettingsStore';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isProductDetail = pathname?.startsWith('/product/');

  const [scrolledState, setScrolledState] = useState(false);
  // Jika di halaman product detail, navbar selalu dalam mode hide (compact)
  const scrolled = isProductDetail || scrolledState;
  const toggleCart = useCartStore((s) => s.toggleCart);
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
      // Animasi hide (compact) terpicu saat bottom sheet mencapai label 'Spesial Buat Kamu' (~350px scroll)
      if (offset > 370) {
        setScrolledState(true);
      } else if (offset < 320) {
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

  return (
    <div className={`sticky top-0 z-50 w-full ${isProductDetail ? 'h-[52px]' : 'h-[64px]'}`}>
      <header
        className={`absolute top-0 w-full transition-all duration-500 ease-in-out ${scrolled
          ? 'bg-[#064E3B] border-b-[1.5px] border-black/20 shadow-layer-md'
          : 'bg-[#0B6B52] border-b-[1.5px] border-white/20'
          }`}
      >
        {/* FIX: Gunakan min-height yang stabil untuk menahan 'lompatan' */}
        <div className={`max-w-container mx-auto px-4 flex items-center justify-between gap-4 transition-all duration-500 ease-in-out ${
          // KUNCINYA: Padding atas tetap sama, yang berubah hanya padding bawah
          scrolled ? 'pt-1.5 pb-1.5 min-h-[52px]' : 'pt-1.5 pb-1.5 min-h-[64px]'
          }`}>
          <Link
            href="/"
            className="flex flex-col justify-center flex-shrink-1 min-w-0 active:scale-[0.98] transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <div className={`relative flex-shrink-0 transition-all duration-500 ease-in-out ${scrolled ? 'w-7 h-7' : 'w-9 h-9'
                }`}>
                <Image
                  src="/icons/logo toko.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority // Tambahkan priority agar logo tidak flickering saat load
                />
              </div>

              <h1 className={`font-black select-none leading-none tracking-tighter transition-all duration-500
  ${scrolled ? 'text-[16px]' : 'text-[22px]'}`}>

                <span className="text-teal-400 drop-shadow-md">
                  {storeNameFirst}
                </span>

                {storeNameLast && (
                  <span className="text-orange-400 drop-shadow-md">
                    {storeNameLast}
                  </span>
                )}
              </h1>
            </div>

            {/* Container Grid dengan Polish Animasi */}
            <div className={`grid transition-all duration-500 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${scrolled
              ? 'grid-rows-[0fr] opacity-0 -translate-y-2' // Geser sedikit ke atas saat menghilang
              : 'grid-rows-[1fr] opacity-100 translate-y-0' // Kembali ke posisi semula
              }`}>
              <div className="overflow-hidden">
                <div className="flex items-center justify-between px-0.5 text-white font-medium text-[8.5px] leading-none w-full pt-1 pb-0.5">

                  {/* ALAMAT */}
                  <div className="flex items-center gap-0.5 flex-shrink-0 text-white/95">
                    <MapPin size={9} className="text-white flex-shrink-0" fill="currentColor" strokeWidth={0} />
                    <span className="whitespace-nowrap">Telang Indah, Kamal</span>
                  </div>

                  {/* DIVIDER */}
                  <div className="w-[1.5px] h-2 bg-white/25 mx-2 shrink-0 rounded-full" aria-hidden="true" />

                  {/* NO TELP */}
                  <div className="flex items-center gap-0.5 flex-shrink-0 text-white/95">
                    <Phone size={9} className="text-white flex-shrink-0" fill="currentColor" strokeWidth={0} />
                    <span className="whitespace-nowrap">081-9960-0135</span>
                  </div>

                </div>
              </div>
            </div>
          </Link>

          {/* Search Bar Desktop */}
          <button
            onClick={openSearch}
            className="hidden sm:flex flex-1 max-w-md items-center gap-2.5 px-4 py-2 bg-white/95 hover:bg-white rounded-full text-gray-700 text-sm transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Search size={18} strokeWidth={2.5} className="text-emerald-700" />
            <span className="flex-1 text-left font-semibold">Cari produk...</span>
            <kbd className="hidden md:inline-flex items-center text-[10px] text-gray-800 bg-white px-1.5 py-0.5 rounded-md border border-gray-200 shadow-layer-xs font-bold">
              <span className="text-gray-500 mr-0.5 text-[9px]">⌘</span>K
            </kbd>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Search — Mobile */}
            <button
              onClick={openSearch}
              className="sm:hidden p-1.5 rounded-xl hover:bg-emerald-600 active:bg-emerald-800 active:scale-90 transition-all duration-200 text-white"
              aria-label="Search"
            >
              <Search size={22} strokeWidth={1.5} />
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-1.5 rounded-xl hover:bg-emerald-600 active:bg-emerald-800 active:scale-90 transition-all duration-200 text-white"
              aria-label="Cart"
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-[3px] right-[3px] bg-orange-600 text-white text-[9px] font-black min-w-[15px] h-[15px] rounded-full flex items-center justify-center shadow-sm animate-scale-in leading-none pt-[0.5px]">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative p-1.5 rounded-xl hover:bg-emerald-600 active:bg-emerald-800 active:scale-90 transition-all duration-200 text-white"
              aria-label="WhatsApp"
            >
              <MessageCircle
                size={22}
                strokeWidth={1.5}
              />
              {/* Online indicator dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-[1.5px] ring-emerald-700" />
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}