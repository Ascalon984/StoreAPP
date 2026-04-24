'use client';

import { useEffect, useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchStore } from '@/store/useSearchStore';
import { Product, Category } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { category, sort } = useFilterStore();
  const { query } = useSearchStore();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ id: 'all', name: 'Semua', icon: 'LayoutGrid' }]);

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
      .then((data) => setProducts(data));
  }, [category, sort]);

  useEffect(() => {
    fetch(`/api/public/categories?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setCategories([{ id: 'all', name: 'Semua', icon: 'LayoutGrid' }, ...data]);
      });
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
      <section id="product-grid" className="px-4 py-2 min-h-[50vh]">
        <div className="mb-2 text-[12px] text-gray-400">
          Menampilkan {filtered.length} item
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">
              {sort === 'discount' 
                ? 'Belum ada produk dengan diskon saat ini.' 
                : 'Belum ada produk di kategori ini.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Gulir ke atas"
        className={`
          fixed bottom-6 right-6 z-50
          w-10 h-10 rounded-full
          bg-gray-800/90 hover:bg-gray-700
          backdrop-blur-sm
          shadow-lg shadow-black/20
          flex items-center justify-center
          text-white
          transition-all duration-300 ease-out
          border border-gray-600/30
          hover:scale-110 hover:shadow-xl
          active:scale-95
          cursor-pointer
          ${showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
          }
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  );
}