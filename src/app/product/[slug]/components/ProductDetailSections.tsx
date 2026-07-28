"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Store,
  MessageCircle,
  Send,
  ChevronLeft,
  Search,
  Share2,
  Heart,
  Flame,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { Product } from "@/lib/types";

// Helper
export const formatCompactNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}jt`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}rb`;
  }
  return num.toString();
};

export function ProductHeader({
  showHeader,
  handleBack,
  openSearch,
  handleShare,
  isFavorite,
  toggleFavorite,
  productId,
}: {
  showHeader: boolean;
  handleBack: () => void;
  openSearch: () => void;
  handleShare: () => void;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  productId: string;
}) {
  return (
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
          <ChevronLeft
            size={28}
            strokeWidth={2}
            className="text-gray-700 translate-y-[2px]"
          />
        </button>
        <button
          type="button"
          onClick={openSearch}
          className="flex-1 flex items-center gap-2 h-8 px-3 bg-gray-100 rounded-lg ring-1 ring-gray-200 min-w-0 active:scale-[0.99] transition-transform"
        >
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <span className="flex-1 text-left text-[13px] text-gray-400 truncate">
            Cari produk lainnya...
          </span>
        </button>
        <button
          onClick={handleShare}
          className="p-2 transition-colors active:scale-90 flex-shrink-0"
          aria-label="Bagikan"
        >
          <Share2 size={18} strokeWidth={2.2} className="text-gray-700" />
        </button>
        <button
          onClick={() => toggleFavorite(productId)}
          className="p-2 transition-colors active:scale-90 flex-shrink-0"
          aria-label="Favorit"
        >
          <Heart
            size={18}
            strokeWidth={2.2}
            className={
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
            }
          />
        </button>
      </div>
    </div>
  );
}

export function ProductInfo({
  product,
  displayOriginalPrice,
  displayPrice,
  isPriceRange,
}: {
  product: Product;
  displayOriginalPrice: string | null;
  displayPrice: string;
  isPriceRange: boolean;
}) {
  return (
    <div className="px-3 pt-2 pb-1.5">
      <div className="flex justify-between items-start gap-3 mb-2">
        <h1 className="text-[15px] font-medium text-gray-700 leading-snug flex-1">
          {product.name}
        </h1>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-orange-500">
            <Flame size={14} className="text-orange-500 fill-orange-400/80" />
            <span className="font-semibold text-gray-700 text-[13px]">
              {formatCompactNumber(Math.max(product.sold, product.sold || 0))}
            </span>
          </div>
          <p className="text-[10px] text-gray-400">Terjual</p>
        </div>
      </div>

      <div className="flex items-end justify-between mb-1">
        <div>
          {displayOriginalPrice && (
            <p className="text-[12px] text-gray-400 line-through mb-[1px] leading-none">
              {displayOriginalPrice}
            </p>
          )}
          <p
            className={`font-semibold leading-none text-gray-700 ${
              isPriceRange ? "text-[16px]" : "text-[20px]"
            }`}
          >
            {displayPrice}
          </p>
        </div>
        <div className="text-right pb-0.5">
          <p className="text-[10px] text-gray-400 leading-none mb-0.5">Stok</p>
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
  );
}

export function ProductVariants({
  product,
  selectedVariant,
  setSelectedVariant,
}: {
  product: Product;
  selectedVariant: string | null;
  setSelectedVariant: (id: string | null) => void;
}) {
  const [isVariantOpen, setIsVariantOpen] = useState(true);

  if (!(product as any).variants?.length) return null;

  return (
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
                onClick={() => !isOutOfStock && setSelectedVariant(variant.id)}
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
  );
}

export function ProductDescription({ description }: { description: string }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const needsTruncation = (description?.length || 0) > 300;

  return (
    <div className="bg-white px-4 pt-2.5 pb-3 mt-1">
      <h2 className="text-sm font-medium leading-none text-gray-700 mb-2.5">
        Deskripsi
      </h2>
      <div className="relative overflow-hidden">
        <div
          className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
            !isDescriptionExpanded ? "max-h-[64px]" : "max-h-[2000px]"
          }`}
        >
          <p className="text-[12px] text-gray-600 leading-[1.55] whitespace-pre-wrap relative">
            {description}
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
  );
}

export function SellerCard({
  seller,
  productSlug,
  isFollowing,
  toggleFollow,
}: {
  seller: any;
  productSlug: string;
  isFollowing: boolean;
  toggleFollow: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="bg-white px-4 py-2.5 mt-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-700 leading-tight truncate">
              {seller.name}
            </p>
            <p className="text-[10px] text-gray-500 mt-1 truncate leading-none">
              {seller.kabupaten}, {seller.provinsi}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => !isFollowing && toggleFollow(seller.id)}
            disabled={isFollowing}
            className={`
              h-7 px-2.5 rounded-md
              flex items-center gap-1
              text-[11px] font-semibold
              transition-colors duration-200
              ${
                isFollowing
                  ? "cursor-default text-gray-500"
                  : "cursor-pointer active:scale-95 text-emerald-700 hover:text-emerald-800"
              }
            `}
          >
            {isFollowing ? (
              <span className="text-gray-500">Diikuti</span>
            ) : (
              <>
                <Plus
                  size={12}
                  strokeWidth={2.6}
                  className="text-emerald-600"
                />
                <span className="text-emerald-600">Ikuti</span>
              </>
            )}
          </button>

          <button
            onClick={() =>
              router.push(
                `/chat?source=product&productSlug=${productSlug}&sellerId=${seller.id}`,
              )
            }
            className="h-7 flex items-center gap-1 px-2 rounded-md border border-gray-200 bg-gray-50 text-emerald-600 text-[11px] font-semibold hover:bg-gray-100 active:scale-95 transition-all"
          >
            <MessageCircle size={11.5} strokeWidth={2.3} />
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductBottomCTA({
  handleAddToCart,
  handleBuyNow,
}: {
  handleAddToCart: () => void;
  handleBuyNow: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 pt-1.5 pb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.035)]">
      <div className="max-w-[500px] mx-auto flex gap-2">
        <button
          onClick={handleAddToCart}
          className="flex-1 py-3 px-4 rounded-lg border border-emerald-600/40 text-emerald-700 font-semibold tracking-[0.020em] transition-all active:scale-[0.96] text-[13px] whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <ShoppingCart size={15} strokeWidth={2.3} />
          Keranjang
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-[2] py-3 px-4 rounded-lg bg-[#048750] text-white font-semibold tracking-[0.020em] hover:bg-emerald-800 transition-all active:scale-[0.96] flex items-center justify-center text-[13px]"
        >
          Pesan Sekarang
        </button>
      </div>
    </div>
  );
}
