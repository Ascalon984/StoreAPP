import Link from 'next/link';
import { Star, Flame } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
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
      <article className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden active:scale-[0.98] border border-gray-100 hover:border-gray-200 h-full flex flex-col">

        {/* Image — 4:3 */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 flex-shrink-0">
          <ProductImage
            category={product.category}
            name={product.name}
            variant={index}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isHot && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                <Flame size={9} strokeWidth={2.5} fill="currentColor" />
                Hot
              </span>
            )}
          </div>

          {/* Discount Badge — top right */}
          {discount > 0 && (
            <span className="absolute top-2 right-2 z-10 inline-flex items-center px-1.5 py-0.5 rounded-md bg-gradient-to-r from-rose-500 to-red-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-2 flex flex-col flex-1">
          {/* Title — adaptive size, line-clamp-2 sebagai safety net */}
          <h3
            className={`text-gray-700 line-clamp-2 font-medium group-hover:text-emerald-600 transition-colors duration-200 min-h-[2.2rem] ${titleSize}`}
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-0.5">
            <p className="text-[14.5px] font-extrabold text-emerald-600 tracking-tight">
              {formatRupiah(product.price)}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-0.5" />

          {/* Stats row — selalu di bottom */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-0.5">
              <Star size={9} strokeWidth={0} fill="#FBBF24" className="text-yellow-400" />
              <span className="text-[10.5px] font-semibold text-gray-700">{product.rating}</span>
              <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-gray-400 font-medium">
              <Flame size={8} strokeWidth={2} className="text-orange-400" />
              <span>{product.sold}+</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}