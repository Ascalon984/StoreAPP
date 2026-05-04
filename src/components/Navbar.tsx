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
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-[padding,box-shadow] duration-300 ${scrolled ? 'py-1.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]' : 'py-2'
        }`}
    >
      <div className="max-w-container mx-auto px-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex flex-col flex-shrink-1 min-w-0 active:scale-[0.98] transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <div className={`relative flex-shrink-0 transition-all duration-500 ease-in-out ${scrolled ? 'w-7 h-7' : 'w-9 h-9'
              }`}>
              <Image
                src="/icons/logo toko.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h1 className={`font-black select-none leading-none tracking-tighter transition-all duration-300 ${scrolled ? 'text-base' : 'text-xl'
              }`}>
              <span className="bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                {storeNameFirst}
              </span>
              {/* FIXED: Menggunakan orange-700 untuk kontras aksesibilitas yang lebih baik */}
              {storeNameLast && <span className="text-orange-700">{storeNameLast}</span>}
            </h1>
          </div>

          {/* Baris Bawah: Alamat | No Telp */}
          <div className={`flex items-center gap-2 px-0.5 text-gray-700 font-bold transition-all duration-300 ease-in-out overflow-hidden ${scrolled ? 'max-h-0 opacity-0 mt-0' : 'max-h-5 opacity-100 mt-1'
            } text-[10px]`}>

            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-red-600" fill="currentColor" strokeWidth={0} />
              <span className="truncate max-w-[120px]">Telang Indah, Kamal</span>
            </div>

            {/* Divider Vertikal */}
            <div className="w-px h-3 bg-gray-300 mx-0.5" />

            <div className="flex items-center gap-1">
              <Phone size={11} className="text-emerald-700" fill="currentColor" strokeWidth={0} />
              <span className="whitespace-nowrap">081-9960-0135</span>
            </div>
          </div>
        </Link>

        {/* Search Bar Desktop: Ubah text-gray-500 menjadi text-gray-600 untuk kontras */}
        <button
          onClick={openSearch}
          className="hidden sm:flex flex-1 max-w-md items-center gap-2.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 text-sm transition-all duration-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-[0.98]"
        >
          <Search size={17} strokeWidth={2} className="text-gray-500" />
          <span className="flex-1 text-left">Cari produk...</span>
          {/* KBD Shortcut: Pastikan warna teks cukup kontras */}
          <kbd className="hidden md:inline-flex items-center text-[10px] text-gray-600 bg-white px-1.5 py-0.5 rounded-md border border-gray-300 shadow-sm font-medium">
            <span className="text-gray-500 mr-0.5 text-[9px]">⌘</span>K
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
            <ShoppingCart
              size={22}
              strokeWidth={1.5}
              className="text-gray-600"
            />
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
            <MessageCircle
              size={22}
              strokeWidth={1.5}
              className="text-gray-600"
            />
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