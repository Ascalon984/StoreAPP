'use client';

import { useEffect, useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { useReviewStore } from '@/store/useReviewStore';
import { Product, Category } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { category, sort } = useFilterStore();
  const { query } = useSearchStore();
  const { fetchReviews, refreshVersion } = useReviewStore();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ id: 'all', name: 'Semua', icon: 'LayoutGrid' }]);

  // Fetch reviews once on component mount (only once, no dependencies)
  useEffect(() => {
    fetchReviews().catch((error) => console.error('Failed to fetch reviews:', error));
  }, []);

  useEffect(() => {
    let url = '/api/public/products';
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);

    let apiFilter = '';
    if (sort === 'cheapest') apiFilter = 'terjangkau';
    else if (sort === 'newest') apiFilter = 'terbaru';
    else if (sort === 'popular') apiFilter = 'populer';
    else if (sort === 'discount') apiFilter = 'hemat';

    if (apiFilter) params.append('filter', apiFilter);

    params.append('t', Date.now().toString());

    fetch(`${url}?${params.toString()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Product API did not return an array:', data);
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      });
  }, [category, sort, refreshVersion]);

  useEffect(() => {
    fetch(`/api/public/categories?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories([{ id: 'all', name: 'Semua', icon: 'LayoutGrid' }, ...data]);
        } else {
          console.error('Category API did not return an array:', data);
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Tampilkan jika scroll sudah melebihi 50% total halaman
      if (docHeight > 0 && scrollY >= docHeight * 0.5) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Frontend filtering only for search query, as API has already applied category and sort.
  const filtered = products.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  // Get label untuk display
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
        {/* Header yang lebih bersih dan lapang */}
        <div className="mb-5 flex flex-col px-0.5">
          <h3 className="text-sm font-bold text-gray-800 tracking-tight">
            Produk {categoryName !== 'Semua' ? categoryName : ''}
          </h3>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
            Menampilkan {filtered.length} item {sort !== 'popular' ? `• ${getSortName()}` : ''}
          </p>
        </div>

        {filtered.length === 0 ? (
          // Empty State (Tetap sama)
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

      {/* Scroll to Top Button - Polish agar senada dengan UI */}
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