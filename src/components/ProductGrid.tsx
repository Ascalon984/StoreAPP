"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchStore } from "@/store/useSearchStore";
import { useReviewStore } from "@/store/useReviewStore";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { mockHighlightProducts } from "@/lib/data";
import HighlightSection from "./HighlightSection";
import { TrendingDown, TrendingUp, Star } from "lucide-react";

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
              className="flex items-center gap-0.5 text-[11.5px] font-semibold text-emerald-700 active:scale-95 transition-transform -translate-x-1 translate-y-0.5"
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
