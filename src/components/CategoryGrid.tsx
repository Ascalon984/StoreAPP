'use client';

import { useEffect, useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { Category } from '@/lib/types';

const iconPathMap: Record<string, string> = {
  all: '/icons/all icon.png',
  snack: '/icons/snack.png',
  minuman: '/icons/minuman.png',
  'kebutuhan-pokok': '/icons/kebutuhan pokok.png',
  'alat-tulis': '/icons/alat tulis.png',
  kebersihan: '/icons/kebersihan.png',
  gas: '/icons/gas.png',
  listrik: '/icons/listrik.png',
  pakaian: '/icons/pakaian.png',
  elektronik: '/icons/elektronik.png',
  peralatan: '/icons/peralatan.png',
};

const colorMap: Record<string, { active: string; bg: string; glow: string }> = {
  all: { active: 'text-gray-700', bg: 'bg-gray-100', glow: 'bg-gray-400' },
  snack: { active: 'text-amber-600', bg: 'bg-amber-50', glow: 'bg-amber-400' },
  minuman: { active: 'text-sky-600', bg: 'bg-sky-50', glow: 'bg-sky-400' },
  'kebutuhan-pokok': { active: 'text-emerald-600', bg: 'bg-emerald-50', glow: 'bg-emerald-400' },
  'alat-tulis': { active: 'text-blue-600', bg: 'bg-blue-50', glow: 'bg-blue-400' },
  kebersihan: { active: 'text-purple-600', bg: 'bg-purple-50', glow: 'bg-purple-400' },
  gas: { active: 'text-orange-600', bg: 'bg-orange-50', glow: 'bg-orange-400' },
  listrik: { active: 'text-yellow-600', bg: 'bg-yellow-50', glow: 'bg-yellow-400' },
  pakaian: { active: 'text-pink-600', bg: 'bg-pink-50', glow: 'bg-pink-400' },
  elektronik: { active: 'text-indigo-600', bg: 'bg-indigo-50', glow: 'bg-indigo-400' },
  peralatan: { active: 'text-teal-600', bg: 'bg-teal-50', glow: 'bg-teal-400' },
};

interface CategoryGridProps {
  initialCategories?: Category[];
}

function CategorySkeleton() {
  return (
    <section className="px-4 pt-1 pb-2">
      <div className="mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-emerald-500 rounded-full" />
          <div className="h-4 w-28 skeleton rounded-md" />
        </div>
        <div className="h-3 w-44 skeleton rounded-md mt-1.5 ml-[11px]" />
      </div>
      <div className="bg-white rounded-2xl p-2 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100/80">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center py-1.5 px-1 gap-1.5">
              <div className="w-7 h-7 skeleton rounded-full" />
              <div className="h-2.5 w-10 skeleton rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CategoryGrid({ initialCategories = [] }: CategoryGridProps) {
  const { category, setCategory } = useFilterStore();
  const [isLoading, setIsLoading] = useState(initialCategories.length === 0);

  const buildCategoryList = (raw: Category[]) => {
    // Filter out 'all' if it exists in DB to prevent duplication, limit to max 5
    const activeFromDb = raw.filter(c => c.id !== 'all').slice(0, 5);
    const list = [
      { id: 'all', name: 'Semua', icon: 'LayoutGrid' },
      ...activeFromDb,
    ];

    // Pad to maintain symmetry (3 items for 1 row, 6 items for 2 rows)
    const targetLength = list.length <= 3 ? 3 : 6;
    while (list.length < targetLength) {
      list.push({
        id: `empty-slot-${list.length}`,
        name: 'Segera Hadir',
        icon: 'empty',
      });
    }

    return list;
  };

  const [categories, setCategories] = useState<Category[]>(
    initialCategories.length > 0
      ? buildCategoryList(initialCategories)
      : [{ id: 'all', name: 'Semua', icon: 'LayoutGrid' }]
  );

  // Hanya fetch dari client jika tidak ada data SSR
  useEffect(() => {
    if (initialCategories.length > 0) return;

    fetch('/api/public/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort by priority before building the list
          const sorted = [...data].sort((a, b) => (a.priority || 0) - (b.priority || 0));
          setCategories(buildCategoryList(sorted));
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err))
      .finally(() => setIsLoading(false));
  }, [initialCategories.length]);

  const handleClick = (catId: string) => {
    setCategory(catId);
    const el = document.getElementById('product-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) return <CategorySkeleton />;

  return (
    <section className="px-4 pt-1 pb-2">
      <div className="mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-emerald-500 rounded-full" />
          <h2 className="text-sm font-bold text-gray-800 tracking-tight">
            Pilih Kategori
          </h2>
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5 ml-[11px] leading-tight">
          Cari produk yang kamu butuhkan di sini
        </p>
      </div>

      <div className="bg-white rounded-2xl p-2 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100/80">
        <div className="grid grid-cols-3 gap-1">
          {categories.map((cat) => {
            if (cat.id.startsWith('empty-slot-')) {
              return (
                <div
                  key={cat.id}
                  className="group relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-300"
                >
                  <div className="relative flex items-center justify-center opacity-50 grayscale-[0.3]">
                    {/* Opacity dikurangi, ditambah sedikit grayscale agar terlihat 'coming soon' tapi tetap tajam */}
                    <img
                      src="/icons/segera hadir.png"
                      alt={cat.name}
                      className="w-7 h-7 object-contain" // Disamakan dengan ukuran ikon aktif (w-7)
                      loading="lazy"
                    />
                  </div>
                  <span className="mt-1 text-[10px] font-medium tracking-tight text-center text-gray-300 leading-tight">
                    {cat.name}
                  </span>
                </div>
              );
            }

            const iconPath = iconPathMap[cat.icon] || iconPathMap.all;
            const isActive = category === cat.id;
            const colors = colorMap[cat.icon] || colorMap.all;

            return (
              <button
                key={cat.id}
                onClick={() => handleClick(cat.id)}
                className={`
                  group relative flex flex-col items-center justify-center
                  py-1.5 px-1 rounded-xl
                  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  active:scale-95
                  ${isActive
                    ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                    : 'bg-transparent hover:bg-gray-50/40'
                  }
                `}
              >
                <div className="relative flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={iconPath}
                    alt={cat.name}
                    className={`
                      w-7 h-7 object-contain transition-transform duration-300 relative z-10
                      ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                    style={{ mixBlendMode: 'multiply' }}
                    loading="lazy"
                  />
                  {isActive && (
                    <div className={`absolute inset-0 blur-lg opacity-20 ${colors.glow} rounded-full`} />
                  )}
                </div>

                <span
                  className={`
                    mt-1 text-[10px] font-semibold tracking-tight text-center relative z-10
                    transition-colors duration-200 leading-tight
                    ${isActive ? colors.active : 'text-gray-500'}
                  `}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}