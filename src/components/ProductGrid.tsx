'use client';

import { useEffect, useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { useReviewStore } from '@/store/useReviewStore';
import { Product, Category } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  initialCategories?: Category[];
}

// Skeleton card untuk loading state
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm overflow-hidden flex flex-col h-full">
      {/* 1. Image Area - Tetap gaya lama tapi aspect 3/2 sesuai asli */}
      <div className="w-full aspect-[3/2] bg-gray-100 skeleton animate-pulse" />

      {/* Content */}
      <div className="p-3 pt-0 flex flex-col flex-1 gap-1.5">

        {/* Title */}
        <div className="mt-2.5 min-h-[2.4rem] flex flex-col justify-center gap-1.5">
          <div className="h-3 w-full bg-gray-100 skeleton rounded-md animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-100 skeleton rounded-md animate-pulse" />
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <div className="h-4 w-24 bg-gray-100 skeleton rounded-md animate-pulse" />
          <div className="h-3 w-10 bg-gray-100 skeleton rounded-md animate-pulse" />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100/80">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-10 bg-gray-100 skeleton rounded-md animate-pulse" />
          </div>
          <div className="h-2.5 w-10 bg-gray-100 skeleton rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ initialCategories = [] }: ProductGridProps) {
  const { category, sort } = useFilterStore();
  const { query } = useSearchStore();
  const { fetchReviews, refreshVersion } = useReviewStore();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Bangun daftar kategori dari props SSR (tidak perlu fetch ulang)
  const categories: Category[] = [
    { id: 'all', name: 'Semua', icon: 'LayoutGrid' },
    ...initialCategories,
  ];

  // Fetch reviews sekali saat mount
  useEffect(() => {
    fetchReviews().catch((error) => console.error('Failed to fetch reviews:', error));
  }, []);

  // Fetch products saat filter/sort berubah
  useEffect(() => {
    setIsLoadingProducts(true);

    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);

    let apiFilter = '';
    if (sort === 'cheapest') apiFilter = 'terjangkau';
    else if (sort === 'newest') apiFilter = 'terbaru';
    else if (sort === 'popular') apiFilter = 'populer';
    else if (sort === 'discount') apiFilter = 'hemat';
    if (apiFilter) params.append('filter', apiFilter);

    const url = params.toString() ? `/api/public/products?${params.toString()}` : '/api/public/products';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      })
      .finally(() => setIsLoadingProducts(false));
  }, [category, sort, refreshVersion]);

  // Scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setShowScrollTop(docHeight > 0 && scrollY >= docHeight * 0.5);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Filter hanya untuk search query (kategori dan sort sudah ditangani API)
  const filtered = products.filter((p) =>
    query ? p.name.toLowerCase().includes(query.toLowerCase()) : true
  );

  const categoryName = categories.find((c) => c.id === category)?.name || 'Semua';
  const getSortName = () => {
    switch (sort) {
      case 'popular': return 'Populer';
      case 'cheapest': return 'Hemat';
      case 'newest': return 'Terbaru';
      case 'discount': return 'Diskon';
      default: return 'Populer';
    }
  };

  return (
    <>
      <section id="product-grid" className="px-4 py-3 min-h-[50vh]">
        <div className="mb-3 flex flex-col px-0.5">
          <h2 className="text-sm font-bold text-gray-800 tracking-tight">
            Produk {categoryName !== 'Semua' ? categoryName : ''}
          </h2>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">
            {isLoadingProducts
              ? 'Memuat produk...'
              : `Menampilkan ${filtered.length} item ${sort !== 'popular' ? `• ${getSortName()}` : ''}`
            }
          </p>
        </div>

        {isLoadingProducts ? (
          // Skeleton grid saat loading
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="text-gray-800 font-bold text-sm">Produk Tidak Ditemukan</h4>
            <p className="text-[11px] text-gray-500 mt-1 max-w-[200px]">
              {sort === 'discount'
                ? 'Wah, sepertinya belum ada promo di kategori ini.'
                : 'Coba pilih kategori lain atau cek kata kunci pencarianmu.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      <button
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
        className={`
          fixed bottom-8 right-6 z-9
          w-11 h-11 rounded-full
          bg-emerald-500 text-white
          shadow-[0_8px_25px_rgba(16,185,129,0.3)]
          flex items-center justify-center
          transition-all duration-500 cubic-bezier(0.34,1.56,0.64,1)
          hover:bg-emerald-600 hover:scale-110
          active:scale-90
          ${showScrollTop
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
          }
        `}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </>
  );
}