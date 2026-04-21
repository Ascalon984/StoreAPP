'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Banner as BannerType } from '@/lib/types';

export default function Banner() {
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/public/banners')
      .then((res) => res.json())
      .then((data) => setBanners(data));
  }, []);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length === 0) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % banners.length;
        // Scroll ke banner berikutnya
        const el = scrollRef.current;
        if (el) {
          el.scrollTo({ left: next * el.offsetWidth, behavior: 'smooth' });
        }
        return next;
      });
    }, 5000);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length === 0) return;
    
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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

  return (
    <section className="px-4 py-2">
      {/* Header Label - Tetap dipertahankan di atas banner */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
          <h2 className="text-sm font-bold text-gray-800">
            Spesial Buat Kamu
          </h2>
        </div>

        <p className="text-[11px] text-gray-500 mt-0.5 ml-3 leading-tight">
          Promo eksklusif hanya untukmu hari ini
        </p>
      </div>

      {/* Banner Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto hide-scrollbar gap-4 px-0.5"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex-shrink-0 w-full rounded-2xl overflow-hidden aspect-[2/1] relative shadow-sm"
              style={{ scrollSnapAlign: 'start' }}
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-fill"
                priority={banner.id === '1'}
              />

              {/* Teks label/subtitle di atas*/}
            </div>
          ))}
        </div>

        {/* Indikator Dot */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                scrollTo(i);
                setCurrent(i);
                startAutoPlay();
              }}
              className={`h-1 rounded-full transition-all duration-300 ${i === current
                ? 'w-6 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
