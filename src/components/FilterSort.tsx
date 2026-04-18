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

  // Gabungkan SORT_OPTIONS dengan filter diskon
  const allFilters = [...SORT_OPTIONS];
  const hasDiscount = allFilters.some(f => f.id === 'discount');
  if (!hasDiscount) {
    allFilters.push(DISCOUNT_FILTER);
  }

  return (
    <section className="sticky top-[52px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-container mx-auto px-4 py-2">
        {/* Container filter - GRID/Layout tetap, TANPA SCROLL */}
        <div className="grid grid-cols-4 gap-2">
          {allFilters.map((option) => {
            const Icon = sortIconMap[option.id] || ArrowUpDown;
            const isActive = sort === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setSort(option.id)}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 active:scale-95 ${isActive
                    ? 'bg-primary text-white border border-primary'
                    : 'bg-gray-50 border border-gray-200 text-gray-600'
                  }`}
              >
                <Icon size={13} strokeWidth={2} />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}