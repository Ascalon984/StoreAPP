"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchStore } from "@/store/useSearchStore";
import { useReviewStore } from "@/store/useReviewStore";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import ProductImage from "./ProductImage";
import { formatRupiah } from "@/lib/utils";
import {
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Star,
  Flame,
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

/* ── Mock Highlight Data ──────────────────────────── */
// TODO: Ganti dengan fetch API saat endpoint sudah siap
const MOCK_HIGHLIGHT_PRODUCTS: Product[] = [
  {
    id: "hl-1",
    name: "Samsung Galaxy Buds FE",
    slug: "samsung-galaxy-buds-fe",
    price: 799000,
    originalPrice: 899000,
    category: "elektronik",
    images: [],
    rating: 4.8,
    reviewCount: 1240,
    sold: 5200,
    description: "Wireless earbuds dengan ANC dan suara jernih",
    stock: 120,
  } as Product,

  {
    id: "hl-2",
    name: "Sneakers Casual Pria Urban Flex",
    slug: "sneakers-casual-pria-urban-flex",
    price: 249000,
    originalPrice: 329000,
    category: "fashion",
    images: [],
    rating: 4.7,
    reviewCount: 860,
    sold: 4100,
    description: "Sneakers casual nyaman untuk aktivitas harian",
    stock: 80,
  } as Product,

  {
    id: "hl-3",
    name: "Set Peralatan Masak Anti Lengket",
    slug: "set-peralatan-masak-anti-lengket",
    price: 389000,
    originalPrice: 459000,
    category: "perabotan",
    images: [],
    rating: 4.9,
    reviewCount: 540,
    sold: 2300,
    description: "Cookware set lengkap untuk kebutuhan dapur modern",
    stock: 45,
  } as Product,

  {
    id: "hl-4",
    name: "Skincare Brightening Serum 30ml",
    slug: "skincare-brightening-serum-30ml",
    price: 129000,
    originalPrice: 159000,
    category: "kesehatan",
    images: [],
    rating: 4.8,
    reviewCount: 2100,
    sold: 9200,
    description: "Serum wajah untuk mencerahkan dan melembapkan kulit",
    stock: 150,
  } as Product,

  {
    id: "hl-5",
    name: "Netflix Premium 1 Bulan",
    slug: "netflix-premium-1-bulan",
    price: 65000,
    originalPrice: 79000,
    category: "hiburan",
    images: [],
    rating: 4.7,
    reviewCount: 980,
    sold: 6200,
    description: "Langganan Netflix Premium resmi 1 bulan",
    stock: 9999,
  } as Product,

  {
    id: "hl-6",
    name: "Mobile Legends 86 Diamonds",
    slug: "mobile-legends-86-diamonds",
    price: 21000,
    originalPrice: 25000,
    category: "game",
    images: [],
    rating: 4.9,
    reviewCount: 3200,
    sold: 18400,
    description: "Top up diamond Mobile Legends instan dan resmi",
    stock: 9999,
  } as Product,

  {
    id: "hl-7",
    name: "Microsoft 365 Personal",
    slug: "microsoft-365-personal",
    price: 149000,
    originalPrice: 179000,
    category: "produktivitas",
    images: [],
    rating: 4.8,
    reviewCount: 1420,
    sold: 7600,
    description: "Lisensi Microsoft 365 Personal original",
    stock: 9999,
  } as Product,

  {
    id: "hl-8",
    name: "Helm Full Face Touring Pro",
    slug: "helm-full-face-touring-pro",
    price: 599000,
    originalPrice: 699000,
    category: "otomotif",
    images: [],
    rating: 4.7,
    reviewCount: 670,
    sold: 1900,
    description: "Helm full face nyaman untuk touring dan harian",
    stock: 35,
  } as Product,
];

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
    <div className="flex-shrink-0 w-[210px] bg-white rounded-xl shadow-sm overflow-hidden flex flex-row items-center border border-gray-100/50 h-[80px]">
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

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block flex-shrink-0 w-[212px] group"
    >
      {/* Remaining time */}
      <div className="absolute top-1 right-2 z-10">
        {/* Perbaikan: Mengubah rounded-tr-2xl menjadi rounded-tr-md agar kelengkungan kanan atas lebih proporsional */}
        <span className="bg-orange-600/80 text-white text-[10px] font-bold px-1.5 py-[4px] rounded-bl-xl rounded-tr-lg leading-none block">
          3 Hari Lagi
        </span>
      </div>

      {/* h-[104px] — cukup untuk nama 2 baris + harga coret + harga + progress bar */}
      <article className="bg-white rounded-xl shadow-sm transition-transform duration-200 active:scale-95 overflow-hidden relative flex flex-row items-stretch border border-gray-100/50 h-[80px]">
        {/* Gambar full-bleed kiri */}
        <div className="w-[76px] flex-shrink-0 self-stretch bg-gray-50">
          <ProductImage
            category={product.category}
            name={product.name}
            variant={index}
            src={productImages[0]}
            className="w-full h-full object-cover"
            style={{} as React.CSSProperties}
          />
        </div>

        {/* Konten kanan */}
        <div className="flex-1 min-w-0 flex flex-col justify-between px-2.5 py-2">
          {/* Nama — min-h agar konsisten 1 atau 2 baris */}
          <div className="min-h-[28px]">
            <p className="text-[10px] font-bold text-gray-800 line-clamp-2 leading-tight">
              {product.name}
            </p>
          </div>

          {/* Harga & progress */}
          <div className="flex flex-col gap-0.5">
            {hasDiscount && (
              <p className="text-[9px] text-gray-400 line-through leading-none">
                {formatRupiah(product.originalPrice!)}
              </p>
            )}

            <p className="text-[12px] font-extrabold text-emerald-700 tracking-tight leading-none">
              {formatRupiah(product.price)}
            </p>
          </div>
        </div>
      </article>
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
  const maxItems = 20;
  const displayProducts = products.slice(0, maxItems);

  return (
    <section className="mb-1">
      {/* ── Header emerald: judul + countdown saja ── */}
      <div className="mx-2 rounded-lg bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46] px-3 pt-2.5 pb-3 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-0 right-8 w-16 h-16 rounded-full bg-emerald-300/10" />

        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-[13.5px] font-bold text-white tracking-tight leading-none">
              Penawaran Terbatas
            </h3>
          </div>
        </div>
      </div>

      {/* ── Cards: scroll bebas, background transparan ── */}
      <div className="mt-2.5 px-2">
        {isLoading ? (
          <div className="flex gap-2.5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <HighlightCardSkeleton key={i} />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex gap-1.5 overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          >
            {displayProducts.map((product, i) => (
              <div
                key={product.id}
                className="flex-shrink-0 snap-start w-[213px]"
              >
                <HighlightCard product={product} index={i} />
              </div>
            ))}
            <div className="shrink-0 w-1" />
          </div>
        ) : null}
      </div>
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
      const discounted = MOCK_HIGHLIGHT_PRODUCTS.filter(
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
    (popularProducts.length > 0 ? popularProducts : allProducts).slice(0, 8),
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
      <section id="product-grid" className="px-2 pt-2 pb-4">
        <div className="pt-1 mb-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[13px] font-bold text-gray-800 tracking-tight">
              TERLARIS
            </h2>
          </div>
        </div>
        {isLoadingPopular ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : popularToShow.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {popularToShow.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : null}
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — Semua Produk
          ══════════════════════════════════════════ */}
      <section className="px-2 pb-3 min-h-[50vh]">
        <div className="pt-2 mb-2">
          <div className="flex items-center justify-between px-0.5 mb-2.5">
            <h2 className="text-[13px] font-bold text-gray-800 tracking-tight">
              SEMUA PRODUK
            </h2>
          </div>
        </div>

        <div>
          {isLoadingAll ? (
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={`left-${i}`} isTall={i === 1} />
                ))}
              </div>
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={`right-${i}`} isTall={false} />
                ))}
              </div>
            </div>
          ) : filteredAll.length === 0 ? (
            <EmptyState message="Coba cek kata kunci pencarianmu." />
          ) : (
            <div className="flex items-start gap-3">
              {/* Kolom Kiri */}
              <div className="flex flex-col gap-3 flex-1 min-w-0">
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
              <div className="flex flex-col gap-3 flex-1 min-w-0">
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
