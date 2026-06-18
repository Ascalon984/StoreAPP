"use client";

import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  SlidersHorizontal,
  Star,
  TrendingDown,
  TrendingUp,
  Search,
} from "lucide-react";
import { Product, Category } from "@/lib/types";
import { useReviewStore } from "@/store/useReviewStore";
import { useSearchStore } from "@/store/useSearchStore";
import ProductCard from "./ProductCard";

/* ── Sort ─────────────────────────────────────────── */
const SORT_OPTIONS = [
  { id: "popular", label: "Terpopuler", Icon: Star },
  { id: "cheapest", label: "Termurah", Icon: TrendingDown },
  { id: "expensive", label: "Termahal", Icon: TrendingUp },
];

/* ── Sub-Category Chips ───────────────────────────── */
const CATEGORY_CHIPS: Record<string, string[]> = {
  elektronik: ["Semua", "Smartphone", "Laptop", "Audio", "Gaming", "Aksesoris"],
  fashion: ["Semua", "Pria", "Wanita", "Sepatu", "Tas", "Aksesoris"],

  perabotan: [
    "Semua",
    "Dapur",
    "Dekorasi",
    "Pembersih",
    "Penyimpanan",
    "Peralatan",
  ],

  kesehatan: [
    "Semua",
    "Skincare",
    "Makeup",
    "Vitamin",
    "Parfum",
    "Perawatan Tubuh",
  ],

  hiburan: ["Semua", "Streaming", "Musik", "Film", "Anime", "Subscription"],

  game: [
    "Semua",
    "Mobile Legends",
    "Free Fire",
    "PUBG Mobile",
    "Genshin Impact",
    "Valorant",
  ],
  produktivitas: ["Semua", "Office", "Desain", "Meeting", "Cloud", "AI Tools"],
  otomotif: [
    "Semua",
    "Suku Cadang",
    "Aksesoris",
    "Perawatan",
    "Riding Gear",
    "Tools",
  ],
};

function applySort(products: Product[], sort: string): Product[] {
  const arr = [...products];
  switch (sort) {
    case "cheapest":
      return arr.sort((a, b) => a.price - b.price);
    case "expensive":
      return arr.sort((a, b) => b.price - a.price);
    default:
      return arr.sort((a, b) => (b.sold || 0) - (a.sold || 0));
  }
}

/* ── Skeletons ────────────────────────────────────── */
function CardSkeleton({ isTall }: { isTall?: boolean } = {}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div
        className={`w-full ${isTall ? "aspect-[4/5]" : "aspect-[3/2]"} bg-gray-100 animate-pulse`}
      />
      <div className="p-3 pt-0 flex flex-col flex-1 gap-1.5">
        <div className="mt-2.5 min-h-[2.4rem] flex flex-col justify-center gap-1.5">
          <div className="h-3 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-100 rounded-md animate-pulse" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <div className="h-4 w-24 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-3 w-10 bg-gray-100 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100/80">
          <div className="h-2.5 w-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-2.5 w-10 bg-gray-100 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ── Empty State ──────────────────────────────────── */
function EmptyState({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-6 text-center">
      <Image
        src="/illustrations/Not Found Sub Category.png"
        alt="Produk tidak ditemukan"
        width={180}
        height={180}
        priority
        className="w-[220px] h-auto select-none pointer-events-none"
      />

      <h4 className="mt-3 text-gray-800 font-bold text-sm">
        Produk Belum Tersedia
      </h4>

      <p className="mt-2 text-[12px] leading-relaxed text-gray-500 max-w-[260px]">
        Saat ini belum ada produk{" "}
        <span className="font-semibold text-gray-700">{category}</span> yang
        tersedia.
      </p>
    </div>
  );
}

/* ── Props ────────────────────────────────────────── */
interface CategoryProductPageProps {
  categorySlug: string;
  initialCategories?: Category[];
}

/* ── Main Component ───────────────────────────────── */
export default function CategoryProductPage({
  categorySlug,
  initialCategories = [],
}: CategoryProductPageProps) {
  const router = useRouter();
  const { fetchReviews, refreshVersion } = useReviewStore();
  const { query, openSearch } = useSearchStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [activeChip, setActiveChip] = useState("Semua");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Resolve category name from slug
  const categoryName =
    initialCategories.find((c) => c.id === categorySlug)?.name ??
    categorySlug.replace(/-/g, " ");

  const chips = CATEGORY_CHIPS[categorySlug] ?? null;

  /* ── Scroll listener for sticky header shadow ── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Close sort menu on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(e.target as Node)
      ) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Fetch reviews once ── */
  useEffect(() => {
    fetchReviews().catch(console.error);
  }, []);

  /* ── Fetch products for this category ── */
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ category: categorySlug });
    fetch(`/api/public/products?${params}`)
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [categorySlug, refreshVersion]);

  /* ── Derived data ── */
  const filteredBySearch = query
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : products;

  const filteredByChip =
    activeChip === "Semua"
      ? filteredBySearch
      : filteredBySearch.filter((p) =>
          p.name.toLowerCase().includes(activeChip.toLowerCase()),
        );

  const sorted = applySort(filteredByChip, sort);

  const activeSortOption =
    SORT_OPTIONS.find((o) => o.id === sort) || SORT_OPTIONS[0];

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#f8faf8]">
      {/* ── Sticky Header ── */}
      <div
        className="sticky top-0 z-50 bg-white transition-shadow duration-300"
        style={{
          boxShadow: isScrolled
            ? "0 2px 10px rgba(0,0,0,0.06)"
            : "0 1px 0 rgba(0,0,0,0.06)",
        }}
      >
        {/* Back row */}
        <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5">
          <button
            onClick={() => router.back()}
            className="
            flex items-center justify-center
            w-8 h-8
            text-gray-700
            active:scale-90
            transition-all duration-150
            flex-shrink-0
          "
            aria-label="Kembali"
          >
            <ChevronLeft size={23} strokeWidth={2.5} />
          </button>

          <div className="flex-1 min-w-0 -ml-1">
            <h1 className="text-[15px] font-bold text-gray-800 tracking-tight capitalize truncate">
              {categoryName}
            </h1>
          </div>

          <button
            onClick={openSearch}
            className="
            flex items-center justify-center
            w-8 h-8
            text-gray-600
            active:scale-90
            transition-all duration-150
            flex-shrink-0
          "
            aria-label="Cari"
          >
            <Search size={19} strokeWidth={2.4} />
          </button>
        </div>

        {/* Sub-category chips + sort */}
        {categorySlug !== "listrik" && (
          <div className="flex items-center gap-2 px-4 py-2">
            {/* Chip scroll area */}
            {chips ? (
              <div className="relative flex-1 min-w-0">
                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pr-2">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setActiveChip(chip)}
                      className={`
                        flex-shrink-0
                        h-7 px-3
                        rounded-full
                        text-[10px]
                        font-semibold
                        tracking-tight
                        border
                        transition-all duration-200
                        active:scale-[0.97]
                        ${
                          activeChip === chip
                            ? `bg-emerald-600 border-emerald-600 text-white`
                            : `bg-white/90 border-gray-300 text-gray-600`
                        }
                      `}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                {/* Fade right */}
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/60 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Sort button */}
            <div className="relative flex-shrink-0" ref={sortMenuRef}>
              <div className="bg-white rounded-xl">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all
                  ${showSortMenu ? "bg-emerald-600 text-white" : "text-gray-600"}`}
                >
                  <SlidersHorizontal size={18} strokeWidth={2.2} />
                </button>
              </div>

              {showSortMenu && (
                <div
                  className="
        absolute right-0 top-full mt-1.5 z-50
        bg-white rounded-xl overflow-hidden min-w-[148px]
        shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]
      "
                >
                  {SORT_OPTIONS.map((opt) => {
                    const isActive = sort === opt.id;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSort(opt.id);
                          setShowSortMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        {/* ICON BOX (ACTIVE STATE VISUAL) */}
                        <div
                          className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors
                ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
                        >
                          <opt.Icon size={14} strokeWidth={2} />
                        </div>

                        {/* LABEL */}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Active filter badge (jika search aktif) ── */}
      {query && (
        <div className="px-4 py-2 flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500 font-medium">
            Hasil pencarian:
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            &quot;{query}&quot;
          </span>
        </div>
      )}

      {/* ── Product Grid ── */}
      <div className="px-2 pt-3 pb-28">
        {isLoading ? (
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={`left-${i}`} isTall={i === 1} />
              ))}
            </div>
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={`right-${i}`} />
              ))}
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            category={activeChip === "Semua" ? categoryName : activeChip}
          />
        ) : (
          <div className="flex items-start gap-3">
            {/* Kolom Kiri */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {sorted
                .filter((_, i) => i % 2 === 0)
                .map((product, idx) => {
                  const globalIndex = idx * 2;
                  const isTall = globalIndex === 2;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={globalIndex}
                      isTall={isTall}
                    />
                  );
                })}
            </div>

            {/* Kolom Kanan */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {sorted
                .filter((_, i) => i % 2 === 1)
                .map((product, idx) => {
                  const globalIndex = idx * 2 + 1;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={globalIndex}
                      isTall={false}
                    />
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
