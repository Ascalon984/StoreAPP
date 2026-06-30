"use client";

import { useState, useRef, useEffect, RefObject } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Share2,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronDown,
  Send,
  Search,
  MapPin,
  Store,
} from "lucide-react";

import { useCartStore } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useToastStore } from "@/store/useToastStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { Product, Review } from "@/lib/types";
import { MOCK_SELLERS } from "@/lib/mockSellers";
import { formatRupiah } from "@/lib/utils";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";

interface ProductDetailContentProps {
  product: Product & { reviews?: Review[] };
  allReviews: Review[];
  liveRating: number;
  productImages: string[];
  /** ID seller dari MOCK_SELLERS; bila tidak ditemukan maka tampil seller pertama */
  sellerId?: string;
}

export default function ProductDetailContent({
  product,
  allReviews,
  liveRating,
  productImages,
  sellerId,
}: ProductDetailContentProps) {
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId) ?? MOCK_SELLERS[0];
  const router = useRouter();

  const { addItem, setBuyNowItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { showToast } = useToastStore();

  // State untuk Varian Produk
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isVariantOpen, setIsVariantOpen] = useState<boolean>(true);

  // UI State
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollY = window.scrollY;
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight > 0 && scrollY >= scrollableHeight * 0.5) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      if (imageContainerRef.current) {
        const imageBottom =
          imageContainerRef.current.getBoundingClientRect().bottom;
        setShowHeader(imageBottom < 56);
      }
    };

    window.addEventListener("scroll", checkScrollPosition, { passive: true });
    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const { setIsReturningFromDetail } = useNavigationStore();

  const handleBack = () => {
    setIsReturningFromDetail(true);
    window.history.back();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Beli ${product.name} di Palugada Store`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link berhasil disalin");
      }
    } catch (error) {
      console.log("Error sharing", error);
    }
  };

  const handleAddToCart = () => {
    if (product.variants?.length && !selectedVariant) {
      showToast("Pilih varian produk terlebih dahulu");
      return;
    }

    const productToAdd = { ...product };
    if (selectedVariant && productToAdd.variants) {
      const variantData = productToAdd.variants.find(
        (v: any) => v.id === selectedVariant,
      );
      if (variantData) {
        productToAdd.variant = variantData.name;
        productToAdd.price = variantData.price || productToAdd.price;
      }
    }

    addItem(productToAdd);
    const name =
      product.name.length > 35 ? product.name.slice(0, 35) + "…" : product.name;
    showToast(`${name} ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    if (product.variants?.length && !selectedVariant) {
      showToast("Pilih varian produk terlebih dahulu");
      return;
    }

    const productToAdd = { ...product };
    if (selectedVariant && productToAdd.variants) {
      const variantData = productToAdd.variants.find(
        (v: any) => v.id === selectedVariant,
      );
      if (variantData) {
        productToAdd.variant = variantData.name;
        productToAdd.price = variantData.price || productToAdd.price;
      }
    }

    setBuyNowItem({ product: productToAdd, quantity: 1 });
    const { setCheckoutSource } = useNavigationStore.getState();
    setCheckoutSource("product");
    router.push("/checkout");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Computed values ────────────────────────────────────────────────────────

  const hasVariants = !!product?.variants && product.variants.length > 0;

  let displayPrice = formatRupiah(product.price);
  let displayOriginalPrice: string | null =
    product?.originalPrice && product.originalPrice > product.price
      ? formatRupiah(product.originalPrice)
      : null;

  if (hasVariants) {
    if (selectedVariant) {
      const variant = product.variants!.find((v) => v.id === selectedVariant);
      if (variant) {
        displayPrice = formatRupiah(variant.price || product.price);
        displayOriginalPrice =
          variant.originalPrice &&
          variant.originalPrice > (variant.price || product.price)
            ? formatRupiah(variant.originalPrice)
            : null;
      }
    } else {
      const variantPrices = product.variants!.map(
        (v) => v.price || product.price,
      );
      const minPrice = Math.min(...variantPrices);
      const maxPrice = Math.max(...variantPrices);
      if (minPrice !== maxPrice) {
        displayPrice = `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
      } else {
        displayPrice = formatRupiah(minPrice);
      }
      displayOriginalPrice = null;
    }
  }

  const needsTruncation = (product?.description?.length || 0) > 300;

  const isPriceRange =
    hasVariants && !selectedVariant && (product.variants?.length ?? 0) > 1;

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}jt`;
    }

    if (num >= 1000) {
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}rb`;
    }

    return num.toString();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Scroll-aware Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300 ease-in-out ${
          showHeader
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-[500px] mx-auto flex items-center gap-1.5 pl-1.5 pr-3 h-14">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-all active:scale-90 flex-shrink-0"
            aria-label="Kembali"
          >
            <ChevronLeft size={26} strokeWidth={2} className="text-gray-700" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-8">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-[13px] text-gray-400 truncate">
              Cari di Atheris...
            </span>
          </div>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-100 transition-all active:scale-90 flex-shrink-0"
            aria-label="Bagikan"
          >
            <Share2 size={18} strokeWidth={2.2} className="text-gray-700" />
          </button>
          <button
            onClick={() => toggleFavorite(product.id)}
            className="p-2 rounded-full hover:bg-gray-100 transition-all active:scale-90 flex-shrink-0"
            aria-label="Favorit"
          >
            <Heart
              size={18}
              strokeWidth={2.2}
              className={
                isFavorite(product.id)
                  ? "fill-red-500 text-red-500"
                  : "text-gray-700"
              }
            />
          </button>
        </div>
      </div>

      {/* Gallery + Info Block */}
      <div className="relative bg-white">
        <ProductGallery
          product={product}
          productImages={productImages}
          isFavorite={isFavorite(product.id)}
          toggleFavorite={toggleFavorite}
          handleBack={handleBack}
          handleShare={handleShare}
          ref={imageContainerRef}
        />

        {/* Info Section */}
        <div className="px-3 pt-2 pb-1.5">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h1 className="text-[15px] font-medium text-gray-700 leading-snug flex-1">
              {product.name}
            </h1>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-orange-500">
                <Flame
                  size={14}
                  className="text-orange-500 fill-orange-400/80"
                />
                <span className="font-semibold text-gray-700 text-[13px]">
                  {formatCompactNumber(
                    Math.max(product.sold, product.sold || 0),
                  )}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Terjual</p>
            </div>
          </div>

          <div className="flex items-end justify-between mb-1.5">
            <div>
              {displayOriginalPrice && (
                <p className="text-[12px] text-gray-400 line-through mb-0.5">
                  {displayOriginalPrice}
                </p>
              )}

              <p
                className={`font-medium text-gray-700 tracking-tight ${
                  isPriceRange ? "text-[16px]" : "text-[20px]"
                }`}
              >
                {displayPrice}
              </p>
            </div>

            <div className="text-right pb-0.5">
              <p className="text-[10px] text-gray-400 leading-none mb-0.5">
                Stok
              </p>

              <p
                className={`text-[14px] font-semibold tabular-nums leading-none ${
                  product.stock > 0 ? "text-gray-600" : "text-rose-400"
                }`}
              >
                {formatCompactNumber(product.stock)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Varian Produk */}
      {(product as any).variants?.length > 0 && (
        <div className="bg-white px-4 py-2.5 mt-1">
          <button
            onClick={() => setIsVariantOpen(!isVariantOpen)}
            className="w-full flex items-center justify-between py-1 group"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-700 tracking-tight">
                Variasi
              </h2>
              {selectedVariant && !isVariantOpen && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-white px-2 py-0.5 rounded-md">
                  {
                    (product as any).variants.find(
                      (v: any) => v.id === selectedVariant,
                    )?.name
                  }
                </span>
              )}
            </div>
            <ChevronDown
              size={18}
              strokeWidth={2}
              className={`text-gray-400 transition-transform duration-300 ${
                isVariantOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: isVariantOpen ? "200px" : "0px",
              opacity: isVariantOpen ? 1 : 0,
            }}
          >
            <div className="flex flex-wrap gap-2 pt-3 pb-1">
              {(product as any).variants.map((variant: any) => {
                const isSelected = selectedVariant === variant.id;
                const isOutOfStock = variant.stock === 0;

                return (
                  <button
                    key={variant.id}
                    onClick={() =>
                      !isOutOfStock && setSelectedVariant(variant.id)
                    }
                    disabled={isOutOfStock}
                    className={`
                      px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-200
                      ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                          : "border-gray-300 text-gray-700 bg-white hover:border-gray-300"
                      }
                      ${
                        isOutOfStock
                          ? "opacity-40 cursor-not-allowed line-through border-gray-100 bg-gray-50 text-gray-400"
                          : "active:scale-95"
                      }
                    `}
                  >
                    {variant.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Deskripsi */}
      <div className="bg-white px-4 py-3 mt-1">
        <h2 className="text-sm font-semibold text-gray-600 tracking-tight mb-2">
          Deskripsi
        </h2>
        <div className="relative overflow-hidden">
          <div
            className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
              !isDescriptionExpanded ? "max-h-[64px]" : "max-h-[2000px]"
            }`}
          >
            <p
              ref={descriptionRef}
              className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap relative"
            >
              {product.description}
            </p>
            <div
              className={`transition-all duration-300 ${
                isDescriptionExpanded ? "h-8" : "h-0"
              }`}
            />
          </div>
          {needsTruncation && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className={`absolute bottom-0 transition-all duration-500 ease-in-out flex items-center h-7 z-10 ${
                !isDescriptionExpanded
                  ? "left-full -translate-x-full pl-24 pr-0 read-more-fade"
                  : "left-0 translate-x-0"
              }`}
            >
              {!isDescriptionExpanded ? (
                <span className="flex items-center text-emerald-700 font-bold text-[12px] whitespace-nowrap pr-0.5">
                  <span className="text-gray-500 font-normal mr-1.5">...</span>
                  <span className="hover:underline">Lihat selengkapnya</span>
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-emerald-700 font-bold text-[12px] whitespace-nowrap">
                  Lihat lebih sedikit
                  <ChevronDown
                    size={14}
                    className="rotate-180 transition-transform duration-500"
                  />
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Seller Card */}
      <div className="bg-white px-4 py-2.5 mt-1">
        <div className="flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className={`
        w-8 h-8 rounded-full bg-gray-100 border
        flex items-center justify-center overflow-hidden
        transition-all duration-300
        ${
          seller.isOnline
            ? "border-emerald-500/70 ring-1 ring-emerald-500/20"
            : "border-gray-200"
        }
      `}
              >
                <Store size={16} strokeWidth={1.8} className="text-gray-400" />
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-700 leading-tight truncate">
                {seller.name}
              </p>

              <p className="text-[10px] text-gray-500 mt-1 truncate leading-none">
                {seller.kabupaten}, {seller.provinsi}
              </p>
            </div>
          </div>

          {/* Chat Button */}
          <button
            onClick={() =>
              router.push(`/chat?source=product&productSlug=${product.slug}&sellerId=${seller.id}`)
            }
            className="h-7 flex items-center gap-1 px-2 rounded-lg border border-gray-200 bg-gray-50 text-emerald-700 text-[11px] font-semibold hover:bg-gray-100 active:scale-95 transition-all flex-shrink-0 self-center"
          >
            <MessageCircle size={11.5} strokeWidth={2.3} />
            Chat
          </button>
        </div>
      </div>

      {/* Review Section */}
      <ProductReviews allReviews={allReviews} liveRating={liveRating} />

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 pt-1.5 pb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.035)]">
        <div className="max-w-[500px] mx-auto flex gap-2.5">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-xl border border-emerald-600/40 text-emerald-700 font-semibold hover:bg-emerald-50 transition-all active:scale-[0.96] text-[13px] whitespace-nowrap"
          >
            + Keranjang
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-[2] py-3 px-4 rounded-xl bg-[#048750] text-white font-semibold hover:bg-emerald-800 transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 text-[13px]"
          >
            <Send size={16} strokeWidth={2.5} className="rotate-[-10deg]" />
            Pesan Sekarang
          </button>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
        className={`fixed bottom-20 right-5 z-50 w-9 h-9 rounded-full bg-emerald-500 text-white shadow-[0_6px_18px_rgba(16,185,129,0.24)] flex items-center justify-center transition-all duration-500 hover:bg-emerald-600 hover:scale-110 active:scale-90 ${
          showBackToTop
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-10 scale-75 pointer-events-none"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
