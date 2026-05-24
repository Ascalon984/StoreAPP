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
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Star,
  Tag,
  ChevronRight,
  Flame,
  Sparkles,
} from "lucide-react";

interface ProductGridProps {
  initialCategories?: Category[];
}

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
    name: "Pulsa Telkomsel 10.000",
    slug: "pulsa-telkomsel-10k",
    price: 10500,
    originalPrice: 11000,
    category: "pulsa",
    images: [],
    rating: 4.8,
    reviewCount: 320,
    sold: 5200,
    description: "Pulsa all operator instan masuk",
    stock: 9999,
  } as Product,

  {
    id: "hl-2",
    name: "Paket Data 5GB 7 Hari",
    slug: "paket-data-5gb-7hari",
    price: 18500,
    originalPrice: 22000,
    category: "paket-data",
    images: [],
    rating: 4.7,
    reviewCount: 410,
    sold: 6100,
    description: "Kuota internet cepat & stabil",
    stock: 9999,
  } as Product,

  {
    id: "hl-3",
    name: "Token Listrik PLN 20.000",
    slug: "token-listrik-20k",
    price: 20500,
    originalPrice: 22000,
    category: "token-listrik",
    images: [],
    rating: 4.9,
    reviewCount: 890,
    sold: 9800,
    description: "Token listrik langsung masuk meteran",
    stock: 9999,
  } as Product,

  {
    id: "hl-4",
    name: "Top Up DANA 50.000",
    slug: "topup-dana-50k",
    price: 50000,
    originalPrice: 52000,
    category: "e-wallet",
    images: [],
    rating: 4.8,
    reviewCount: 760,
    sold: 7400,
    description: "Isi saldo e-wallet instan",
    stock: 9999,
  } as Product,

  {
    id: "hl-5",
    name: "Top Up Mobile Legends 86 Diamonds",
    slug: "ml-86-diamonds",
    price: 21000,
    originalPrice: 25000,
    category: "game",
    images: [],
    rating: 4.7,
    reviewCount: 540,
    sold: 8800,
    description: "Diamond ML cepat & resmi",
    stock: 9999,
  } as Product,

  {
    id: "hl-6",
    name: "Voucher Google Play 50.000",
    slug: "google-play-voucher-50k",
    price: 50000,
    originalPrice: 52000,
    category: "voucher",
    images: [],
    rating: 4.6,
    reviewCount: 300,
    sold: 4100,
    description: "Voucher digital Google Play",
    stock: 9999,
  } as Product,

  {
    id: "hl-7",
    name: "Tagihan PLN Pascabayar",
    slug: "tagihan-pln-pascabayar",
    price: 1500,
    originalPrice: 2000,
    category: "tagihan",
    images: [],
    rating: 4.8,
    reviewCount: 1200,
    sold: 15000,
    description: "Bayar listrik bulanan tanpa ribet",
    stock: 9999,
  } as Product,

  {
    id: "hl-8",
    name: "Netflix Subscription 1 Bulan",
    slug: "netflix-subscription-1-bulan",
    price: 65000,
    originalPrice: 75000,
    category: "subscription",
    images: [],
    rating: 4.7,
    reviewCount: 980,
    sold: 6200,
    description: "Langganan Netflix resmi",
    stock: 9999,
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

function PromoCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[200px] bg-white rounded-xl shadow-sm overflow-hidden p-2 flex flex-row items-center gap-3">
      <div className="w-16 h-16 bg-gray-100 skeleton rounded-lg animate-pulse flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-2 w-full bg-gray-100 skeleton rounded animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-gray-100 skeleton rounded animate-pulse" />
          <div className="h-2.5 w-8 bg-gray-100 skeleton rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ── Highlight Card Skeleton ──────────────────────── */
function HighlightCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[200px] bg-white rounded-xl shadow-sm overflow-hidden p-2 flex flex-row items-center gap-3">
      <div className="w-16 h-16 bg-gray-100 skeleton rounded-lg animate-pulse flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-2 w-full bg-gray-100 skeleton rounded animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-gray-100 skeleton rounded animate-pulse" />
          <div className="h-2.5 w-8 bg-gray-100 skeleton rounded animate-pulse" />
        </div>
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
      className="block flex-shrink-0 w-[200px] group"
    >
      <article className="bg-white rounded-xl shadow-sm transition-transform duration-200 active:scale-95 overflow-hidden relative flex flex-row items-stretch border border-gray-100/50 h-[80px]">
        {/* Gambar full-bleed kiri */}
        <div className="w-[72px] flex-shrink-0 self-stretch bg-gray-50">
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
        <div className="flex-1 min-w-0 flex flex-col px-2.5 py-2">
          {/* Nama */}
          <div className="min-h-[28px] mb-1">
            <p className="text-[10px] font-bold text-gray-800 line-clamp-2 leading-tight">
              {product.name}
            </p>
          </div>

          {/* Harga & progress */}
          <div className="flex flex-col gap-0.5 mt-auto">
            {hasDiscount && (
              <p className="text-[9px] text-gray-400 line-through leading-none">
                {formatRupiah(product.originalPrice!)}
              </p>
            )}

            <p className="text-[12px] font-black text-emerald-700 tracking-tighter leading-none">
              {formatRupiah(product.price)}
            </p>

            {/* Progress */}
            <div className="mt-1.5">
              <span className="text-[8px] font-semibold text-orange-500 leading-none">
                Tersisa 12
              </span>

              <div className="mt-1 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                  style={{ width: "78%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
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
      className="block flex-shrink-0 w-[200px] group"
    >
      {/* Remaining time */}
      <div className="absolute top-1.5 right-2 z-10">
        {/* Perbaikan: Mengubah rounded-tr-2xl menjadi rounded-tr-md agar kelengkungan kanan atas lebih proporsional */}
        <span className="bg-orange-500/90 text-white text-[9px] font-black px-1.5 py-[4px] rounded-bl-xl rounded-tr-lg leading-none block">
          3 Hari Lagi
        </span>
      </div>

      {/* h-[104px] — cukup untuk nama 2 baris + harga coret + harga + progress bar */}
      <article className="bg-white rounded-xl shadow-sm transition-transform duration-200 active:scale-95 overflow-hidden relative flex flex-row items-stretch border border-gray-100/50 h-[88px]">
        {/* Gambar full-bleed kiri */}
        <div className="w-[80px] flex-shrink-0 self-stretch bg-gray-50">
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

            <p className="text-[12px] font-black text-emerald-700 tracking-tighter leading-none">
              {formatRupiah(product.price)}
            </p>

            {/* Progress bar stok */}
            <div className="mt-1">
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1 bg-orange-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: "78%" }}
                  />
                </div>

                <span className="text-[7px] font-bold text-orange-500 leading-none shrink-0">
                  12
                </span>
              </div>
            </div>
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
  const maxItems = 12;
  const displayProducts = products.slice(0, maxItems);

  return (
    <section className="mb-2">
      {/* ── Header emerald: judul + countdown saja ── */}
      <div className="mx-2 rounded-lg bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46] px-3 pt-2.5 pb-3 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-0 right-8 w-16 h-16 rounded-full bg-emerald-300/10" />

        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-black text-white tracking-tight leading-none">
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
            className="flex gap-2.5 overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          >
            {displayProducts.map((product, i) => (
              <div
                key={product.id}
                className="flex-shrink-0 snap-start w-[200px]"
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

/* ── Inline Sticker: Promo (ratio 2.55:1 → slim) ─── */
function PromoInlineBanner() {
  return (
    <div className="relative w-full aspect-[2.55/1] rounded-2xl overflow-hidden bg-[#FEF3E2]">
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
        <div className="mt-1.5">
          <span className="inline-block bg-[#D89B2B] text-white text-[9px] font-bold px-2.5 py-1 rounded-full leading-none">
            Lihat semua promo →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Inline Sticker: Popular (ratio 2.55:1 → slim) ── */
function PopularInlineBanner() {
  return (
    <div className="relative w-full aspect-[2.55/1] rounded-2xl overflow-hidden bg-[#E8F5F0]">
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
        <div className="mt-1.5">
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
export default function ProductGrid({
  initialCategories = [],
}: ProductGridProps) {
  const { category } = useFilterStore();
  const { query } = useSearchStore();
  const { sort: allSort } = useFilterStore();
  const { fetchReviews, refreshVersion } = useReviewStore();

  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingPromo, setIsLoadingPromo] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);

  /* ── Highlight state ── */
  const [highlightProducts, setHighlightProducts] = useState<Product[]>([]);
  const [isLoadingHighlight, setIsLoadingHighlight] = useState(true);

  const isSpecificCategory = category !== null && category !== "all";

  const categories: Category[] = initialCategories;
  const categoryName =
    categories.find((c) => c.id === category)?.name ?? "Semua Produk";

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
    if (category !== null) params.append("category", category);
    const url = params.toString()
      ? `/api/public/products?${params}`
      : "/api/public/products";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setAllProducts(Array.isArray(d) ? d : []))
      .catch(() => setAllProducts([]))
      .finally(() => setIsLoadingAll(false));
  }, [category, refreshVersion]);

  /* Derived data */
  const filteredQuery = (arr: Product[]) =>
    query
      ? arr.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      : arr;

  const popularToShow = filteredQuery(
    (popularProducts.length > 0 ? popularProducts : allProducts).slice(0, 6),
  );

  const filteredAll = applySort(filteredQuery(allProducts), allSort);
  const firstChunk = filteredAll.slice(0, 10);
  const restChunk = filteredAll.slice(10);

  const activeSortOption =
    SORT_OPTIONS.find((o) => o.id === allSort) || SORT_OPTIONS[0];

  const showPromoSection = !isSpecificCategory && promoProducts.length > 0;

  const isHomeView = !category || category === "all";

  /* ── Render ── */
  return (
    <>
      {/* ══════════════════════════════════════════
          SECTION 0 — HIGHLIGHT / PROMO CARD
          Tampil tepat setelah category grid (tab Semua)
          ══════════════════════════════════════════ */}
      {isHomeView && (
        <HighlightSection
          products={highlightProducts}
          isLoading={isLoadingHighlight}
        />
      )}

      {/* ══════════════════════════════════════════
          SECTION 1 — Paling Dicari (tab Semua saja)
          ══════════════════════════════════════════ */}
      {isHomeView && (
        <section id="product-grid" className="px-2 pt-2 pb-4">
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
      )}

      {/* ══════════════════════════════════════════
          SECTION 3 — Semua Produk
          ══════════════════════════════════════════ */}
      <section className="px-2 pt-2 pb-3 min-h-[50vh]">
        <div className="mb-1 flex items-start justify-between px-0.5">
          <div>
            <h2 className="text-[13px] font-black text-gray-800 tracking-tight leading-tight">
              {categoryName}
            </h2>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5"></p>
          </div>
        </div>

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
          <EmptyState message="Coba pilih kategori lain atau cek kata kunci pencarianmu." />
        ) : (
          <>
            <div className="flex items-start gap-3">
              {/* Kolom Kiri */}
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                {filteredAll
                  .filter((_, i) => i % 2 === 0)
                  .map((product, idx) => {
                    const globalIndex = idx * 2;
                    // Hanya baris 2 (indeks 2) yang lonjong untuk menciptakan offset genteng permanen
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
          </>
        )}
      </section>
    </>
  );
}
