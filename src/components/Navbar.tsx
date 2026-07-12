"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Bell, Star, TrendingDown, TrendingUp } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useFilterStore } from "@/store/useFilterStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser, getGreeting } from "@/store/useUserStore";
import { products } from "@/lib/data";

const SORT_OPTIONS = [
  { id: "popular", label: "Terpopuler", Icon: Star },
  { id: "cheapest", label: "Termurah", Icon: TrendingDown },
  { id: "expensive", label: "Termahal", Icon: TrendingUp },
];

const topProducts = [...products]
  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
  .slice(0, 5)
  .map((p) => {
    const words = p.name.split(" ");
    return words.slice(0, 3).join(" ");
  });

const SEARCH_PLACEHOLDERS = [...topProducts];

function AnimatedPlaceholder() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
        setVisible(true);
      }, 180);
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center text-[12px] tracking-[-0.01em] overflow-hidden">
      {/* Animated keyword */}
      <span
        className={`
          text-gray-400 font-normal whitespace-nowrap
          transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[3px]"
          }
        `}
      >
        {SEARCH_PLACEHOLDERS[index]}
      </span>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isProductDetail = pathname?.startsWith("/product/");
  const isCategoryDetail = pathname?.startsWith("/category/");
  const isCheckout = pathname === "/checkout";
  const isProfile = pathname === "/profile";
  const isOrders = pathname === "/orders";
  const isWishlist = pathname === "/wishlist";
  const isNotifications = pathname === "/notifications";
  const isProducts = pathname?.startsWith("/products/");

  const openSearch = useSearchStore((s) => s.openSearch);
  const { fetchSettings } = useSettingsStore();
  const { sort, setSort } = useFilterStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const tickingRef = useRef(false);

  // ─── Scroll Handler (SIMPLIFIED & STABLE) ───
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;

          setIsScrolled((prev) => {
            // Hysteresis: collapse di >60, expand hanya di <15
            // Gap mencegah jitter tanpa perlu skipExpandCheck
            if (!prev && y > 60) return true;
            if (prev && y < 15) return false;
            return prev; // zona mati: pertahankan state
          });

          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // cek posisi awal (misal browser restore scroll)
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    },
    [openSearch],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (
    isCheckout ||
    isProfile ||
    isOrders ||
    isWishlist ||
    isProductDetail ||
    isCategoryDetail ||
    isNotifications ||
    isProducts
  ) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none select-none"
        style={{
          height: "calc(env(safe-area-inset-top) + 88px)",
        }}
      />

      <div
        className="gnb-shell fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46]"
        style={{
          borderBottomLeftRadius: isScrolled ? "0px" : "16px",
          borderBottomRightRadius: isScrolled ? "0px" : "16px",
          transition: "border-radius 250ms ease-in-out",
          boxShadow: isScrolled
            ? "0 1px 4px rgba(0,0,0,0.04)"
            : "0 2px 8px rgba(0,0,0,0.06)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <header className="w-full px-4 overflow-visible">
          <div className="max-w-container mx-auto">
            {/* ── Greeting Row ── */}
            <div
              className="overflow-hidden transition-[max-height] duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ maxHeight: isScrolled ? "0px" : "50px" }}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  className="gnb-fade"
                  style={{
                    transform: isScrolled
                      ? "translateY(-50px)"
                      : "translateY(0px)",
                    opacity: isScrolled ? 0 : 1,
                  }}
                >
                  <div className="flex items-center justify-between h-[50px] pt-1">
                    {/* Avatar */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Link
                        href="/profile"
                        className="active:scale-95 transition-transform flex-shrink-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center">
                          {mockUser.avatar ? (
                            <img
                              src={mockUser.avatar}
                              alt={mockUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src="/icons/avatar.png"
                              alt="avatar"
                              className="w-full h-full object-cover opacity-70"
                            />
                          )}
                        </div>
                      </Link>
                      <div className="flex flex-col min-w-0">
                        <p className="text-white/75 text-[10px] font-medium tracking-[0.010em] leading-none">
                          {getGreeting()}
                        </p>
                        <p className="text-white text-sm font-medium tracking-[0.015em] truncate mt-0.5">
                          {mockUser.name.split(" ")[0]}
                        </p>
                      </div>
                    </div>

                    {/* Right Actions (unscrolled) */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Bell Button */}
                      <Link
                        href="/notifications"
                        className="relative p-1.5 active:scale-95 transition-transform"
                      >
                        <Bell
                          size={20}
                          className="text-white/95"
                          strokeWidth={1.9}
                        />
                        <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full bg-[#EB4363]" />
                      </Link>

                      {/* Chat Button */}
                      <Link
                        href="/chat"
                        className="relative p-1.5 active:scale-95 transition-transform"
                        aria-label="Chat"
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="translate-y-[1px] text-white/90"
                        >
                          <path
                            d="M3 6.5C3 5.12 4.12 4 5.5 4h10C16.88 4 18 5.12 18 6.5v5C18 12.88 16.88 14 15.5 14H9l-4 3v-2.5C3.9 14.08 3 13.12 3 12V6.5Z"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 14v1.5C8 16.88 9.12 18 10.5 18H15l4 3v-2.5c1.1-.42 2-1.38 2-2.5V11c0-1.38-1.12-2.5-2.5-2.5H18"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <span className="absolute top-[8px] right-[6.5px] w-[7px] h-[7px] rounded-full bg-[#EB4363]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Search Row ── 
            Dihapus translate-y-[1.5px] karena micro-transform sering bikin text blurry/jitter di mobile
          */}
            <div
              className={`flex items-center gap-1 pb-2.5 transition-[padding-top] duration-300 ease-in-out ${
                isScrolled ? "pt-2.5" : "pt-0 translate-y-[1.5px]"
              }`}
            >
              {/* Search Bar */}
              <div className="flex-1 bg-white/95 rounded-lg px-2 py-1.5 flex items-center gap-2.5 shadow-sm">
                <button
                  onClick={openSearch}
                  className="flex-1 flex items-center gap-2.5 min-w-0"
                >
                  <Search
                    size={16}
                    className="text-gray-400 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <AnimatedPlaceholder />
                </button>
              </div>

              {/* Right Actions (scrolled)*/}
              <div
                className="flex-shrink-0 min-w-0 flex items-center justify-end gap-1 overflow-hidden"
                style={{
                  width: isScrolled ? "72px" : "0px",
                  opacity: isScrolled ? 1 : 0,
                  transform: isScrolled ? "scale(1)" : "scale(0.75)",
                  transition:
                    "width 300ms ease-in-out, opacity 300ms ease-in-out, transform 300ms ease-in-out",
                }}
              >
                {/* Bell (scrolled)*/}
                <Link
                  href="/notifications"
                  className="relative p-1.5 flex active:scale-95 transition-transform"
                  tabIndex={isScrolled ? 0 : -1}
                >
                  <Bell size={20} className="text-white/95" strokeWidth={1.9} />
                  <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full bg-[#EB4363]" />
                </Link>

                {/* Chat (scrolled)*/}
                <Link
                  href="/chat"
                  className="relative p-1.5 flex active:scale-95 transition-transform"
                  tabIndex={isScrolled ? 0 : -1}
                  aria-label="Chat"
                >
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="translate-y-[1px] text-white/95"
                  >
                    <path
                      d="M3 6.5C3 5.12 4.12 4 5.5 4h10C16.88 4 18 5.12 18 6.5v5C18 12.88 16.88 14 15.5 14H9l-4 3v-2.5C3.9 14.08 3 13.12 3 12V6.5Z"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 14v1.5C8 16.88 9.12 18 10.5 18H15l4 3v-2.5c1.1-.42 2-1.38 2-2.5V11c0-1.38-1.12-2.5-2.5-2.5H18"
                      fill="rgba(255,255,255,0.12)"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="absolute top-[7px] right-[6.5px] w-[7px] h-[7px] rounded-full bg-[#EB4363]" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        <style jsx>{`
          .gnb-shell {
            /* Ubah dari 'paint style' ke 'layout paint' untuk mengisolasi perubahan width/max-height dari seluruh page */
            contain: layout paint;
            will-change: transform;
          }

          .gnb-fade {
            transition:
              transform 260ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 200ms ease;
            will-change: transform, opacity;
            /* Paksa GPU layer agar transisi translateY mulus */
            transform: translateZ(0);
          }

          @media (prefers-reduced-motion: reduce) {
            .gnb-shell,
            .gnb-shell * {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
