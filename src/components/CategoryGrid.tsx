'use client';

import { useEffect, useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { Category } from '@/lib/types';

const iconPathMap: Record<string, string> = {
  all: '/icons/all icon.png',
  snack: '/icons/snack.png',
  minuman: '/icons/minuman.png',
  kebutuhan: '/icons/kebutuhan pokok.png',
  atk: '/icons/alat tulis.png',
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
  kebutuhan: { active: 'text-emerald-600', bg: 'bg-emerald-50', glow: 'bg-emerald-400' },
  atk: { active: 'text-blue-600', bg: 'bg-blue-50', glow: 'bg-blue-400' },
  kebersihan: { active: 'text-purple-600', bg: 'bg-purple-50', glow: 'bg-purple-400' },
  gas: { active: 'text-orange-600', bg: 'bg-orange-50', glow: 'bg-orange-400' },
  listrik: { active: 'text-yellow-600', bg: 'bg-yellow-50', glow: 'bg-yellow-400' },
  pakaian: { active: 'text-pink-600', bg: 'bg-pink-50', glow: 'bg-pink-400' },
  elektronik: { active: 'text-indigo-600', bg: 'bg-indigo-50', glow: 'bg-indigo-400' },
  peralatan: { active: 'text-teal-600', bg: 'bg-teal-50', glow: 'bg-teal-400' },
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
        if (!Array.isArray(data)) {
          console.error('Category API did not return an array:', data);
          return;
        }
        const limited = data.slice(0, 5);
        setCategories([
          { id: 'all', name: 'Semua', icon: 'LayoutGrid' },
          ...limited,
        ]);
      });
  }, []);

  const handleClick = (catId: string) => {
    setCategory(catId);
    const el = document.getElementById('product-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="px-4 pt-1 pb-2">
      {/* Header Kategori — Refined Version */}
      <div className="mb-3 px-0.5">
        <div className="flex items-center gap-2">
          {/* Indikator vertikal dibuat lebih ramping (3px) agar elegan */}
          <div className="w-[3px] h-4 bg-emerald-500 rounded-full" />

          <h2 className="text-sm font-bold text-gray-800 tracking-tight">
            Pilih Kategori
          </h2>
        </div>

        <p className="text-[11px] text-gray-400 font-medium mt-0.5 ml-[11px] leading-tight">
          Cari produk yang kamu butuhkan di sini
        </p>
      </div>

      {/* Card Container — white, soft elevation, light hairline border */}
      <div className="bg-white rounded-2xl p-2 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100/80">
        <div className="grid grid-cols-3 gap-1">
          {categories.map((cat) => {
            const iconPath = iconPathMap[cat.id] || iconPathMap.all;
            const isActive = category === cat.id;
            const colors = colorMap[cat.id] || colorMap.all;

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
                    ? `
                      bg-white 
                      /* Shadow super tipis & dekat (low elevation) */
                      shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                    `
                    : `bg-transparent hover:bg-gray-50/40`
                  }
                `}
              >
                <div className="relative flex items-center justify-center">
                  <img
                    src={iconPath}
                    alt={cat.name}
                    className={`
                      w-7 h-7 object-contain transition-transform duration-300 relative z-10
                      ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                    style={{ mixBlendMode: 'multiply' }}
                  />

                  {/* Glow diperkecil (inset-0) dan blur dikurangi (blur-lg) */}
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