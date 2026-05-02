import Link from 'next/link';
import { Star, Flame } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import ProductImage from './ProductImage';
import { useReviewStore } from '@/store/useReviewStore';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { getReviewsForProduct } = useReviewStore();

  // Ambil ulasan dari local store untuk sinkronisasi instan di UI
  const localReviews = getReviewsForProduct(product.id);

  // Normalisasi gambar yang lebih kuat untuk mencegah crash
  const rawImages = product.images || (product as any).image;
  let productImages: string[] = [];

  if (Array.isArray(rawImages)) {
    // Jika array, cek apakah setiap elemen adalah pipe-separated (bug dari admin API)
    // atau sudah individual images
    productImages = rawImages.flatMap(img => {
      if (!img || typeof img !== 'string') return [];
      // Jika string dimulai dengan data:image atau http, itu gambar individual
      if (img.startsWith('data:image') || img.startsWith('http')) {
        return [img];
      }
      // Jika tidak, coba split dengan pipe (fallback untuk admin API bug)
      return img.split('|').filter(i => i?.trim()?.startsWith('data:image') || i?.trim()?.startsWith('http'));
    });
  } else if (typeof rawImages === 'string') {
    // Jika string, split dengan pipe dan filter yang valid
    productImages = rawImages
      .split('|')
      .map(img => img?.trim())
      .filter(img => img && (img.startsWith('data:image') || img.startsWith('http')));
  }

  const mainImage = productImages[0];

  // Hitung live metrics (optimistic UI)
  // Kita ambil semua ulasan yang spesifik milik produk ini dari store
  const specificReviews = localReviews.filter(r => r.productId === product.id);
  const serverCount = product.reviewCount || 0;
  const serverRating = product.rating || 0;

  const displayReviewCount = Math.max(serverCount, specificReviews.length);
  const displayRating = specificReviews.length > 0
    ? Number((specificReviews.reduce((acc, r) => acc + r.rating, 0) / specificReviews.length).toFixed(1))
    : serverRating;

  const isHot = product.sold >= 500;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Adaptive font size — semakin panjang nama, semakin kecil font
  const titleSize = product.name.length > 50
    ? 'text-[9.5px] leading-[1.15]'
    : product.name.length > 35
      ? 'text-[10.5px] leading-[1.2]'
      : product.name.length > 25
        ? 'text-[11px] leading-snug'
        : 'text-[12.5px] leading-snug';

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <article className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden active:scale-[0.96] border border-gray-100 flex flex-col h-full relative">

        {/* 1. Discount Badge — Lebih Vibrant dengan Gradasi */}
        {discount > 0 && (
          <div className="absolute top-0 right-0 z-20 px-2.5 py-1 bg-gradient-to-l from-rose-600 to-rose-500 text-white text-[10px] font-black rounded-bl-xl shadow-sm tracking-tighter">
            -{discount}%
          </div>
        )}

        {/* Image Area — 3:2 Seamless */}
        <div className="relative w-full aspect-[3/2] bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-3">
          <div style={{ mixBlendMode: 'multiply' }} className="w-full h-full flex items-center justify-center">
            <ProductImage
              category={product.category}
              name={product.name}
              variant={index}
              src={mainImage}
              className="w-full h-full transition-transform duration-700 group-hover:scale-110"
              style={{ objectFit: 'contain' } as React.CSSProperties}
            />
          </div>

          {/* Hot Badge — Pojok Kiri Atas */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isHot && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-sm border border-orange-100 text-orange-600 text-[8px] font-bold uppercase tracking-wider shadow-sm">
                <Flame size={9} className="fill-orange-500 text-orange-500" />
                Hot
              </span>
            )}
          </div>
        </div>

        {/* Content Area — Padding lebih lega */}
        <div className="p-3 pt-1 flex flex-col flex-1 gap-1.5">
          <h3 className={`text-gray-800 line-clamp-2 font-bold group-hover:text-emerald-600 transition-colors duration-300 min-h-[2.4rem] tracking-tight ${titleSize}`}>
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-black text-emerald-600 tracking-tighter">
              {formatRupiah(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-gray-400 line-through opacity-60 font-medium">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stats Row — Footer yang lebih clean */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
            <div className="flex items-center gap-1">
              <Star size={10} strokeWidth={0} fill="#FBBF24" />
              <span className="text-[11px] font-bold text-gray-700">{displayRating}</span>
              <span className="text-[10px] text-gray-400">({displayReviewCount})</span>
            </div>
            <div className="px-2 py-0.5 bg-gray-50 rounded-md text-[10px] text-gray-500 font-semibold">
              {product.sold}+ Terjual
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}