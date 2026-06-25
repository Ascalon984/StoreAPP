"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Banner as BannerType } from "@/lib/types";

interface BannerProps {
  initialBanners?: BannerType[];
}

function BannerSkeleton() {
  return (
    <section className="px-2.5 pt-4 pb-1 -mt-px">
      <div className="w-full aspect-[2.65/1] skeleton rounded-lg" />
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
  const scrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // gap-1 = 4px
  const GAP_SIZE = 2;

  // --- Defined up top so every effect/callback below can rely on it safely ---
  const getStepWidth = useCallback((el: HTMLDivElement) => {
    const firstChild = el.children[0] as HTMLElement | undefined;
    return firstChild
      ? firstChild.offsetWidth + GAP_SIZE * 2
      : el.offsetWidth + GAP_SIZE * 2;
  }, []);

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
      const stepWidth = getStepWidth(el);
      el.scrollLeft = stepWidth;
      setReady(true);
    }
    if (!isLoading && !hasMultipleBanners) {
      setReady(true);
    }
  }, [isLoading, hasMultipleBanners, getStepWidth]);

  const scrollTo = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (el) {
        el.scrollTo({
          left: (index + 1) * (el.offsetWidth + GAP_SIZE),
          behavior: "smooth",
        });
      }
    },
    [GAP_SIZE],
  );

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!hasMultipleBanners) return;

    timerRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (el && !isResettingRef.current) {
        const stepWidth = getStepWidth(el);
        const currentVisualIndex = Math.round(el.scrollLeft / stepWidth);
        el.scrollTo({
          left: (currentVisualIndex + 1) * stepWidth,
          behavior: "smooth",
        });
      }
    }, 6000);
  }, [hasMultipleBanners, getStepWidth]);

  useEffect(() => {
    if (banners.length === 0) return;
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, startAutoPlay]);

  // Snap the clone back to its real counterpart. Same treatment (rAF) for
  // both directions so the browser never "fights" momentum scroll with a
  // forced scrollLeft — this is what caused the jump on manual swipe.
  const settleClonePosition = useCallback(
    (el: HTMLDivElement) => {
      const stepWidth = getStepWidth(el);
      const visualIndex = Math.round(el.scrollLeft / stepWidth);
      const lastVisualIndex = displayBanners.length - 1;

      if (visualIndex >= lastVisualIndex) {
        // landed on cloned first -> jump to real first
        isResettingRef.current = true;
        el.style.scrollSnapType = "none";
        el.scrollLeft = stepWidth;
        setCurrent(0);
        requestAnimationFrame(() => {
          el.style.scrollSnapType = "x mandatory";
          isResettingRef.current = false;
        });
        return true;
      }

      if (visualIndex <= 0) {
        // landed on cloned last -> jump to real last
        isResettingRef.current = true;
        el.style.scrollSnapType = "none";
        el.scrollLeft = banners.length * stepWidth;
        setCurrent(banners.length - 1);
        requestAnimationFrame(() => {
          el.style.scrollSnapType = "x mandatory";
          isResettingRef.current = false;
        });
        return true;
      }

      return false;
    },
    [getStepWidth, displayBanners.length, banners.length],
  );

  // Fires once the browser has actually finished settling the scroll
  // position (native `scrollend`, with a debounce fallback for browsers
  // that don't support it yet, e.g. older Safari).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || banners.length <= 1) return;

    const handleSettled = () => {
      if (isResettingRef.current) return;
      settleClonePosition(el);

      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
      resumeTimeout.current = setTimeout(() => {
        startAutoPlay();
      }, 150);
    };

    const supportsScrollEnd = "onscrollend" in window;

    if (supportsScrollEnd) {
      el.addEventListener("scrollend", handleSettled);
      return () => el.removeEventListener("scrollend", handleSettled);
    }

    // Fallback: debounce on regular scroll events.
    const handleScrollFallback = () => {
      if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);
      scrollEndTimeout.current = setTimeout(handleSettled, 120);
    };
    el.addEventListener("scroll", handleScrollFallback, { passive: true });
    return () => el.removeEventListener("scroll", handleScrollFallback);
  }, [banners.length, settleClonePosition, startAutoPlay]);

  // Live updates while scrolling: pause autoplay + update the active dot.
  // This NO LONGER does any clone-jumping itself — that's handled once
  // scroll has actually settled (see effect above), which is what fixes
  // the instability when swiping to the last banner.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || banners.length <= 1) return;

    if (timerRef.current) clearInterval(timerRef.current);

    if (!isResettingRef.current) {
      const stepWidth = getStepWidth(el);
      const visualIndex = Math.round(el.scrollLeft / stepWidth);
      let activeDot = visualIndex - 1;
      if (activeDot < 0) activeDot = banners.length - 1;
      if (activeDot >= banners.length) activeDot = 0;
      if (activeDot !== current) setCurrent(activeDot);
    }
  };

  if (isLoading) return <BannerSkeleton />;

  return (
    <section className="px-2.5 pt-4 pb-0 -mt-px">
      {/* Wrapper: no extra bg/blur/shadow — biarkan layer hijau di baliknya terlihat */}
      <div className="relative aspect-[2.4/1] overflow-visible">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="
  flex overflow-x-auto hide-scrollbar
  gap-0.3
  snap-x snap-mandatory
  overflow-y-visible
  px-2
"
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            visibility: ready ? "visible" : "hidden",
          }}
        >
          {displayBanners.map((banner, index) => {
            const realIndex =
              index === 0
                ? banners.length - 1
                : index === displayBanners.length - 1
                  ? 0
                  : index - 1;

            const isActive = realIndex === current;

            return (
              <div
                key={`${banner.id}-${index}`}
                className="
          flex-shrink-0
          w-[96.5%]
          snap-center snap-always
          transition-all duration-700 ease-out
        "
              >
                <div
                  className={`
            relative overflow-hidden aspect-[2.6/1]
            rounded-2xl
            shadow-md
            transition-all duration-500
            ${
              isActive
                ? "scale-100 opacity-100 shadow-lg"
                : "scale-[0.965] opacity-55 shadow-sm"
            }
          `}
                >
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
            );
          })}
        </div>
      </div>

      {/* Dot indicators — moved outside, below banner */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-[3px] -mt-2.5">
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
                    : "w-[7px] h-[5px] bg-gray-300/70"
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
