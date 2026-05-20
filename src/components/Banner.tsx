"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Banner as BannerType } from "@/lib/types";

interface BannerProps {
  initialBanners?: BannerType[];
}

function BannerSkeleton() {
  return (
    <section className="px-3 pt-1 pb-3 -mt-px">
      <div className="w-full aspect-[2.32/1] skeleton rounded-2xl" />
    </section>
  );
}

export default function Banner({ initialBanners = [] }: BannerProps) {
  const [banners, setBanners] = useState<BannerType[]>(initialBanners);
  const [isLoading, setIsLoading] = useState(initialBanners.length === 0);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isResettingRef = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // gap-1 = 4px
  const GAP_SIZE = 4;

  useEffect(() => {
    if (initialBanners.length > 0) return;

    fetch("/api/public/banners")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBanners(data);
      })
      .catch((err) => console.error("Failed to fetch banners:", err))
      .finally(() => setIsLoading(false));
  }, [initialBanners.length]);

  const hasMultipleBanners = banners.length > 1;

  // Clone first & last for infinite loop
  const displayBanners = hasMultipleBanners
    ? [banners[banners.length - 1], ...banners, banners[0]]
    : banners;

  // Set initial scroll position to first real slide
  useEffect(() => {
    if (!isLoading && hasMultipleBanners && scrollRef.current) {
      const el = scrollRef.current;
      el.scrollLeft = el.offsetWidth + GAP_SIZE;
      setReady(true);
    }
    if (!isLoading && !hasMultipleBanners) {
      setReady(true);
    }
  }, [isLoading, hasMultipleBanners]);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({
        left: (index + 1) * (el.offsetWidth + GAP_SIZE),
        behavior: "smooth",
      });
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
        el.scrollTo({
          left: (currentVisualIndex + 1) * stepWidth,
          behavior: "smooth",
        });
      }
    }, 5000);
  }, [hasMultipleBanners]);

  useEffect(() => {
    if (banners.length === 0) return;
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, startAutoPlay]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || banners.length <= 1) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    const currentScrollLeft = el.scrollLeft;
    const stepWidth = el.offsetWidth + GAP_SIZE;
    const visualIndex = Math.round(currentScrollLeft / stepWidth);

    if (!isResettingRef.current) {
      let activeDot = visualIndex - 1;
      if (activeDot < 0) activeDot = banners.length - 1;
      if (activeDot >= banners.length) activeDot = 0;
      if (activeDot !== current) setCurrent(activeDot);
    }

    // Jump to real first when reaching cloned last
    if (
      visualIndex >= displayBanners.length - 1 &&
      currentScrollLeft >= (displayBanners.length - 1) * stepWidth - 5
    ) {
      isResettingRef.current = true;
      el.style.scrollSnapType = "none";
      el.scrollLeft = stepWidth;
      el.style.scrollSnapType = "x mandatory";
      setCurrent(0);
      setTimeout(() => {
        isResettingRef.current = false;
      }, 50);
    }
    // Jump to real last when reaching cloned first
    else if (visualIndex <= 0 && currentScrollLeft <= 5) {
      isResettingRef.current = true;
      el.style.scrollSnapType = "none";
      el.scrollLeft = banners.length * stepWidth;
      el.style.scrollSnapType = "x mandatory";
      setCurrent(banners.length - 1);
      setTimeout(() => {
        isResettingRef.current = false;
      }, 50);
    }

    scrollTimeout.current = setTimeout(() => {
      startAutoPlay();
    }, 150);
  };

  if (isLoading) return <BannerSkeleton />;

  return (
    <section className="px-3 pt-1 pb-3 -mt-px">
      {/* Wrapper: no extra bg/blur/shadow — biarkan layer hijau di baliknya terlihat */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto hide-scrollbar gap-1 snap-x snap-mandatory"
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            visibility: ready ? "visible" : "hidden",
          }}
        >
          {displayBanners.map((banner, index) => (
            <div
              key={`${banner.id}-${index}`}
              className="flex-shrink-0 w-full snap-start"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[2.32/1] shadow-md transition-transform duration-300 active:scale-[0.98]">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 1}
                  unoptimized={index === 1}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators — moved outside, below banner */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                scrollTo(i);
                setCurrent(i);
                startAutoPlay();
              }}
              className={`
  rounded-full transition-all duration-300
  ${
    i === current
      ? "w-5 h-[5px] bg-[#048750]"
      : "w-[7px] h-[5px] bg-gray-300/90"
  }
`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
