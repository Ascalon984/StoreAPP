'use client';

import Image from 'next/image';
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
    <section className="px-4 pt-1 pb-3.5">
      <div className="mb-0.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-emerald-500 rounded-full" />
          <div className="h-4 w-28 skeleton rounded-md" />
        </div>
      </div>

      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center flex-shrink-0 w-[64px] pt-3 pb-2.5 px-1 rounded-2xl"
          >
            {/* Icon area dengan elips di bawahnya */}
            <div className="relative flex items-center justify-center w-8 h-8">
              <div className="w-7 h-7 skeleton rounded-xl relative z-10" />
              {/* Elips skeleton */}
              <div className="absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-[10%]
                w-[38px] h-[19px] rounded-[100%] skeleton opacity-40 z-0" />
            </div>
            {/* Label skeleton */}
            <div className="h-2.5 w-10 skeleton rounded-md mt-2" />
          </div>
        ))}
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
    const bottomSheetElement = document.getElementById('bottom-sheet');
    if (bottomSheetElement) {
      const rect = bottomSheetElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const bottomSheetTop = scrollY + rect.top;
      const targetScroll = Math.max(bottomSheetTop - 60, 0);
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) return <CategorySkeleton />;

  return (
    <section className="px-4 pt-1 pb-3.5">
      <div className="mb-0.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-emerald-500 rounded-full shadow-sm" />
          <h2 className="text-sm font-bold text-gray-800 tracking-tight drop-shadow-sm">
            Kategori Favorit
          </h2>
        </div>
      </div>

      <div
        className="flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          if (cat.id.startsWith('empty-slot-')) return null;

          const iconPath = iconPathMap[cat.icon] || iconPathMap.all;
          const isActive = category === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`
              group relative flex flex-col items-center flex-shrink-0
              w-[64px] pt-3 pb-2.5 px-1
              transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              active:scale-95
              ${isActive
                  ? 'bg-transparent shadow-none'
                  : 'bg-transparent hover:bg-transparent'
                }
            `}
            >
              {/* KONTEN IKON & ELIPS OVAL */}
              <div className="relative flex items-center justify-center w-8 h-8">
                {/* ELIPS OVAL SEMPURNA — Menggunakan ukuran w-11 h-6 untuk rasio elips ideal */}
                <div
                  className={`
                  absolute top-[53%] left-1/2 -translate-x-1/2 -translate-y-[10%]
                  w-[38px] h-[19px] rounded-[100%] transition-all duration-300 z-0
                  ${isActive
                      ? 'bg-amber-500 opacity-90 blur-[0.5px] scale-105 shadow-[0_1px_6px_rgba(251,191,36,0.4)]'
                      : 'bg-emerald-500 opacity-75 blur-[0.5px]'
                    }
                `}
                />

                {/* Icon */}
                <Image
                  src={iconPath}
                  alt={cat.name}
                  width={28}
                  height={28}
                  className={`
                  w-7 h-7 object-contain relative z-10
                  transition-transform duration-300
                  ${isActive ? 'scale-110 -translate-y-[1px]' : 'group-hover:scale-105'}
                `}
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>

              {/* Label / Teks */}
              <span className={`
              mt-2 text-[10px] font-semibold tracking-tight text-center
              leading-tight w-full truncate relative z-10
              ${isActive ? 'text-amber-600' : 'text-gray-500'}
            `}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}