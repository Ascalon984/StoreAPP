"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchStore } from "@/store/useSearchStore";
import { useReviewStore } from "@/store/useReviewStore";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import ProductImage from "./ProductImage";
import { formatRupiah } from "@/lib/utils";
import { mockHighlightProducts } from "@/lib/data";
import {
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Star,
  Flame,
  ChevronRight,
} from "lucide-react";

/* ── Sort ─────────────────────────────────────────── */
const SORT_OPTIONS = [
  { id: "popular", label: "Terpopuler", Icon: Star },
  { id: "cheapest", label: "Termurah", Icon: TrendingDown },
  { id: "expensive", label: "Termahal", Icon: TrendingUp },
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
function CardSkeleton({ isTall }: { isTall?: boolean } = {}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div
        className={`w-full ${isTall ? "aspect-[4/5]" : "aspect-[3/2]"} bg-gray-100 skeleton animate-pulse`}
      />
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

/* ── Highlight Card Skeleton ──────────────────────── */
function HighlightCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[210px] bg-white rounded-xl shadow-sm overflow-hidden flex flex-row items-center border border-gray-100/50 h-[82px]">
      <div className="w-[76px] h-full bg-gray-100 skeleton animate-pulse flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2 px-2.5 py-2">
        <div className="h-2.5 w-full bg-gray-100 skeleton rounded animate-pulse" />
        <div className="h-2.5 w-3/4 bg-gray-100 skeleton rounded animate-pulse" />
        <div className="h-2 w-1/2 bg-gray-100 skeleton rounded animate-pulse" />
      </div>
    </div>
  );
}

/* ── Highlight Card ───────────────────────────────── */
function HighlightCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
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

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const isHabis = product.stock === 0;

  const cardContent = (
    <article
      className={`bg-white rounded-lg border border-black/[0.04] overflow-hidden relative flex flex-row items-stretch border border-gray-100/50 h-[82px] transition-transform duration-200 ${isHabis ? "" : "active:scale-97"}`}
    >
      {/* Gambar full-bleed kiri */}
      <div className="w-[72px] flex-shrink-0 self-stretch bg-gray-50 relative">
        <ProductImage
          category={product.category}
          name={product.name}
          variant={index}
          src={productImages[0]}
          className={`w-full h-full object-cover ${isHabis ? "grayscale opacity-60" : ""}`}
          style={{} as React.CSSProperties}
        />
        {isHabis && (
          <img
            src="/icons/habis.png"
            alt="Habis"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 p-1"
          />
        )}
      </div>

      {/* Konten kanan */}
      <div
        className={`flex-1 min-w-0 flex flex-col justify-between pl-1.5 pr-1 py-2 ${isHabis ? "opacity-60" : ""}`}
      >
        <div className="min-h-[28px]">
          <p className="text-[10px] font-normal text-gray-700 line-clamp-2 leading-[1.10] tracking-[0.005em]">
            {product.name}
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          {hasDiscount && (
            <p className="text-[9px] text-gray-400 line-through leading-none tracking-[0.010em]">
              {formatRupiah(product.originalPrice!)}
            </p>
          )}

          <p className="mt-[1px] text-[11.5px] font-semibold text-gray-700 tracking-[0.015em] leading-none">
            {formatRupiah(product.price)}
          </p>
        </div>
      </div>
    </article>
  );

  if (isHabis) {
    return (
      <div className="block flex-shrink-0 w-[176px] cursor-not-allowed select-none">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block flex-shrink-0 w-[176px] group"
    >
      {/* Badge timer */}
      <div className="absolute top-1 right-1.5 z-10">
        <span className="block rounded-bl-xl rounded-tr-lg px-1.5 py-[4px] text-[9.5px] font-medium tracking-[0.008em] leading-none text-white bg-gradient-to-l from-orange-600 to-amber-500">
          3 Hari Lagi
        </span>
      </div>
      {cardContent}
    </Link>
  );
}

/* ── Highlight Section ────────────────────────────── */
function HighlightSection({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [thumbPixelWidth, setThumbPixelWidth] = useState(12);

  const maxItems = 20;
  const displayProducts = products.slice(0, maxItems);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateIndicator = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;

      // track indicator width (w-7 = 28px)
      const trackWidth = 28;

      // tidak bisa discroll
      if (maxScroll <= 0) {
        setThumbLeft(0);
        setThumbPixelWidth(trackWidth);
        return;
      }

      // rasio area visible
      const visibleRatio = el.clientWidth / el.scrollWidth;

      // ukuran thumb minimum
      const thumbWidth = Math.max(trackWidth * visibleRatio, 8);

      // area gerak thumb
      const movableArea = trackWidth - thumbWidth;

      // progress scroll
      const progress = el.scrollLeft / maxScroll;

      // posisi real
      const left = movableArea * progress;

      setThumbPixelWidth(thumbWidth);
      setThumbLeft(left);
    };

    updateIndicator();

    el.addEventListener("scroll", updateIndicator, { passive: true });
    window.addEventListener("resize", updateIndicator);

    return () => {
      el.removeEventListener("scroll", updateIndicator);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [displayProducts.length]);

  return (
    <section className="mb-1">
      {/* ── Header emerald ── */}
      <div className="mx-1.5 rounded-t-lg bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46] px-3 pt-1.5 pb-1.5 relative overflow-hidden">
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-white/95 leading-none">
              Promo Terbatas
            </h3>
          </div>

          <div className="h-[21px] flex items-end">
            <div className="w-7 h-[2.5px] rounded-full bg-white/30 overflow-hidden relative flex-shrink-0">
              <div
                className="absolute inset-y-0 rounded-full bg-white/85 transition-[left,width] duration-150"
                style={{
                  width: `${thumbPixelWidth}px`,
                  left: `${thumbLeft}px`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Cards: scroll bebas, background transparan ── */}
      <div className="mt-0.5 px-1.5">
        {isLoading ? (
          <div className="flex gap-2.5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <HighlightCardSkeleton key={i} />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <>
            <div
              ref={scrollRef}
              className="flex gap-1 overflow-x-auto hide-scrollbar snap-x snap-proximity"
            >
              {displayProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 snap-start w-[176px]"
                >
                  <HighlightCard product={product} index={i} />
                </div>
              ))}
              <div className="shrink-0 w-1" />
            </div>

            {/* Fade peek kanan */}
            <div
              className="
                absolute
                right-[4px]
                top-[40px]
                h-[84px]
                w-4
                pointer-events-none
              "
              style={{
                background:
                  "linear-gradient(to right, rgba(245,245,245,0), rgba(245,245,245,0.96))",
                filter: "blur(0.1px)",
              }}
            />
          </>
        ) : null}
      </div>
      <div className="mx-4 mt-2 h-px" />
    </section>
  );
}

/* ── Empty State ──────────────────────────────────── */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
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
export default function ProductGrid() {
  const { query } = useSearchStore();
  const { fetchReviews, refreshVersion } = useReviewStore();

  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);

  /* ── Highlight state ── */
  const [highlightProducts, setHighlightProducts] = useState<Product[]>([]);
  const [isLoadingHighlight, setIsLoadingHighlight] = useState(true);

  /* Fetch reviews once */
  useEffect(() => {
    fetchReviews().catch(console.error);
  }, []);

  /* Fetch highlight products — mock for now */
  useEffect(() => {
    setIsLoadingHighlight(true);
    // Simulate network delay; replace with real API call later
    const timer = setTimeout(() => {
      // Filter hanya produk yang punya diskon
      const discounted = mockHighlightProducts.filter(
        (p) => p.originalPrice && p.originalPrice > p.price,
      );
      setHighlightProducts(discounted);
      setIsLoadingHighlight(false);
    }, 900);
    return () => clearTimeout(timer);

    // TODO: Replace with real API:
    // fetch("/api/public/products?filter=highlight")
    //   .then((r) => r.json())
    //   .then((d) => setHighlightProducts(Array.isArray(d) ? d : []))
    //   .catch(() => setHighlightProducts([]))
    //   .finally(() => setIsLoadingHighlight(false));
  }, [refreshVersion]);

  /* Fetch popular products */
  useEffect(() => {
    setIsLoadingPopular(true);
    fetch("/api/public/products?filter=populer")
      .then((r) => r.json())
      .then((d) => setPopularProducts(Array.isArray(d) ? d : []))
      .catch(() => setPopularProducts([]))
      .finally(() => setIsLoadingPopular(false));
  }, [refreshVersion]);

  /* Fetch all products (home view — no category filter) */
  useEffect(() => {
    setIsLoadingAll(true);
    fetch("/api/public/products")
      .then((r) => r.json())
      .then((d) => setAllProducts(Array.isArray(d) ? d : []))
      .catch(() => setAllProducts([]))
      .finally(() => setIsLoadingAll(false));
  }, [refreshVersion]);

  /* Derived data */
  const filteredQuery = (arr: Product[]) =>
    query
      ? arr.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      : arr;

  const popularToShow = filteredQuery(
    (popularProducts.length > 0 ? popularProducts : allProducts).slice(0, 6),
  );

  const filteredAll = applySort(filteredQuery(allProducts), "popular");

  /* ── Render ── */
  return (
    <div id="product-area" className="scroll-mt-40">
      {/* ══════════════════════════════════════════
          SECTION 0 — HIGHLIGHT / PROMO CARD
          ══════════════════════════════════════════ */}
      <HighlightSection
        products={highlightProducts}
        isLoading={isLoadingHighlight}
      />

      {/* ══════════════════════════════════════════
          SECTION 1 — Paling Dicari
          ══════════════════════════════════════════ */}
      <section id="product-grid" className="px-1.5 pt-2 pb-4">
        <div className="pt-1 mb-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[13px] font-bold tracking-[0.03em] text-gray-700">
              TERLARIS
            </h2>

            <Link
              href="/products/popular"
              className="flex items-center gap-0.5 text-[11.5px] font-semibold text-emerald-700 active:scale-95 transition-transform -translate-x-1"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        {isLoadingPopular ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : popularToShow.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            {popularToShow.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : null}
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — Semua Produk
          ══════════════════════════════════════════ */}
      <section className="px-1.5 pb-3 min-h-[50vh]">
        <div className="pt-2 mb-2">
          <div className="flex items-center justify-between px-0.5 mb-1.5">
            <h2 className="text-[13px] font-bold tracking-[0.03em] text-gray-700">
              SEMUA PRODUK
            </h2>
          </div>
        </div>

        <div>
          {isLoadingAll ? (
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={`left-${i}`} isTall={i === 1} />
                ))}
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={`right-${i}`} isTall={false} />
                ))}
              </div>
            </div>
          ) : filteredAll.length === 0 ? (
            <EmptyState message="Coba cek kata kunci pencarianmu." />
          ) : (
            <div className="flex items-start gap-2">
              {/* Kolom Kiri */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {filteredAll
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
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {filteredAll
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
      </section>
    </div>
  );
}
