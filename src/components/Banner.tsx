'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Banner as BannerType } from '@/lib/types';

interface BannerProps {
  initialBanners?: BannerType[];
}

// Skeleton dioptimalkan: sub-label dihapus agar konsisten dengan UI utama
function BannerSkeleton() {
  return (
    <section className="px-4 pt-1 pb-2">
      {/* mb-1.5 diselaraskan dengan container utama */}
      <div className="mb-1.5 px-0.5">
        <div className="flex items-center gap-2">
          {/* Batang dekorator disesuaikan memakai warna oranye */}
          <div className="w-[3px] h-4 bg-orange-500 rounded-full shadow-sm" />
          <div className="h-4 w-32 skeleton rounded-md" />
        </div>
        {/* Sub-label skeleton <div className="h-3 w-48 ... mt-1.5" /> telah dihapus dari sini */}
      </div>
      <div className="w-full aspect-[2.15/1] skeleton rounded-2xl" />
    </section>
  );
}

export default function Banner({ initialBanners = [] }: BannerProps) {
  const [banners, setBanners] = useState<BannerType[]>(initialBanners);
  const [isLoading, setIsLoading] = useState(initialBanners.length === 0);
  const [current, setCurrent] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isResettingRef = useRef(false);

  // GAP_SIZE diatur ke 16 karena menggunakan kelas tailwind `gap-4` (16px)
  const GAP_SIZE = 16;

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

  const hasMultipleBanners = banners.length > 1;
  const displayBanners = hasMultipleBanners
    ? [banners[banners.length - 1], ...banners, banners[0]]
    : banners;

  // Set posisi awal tepat di slide asli pertama dengan memperhitungkan jarak gap-4
  useEffect(() => {
    if (!isLoading && hasMultipleBanners && scrollRef.current) {
      const el = scrollRef.current;
      el.scrollLeft = el.offsetWidth + GAP_SIZE;
    }
  }, [isLoading, hasMultipleBanners]);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (el) {
      // Perhitungan melompat melibatkan perkalian ukuran elemen ditambah celah gap
      el.scrollTo({ left: (index + 1) * (el.offsetWidth + GAP_SIZE), behavior: 'smooth' });
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!hasMultipleBanners) return;

    timerRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (el && !isResettingRef.current) {
        const stepWidth = el.offsetWidth + GAP_SIZE;
        const currentVisualIndex = Math.round(el.scrollLeft / stepWidth);
        el.scrollTo({ left: (currentVisualIndex + 1) * stepWidth, behavior: 'smooth' });
      }
    }, 5000);
  }, [hasMultipleBanners]);

  useEffect(() => {
    if (banners.length === 0) return;
    startAutoPlay();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length, startAutoPlay]);

  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || banners.length <= 1) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    const currentScrollLeft = el.scrollLeft;
    const width = el.offsetWidth;
    const stepWidth = width + GAP_SIZE;

    const visualIndex = Math.round(currentScrollLeft / stepWidth);

    if (!isResettingRef.current) {
      let activeDot = visualIndex - 1;
      if (activeDot < 0) activeDot = banners.length - 1;
      if (activeDot >= banners.length) activeDot = 0;
      if (activeDot !== current) setCurrent(activeDot);
    }

    // Pindah instan ke slide asli pertama jika mentok kanan (Kloning Slide Pertama)
    if (visualIndex >= displayBanners.length - 1 && currentScrollLeft >= (displayBanners.length - 1) * stepWidth - 5) {
      isResettingRef.current = true;
      el.style.scrollSnapType = 'none';
      el.scrollLeft = stepWidth;
      el.style.scrollSnapType = 'x mandatory';
      setCurrent(0);
      setTimeout(() => { isResettingRef.current = false; }, 50);
    }
    // Pindah instan ke slide asli terakhir jika mentok kiri (Kloning Slide Terakhir)
    else if (visualIndex <= 0 && currentScrollLeft <= 5) {
      isResettingRef.current = true;
      el.style.scrollSnapType = 'none';
      el.scrollLeft = banners.length * stepWidth;
      el.style.scrollSnapType = 'x mandatory';
      setCurrent(banners.length - 1);
      setTimeout(() => { isResettingRef.current = false; }, 50);
    }

    scrollTimeout.current = setTimeout(() => {
      startAutoPlay();
    }, 150);
  };

  if (isLoading) return <BannerSkeleton />;

  return (
    <section className="px-4 pt-1 pb-2">
      <div className="mb-1.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-orange-500 rounded-full shadow-sm" />
          <h2 className="text-sm font-bold text-white tracking-tight drop-shadow-sm">
            Rekomendasi Hari Ini
          </h2>
        </div>
      </div>

      <div className="relative group bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-inner">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto hide-scrollbar gap-4 snap-x snap-mandatory"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {displayBanners.map((banner, index) => (
            <div key={`${banner.id}-clone-${index}`} className="flex-shrink-0 w-full snap-start">
              <div className="relative rounded-2xl overflow-hidden aspect-[2.15/1] layer-card shadow-soft transition-transform duration-500 active:scale-[0.98]">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 1}
                  unoptimized={index === 1}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
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
                className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}