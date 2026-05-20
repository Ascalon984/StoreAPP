import Link from "next/link";
import { Star, Flame } from "lucide-react";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import ProductImage from "./ProductImage";
import { useReviewStore } from "@/store/useReviewStore";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { getReviewsForProduct } = useReviewStore();

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

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const titleSize =
    product.name.length > 50
      ? "text-[9.5px] leading-[1.15]"
      : product.name.length > 35
        ? "text-[10.5px] leading-[1.2]"
        : product.name.length > 25
          ? "text-[11px] leading-snug"
          : "text-[12.5px] leading-snug";

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <article
        className="
        bg-white rounded-xl 
        shadow-layer-xs 
        hover:shadow-layer-lg 
        transition-all duration-500 overflow-hidden 
        active:scale-[0.96] 
        flex flex-col h-full relative backdrop-blur-sm
      "
      >
        <div className="absolute inset-0 bg-gradient-premium pointer-events-none z-0" />

        {discount > 0 && (
          <div className="absolute top-0 right-0 z-30 px-2.5 py-1 bg-gradient-to-l from-rose-600 to-rose-500 text-white text-[10px] font-black rounded-bl-2xl shadow-layer-md backdrop-blur-sm tracking-tighter">
            -{discount}%
          </div>
        )}

        <div className="relative w-full aspect-[3/2] bg-white overflow-hidden flex-shrink-0 z-10">
          <ProductImage
            category={product.category}
            name={product.name}
            variant={index}
            src={mainImage}
            className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-110 object-contain scale-[0.82]"
            style={{} as React.CSSProperties}
          />
        </div>

        <div className="p-3 pt-0 flex flex-col flex-1 gap-1.5 z-10 relative bg-white/50 backdrop-blur-sm">
          <h3
            className={`text-gray-800 line-clamp-2 font-bold group-hover:text-emerald-700 transition-colors duration-300 min-h-[2.4rem] tracking-tight ${titleSize}`}
          >
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[15px] font-black text-emerald-700 tracking-tighter">
              {formatRupiah(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-gray-600 line-through font-medium">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-1">
  <div className="absolute left-0 right-0 bottom-[28px] h-6 bg-gradient-to-b from-transparent to-black/[0.02] pointer-events-none" />
            <div className="flex items-center gap-0.5">
              <Star size={10} strokeWidth={0} fill="#FBBF24" />
              <span className="text-[11px] font-extrabold text-gray-700">
                {displayRating}
              </span>
             
            </div>
            <div className="text-[10px] text-gray-600 font-bold">
              {product.sold} Terjual
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
