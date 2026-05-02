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
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
      <div className="w-full aspect-[3/2] skeleton" />
      <div className="p-2.5 flex flex-col gap-2">
        <div className="h-3 w-4/5 skeleton rounded-md" />
        <div className="h-3 w-3/5 skeleton rounded-md" />
        <div className="h-4 w-2/5 skeleton rounded-md mt-1" />
        <div className="h-px bg-gray-100 my-0.5" />
        <div className="flex justify-between">
          <div className="h-2.5 w-14 skeleton rounded-md" />
          <div className="h-2.5 w-10 skeleton rounded-md" />
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
          <h3 className="text-sm font-bold text-gray-800 tracking-tight">
            Produk {categoryName !== 'Semua' ? categoryName : ''}
          </h3>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
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
              <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="text-gray-800 font-bold text-sm">Produk Tidak Ditemukan</h4>
            <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
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
        className={`
          fixed bottom-8 right-6 z-50
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