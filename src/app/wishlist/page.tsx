"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowRight,
  Bookmark,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/lib/types";
import { useToastStore } from "@/store/useToastStore";

type SortOption = "Semua" | "Terbaru" | "Terlama";

// ─────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────
function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 pt-20 pb-8 text-center">
      <div className="w-32 h-32 mb-6">
        <svg
          viewBox="0 0 144 144"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <circle cx="72" cy="72" r="64" fill="#F0FDF4" />
          <circle
            cx="72"
            cy="72"
            r="52"
            stroke="#D1FAE5"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="30" cy="44" r="5" fill="#A7F3D0" opacity="0.7" />
          <circle cx="114" cy="44" r="5" fill="#A7F3D0" opacity="0.7" />
          <path
            d="M72 100 C72 100 38 76 38 52 C38 40 47.5 31 59 31 C65 31 70 34 72 38.5 C74 34 79 31 85 31 C96.5 31 106 40 106 52 C106 76 72 100 72 100 Z"
            fill="#ECFDF5"
            stroke="#065F46"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M72 92 C72 92 46 74 46 56 C46 47 52.5 40 61 40 C65.5 40 69 42.5 72 46 C75 42.5 78.5 40 83 40 C91.5 40 98 47 98 56 C98 74 72 92 72 92 Z"
            fill="#BBF7D0"
            opacity="0.45"
          />
        </svg>
      </div>
      <h2 className="text-[18px] font-extrabold text-gray-900 tracking-tight mb-2">
        Belum ada produk favorit
      </h2>
      <p className="text-[13px] text-gray-500 font-normal leading-relaxed mb-8 max-w-[230px]">
        Tambahkan produk yang kamu suka untuk disimpan di sini
      </p>
      <button
        onClick={onExplore}
        className="flex items-center gap-2 px-7 py-3.5 bg-emerald-700 text-white rounded-full
          text-[13px] font-bold shadow-[0_4px_14px_rgba(6,95,70,0.3)]
          active:scale-[0.96] transition-all duration-200 hover:bg-emerald-600"
      >
        Jelajahi Produk
        <ArrowRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
//  EMPTY SEARCH STATE
// ─────────────────────────────────────────
function EmptySearch({ keyword }: { keyword: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-12 pb-10 text-center">
      <img
        src="/illustrations/Favorit Product Not Found.svg"
        alt="Produk favorit tidak ditemukan"
        className="w-52 h-52 object-contain -translate-x-1"
      />

      <h2 className="mt-1 text-[17px] font-bold text-gray-800 tracking-tight">
        Produk tidak ditemukan
      </h2>

      <p className="mt-2 text-[13px] text-gray-500 leading-relaxed max-w-[260px]">
        Tidak ada produk favorit yang cocok dengan
      </p>

      <div className="mt-2 px-3 py-1 rounded-full bg-gray-100 text-[12px] font-semibold text-gray-700">
        "{keyword}"
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  PRODUCT ROW
// ─────────────────────────────────────────
function ProductRow({
  product,
  index,
  isFirst,
  onAddToCart,
  onRemoveFromWishlist,
}: {
  product: Product;
  index: number;
  isFirst: boolean;
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (id: string) => void;
}) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  return (
    <>
      {!isFirst && <div className="h-px bg-gray-200/90 ml-[92px] mr-4" />}

      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        {/* Image */}
        <Link
          href={`/product/${product.slug}`}
          className="relative flex-shrink-0 w-[72px] h-[72px] rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100"
        >
          <div className="w-full h-full p-1.5">
            <ProductImage
              category={product.category}
              name={product.name}
              variant={index}
              src={product.images?.[0]}
              className="w-full h-full object-contain"
            />
          </div>

          {discount > 0 && (
            <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-bold rounded-br-lg z-10">
              -{discount}%
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/product/${product.slug}`} className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-800 leading-tight line-clamp-2 tracking-tight">
                {product.name}
              </p>
            </Link>

            {/* Heart */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromWishlist(product.id);
              }}
              className="flex-shrink-0 w-7 h-7 flex items-start justify-center pt-0.5 text-red-400 active:scale-90 transition-transform"
              aria-label="Hapus dari favorit"
            >
              <Heart size={18} strokeWidth={2} fill="currentColor" />
            </button>
          </div>

          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex flex-col justify-end min-h-[32px]">
              {product.originalPrice && (
                <p className="mb-1 text-[11px] text-gray-400 line-through font-normal leading-none">
                  {formatRupiah(product.originalPrice)}
                </p>
              )}

              <p className="text-[15px] font-extrabold text-emerald-700 tracking-tight leading-none">
                {formatRupiah(product.price)}
              </p>
            </div>

            {/* Cart */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="flex-shrink-0 p-1 text-emerald-700 active:scale-90 transition-transform"
              aria-label="Tambah ke keranjang"
            >
              <ShoppingBag size={18} strokeWidth={2.3} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────
function SkeletonList() {
  return (
    <div className="mx-2 mt-5 bg-white rounded-xl shadow-sm overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          {i !== 0 && <div className="h-px bg-gray-100 mx-4" />}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-[52px] h-[52px] rounded-xl skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded skeleton w-36" />
              <div className="h-3.5 rounded skeleton w-24" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="w-8 h-8 rounded-xl skeleton" />
              <div className="h-7 w-16 rounded-xl skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────
export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItems } = useWishlistStore();
  const { addItem: addCartItem } = useCartStore();
  const { showToast } = useToastStore();

  const [activeSort, setActiveSort] = useState<SortOption>("Semua");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  const sortOptions: SortOption[] = ["Semua", "Terbaru", "Terlama"];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Click outside to close filter dropdown
  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  // Scroll detection for header shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Derived data ──

  // Search filtering
  const searchFiltered = items.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Sort
  const sortedItems = (() => {
    switch (activeSort) {
      case "Terbaru":
        return [...searchFiltered].reverse();
      case "Terlama":
        return [...searchFiltered];
      default:
        return searchFiltered;
    }
  })();

  // ── Handlers ──
  const handleAddToCart = (product: Product) => {
    addCartItem(product);
    showToast("Ditambahkan ke keranjang 🛒", "success");
  };

  const handleRemoveFromWishlist = useCallback(
    (id: string) => {
      const product = items.find((p) => p.id === id);
      removeItems([id]);
      if (product) {
        showToast(`"${product.name}" dihapus`);
      }
    },
    [items, removeItems, showToast],
  );

  const handleSortSelect = (option: SortOption) => {
    setActiveSort(option);
    setFilterOpen(false);
  };

  // ── Render content ──
  const renderContent = () => {
    if (items.length === 0)
      return <EmptyState onExplore={() => router.push("/")} />;

    if (searchFiltered.length === 0 && search) {
      return <EmptySearch keyword={search} />;
    }

    return (
      <div className="bg-white">
        {sortedItems.map((product, i) => (
          <ProductRow
            key={product.id}
            product={product}
            index={i}
            isFirst={i === 0}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        ))}
      </div>
    );
  };

  const isFilterActive = activeSort !== "Semua";

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-50">
        <div
          className="bg-emerald-700 rounded-b-[17px] pb-2.5"
          style={{
            boxShadow: isScrolled
              ? "0 10px 24px rgba(0,0,0,0.18)"
              : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "box-shadow 250ms ease-in-out",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          {/* Title */}
          <div className="flex items-center justify-center px-4 h-8 pt-0.5">
            <span className="text-[14px] font-bold text-white leading-none">
              Favorit Saya
            </span>
          </div>

          {/* Search + Sort Dropdown */}
          <div className="px-4 mt-1 pb-1 -mb-0.5 pt-1">
            <div className="flex items-center gap-2">
              {/* Search Box */}
              <div className="group flex-1 relative">
                <Search
                  size={16}
                  strokeWidth={2.2}
                  className="
                  absolute left-3 top-1/2 -translate-y-1/2
                  z-10
                  text-white/70
                  pointer-events-none
                  transition-colors duration-200
                  group-focus-within:text-gray-400
                "
                />
                <input
                  type="text"
                  placeholder="Cari produk favorit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-white/50 text-[13px] font-medium ring-1 ring-white/10 outline-none transition-all duration-200 focus:bg-white/95 focus:text-gray-800 focus:placeholder:text-gray-400 focus:ring-white/30"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <X size={10} strokeWidth={2.5} className="text-white/80" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown Button */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`
                    h-9 px-3 rounded-xl flex items-center gap-1.5
                    text-[12px] font-semibold transition-all duration-200
                    ${
                      filterOpen || isFilterActive
                        ? "bg-white text-emerald-800 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                        : "bg-white/10 text-white/80 ring-1 ring-white/10 backdrop-blur-md"
                    }
                  `}
                >
                  <SlidersHorizontal size={16} strokeWidth={2.2} />
                  {isFilterActive && (
                    <span className="text-[11px]">{activeSort}</span>
                  )}
                </button>

                {/* Dropdown */}
                {filterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.04] overflow-hidden z-50 dropdown-enter">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSortSelect(option)}
                        className={`
                          w-full px-4 py-2.5 text-left text-[13px] font-semibold transition-colors
                          ${
                            option === activeSort
                              ? "text-emerald-700 bg-emerald-50"
                              : "text-gray-700 hover:bg-gray-50"
                          }
                        `}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVE SORT INDICATOR ── */}
      {mounted && items.length > 0 && isFilterActive && (
        <div className="flex items-center justify-center gap-2 pt-3 pb-1 px-4">
          <span className="text-[11px] font-semibold text-gray-400">
            Urutkan: {activeSort}
          </span>
          <button
            onClick={() => setActiveSort("Semua")}
            className="text-[11px] font-semibold text-emerald-700 underline underline-offset-2"
          >
            Reset
          </button>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="pt-4 pb-6">
        {!mounted ? <SkeletonList /> : renderContent()}
      </div>

      <style jsx>{`
        .skeleton {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .dropdown-enter {
          animation: dropdownIn 0.15s ease-out;
        }
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
