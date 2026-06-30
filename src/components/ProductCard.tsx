import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/lib/types";
import { formatRupiah, formatSold } from "@/lib/utils";
import ProductImage from "./ProductImage";
import { useReviewStore } from "@/store/useReviewStore";
// import { useCartStore } from "@/store/useCartStore";
// import { useToastStore } from "@/store/useToastStore";

interface ProductCardProps {
  product: Product;
  index: number;
  isTall?: boolean;
}

export default function ProductCard({
  product,
  index,
  isTall,
}: ProductCardProps) {
  const { getReviewsForProduct } = useReviewStore();
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

  const titleSize =
    product.name.length > 50
      ? "text-[11px]"
      : product.name.length > 35
        ? "text-[11.5px]"
        : "text-[12px]";

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
    bg-white rounded-[11px]
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
            px-2.5 py-1
            bg-gradient-to-l from-rose-600 to-rose-500
            text-white text-[10px] font-semibold
            rounded-tr-[11px] rounded-bl-xl
            shadow-layer-sm tracking-tight
          "
          >
            -{discount}%
          </div>
        )}

        <div
          className={`relative w-full ${isTall ? "aspect-[5/4]" : "aspect-[4/3]"} bg-white overflow-hidden flex-shrink-0 z-10`}
        >
          <ProductImage
            category={product.category}
            name={product.name}
            variant={index}
            src={mainImage}
            className="absolute inset-0 w-full h-full object-contain"
            style={{} as React.CSSProperties}
          />
        </div>

        <div className="px-2.5 pb-2 pt-1.5 flex flex-col flex-1 gap-1 z-10 relative bg-white/50 backdrop-blur-sm">
          <h3
            className={`text-gray-800 line-clamp-2 font-normal leading-[1.12] min-h-[2.2em] tracking-tight ${titleSize}`}
          >
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1 w-full overflow-hidden whitespace-nowrap">
            <span
              className={`
                ${priceSize}
                font-semibold
                text-gray-700
                tracking-tight
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
    truncate
    flex-shrink
  `}
                >
                  {formatRupiah(product.originalPrice)}
                </span>
              )}
          </div>

          <div className="flex items-end justify-between mt-auto pt-0.5 relative z-20">
            {/* LEFT: Rating */}
            <div className="flex items-center gap-0.5 text-[10.5px] font-bold text-gray-600">
              <Star size={10} strokeWidth={0} fill="#FBBF24" />
              <span className="text-gray-700 font-semibold">
                {displayRating}
              </span>
            </div>

            {/* RIGHT: Sold */}
            <div className="text-[10px] text-gray-400 font-normal">
              {formatSold(product.sold)} terjual
            </div>

            {/* Quick cart button dihapus - user membuka product detail untuk lihat variasi */}
            {/* 
            <button 
              onClick={handleAddToCart}
              className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors active:scale-95 shadow-sm border border-emerald-100/50 relative z-30"
              aria-label="Add to cart"
            >
              <ShoppingCart size={13} strokeWidth={2.5} />
            </button>
            */}
          </div>
        </div>
      </article>
    </Link>
  );
}
