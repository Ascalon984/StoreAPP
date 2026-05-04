'use client';

import { useFilterStore } from '@/store/useFilterStore';
import { SORT_OPTIONS } from '@/lib/constants';
import {
  ArrowUpDown,
  Star,
  TrendingDown,
  History,
  Ticket,
} from 'lucide-react';

// ✅ SINKRON DENGAN SORT_OPTIONS + DISKON
const sortIconMap: Record<string, React.ElementType> = {
  popular: Star,
  cheapest: TrendingDown,
  newest: History,
  discount: Ticket,
};

// Filter diskon (tambahan)
const DISCOUNT_FILTER = {
  id: 'discount',
  label: 'Diskon',
};

export default function FilterSort() {
  const { sort, setSort } = useFilterStore();
  const allFilters = [...SORT_OPTIONS];
  if (!allFilters.some(f => f.id === 'discount')) allFilters.push(DISCOUNT_FILTER);

  return (
    // 1. Ganti bg-white/95 ke background aplikasi agar menyatu secara natural
    <section className="sticky top-[52px] z-30 bg-[#F8F9FA]/95 backdrop-blur-md border-y border-gray-200 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.05)]">
      <div className="max-w-container mx-auto px-4 py-2.5">
        <div className="grid grid-cols-4 gap-2">
          {allFilters.map((option) => {
            const Icon = sortIconMap[option.id] || ArrowUpDown;
            const isActive = sort === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setSort(option.id)}
                className={`
                  flex items-center justify-center gap-1.5 px-1 py-1.5 
                  rounded-xl text-[10px] font-bold tracking-tight
                  transition-all duration-300 ease-out
                  active:scale-95
                  ${isActive
                    ? 'bg-emerald-700 text-white shadow-[0_4px_10px_rgba(5,150,105,0.2)]'
                    : 'bg-white border border-gray-200 text-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                  }
                `}
              >
                <Icon
                  size={12}
                  strokeWidth={2.5} // Sedikit diturunkan dari 3 agar tetap elegan tanpa animasi
                  className={`
                    transition-colors duration-300
                    /* Kuning cerah saat aktif, Abu-abu lembut saat tidak aktif */
                    ${isActive ? 'text-yellow-400' : 'text-gray-400'}
                  `}
                />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}