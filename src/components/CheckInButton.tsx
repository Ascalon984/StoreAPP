"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CheckInButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("checkInVisible");
    if (saved !== null) {
      setIsVisible(saved === "true");
    }
  }, []);

  const toggleVisibility = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    localStorage.setItem("checkInVisible", String(newState));
  };

  if (!isMounted) return null;

  return (
    <>
      {/* ── Main Floating GIF ── */}
      <div
        className={`
          fixed bottom-[92px] right-2 z-40
          transition-all duration-300 ease-out
          ${
            isVisible
              ? "translate-x-0 opacity-100 pointer-events-auto"
              : "translate-x-[52px] opacity-90 pointer-events-none"
          }
        `}
      >
        <div className="relative w-[58px] h-[58px]">
          {/* Hide Chevron (Kondisi Terbuka) */}
          <button
            onClick={toggleVisibility}
            aria-label="Sembunyikan check-in"
            className={`
            absolute -top-4 -left-6 z-10
            w-6 h-6
            rounded-full
            bg-white
            border border-white
            shadow-md
            flex items-center justify-center
            active:scale-90
            transition-all duration-200
            ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2 pointer-events-none"
            }
          `}
          >
            <ChevronRight
              size={18}
              strokeWidth={2.8}
              className="text-gray-700"
            />
          </button>

          {/* GIF */}
          <Link
            href="/profile"
            aria-label="Buka halaman check-in"
            className="
              w-full h-full
              flex items-center justify-center
              active:scale-[0.96]
              transition-transform
            "
          >
            <img
              src="/icons/calendar_poin.webp"
              alt="Check In"
              className="
                w-full h-full
                object-contain
                drop-shadow-[0_8px_18px_rgba(0,0,0,0.16)]
                select-none
                pointer-events-none
              "
              draggable={false}
            />
          </Link>
        </div>
      </div>

      {/* ── Expand Button (Kondisi Tersembunyi) ── */}
      {/* Posisi disamakan persis dengan tinggi tombol atas GIF (-top-2 dari bottom-24 adalah bottom-[102px]) */}
      <button
        onClick={toggleVisibility}
        aria-label="Tampilkan check-in"
        className={`
          fixed bottom-[142px] right-2 z-40
          w-6 h-6
          rounded-full
          bg-white
          border border-white
          shadow-md
          flex items-center justify-center
          transition-all duration-500 ease-out
          active:scale-90
          ${
            !isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-2 pointer-events-none"
          }
        `}
      >
        <ChevronLeft size={18} strokeWidth={2.8} className="text-gray-700" />
      </button>
    </>
  );
}
