"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NotebookText, ShoppingCart, Bookmark, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useNavigationStore } from "@/store/useNavigationStore";

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
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 1.8 : 1.5}
        strokeLinejoin="round"
      />
      {/* Pintu - stroke putih saat active agar terlihat */}
      <path
        d="M9.5 21V15.5H14.5V21"
        fill="none"
        stroke={active ? "white" : "currentColor"}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NotebookTextIcon({ active }: { active: boolean }) {
  const strokeColor = active ? "white" : "currentColor";
  const fillColor = active ? "currentColor" : "none";

  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body buku - filled saat active */}
      <path
        d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4V3Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={active ? 1.8 : 1.5}
        strokeLinejoin="round"
      />

      {/* Garis sisi kiri (binding edge) */}
      <path
        d="M4 3V21"
        stroke={strokeColor}
        strokeWidth={active ? 1.8 : 1.5}
        strokeLinecap="round"
      />

      {/* Spiral binding - selalu kontras dengan body */}
      <path
        d="M2 7H4"
        stroke={active ? "white" : "currentColor"}
        strokeWidth={active ? 1.8 : 1.5}
        strokeLinecap="round"
      />
      <path
        d="M2 12H4"
        stroke={active ? "white" : "currentColor"}
        strokeWidth={active ? 1.8 : 1.5}
        strokeLinecap="round"
      />
      <path
        d="M2 17H4"
        stroke={active ? "white" : "currentColor"}
        strokeWidth={active ? 1.8 : 1.5}
        strokeLinecap="round"
      />

      {/* Garis teks internal - putih saat active */}
      <path
        d="M8 8H17"
        stroke={active ? "white" : "currentColor"}
        strokeWidth={active ? 1.6 : 1.3}
        strokeLinecap="round"
      />
      <path
        d="M8 12H17"
        stroke={active ? "white" : "currentColor"}
        strokeWidth={active ? 1.6 : 1.3}
        strokeLinecap="round"
      />
      <path
        d="M8 16H13"
        stroke={active ? "white" : "currentColor"}
        strokeWidth={active ? 1.6 : 1.3}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const navStore = useNavigationStore();

  // Sembunyikan navbar di halaman detail produk dan checkout
  const isProductDetail = pathname?.startsWith("/product/");
  const isCheckout = pathname === "/checkout";
  const isNotifications = pathname === "/notifications";
  const isProducts = pathname?.startsWith("/products/");

  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  if (isProductDetail || isCheckout || isNotifications || isProducts)
    return null;

  return (
    <>
      {/* FIXED WRAPPER - Transparan agar konten di balik cekungan terlihat */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="relative w-full max-w-container mx-auto h-[52px]">
          {/* BACKGROUND SVG LAYER - Satu-satunya sumber warna putih */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              viewBox="0 0 400 52"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <mask id="navCutout">
                  <rect width="400" height="52" fill="white" />
                  <circle cx="200" cy="2" r="30" fill="black" />
                </mask>
              </defs>

              <path
                d="
    M0 0
    L148 0
    C167 0, 173 33.5, 200 33.5
    C227 33.5, 233 0, 252 0
    L400 0
    L400 52
    L0 52
    Z
  "
                fill="white"
                mask="url(#navCutout)"
              />

              <path
                d="
    M0 0
    L148 0
    C167 0, 173 33.5, 200 33.5
    C227 33.5, 233 0, 252 0
    L400 0
  "
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1.2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* NAVIGATION CONTENT */}
          <div className="relative z-10 flex justify-between items-center h-full">
            {/* Sisi Kiri: Home & Pesanan */}
            <div className="flex-1 flex justify-end pr-4 gap-5">
              <Link
                href="/"
                className={`group flex flex-col items-center gap-0.5 p-2 transition-colors duration-200 active:scale-95 ${
                  pathname === "/" ? "text-emerald-700" : "text-gray-400"
                }`}
              >
                <HomeIcon active={pathname === "/"} />
                <span
                  className={`text-[10px] tracking-tight transition-colors ${
                    pathname === "/"
                      ? "text-gray-600 font-bold"
                      : "text-gray-400 font-medium"
                  }`}
                >
                  Home
                </span>
              </Link>

              <Link
                href="/orders"
                className={`group flex flex-col items-center gap-0.5 p-2 transition-[all] duration-300 active:scale-95 ${
                  pathname === "/orders"
                    ? "text-emerald-700 scale-105"
                    : "text-gray-500"
                }`}
              >
                <NotebookTextIcon active={pathname === "/orders"} />
                <span
                  className={`text-[10px] tracking-tight transition-colors ${
                    pathname === "/orders"
                      ? "text-gray-600 font-bold"
                      : "text-gray-400 font-medium"
                  }`}
                >
                  Pesanan
                </span>
              </Link>
            </div>

            {/* Tombol Tengah: Keranjang Floating */}
            <div className="w-[60px] flex-shrink-0 flex justify-center relative -top-[24px]">
              <button
                onClick={() => {
                  navStore.setCheckoutSource("cart");
                  router.push("/checkout");
                }}
                className="group relative w-[52px] h-[52px] rounded-full 
      bg-[#048750] text-white flex items-center justify-center 
      shadow-[0_4px_10px_rgba(6,95,70,0.25)]
      active:scale-90 transition-all duration-300"
                aria-label="Keranjang"
              >
                {/* === CONVEX GLOSSY EFFECT === */}
                <div className="absolute inset-[1.5px] rounded-full pointer-events-none z-0 overflow-hidden translate-y-[0.5px]">
                  {/* 1. Inner shadow bawah - kedalaman cekung */}
                  <div
                    className="absolute inset-0 rounded-full 
    shadow-[inset_0_-3px_6px_rgba(0,0,0,0.08),inset_0_1px_3px_rgba(255,255,255,0.08)]"
                  />

                  {/* 2. Main highlight atas — menembus overflow untuk menyatu di tepi */}
                  <div
                    className="absolute -top-[3px] left-[4px] right-[4px] h-[48%] 
    bg-gradient-to-b from-white/45 via-white/15 to-transparent 
    rounded-[55%_55%_40%_40%]"
                  />

                  {/* 3. Bright spot — titik terang melebar di garis atas */}
                  <div
                    className="absolute -top-[2px] left-1/2 -translate-x-1/2 
    w-[62%] h-[28%] 
    bg-gradient-to-b from-white/70 via-white/20 to-transparent 
    rounded-full blur-[1.5px]"
                  />

                  {/* 4. Edge darkening — tepi menggelap untuk volume */}
                  <div
                    className="absolute inset-0 rounded-full 
  bg-radial-[circle_at_50%_45%] from-transparent 55% to-black/8"
                  />
                </div>

                {/* Active state overlay */}
                <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-active:opacity-100 transition-opacity duration-200 z-10" />

                {/* Icon */}
                <ShoppingCart
                  size={22}
                  strokeWidth={1.8}
                  className="relative z-10 transition-transform group-hover:scale-110 duration-300"
                />

                {/* Badge */}
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 z-20 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-orange-600 text-[9px] font-semibold leading-none text-white shadow-md">
                    <span className="translate-y-[0.07px]">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  </span>
                )}
              </button>
            </div>

            {/* Sisi Kanan: Favorit & Profil */}
            <div className="flex-1 flex justify-start pl-4 gap-5">
              <Link
                href="/wishlist"
                className={`group flex flex-col items-center gap-0.5 p-2 transition-[all] duration-300 active:scale-95 ${
                  pathname === "/wishlist"
                    ? "text-emerald-700 scale-105"
                    : "text-gray-500"
                }`}
              >
                <Bookmark
                  size={21}
                  strokeWidth={pathname === "/wishlist" ? 1.8 : 1.5}
                  fill={pathname === "/wishlist" ? "currentColor" : "none"}
                />
                <span
                  className={`text-[10px] tracking-tight transition-colors ${
                    pathname === "/wishlist"
                      ? "text-gray-600 font-bold"
                      : "text-gray-400 font-medium"
                  }`}
                >
                  Favorit
                </span>
              </Link>

              <Link
                href="/profile"
                className={`group flex flex-col items-center gap-0.5 p-2 transition-[all] duration-300 active:scale-95 ${
                  pathname === "/profile"
                    ? "text-emerald-700 scale-105"
                    : "text-gray-500"
                }`}
              >
                <User
                  size={21}
                  strokeWidth={pathname === "/profile" ? 1.8 : 1.5}
                  fill={pathname === "/profile" ? "currentColor" : "none"}
                />
                <span
                  className={`text-[10px] tracking-tight transition-colors ${
                    pathname === "/profile"
                      ? "text-gray-600 font-bold"
                      : "text-gray-400 font-medium"
                  }`}
                >
                  Profil
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
