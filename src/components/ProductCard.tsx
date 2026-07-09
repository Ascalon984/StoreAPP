import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/lib/types";
import { formatRupiah, formatSold, formatCompactNumber } from "@/lib/utils";
import ProductImage from "./ProductImage";
import { useReviewStore } from "@/store/useReviewStore";
import { MOCK_SELLERS } from "@/lib/mockSellers";

// import { useCartStore } from "@/store/useCartStore";
// import { useToastStore } from "@/store/useToastStore";

interface ProductCardProps {
  product: Product;
  index: number;
  isTall?: boolean;
}

const normalizeLocation = (location?: string) => {
  if (!location) return "";

  return location
    .replace(/^Kabupaten\s+/i, "Kab. ")
    .replace(/^Kab\s+/i, "Kab. ")
    .replace(/^Kota\s+/i, "Kota ");
};

export default function ProductCard({
  product,
  index,
  isTall,
}: ProductCardProps) {
  const { getReviewsForProduct } = useReviewStore();
  const seller =
    MOCK_SELLERS.find((s) => s.id === product.sellerId) ?? MOCK_SELLERS[0];
  // Quick cart button dihapus - user harus membuka detail produk untuk melihat variasi
  // const { addItem } = useCartStore();
  // const { showToast } = useToastStore();

  // const handleAddToCart = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   addItem(product);
  //   showToast("Berhasil dimasukkan ke keranjang");
  // };

  const localReviews = getReviewsForProduct(product.id);

  const rawImages = product.images || (product as any).image;
  let productImages: string[] = [];

  if (Array.isArray(rawImages)) {
    productImages = rawImages.flatMap((img) => {
      if (!img || typeof img !== "string") return [];
      if (img.startsWith("data:image") || img.startsWith("http")) {
        return [img];
      }
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
      .map((img) => img?.trim())
      .filter(
        (img) =>
          img && (img.startsWith("data:image") || img.startsWith("http")),
      );
  }

  const mainImage = productImages[0];

  const specificReviews = localReviews.filter(
    (r) => r.productId === product.id,
  );
  const serverCount = product.reviewCount || 0;
  const serverRating = product.rating || 0;

  const displayReviewCount = Math.max(serverCount, specificReviews.length);
  const displayRating =
    specificReviews.length > 0
      ? Number(
          (
            specificReviews.reduce((acc, r) => acc + r.rating, 0) /
            specificReviews.length
          ).toFixed(1),
        )
      : serverRating;

  const hasVariants = product.variants && product.variants.length > 0;

  const discount =
    !hasVariants &&
    product.originalPrice &&
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  let displayPrice = formatRupiah(product.price);

  if (hasVariants) {
    const variantPrices = product.variants!.map(
      (v) => v.price || product.price,
    );
    const minPrice = Math.min(...variantPrices);
    displayPrice = formatRupiah(minPrice);
  }

  // Ganti logika titleSize dengan pendekatan yang lebih granular
  const getTitleSize = (name: string) => {
    const length = name.length;

    if (length > 60) return "text-[10px]"; // Sangat panjang
    if (length > 50) return "text-[10.5px]"; // Panjang
    if (length > 40) return "text-[11px]"; // Cukup panjang
    if (length > 30) return "text-[11.5px]"; // Sedang
    if (length > 20) return "text-[12px]"; // Pendek
    return "text-[12.5px]"; // Sangat pendek
  };

  const titleSize = getTitleSize(product.name);

  const priceLength = displayPrice.length;

  const priceSize =
    priceLength > 14
      ? "text-[12px]"
      : priceLength > 11
        ? "text-[13px]"
        : "text-[14px]";

  const originalPriceSize = priceLength > 14 ? "text-[9px]" : "text-[10px]";

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <article
        className="
    bg-white rounded-[10px]
    shadow-layer-xs 
    transition-all duration-200 overflow-hidden 
    active:scale-[0.985] 
    flex flex-col relative
  "
      >
        <div className="absolute inset-0 bg-gradient-premium pointer-events-none z-0" />

        {discount > 0 && (
          <div
            className="
            absolute top-0 right-0 z-30
            translate-x-[1.5px]
            px-2.5 py-1
            bg-gradient-to-l from-rose-500 to-rose-400
            text-white text-[10px] font-medium
            rounded-tr-[11px] rounded-bl-xl
            shadow-layer-sm tracking-[0.015em]
          "
          >
            -{discount}%
          </div>
        )}

        <div
          className={`relative w-full ${isTall ? "aspect-[4.4/4]" : "aspect-[4.8/4]"} bg-white overflow-hidden flex-shrink-0 z-10`}
        >
          <ProductImage
            category={product.category}
            name={product.name}
            variant={index}
            src={mainImage}
            className="absolute inset-0 w-full h-full object-contain"
            style={{} as React.CSSProperties}
          />
          {(product.sold || 0) === 0 && (
            <div
              className="
  absolute left-0 bottom-0 z-30
  px-2 py-0.5
  rounded-tr-[10px]
  bg-gradient-to-r from-emerald-500 to-emerald-400
  text-white/95
  text-[9.5px]
  font-medium
  tracking-[0.008em]
"
            >
              Baru
            </div>
          )}
        </div>

        <div className="px-2.5 py-1 flex flex-col flex-1 gap-0.5 z-10 relative bg-white/50 backdrop-blur-sm">
          <h3
            className={`
              text-gray-700
              line-clamp-2
              font-normal
              leading-[1.03]
              min-h-[1.94em]
              tracking-[0.01em]
              ${titleSize}
            `}
          >
            {product.name}
          </h3>

          {/* Seller Location */}
          <div className="text-[9px] text-gray-400 truncate leading-tight translate-y-[2px]">
            {normalizeLocation(seller?.kabupaten)}
          </div>

          <div className="flex items-baseline gap-1 w-full overflow-hidden whitespace-nowrap">
            <span
              className={`
                ${priceSize}
                font-semibold
                tracking-[0.02em]
                text-gray-700
                truncate
                flex-shrink-0
              `}
            >
              {displayPrice}
            </span>

            {!hasVariants &&
              product.originalPrice &&
              product.originalPrice > product.price && (
                <span
                  className={`
            ${originalPriceSize}
            text-gray-400
            line-through
            font-normal
            tracking-[0.015em]
            truncate
            flex-shrink
          `}
                >
                  {formatRupiah(product.originalPrice)}
                </span>
              )}
          </div>

          <div className="flex items-end justify-between mt-auto relative z-20">
            {/* LEFT: Rating */}
            <div className="flex items-center gap-0.5 text-[10px] font-medium text-gray-600">
              <Star
                size={11}
                strokeWidth={0}
                fill={displayReviewCount > 0 ? "#f3bc18ff" : "#d1d5db"}
              />
              <span className="text-gray-600 font-medium">
                {displayReviewCount > 0 ? displayRating : "-"}
              </span>
            </div>

            {/* RIGHT: Sold */}
            <div className="text-[10px] text-gray-400 font-normal tracking-[0.015em]">
              {(product.sold || 0) > 0
                ? `${formatCompactNumber(product.sold)} terjual`
                : "Belum terjual"}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
