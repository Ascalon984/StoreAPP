"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useReviewStore } from "@/store/useReviewStore";
import { Product } from "@/lib/types";
import ProductImage from "./ProductImage";
import { formatRupiah } from "@/lib/utils";

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
      className={`bg-white rounded-lg border border-black/[0.04] overflow-hidden relative flex flex-row items-stretch border border-gray-100/50 h-[82px] transition-transform duration-200 ${
        isHabis ? "" : "active:scale-97"
      }`}
    >
      {/* Gambar full-bleed kiri */}
      <div className="w-[72px] flex-shrink-0 self-stretch bg-gray-50 relative">
        <ProductImage
          category={product.category}
          name={product.name}
          variant={index}
          src={productImages[0]}
          className={`w-full h-full object-cover ${
            isHabis ? "grayscale opacity-60" : ""
          }`}
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
        className={`flex-1 min-w-0 flex flex-col justify-between pl-1.5 pr-1 py-2 ${
          isHabis ? "opacity-60" : ""
        }`}
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
      <div className="block flex-shrink-0 w-[175px] cursor-not-allowed select-none">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block flex-shrink-0 w-[175px] group"
    >
      {cardContent}
    </Link>
  );
}

/* ── Highlight Section ────────────────────────────── */
export default function HighlightSection({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [thumbPixelWidth, setThumbPixelWidth] = useState(12);

  // State untuk memicu animasi slide-in
  const [animateIn, setAnimateIn] = useState(false);

  const maxItems = 20;
  const displayProducts = products.slice(0, maxItems);

  // Efek untuk trigger animasi masuk
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      const timer = setTimeout(() => setAnimateIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [isLoading, products]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateIndicator = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const trackWidth = 28;

      if (maxScroll <= 0) {
        setThumbLeft(0);
        setThumbPixelWidth(trackWidth);
        return;
      }

      const visibleRatio = el.clientWidth / el.scrollWidth;
      const thumbWidth = Math.max(trackWidth * visibleRatio, 8);
      const movableArea = trackWidth - thumbWidth;
      const progress = el.scrollLeft / maxScroll;
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

  // Efek auto-scroll dari card index 1 (2 per 2) ke index 0
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isLoading || displayProducts.length === 0) return;

    let timeout1: ReturnType<typeof setTimeout>;
    let timeout2: ReturnType<typeof setTimeout>;

    if (animateIn) {
      const rafId = requestAnimationFrame(() => {
        const cardWidth = 176;
        const gap = 4;
        const startIndex = 2;

        el.scrollLeft = startIndex * (cardWidth + gap);

        timeout1 = setTimeout(() => {
          el.style.scrollBehavior = "smooth";
          el.scrollLeft = 0;

          timeout2 = setTimeout(() => {
            if (el) el.style.scrollBehavior = "auto";
          }, 1500);
        }, 2500);
      });

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        if (el) el.style.scrollBehavior = "auto";
      };
    }
  }, [animateIn, isLoading, displayProducts.length]);

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

          <div className="absolute -top-[8px] -right-[11.5px] z-10">
            <span className="block rounded-bl-xl rounded-tr-lg px-1.5 py-[5px] text-[9.5px] font-medium tracking-[0.008em] leading-none text-white bg-gradient-to-l from-orange-600 to-amber-500">
              3 Hari Lagi
            </span>
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

      {/* ── Cards: 2 per 2 (Full Block) ── */}
      <div className="mt-0.5 px-1.5 relative">
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
              // PERUBAHAN UTAMA:
              // 1. max-width-[356px] -> Memaksa container hanya muat 2 card (176*2 + 4 gap = 356px)
              // 2. mx-auto -> Centered
              // 3. snap-mandatory -> Memaksa snap tiap 1 card (terlihat geser 2 per 2)
              className={`flex gap-1 hide-scrollbar snap-x snap-mandatory max-w-[356px] mx-auto transition-opacity duration-300 ${
                animateIn
                  ? "overflow-x-auto opacity-100"
                  : "overflow-x-hidden opacity-0"
              }`}
            >
              {displayProducts.map((product, i) => (
                <div
                  key={product.id}
                  // w-[176px] disamahkan dengan max-w-[356px] agar pas 2 card
                  className={`flex-shrink-0 snap-start w-[175px] transition-[transform,opacity] duration-500 ease-out ${
                    animateIn
                      ? "translate-x-0 opacity-100"
                      : "translate-x-3 opacity-0"
                  }`}
                  style={{
                    transitionDelay: `${
                      animateIn ? Math.min(i * 70, 350) : 0
                    }ms`,
                  }}
                >
                  <HighlightCard product={product} index={i} />
                </div>
              ))}
              <div className="flex-shrink-0 w-[88px]">
                <div className="h-[82px] rounded-lg border border-dashed border-gray-200 bg-white flex flex-col justify-center items-end px-2">
                  <img
                    src="/icons/closing deals.png"
                    alt=""
                    draggable={false}
                    className="w-full h-[42px] object-contain opacity-95 pointer-events-none -mr-2"
                  />

                  <p className="mt-1.5 text-right leading-tight">
                    <span className="block text-[8px] font-medium text-gray-400">
                      Selalu Ada
                    </span>
                    <span className="block text-[9px] font-semibold tracking-[0.01em] text-gray-600">
                      Promo Terbaik
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Fade peek kanan (Posisi dipindah ke luar max-width) */}
            <div
              className={`
                absolute
                right-[4px]
                top-0
                h-full
                w-3
                pointer-events-none
                transition-opacity duration-300
                ${animateIn ? "opacity-100" : "opacity-0"}
              `}
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
