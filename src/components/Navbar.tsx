'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, MessageCircle, MapPin, Phone } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useSearchStore } from '@/store/useSearchStore';
import { WA_NUMBER } from '@/lib/constants';
import { useSettingsStore } from '@/store/useSettingsStore';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-[padding,box-shadow] duration-300 ${scrolled ? 'py-2 shadow-[0_1px_8px_rgba(0,0,0,0.06)]' : 'py-3'
        }`}
    >
      <div className="max-w-container mx-auto px-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex flex-col gap-1.5 flex-shrink-1 min-w-0 active:scale-[0.98] transition-transform duration-200 group"
        >
          {/* Baris Atas: Logo & Nama Toko (SIZE BOOST) */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <Image
                src="/icons/logo toko.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            {/* Menaikkan font ke text-xl (mobile) dan text-3xl (desktop) */}
            <h1 className="text-xl sm:text-3xl font-black select-none leading-none tracking-tighter sm:tracking-tight truncate">
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                {storeNameFirst || 'Palugada'}
              </span>
              <span className="text-orange-600">{storeNameLast || 'Store'}</span>
            </h1>
          </div>

          {/* Baris Bawah: Info Detail (Disesuaikan Jaraknya) */}
          <div className="flex items-center gap-2 px-0.5 mt-0.5 text-[9px] sm:text-[11px] text-gray-500 font-bold tracking-tight opacity-90">
            <div className="min-w-0">
              <span className="truncate block max-w-[150px] sm:max-w-none">
                Telang Inda, Kamal
              </span>
            </div>

            <div className="w-px h-2.5 bg-gray-200 flex-shrink-0 mx-0.5" />

            <div className="flex-shrink-0">
              <span className="whitespace-nowrap">+62 819-9600-0135</span>
            </div>
          </div>
        </Link>

        {/* Search Bar — Desktop */}
        <button
          onClick={openSearch}
          className="hidden sm:flex flex-1 max-w-md items-center gap-2.5 px-4 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 rounded-full text-gray-500 text-sm transition-all duration-200 border border-gray-100 hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 active:scale-[0.98]"
        >
          <Search size={17} strokeWidth={1.5} className="text-gray-500" />
          <span className="flex-1 text-left">Cari produk...</span>
          <kbd className="hidden md:inline-flex items-center text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded-md border border-gray-200/80 shadow-sm font-medium tracking-wide">
            <span className="text-gray-400 mr-0.5">⌘</span>K
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Search — Mobile */}
          <button
            onClick={openSearch}
            className="sm:hidden p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 active:scale-90 transition-all duration-200"
            aria-label="Search"
          >
            <Search size={22} strokeWidth={1.5} className="text-gray-600" />
          </button>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 active:scale-90 transition-all duration-200"
            aria-label="Cart"
          >
            <ShoppingCart size={22} strokeWidth={1.5} className="text-gray-600" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 ring-[2.5px] ring-white shadow-sm animate-scale-in">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 active:scale-90 transition-all duration-200"
            aria-label="WhatsApp"
          >
            <MessageCircle size={22} strokeWidth={1.5} className="text-gray-600" />
            {/* Online indicator dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-[1.5px] ring-white" />
          </a>
        </div>
      </div>

      {/* Gradient bottom line — subtle premium touch */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </header>
  );
}