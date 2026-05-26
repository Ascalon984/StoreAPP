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
    <span className="text-gray-400 text-xs font-medium">
      {displayed}
      <span className="inline-block w-[1.5px] h-3 bg-gray-300 ml-[1px] align-middle animate-[blink_1s_step-end_infinite]" />
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isProductDetail = pathname?.startsWith("/product/");
  const isCheckout = pathname === "/checkout";
  const isProfile = pathname === "/profile";
  const isOrders = pathname === "/orders";
  const isWishlist = pathname === "/wishlist";
  const isNotifications = pathname === "/notifications";

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
            if (!prev && y > 30) return true;
            if (prev && y < 8) return false;
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
    isNotifications
  ) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-50 w-full bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46] shadow-sm"
      style={{
        borderBottomLeftRadius: isScrolled ? "0px" : "26px",
        borderBottomRightRadius: isScrolled ? "0px" : "26px",
        transition: "border-radius 250ms ease-in-out",
        willChange: "border-radius",
        boxShadow: isScrolled
          ? "0 10px 24px rgba(0,0,0,0.18)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <header className="w-full px-4 overflow-visible">
        <div className="max-w-container mx-auto">
          {/* ── Greeting Row ── */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isScrolled
                ? "grid-rows-[0fr] opacity-0"
                : "grid-rows-[1fr] opacity-100"
            }`}
          >
            {/* Tambahkan min-h-0 di sini agar grid bisa collapse sempurna ke 0 */}
            <div className="overflow-hidden min-h-0">
              {/* Ganti mb-2 menjadi pb-2 pada wrapper ini, margin membuat animasi grid patah */}
              <div className="pb-2">
                <div className="flex items-center justify-between h-12 pt-0.5">
                  {/* Avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Link
                      href="/profile"
                      className="active:scale-95 transition-transform flex-shrink-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
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
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Greeting */}
                    <div className="flex flex-col min-w-0">
                      <p className="text-white/60 text-[11px] font-medium leading-none">
                        {getGreeting()}
                      </p>
                      <p className="text-white text-sm font-semibold truncate mt-0.5">
                        {mockUser.name.split(" ")[0]}
                      </p>
                    </div>
                  </div>

                  {/* Bell (unscrolled) */}
                  <Link
                    href="/notifications"
                    className="relative p-1.5 active:scale-95 transition-transform flex-shrink-0"
                  >
                    <Bell size={20} className="text-white" strokeWidth={2} />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Search Row ── */}
          <div
            className={`flex items-center gap-2 pb-2.5 transition-all duration-300 ease-in-out ${
              isScrolled ? "pt-2.5" : "pt-0"
            }`}
          >
            {/* Search Bar */}
            <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-xl px-2 py-1.5 flex items-center gap-2.5 shadow-sm">
              <button
                onClick={openSearch}
                className="flex-1 flex items-center gap-2.5 min-w-0"
              >
                <Search
                  size={18}
                  className="text-gray-500 flex-shrink-0"
                  strokeWidth={2.5}
                />
                <AnimatedPlaceholder />
              </button>
            </div>

            {/* Bell (scrolled) */}
            <div
              className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
                isScrolled
                  ? "w-8 opacity-100 scale-100"
                  : "w-0 opacity-0 scale-75"
              }`}
            >
              <Link
                href="/notifications"
                className="relative p-1.5 flex active:scale-95 transition-transform"
                tabIndex={isScrolled ? 0 : -1}
              >
                <Bell size={20} className="text-white" strokeWidth={2} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400" />
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
