"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useFilterStore } from "@/store/useFilterStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useReviewStore } from "@/store/useReviewStore";
import { Product, Category } from "@/lib/types";
import ProductCard from "./ProductCard";
import ProductImage from "./ProductImage";
import { formatRupiah } from "@/lib/utils";
import {
  ArrowUpDown,
  ArrowDownAZ,
  ArrowUpAZ,
  TrendingDown,
  TrendingUp,
  Star,
} from "lucide-react";

interface ProductGridProps {
  initialCategories?: Category[];
}

/* ── Sort ─────────────────────────────────────────── */
const SORT_OPTIONS = [
  { id: "popular", label: "Terpopuler", Icon: Star },
  { id: "cheapest", label: "Termurah", Icon: TrendingDown },
  { id: "expensive", label: "Termahal", Icon: TrendingUp },
  { id: "az-asc", label: "A–Z", Icon: ArrowDownAZ },
  { id: "az-desc", label: "Z–A", Icon: ArrowUpAZ },
];

function applySort(products: Product[], sort: string): Product[] {
  const arr = [...products];
  switch (sort) {
    case "cheapest":
      return arr.sort((a, b) => a.price - b.price);
    case "expensive":
      return arr.sort((a, b) => b.price - a.price);
    case "az-asc":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "az-desc":
      return arr.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return arr.sort((a, b) => (b.sold || 0) - (a.sold || 0));
  }
}

/* ── Skeletons ────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-layer-xs overflow-hidden flex flex-col h-full">
      <div className="w-full aspect-[3/2] bg-gray-100 skeleton animate-pulse" />
      <div className="p-3 pt-0 flex flex-col flex-1 gap-1.5">
        <div className="mt-2.5 min-h-[2.4rem] flex flex-col justify-center gap-1.5">
          <div className="h-3 w-full bg-gray-100 skeleton rounded-md animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-100 skeleton rounded-md animate-pulse" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <div className="h-4 w-24 bg-gray-100 skeleton rounded-md animate-pulse" />
          <div className="h-3 w-10 bg-gray-100 skeleton rounded-md animate-pulse" />
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100/80">
          <div className="h-2.5 w-10 bg-gray-100 skeleton rounded-md animate-pulse" />
          <div className="h-2.5 w-10 bg-gray-100 skeleton rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function PromoCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[136px] bg-white rounded-xl shadow-layer-xs overflow-hidden">
      <div className="w-full aspect-square bg-gray-100 skeleton animate-pulse" />
      <div className="px-2.5 pb-2.5 pt-1.5 flex flex-col gap-1">
        <div className="h-2.5 w-full bg-gray-100 skeleton rounded animate-pulse" />
        <div className="h-2.5 w-3/4 bg-gray-100 skeleton rounded animate-pulse" />
        <div className="h-3.5 w-16 bg-gray-100 skeleton rounded animate-pulse mt-0.5" />
      </div>
    </div>
  );
}

/* ── Compact Promo Card (horizontal scroll) ────────── */
function PromoCard({ product, index }: { product: Product; index: number }) {
  const { getReviewsForProduct } = useReviewStore();
  const localReviews = getReviewsForProduct(product.id);

  const rawImages = product.images || (product as any).image;
  let productImages: string[] = [];
  if (Array.isArray(rawImages)) {
    productImages = rawImages.flatMap((img) => {
      if (!img || typeof img !== "string") return [];
      if (img.startsWith("data:image") || img.startsWith("http")) return [img];
      return img
        .split("|")
        .filter(
          (i) =>
            i?.trim()?.startsWith("data:image") ||
            i?.trim()?.startsWith("http"),
        );
    });
  } else if (typeof rawImages === "string") {
    productImages = rawImages
      .split("|")
      .map((i) => i?.trim())
      .filter((i) => i && (i.startsWith("data:image") || i.startsWith("http")));
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const specificReviews = localReviews.filter(
    (r) => r.productId === product.id,
  );
  const displayRating =
    specificReviews.length > 0
      ? Number(
          (
            specificReviews.reduce((acc, r) => acc + r.rating, 0) /
            specificReviews.length
          ).toFixed(1),
        )
      : product.rating || 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block flex-shrink-0 w-[136px] group"
    >
      <article className="bg-white rounded-xl shadow-layer-xs hover:shadow-layer-lg transition-all duration-500 active:scale-[0.96] overflow-hidden relative h-full flex flex-col">
        {discount > 0 && (
          <div className="absolute top-0 right-0 z-30 px-2 py-[3px] bg-gradient-to-l from-rose-600 to-rose-500 text-white text-[9px] font-black rounded-bl-xl">
            -{discount}%
          </div>
        )}
        <div className="w-full aspect-[1.1/1] bg-white overflow-hidden flex items-center justify-center">
          <ProductImage
            category={product.category}
            name={product.name}
            variant={index}
            src={productImages[0]}
            className="w-full h-full object-contain scale-[0.82] transition-transform duration-700 group-hover:scale-95"
            style={{} as React.CSSProperties}
          />
        </div>
        <div className="px-2 pb-2 pt-1 flex flex-col flex-1">
          <p className="text-[10px] font-bold text-gray-800 line-clamp-2 leading-tight min-h-[1.8rem]">
            {product.name}
          </p>

          <div className="mt-auto">
            {product.originalPrice && (
              <p className="text-[9px] text-gray-500 line-through leading-none mb-px">
                {formatRupiah(product.originalPrice)}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-black text-emerald-700 tracking-tighter">
                {formatRupiah(product.price)}
              </p>
              <div className="flex items-center gap-0.5">
                <Star size={9} strokeWidth={0} fill="#FBBF24" />
                <span className="text-[9px] text-gray-500 font-semibold">
                  {displayRating}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ── Inline Sticker: Promo (ratio 2.55:1) ─────────── */
// Style: pastel background + blob dekorasi, tidak ada gradient penuh
function PromoInlineBanner() {
  return (
    <div className="relative w-full aspect-[2.55/1] rounded-2xl overflow-hidden bg-[#FEF3E2] shadow-layer-sm">
      {/* Blob dekorasi kanan */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#F5A623]/20" />
      <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-[#D89B2B]/15" />
      <div className="absolute right-10 -bottom-4 w-10 h-10 rounded-full bg-[#F5A623]/10" />

      <div className="absolute inset-0 flex flex-col justify-center px-5">
        <span className="text-[13px] font-black text-[#7A4A00] tracking-tight leading-tight">
          🔥 Lebih Hemat Hari Ini
        </span>
        <p className="text-[10px] text-[#9E6300]/80 font-medium mt-0.5 leading-snug">
          Promo pilihan untukmu · Jangan sampai kehabisan!
        </p>
        <div className="mt-2">
          <span className="inline-block bg-[#D89B2B] text-white text-[9px] font-bold px-2.5 py-1 rounded-full leading-none">
            Lihat semua promo →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Inline Sticker: Info jeda (ratio 2.55:1) ──────── */
// Style: pastel hijau + blob dekorasi, konsisten dengan PromoInlineBanner
function PopularInlineBanner() {
  return (
    <div className="relative w-full aspect-[2.55/1] rounded-2xl overflow-hidden bg-[#E8F5F0] shadow-layer-sm">
      {/* Blob dekorasi kanan */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#048750]/15" />
      <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-[#048750]/10" />
      <div className="absolute right-10 -bottom-4 w-10 h-10 rounded-full bg-[#048750]/08" />

      <div className="absolute inset-0 flex flex-col justify-center px-5">
        <span className="text-[13px] font-black text-[#085041] tracking-tight leading-tight">
          💡 Lagi banyak dibeli
        </span>
        <p className="text-[10px] text-[#085041]/70 font-medium mt-0.5 leading-snug">
          Stok favorit minggu ini · Buruan sebelum habis!
        </p>
        <div className="mt-2">
          <span className="inline-block bg-[#048750] text-white text-[9px] font-bold px-2.5 py-1 rounded-full leading-none">
            Cek selengkapnya →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Empty State ──────────────────────────────────── */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
        <svg
          className="w-7 h-7 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h4 className="text-gray-700 font-bold text-sm">
        Produk Tidak Ditemukan
      </h4>
      <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] leading-snug">
        {message}
      </p>
    </div>
  );
}

/* ── Main Component ───────────────────────────────── */
export default function ProductGrid({
  initialCategories = [],
}: ProductGridProps) {
  const { category } = useFilterStore();
  const { query } = useSearchStore();
  const { fetchReviews, refreshVersion } = useReviewStore();

  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingPromo, setIsLoadingPromo] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);

  const [allSort, setAllSort] = useState("popular");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const isSpecificCategory = category && category !== "all";

  const categories: Category[] = [
    { id: "all", name: "Semua", icon: "LayoutGrid" },
    ...initialCategories,
  ];
  const categoryName =
    categories.find((c) => c.id === category)?.name || "Semua";

  /* Fetch reviews once */
  useEffect(() => {
    fetchReviews().catch(console.error);
  }, []);

  /* Fetch popular products */
  useEffect(() => {
    setIsLoadingPopular(true);
    fetch("/api/public/products?filter=populer")
      .then((r) => r.json())
      .then((d) => setPopularProducts(Array.isArray(d) ? d : []))
      .catch(() => setPopularProducts([]))
      .finally(() => setIsLoadingPopular(false));
  }, [refreshVersion]);

  /* Fetch promo products */
  useEffect(() => {
    setIsLoadingPromo(true);
    fetch("/api/public/products?filter=hemat")
      .then((r) => r.json())
      .then((d) => setPromoProducts(Array.isArray(d) ? d : []))
      .catch(() => setPromoProducts([]))
      .finally(() => setIsLoadingPromo(false));
  }, [refreshVersion]);

  /* Fetch all / category products */
  useEffect(() => {
    setIsLoadingAll(true);
    const params = new URLSearchParams();
    if (isSpecificCategory) params.append("category", category);
    const url = params.toString()
      ? `/api/public/products?${params}`
      : "/api/public/products";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setAllProducts(Array.isArray(d) ? d : []))
      .catch(() => setAllProducts([]))
      .finally(() => setIsLoadingAll(false));
  }, [category, refreshVersion]);

  /* Reset sort on category change */
  useEffect(() => {
    setAllSort("popular");
    setShowSortMenu(false);
  }, [category]);

  /* Close sort menu on outside click */
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

  /* Derived data */
  const filteredQuery = (arr: Product[]) =>
    query
      ? arr.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      : arr;

  // Popular: gunakan popularProducts jika ada, fallback ke allProducts. Maks 6.
  const popularToShow = filteredQuery(
    (popularProducts.length > 0 ? popularProducts : allProducts).slice(0, 6),
  );

  const filteredAll = applySort(filteredQuery(allProducts), allSort);
  const firstChunk = filteredAll.slice(0, 10);
  const restChunk = filteredAll.slice(10);

  const activeSortOption =
    SORT_OPTIONS.find((o) => o.id === allSort) || SORT_OPTIONS[0];

  // Promo section hanya tampil jika ada produk diskon
  const showPromoSection = !isSpecificCategory && promoProducts.length > 0;

  /* ── Render ── */
  return (
    <>
      {/* ══════════════════════════════════════════
          SECTION 1 — Paling Dicari (tab Semua saja)
          Fallback otomatis ke allProducts jika belum ada penjualan
          ══════════════════════════════════════════ */}
      {!isSpecificCategory && (
        <section id="product-grid" className="px-4 pt-5 pb-4">
          {isLoadingPopular ? (
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : popularToShow.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              {popularToShow.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : null}
        </section>
      )}

      {/* ══════════════════════════════════════════
          SECTION 2 — Promo Sticker Carousel + Horizontal Scroll
          ══════════════════════════════════════════ */}
      {!isSpecificCategory && (
        <section className="px-4 mb-5">
          {/* Sticker Carousel — constrained ke product grid width */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar mb-4 snap-x snap-mandatory">
            <div className="flex-shrink-0 w-full snap-center">
              <PromoInlineBanner />
            </div>

            <div className="flex-shrink-0 w-full snap-center">
              <PopularInlineBanner />
            </div>

            {/* spacer kanan */}
            <div className="shrink-0 w-1" />
          </div>

          {/* Horizontal Scroll Products (Promo) */}
          {showPromoSection && (
            <div className="pb-1">
              {isLoadingPromo ? (
                <div
                  className="flex gap-3 overflow-hidden"
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <PromoCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                  {promoProducts.map((product, i) => (
                    <PromoCard key={product.id} product={product} index={i} />
                  ))}

                  {/* spacer kanan */}
                  <div className="shrink-0 w-1" />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════
          SECTION 3 — Semua Produk
          - Tab Semua: tanpa tombol Urutkan, hanya jumlah produk
          - Tab kategori: + tombol Urutkan aktif
          ══════════════════════════════════════════ */}
      <section className="px-4 pt-2 pb-3 min-h-[50vh]">
        {/* Header */}
        <div className="mb-1 flex items-start justify-between px-0.5">
          <div>
            <h2 className="text-[13px] font-black text-gray-800 tracking-tight leading-tight">
              {isSpecificCategory ? categoryName : "Semua Produk"}
            </h2>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5"></p>
          </div>

          {/* Tombol Urutkan — hanya tampil di tab kategori spesifik */}
          {isSpecificCategory && (
            <div className="relative mt-0.5" ref={sortMenuRef}>
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold
                  transition-all duration-200 active:scale-95 ${
                    showSortMenu
                      ? "bg-emerald-600 text-white shadow-layer-md"
                      : "bg-gray-100 text-gray-600"
                  }`}
              >
                <ArrowUpDown size={10} strokeWidth={2.5} />
                <span>Urutkan</span>
                <activeSortOption.Icon
                  size={10}
                  strokeWidth={2}
                  className="opacity-70"
                />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1.5 z-40 bg-white rounded-2xl shadow-layer-xl border border-gray-100 overflow-hidden min-w-[130px]">
                  {SORT_OPTIONS.map((opt) => {
                    const isActive = allSort === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setAllSort(opt.id);
                          setShowSortMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold
                          transition-colors duration-150 text-left ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <opt.Icon
                          size={11}
                          strokeWidth={2.5}
                          className={
                            isActive ? "text-emerald-600" : "text-gray-400"
                          }
                        />
                        {opt.label}
                        {isActive && (
                          <span className="ml-auto text-emerald-500 text-[9px]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Jumlah produk + sort aktif */}
        <p className="text-[10px] text-gray-400 font-medium px-0.5 mb-3">
          {isLoadingAll ? "Memuat..." : `${filteredAll.length} produk`}
          {!isLoadingAll && isSpecificCategory && allSort !== "popular" && (
            <span className="text-emerald-600 ml-1">
              · {activeSortOption.label}
            </span>
          )}
        </p>

        {/* Grid produk */}
        {isLoadingAll ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAll.length === 0 ? (
          <EmptyState message="Coba pilih kategori lain atau cek kata kunci pencarianmu." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              {firstChunk.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            {/* Sticker jeda sudah dipindah ke carousel atas */}

            {restChunk.length > 0 && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                {restChunk.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i + 10}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
