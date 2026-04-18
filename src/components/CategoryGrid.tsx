'use client';

import { useFilterStore } from '@/store/useFilterStore';
import { categories } from '@/lib/data';
import {
  LayoutGrid, Smartphone, Wifi, Zap, Gamepad2,
  Wallet, Ticket, MessageCircle, Wrench,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  LayoutGrid, Smartphone, Wifi, Zap, Gamepad2,
  Wallet, Ticket, MessageCircle, Wrench,
};

// Color mapping untuk setiap kategori
const colorMap: Record<string, { active: string; inactive: string; bg: string; border: string }> = {
  all: { active: 'text-gray-700', inactive: 'text-gray-400', bg: 'bg-gray-50/50', border: 'border-gray-500/20' },
  pulsa: { active: 'text-emerald-500', inactive: 'text-emerald-300', bg: 'bg-emerald-50/50', border: 'border-emerald-500/20' },
  data: { active: 'text-sky-500', inactive: 'text-sky-300', bg: 'bg-sky-50/50', border: 'border-sky-500/20' },
  pln: { active: 'text-amber-500', inactive: 'text-amber-300', bg: 'bg-amber-50/50', border: 'border-amber-500/20' },
  game: { active: 'text-purple-500', inactive: 'text-purple-400', bg: 'bg-purple-50/50', border: 'border-purple-500/20' }, // ✅ perbaiki
  ewallet: { active: 'text-emerald-500', inactive: 'text-emerald-300', bg: 'bg-emerald-50/50', border: 'border-emerald-500/20' }, // ✅ perbaiki
  voucher: { active: 'text-orange-500', inactive: 'text-orange-300', bg: 'bg-orange-50/50', border: 'border-orange-500/20' },
  sosmed: { active: 'text-cyan-500', inactive: 'text-cyan-300', bg: 'bg-cyan-50/50', border: 'border-cyan-500/20' },
  tools: { active: 'text-slate-500', inactive: 'text-slate-300', bg: 'bg-slate-50/50', border: 'border-slate-500/20' },
};

export default function CategoryGrid() {
  const { category, setCategory } = useFilterStore();

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
            Pilih Layanan
          </h2>
        </div>

        <p className="text-[11px] text-gray-500 mt-0.5 ml-3 leading-tight">
          Cari produk yang kamu butuhkan di sini
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || LayoutGrid;
          const isActive = category === cat.id;
          const colors = colorMap[cat.id] || colorMap.all;
          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all duration-200 tap-active border ${isActive
                ? `${colors.bg} ${colors.border} shadow-sm`
                : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
            >
              <Icon
                size={17}
                strokeWidth={2}
                className={`transition-colors duration-200 ${isActive ? colors.active : colors.inactive}`}
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