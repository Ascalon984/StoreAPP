'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Banner as BannerType } from '@/lib/types';

interface BannerProps {
  initialBanners?: BannerType[];
}

// Skeleton saat data belum tersedia
function BannerSkeleton() {
  return (
    <section className="px-4 py-2">
      <div className="mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-emerald-500 rounded-full" />
          <div className="h-4 w-32 skeleton rounded-md" />
        </div>
        <div className="h-3 w-48 skeleton rounded-md mt-1.5 ml-[11px]" />
      </div>
      <div className="w-full aspect-[2/1] skeleton rounded-2xl" />
    </section>
  );
}

export default function Banner({ initialBanners = [] }: BannerProps) {
  const [banners, setBanners] = useState<BannerType[]>(initialBanners);
  const [isLoading, setIsLoading] = useState(initialBanners.length === 0);
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hanya fetch dari client jika tidak ada data dari SSR
  useEffect(() => {
    if (initialBanners.length > 0) return;

    fetch('/api/public/banners')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBanners(data);
      })
      .catch((err) => console.error('Failed to fetch banners:', err))
      .finally(() => setIsLoading(false));
  }, [initialBanners.length]);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
  }, []);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length === 0) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % banners.length;
        const el = scrollRef.current;
        if (el) el.scrollTo({ left: next * el.offsetWidth, behavior: 'smooth' });
        return next;
      });
    }, 5000);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length === 0) return;
    startAutoPlay();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length, startAutoPlay]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    if (index !== current) {
      setCurrent(index);
      startAutoPlay();
    }
  };

  if (isLoading) return <BannerSkeleton />;

  return (
    <section className="px-4 pt-4 pb-2">
      <div className="mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-emerald-500 rounded-full" />
          <h2 className="text-sm font-bold text-gray-800 tracking-tight">
            Spesial Buat Kamu
          </h2>
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5 ml-[11px] leading-tight">
          Promo eksklusif hanya untukmu hari ini
        </p>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto hide-scrollbar gap-3 px-0 snap-x snap-mandatory scroll-smooth"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch', // Penting untuk smoothness di iPhone
            scrollBehavior: 'smooth',
          }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="flex-shrink-0 w-full snap-start"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[2/1] shadow-sm bg-gray-100">
                <img
                  src={banner.image}
                  alt={banner.title}
                  // object-cover menggantikan object-fill — memperbaiki image-aspect-ratio audit
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  // fetchpriority="high" pada banner pertama agar LCP image diprioritaskan browser
                  {...(index === 0 ? { fetchPriority: 'high' } : {})}
                />
              </div>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => { scrollTo(i); setCurrent(i); startAutoPlay(); }}
                className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
