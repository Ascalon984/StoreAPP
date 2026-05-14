'use client';

import { useFilterStore } from '@/store/useFilterStore';
import { useState, useEffect } from 'react';
import { SORT_OPTIONS } from '@/lib/constants';
import {
  ArrowUpDown,
  Star,
  TrendingDown,
  History,
  Ticket,
} from 'lucide-react';

const sortIconMap: Record<string, React.ElementType> = {
  popular: Star,
  cheapest: TrendingDown,
  newest: History,
  discount: Ticket,
};

const DISCOUNT_FILTER = {
  id: 'discount',
  label: 'Diskon',
};

export default function FilterSort() {
  const { sort, setSort } = useFilterStore();
  const [isScrolled, setIsScrolled] = useState(false);

  const allFilters = [...SORT_OPTIONS];
  if (!allFilters.some(f => f.id === 'discount')) allFilters.push(DISCOUNT_FILTER);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className={`
        sticky top-[52px] z-30 bg-white backdrop-blur-md
        border-b border-gray-100 
        transition-all duration-300 ease-in-out
        pb-2 pt-1
        ${isScrolled ? 'shadow-layer-md' : 'shadow-layer-xs'}
      `}
    >
      <div className="max-w-container mx-auto px-4 py-2">
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
                    ? 'bg-emerald-700 text-white shadow-layer-lg'
                    : 'bg-white text-gray-600 ring-1 ring-slate-900/[0.04] shadow-layer-xs'
                  }
                `}
              >
                <Icon
                  size={12}
                  strokeWidth={2.5}
                  className={`
                    transition-colors duration-300
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