'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
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
    if (el) {
      // Baca dimensi tanpa force reflow berlebih (atau jika dipanggil sesekali, tidak masalah)
      el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length <= 1) return;

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

  // Menyimpan timeout untuk debouncing scroll
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    // 1. Hentikan autoplay segera saat interaksi dimulai
    if (timerRef.current) clearInterval(timerRef.current);

    // 2. Update index secara real-time agar dots responsif
    const el = scrollRef.current;
    if (el) {
      const index = Math.round(el.scrollLeft / el.offsetWidth);
      if (index !== current) setCurrent(index);
    }

    // 3. Debounce hanya untuk memulai kembali autoplay
    scrollTimeout.current = setTimeout(() => {
      startAutoPlay();
    }, 150); // Eksekusi setelah berhenti scroll selama 150ms
  };

  if (isLoading) return <BannerSkeleton />;

  return (
    <section className="px-4 pt-4 pb-2">
      {/* Header Section: Menggunakan font-bold tracking-tight yang sudah kamu tentukan */}
      <div className="mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-emerald-500 rounded-full" />
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            Spesial Buat Kamu
          </h2>
        </div>
        <p className="text-[11px] text-gray-500 font-medium mt-0.5 ml-[11px] leading-tight">
          Promo eksklusif hanya untukmu hari ini
        </p>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          // Tambahkan gap sedikit agar antar banner ada ruang napas
          className="flex overflow-x-auto hide-scrollbar gap-4 snap-x snap-mandatory"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="flex-shrink-0 w-full snap-start"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[2/1] layer-card shadow-soft transition-transform duration-500 active:scale-[0.98]">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                  unoptimized={index === 0} 
                />
                
                {/* Efek Inner Shadow Gradient agar teks banner (jika ada) lebih kontras */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => { scrollTo(i); setCurrent(i); startAutoPlay(); }}
                // Menggunakan transisi lebar (shopee-style) dan backdrop-blur tipis
                className={`h-1.5 rounded-full transition-all duration-300 backdrop-blur-sm ${
                  i === current 
                    ? 'w-6 bg-white shadow-sm' 
                    : 'w-1.5 bg-white/40 hover:bg-white/60'
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
