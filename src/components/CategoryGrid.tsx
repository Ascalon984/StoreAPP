'use client';

import { useEffect, useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { Category } from '@/lib/types';

// Mapping path icon PNG untuk setiap kategori
const iconPathMap: Record<string, string> = {
  all: '/icons/all icon.png',
  snack: '/icons/snack.png',
  minuman: '/icons/minuman.png',
  kebutuhan: '/icons/kebutuhan pokok.png',
  atk: '/icons/alat tulis.png',
  kebersihan: '/icons/kebersihan.png',
};

// Color mapping untuk setiap kategori
const colorMap: Record<string, { active: string; inactive: string; bg: string; border: string }> = {
  all: { active: 'text-gray-700', inactive: 'text-gray-400', bg: 'bg-gray-50/50', border: 'border-gray-500/20' },
  snack: { active: 'text-amber-500', inactive: 'text-amber-300', bg: 'bg-amber-50/50', border: 'border-amber-500/20' },
  minuman: { active: 'text-sky-500', inactive: 'text-sky-300', bg: 'bg-sky-50/50', border: 'border-sky-500/20' },
  kebutuhan: { active: 'text-emerald-500', inactive: 'text-emerald-300', bg: 'bg-emerald-50/50', border: 'border-emerald-500/20' },
  atk: { active: 'text-blue-500', inactive: 'text-blue-300', bg: 'bg-blue-50/50', border: 'border-blue-500/20' },
  kebersihan: { active: 'text-purple-500', inactive: 'text-purple-400', bg: 'bg-purple-50/50', border: 'border-purple-500/20' },
};

export default function CategoryGrid() {
  const { category, setCategory } = useFilterStore();
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'Semua', icon: 'LayoutGrid' },
  ]);

  useEffect(() => {
    fetch('/api/public/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories([
          { id: 'all', name: 'Semua', icon: 'LayoutGrid' },
          ...data,
        ]);
      });
  }, []);

  const handleClick = (catId: string) => {
    setCategory(catId);
    const el = document.getElementById('product-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="px-4 py-2">
      {/* Sub Label / Header */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
          <h2 className="text-sm font-bold text-gray-800">
            Pilih Kategori
          </h2>
        </div>

        <p className="text-[11px] text-gray-500 mt-0.5 ml-3 leading-tight">
          Cari produk yang kamu butuhkan di sini
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {categories.map((cat) => {
          const iconPath = iconPathMap[cat.id] || iconPathMap.all;
          const isActive = category === cat.id;
          const colors = colorMap[cat.id] || colorMap.all;
          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 tap-active border ${isActive
                ? `${colors.bg} ${colors.border} shadow-sm`
                : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
            >
              <img
                src={iconPath}
                alt={cat.name}
                width={24}
                height={24}
                className="w-7 h-7 object-contain"
                style={{
                  opacity: 1,
                  mixBlendMode: 'multiply',
                }}
              />
              <span className={`mt-1 text-[10px] font-semibold text-center transition-colors duration-200 ${isActive ? colors.active : 'text-gray-500'
                }`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}