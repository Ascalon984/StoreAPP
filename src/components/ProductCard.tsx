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
    transition-all duration-200 overflow-hidden 
    active:scale-[0.96] 
    flex flex-col relative
  "
      >
        <div className="absolute inset-0 bg-gradient-premium pointer-events-none z-0" />

        {discount > 0 && (
          <div
            className="absolute top-0 right-0 z-30 px-2.5 py-1 
  bg-gradient-to-l from-rose-600 to-rose-500 
  text-white text-[10px] font-black 
  rounded-tr-xl rounded-bl-2xl   {/* ← tambah rounded-tr-xl */}
  shadow-layer-md tracking-tighter"
          >
            -{discount}%
          </div>
        )}

        <div
          className={`relative w-full ${isTall ? "aspect-[5/4]" : "aspect-[3/2]"} bg-white overflow-hidden flex-shrink-0 z-10`}
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

        <div className="p-3 pt-0 flex flex-col flex-1 gap-1.5 z-10 relative bg-white/50 backdrop-blur-sm">
          <h3
            className={`text-gray-800 line-clamp-2 font-bold transition-colors duration-200 min-h-[2.4rem] tracking-tight ${titleSize}`}
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

          <div className="flex items-end justify-between mt-auto pt-1 relative z-20">
            {/* LEFT: Rating */}
            <div className="flex items-center gap-0.5 text-[10.5px] font-bold text-gray-600">
              <Star size={10} strokeWidth={0} fill="#FBBF24" />
              <span className="text-gray-700 font-extrabold">
                {displayRating}
              </span>
            </div>

            {/* RIGHT: Sold */}
            <div className="text-[10px] text-gray-500 font-bold">
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
