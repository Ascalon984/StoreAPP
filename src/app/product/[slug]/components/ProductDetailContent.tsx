"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useToastStore } from "@/store/useToastStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useSearchStore } from "@/store/useSearchStore";
import { Product, Review } from "@/lib/types";
import { MOCK_SELLERS } from "@/lib/mockSellers";
import { formatRupiah } from "@/lib/utils";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";
import {
  ProductHeader,
  ProductInfo,
  ProductVariants,
  ProductDescription,
  SellerCard,
  ProductBottomCTA,
  formatCompactNumber,
} from "./ProductDetailSections";

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
  const { openSearch } = useSearchStore();

  // State untuk Varian Produk
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // UI State
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);

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

  const isPriceRange =
    hasVariants && !selectedVariant && (product.variants?.length ?? 0) > 1;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Scroll-aware Header */}
      <ProductHeader
        showHeader={showHeader}
        handleBack={handleBack}
        openSearch={openSearch}
        handleShare={handleShare}
        isFavorite={isFavorite(product.id)}
        toggleFavorite={toggleFavorite}
        productId={product.id}
      />

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
        <ProductInfo
          product={product}
          displayOriginalPrice={displayOriginalPrice}
          displayPrice={displayPrice}
          isPriceRange={isPriceRange}
        />
      </div>

      {/* Varian Produk */}
      <ProductVariants
        product={product}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
      />

      {/* Deskripsi */}
      <ProductDescription description={product.description ?? ""} />

      {/* Seller Card */}
      <SellerCard seller={seller} productSlug={product.slug} />

      {/* Review Section */}
      <ProductReviews allReviews={allReviews} liveRating={liveRating} />

      <div className="h-8" />

      {/* Sticky Bottom CTA */}
      <ProductBottomCTA
        handleAddToCart={handleAddToCart}
        handleBuyNow={handleBuyNow}
      />

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
        className={`fixed bottom-20 right-5 z-50 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-500 hover:bg-emerald-600 hover:scale-110 active:scale-90 ${
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
