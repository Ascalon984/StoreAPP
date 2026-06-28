"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Bell, Star, TrendingDown, TrendingUp } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useFilterStore } from "@/store/useFilterStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser, getGreeting } from "@/store/useUserStore";

const SORT_OPTIONS = [
  { id: "popular", label: "Terpopuler", Icon: Star },
  { id: "cheapest", label: "Termurah", Icon: TrendingDown },
  { id: "expensive", label: "Termahal", Icon: TrendingUp },
];

const SEARCH_PLACEHOLDERS = [
  "Cari produk favoritmu...",
  "Cari kategori...",
  "Cari merek terkenal...",
  "Cari promo hari ini...",
];

function AnimatedPlaceholder() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = SEARCH_PLACEHOLDERS[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, displayed.length + 1));
      }, 60);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, displayed.length - 1));
      }, 35);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setPhraseIndex((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, phraseIndex]);

  return (
    <span className="text-gray-400 text-[12px] font-normal tracking-[-0.01em]">
      {displayed}
      <span className="inline-block w-[1.5px] h-3 bg-gray-300 ml-[1px] align-middle animate-[blink_1s_step-end_infinite]" />
    </span>
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

  // ─── Scroll Handler (SIMPLIFIED & STABLE) ───
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;

          setIsScrolled((prev) => {
            // Hysteresis: collapse di >50, expand hanya di <10
            // Gap 40px mencegah jitter tanpa perlu skipExpandCheck
            if (!prev && y > 60) return true;
            if (prev && y < 15) return false;
            return prev; // zona mati (10–50): pertahankan state
          });

          ticking = false;
        });
        ticking = true;
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
    <div
      className="sticky top-0 z-50 w-full bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46]"
      style={{
        borderBottomLeftRadius: isScrolled ? "0px" : "16px",
        borderBottomRightRadius: isScrolled ? "0px" : "16px",
        transition: "border-radius 250ms ease-in-out",
        willChange: "border-radius",
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
            style={{
              height: isScrolled ? "0px" : "50px",
              overflow: "hidden",
              transition: "height 260ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                transform: isScrolled ? "translateY(-50px)" : "translateY(0px)",
                opacity: isScrolled ? 0 : 1,
                willChange: "transform, opacity",
                transition:
                  "transform 260ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease",
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
                        <span className="text-emerald-700 text-xs font-bold">
                          {mockUser.name
                            .split(" ")
                            .map((n: any) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-col min-w-0">
                    <p className="text-white/75 text-[10.5px] font-medium leading-none">
                      {getGreeting()}
                    </p>
                    <p className="text-white text-sm font-semibold tracking-[-0.01em] truncate mt-0.5">
                      {mockUser.name.split(" ")[0]}
                    </p>
                  </div>
                </div>

                {/* Right Actions (unscrolled) */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {/* Bell Button */}
                  <Link
                    href="/notifications"
                    className="relative p-1.5 active:scale-95 transition-transform"
                  >
                    <Bell
                      size={19}
                      className="text-white/95"
                      strokeWidth={1.9}
                    />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400" />
                  </Link>

                  {/* Chat Button */}
                  <Link
                    href="/chat"
                    className="relative p-1.5 active:scale-95 transition-transform"
                    aria-label="Chat"
                  >
                    <svg
                      width="20"
                      height="20"
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
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <span className="absolute top-[5.5px] right-[5.5px] w-1.5 h-1.5 rounded-full bg-rose-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Search Row ── */}
          <div
            className={`flex items-center gap-1 pb-2.5 transition-[padding] duration-300 ease-in-out ${
              isScrolled ? "pt-2.5" : "pt-0"
            }`}
          >
            {/* Search Bar */}
            <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1.5 flex items-center gap-2.5 shadow-sm">
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
              className={`flex-shrink-0 flex items-center justify-end gap-0.5 overflow-hidden transition-[width,opacity,transform] duration-300 ease-in-out ${
                isScrolled
                  ? "w-[72px] opacity-100 scale-100"
                  : "w-0 opacity-0 scale-75"
              }`}
            >
              {/* Bell (scrolled)*/}
              <Link
                href="/notifications"
                className="relative p-1.5 flex active:scale-95 transition-transform"
                tabIndex={isScrolled ? 0 : -1}
              >
                <Bell size={19} className="text-white/95" strokeWidth={1.9} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400" />
              </Link>

              {/* Chat (scrolled)*/}
              <Link
                href="/chat"
                className="relative p-1.5 flex active:scale-95 transition-transform"
                tabIndex={isScrolled ? 0 : -1}
                aria-label="Chat"
              >
                <svg
                  width="20"
                  height="20"
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
                <span className="absolute top-[5px] right-[5px] w-1.5 h-1.5 rounded-full bg-rose-400" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
