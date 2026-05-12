'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReceiptText, ShoppingCart, Bookmark, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body rumah - filled hijau saat active */}
      <path
        d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={active ? 1.8 : 1.5}
        strokeLinejoin="round"
      />
      {/* Pintu - stroke putih saat active agar terlihat */}
      <path
        d="M9.5 21V15.5H14.5V21"
        fill="none"
        stroke={active ? 'white' : 'currentColor'}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  // Sembunyikan navbar di halaman detail produk dan checkout
  const isProductDetail = pathname?.startsWith('/product/');
  const isCheckout = pathname === '/checkout';

  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  if (isProductDetail || isCheckout) return null;

  return (
    <>
      {/* FIXED WRAPPER - Transparan agar konten di balik cekungan terlihat */}
      <div className="fixed bottom-0 left-0 right-0 z-40">

        <div className="relative w-full max-w-container mx-auto h-[58px]">

          {/* BACKGROUND SVG LAYER - Satu-satunya sumber warna putih */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              viewBox="0 0 400 58"
              className="w-full h-full filter drop-shadow-[0_-2px_6px_rgba(0,0,0,0.03)] drop-shadow-[0_-6px_20px_rgba(0,0,0,0.08)]"
              preserveAspectRatio="none"
            >
              <defs>
                <mask id="navCutout">
                  <rect width="400" height="58" fill="white" />
                  <circle cx="200" cy="6" r="32" fill="black" />
                </mask>
              </defs>
              {/* Fill putih dengan cutout lingkaran di tengah atas */}
              <path
                d="
                  M0 0
                  L148 0
                  C160 0, 166 40, 200 40
                  C234 40, 240 0, 252 0
                  L400 0
                  L400 58
                  L0 58
                  Z
                "
                fill="white"
                mask="url(#navCutout)"
              />

              {/* Stroke mengikuti lekukan kurva saja */}
              <path
                d="
                  M0 0
                  L148 0
                  C160 0, 166 40, 200 40
                  C234 40, 240 0, 252 0
                  L400 0
                "
                fill="none"
                stroke="#EEF2F6"
                strokeWidth="1.2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* NAVIGATION CONTENT */}
          <div className="relative z-10 flex justify-between items-center h-full px-4">

            {/* Sisi Kiri: Home & Pesanan */}
            <div className="flex-1 flex justify-evenly">
              <Link
                href="/"
                className={`group flex flex-col items-center gap-0.5 p-2 transition-[all] duration-300 active:scale-95 ${pathname === '/' ? 'text-emerald-700 scale-105' : 'text-gray-400'
                  }`}
              >
                <HomeIcon active={pathname === '/'} />
                <span className={`text-[10px] tracking-tight transition-colors ${pathname === '/' ? 'font-bold' : 'font-semibold'}`}>Home</span>
              </Link>

              <Link
                href="/orders"
                className={`group flex flex-col items-center gap-0.5 p-2 transition-[all] duration-300 active:scale-95 ${pathname === '/orders' ? 'text-emerald-700 scale-105' : 'text-gray-400'
                  }`}
              >
                <ReceiptText
                  size={21}
                  strokeWidth={pathname === '/orders' ? 1.8 : 1.5}
                  stroke={pathname === '/orders' ? 'white' : 'currentColor'}
                  fill={pathname === '/orders' ? 'currentColor' : 'none'}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
                <span className={`text-[10px] tracking-tight transition-colors ${pathname === '/orders' ? 'font-bold' : 'font-semibold'}`}>Pesanan</span>
              </Link>
            </div>

            {/* Tombol Tengah: Keranjang Floating */}
            <div className="w-[60px] flex justify-center relative -top-5">
              <Link
                href="/checkout"
                className="group relative w-[52px] h-[52px] rounded-full 
      bg-[#065F46] text-white flex items-center justify-center 
      shadow-[0_6px_16px_rgba(6,95,70,0.35)]
      active:scale-90 transition-all duration-300 overflow-hidden"
                aria-label="Keranjang"
              >
                {/* 1. Glossy Glassmorphism Highlight - Posisi dinaikkan sedikit ke top-[1px] */}
                <div className="absolute top-[1px] left-[7px] right-[7px] h-[38%] 
      bg-gradient-to-b from-white/35 to-white/0 
      rounded-[100%_100%_80%_80%] pointer-events-none z-0"
                />

                {/* 2. "n" Curve Pattern Background (Subtle Texture) */}
                <div className="absolute inset-0 opacity-[0.12] pointer-events-none z-0">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full scale-125 translate-y-3">
                    <path
                      d="M0 100 V87 Q50 67 100 87 V100 Z"
                      fill="white"
                    />
                  </svg>
                </div>

                <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-active:opacity-100 transition-opacity duration-200" />
                {/* Menyeimbangkan ketebalan ikon utama di tengah */}
                <ShoppingCart size={22} strokeWidth={1.8} className="transition-transform group-hover:scale-110 duration-300" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white leading-none shadow-md animate-in zoom-in duration-200">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Sisi Kanan: Favorit & Profil */}
            <div className="flex-1 flex justify-evenly">
              <Link
                href="/wishlist"
                className={`group flex flex-col items-center gap-0.5 p-2 transition-[all] duration-300 active:scale-95 ${pathname === '/wishlist' ? 'text-emerald-700 scale-105' : 'text-gray-400'
                  }`}
              >
                <Bookmark
                  size={21}
                  strokeWidth={pathname === '/wishlist' ? 1.8 : 1.5}
                  fill={pathname === '/wishlist' ? 'currentColor' : 'none'}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
                <span className={`text-[10px] tracking-tight transition-colors ${pathname === '/wishlist' ? 'font-bold' : 'font-semibold'}`}>Favorit</span>
              </Link>

              <Link
                href="/profile"
                className={`group flex flex-col items-center gap-0.5 p-2 transition-[all] duration-300 active:scale-95 ${pathname === '/profile' ? 'text-emerald-700 scale-105' : 'text-gray-400'
                  }`}
              >
                <User
                  size={21}
                  strokeWidth={pathname === '/profile' ? 1.8 : 1.5}
                  fill={pathname === '/profile' ? 'currentColor' : 'none'}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
                <span className={`text-[10px] tracking-tight transition-colors ${pathname === '/profile' ? 'font-bold' : 'font-semibold'}`}>Profil</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}