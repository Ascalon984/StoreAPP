"use client";

import {
  ArrowLeft,
  MoreVertical,
  Store,
  Flag,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ChatReportSheet } from "./ChatReportSheet";

interface ChatHeaderProps {
  onBack: () => void;
  isOnline?: boolean;
  name?: string;
  isOfficial?: boolean;
  onMore?: () => void;
}

export default function ChatHeader({
  onBack,
  isOnline = true,
  name = "Customer Service",
  isOfficial = false,
  onMore,
}: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // buka menu
  const openMenu = () => {
    setIsMounted(true);
  };

  const closeMenu = () => setMenuOpen(false); // unmount ditangani onTransitionEnd

  useEffect(() => {
    if (!menuOpen && !isMounted) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, isMounted]);

  useLayoutEffect(() => {
    if (isMounted) {
      requestAnimationFrame(() => setMenuOpen(true));
    }
  }, [isMounted]);

  return (
    <div
      className={`
        flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5
        transition-colors
        ${
          isOfficial
            ? "bg-[#048750] shadow-sm"
            : "bg-white border-b border-gray-100"
        }
      `}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        aria-label="Kembali"
        className={`
          w-8 h-8 flex items-center justify-center rounded-full
          active:scale-90 transition-all -ml-2
          ${
            isOfficial
              ? "text-white/80 hover:text-white hover:bg-white/10"
              : "text-gray-700 hover:bg-gray-100"
          }
        `}
      >
        <ArrowLeft size={25} strokeWidth={1.5} />
      </button>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center border
            ${
              isOfficial
                ? "bg-emerald-100 border-white/20"
                : "bg-gray-100 border-gray-200"
            }
          `}
        >
          <Store
            size={20}
            strokeWidth={1.8}
            className={isOfficial ? "text-emerald-700" : "text-gray-500"}
          />
        </div>

        {isOnline && (
          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
        )}
      </div>

      {/* Name & Status */}
      <div className="flex-1 min-w-0 pl-1">
        <p
          className={`
            text-[13px] font-semibold tracking-[0.02em] leading-none
            ${isOfficial ? "text-white" : "text-gray-700"}
          `}
        >
          {name}
        </p>

        <p
          className={`
            text-[10px] font-medium mt-1.5 leading-none
            ${isOfficial ? "text-white/70" : "text-gray-500"}
          `}
        >
          {isOnline ? "Online sekarang" : "Terakhir kali online baru saja"}
        </p>
      </div>

      {/* More Button (Seller Only) */}
      {!isOfficial && (
        <div className="relative -mr-2" ref={menuRef}>
          <button
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
            aria-label="Lainnya"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-700"
          >
            <MoreVertical size={21} strokeWidth={1.8} />
          </button>

          {isMounted && (
            <div
              onTransitionEnd={() => {
                if (!menuOpen) setIsMounted(false);
              }}
              className={`
                absolute -translate-x-2.5 right-0 top-[calc(100%+6px)]
                w-40 overflow-hidden rounded-lg
                border border-gray-100 bg-white shadow-layer-sm
                origin-top-right
                transition-all duration-120 ease-out
                -mt-2
                ${
                  menuOpen
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 -translate-y-1.5 scale-95 pointer-events-none"
                }
                z-50
              `}
            >
              <button
                onClick={() => {
                  setIsFollowing((v) => !v);
                }}
                className="
                  flex w-full items-center gap-2.5
                  px-3 py-2
                  text-left
                  text-[12.5px] font-medium
                  text-gray-700
                  transition-colors
                  hover:bg-gray-50
                  active:bg-gray-100
                "
              >
                <Star
                  size={16}
                  strokeWidth={2}
                  className={
                    isFollowing
                      ? "fill-amber-500 text-amber-500"
                      : "text-gray-700"
                  }
                />

                <span>{isFollowing ? "Mengikuti" : "Ikuti Toko"}</span>
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  setIsReportSheetOpen(true);
                }}
                className="
  flex w-full items-center gap-2.5
  px-3 py-2
  text-left
  text-[12.5px] font-medium
  text-gray-700
  transition-colors
  hover:bg-gray-50
  active:bg-gray-100
"
              >
                <Flag size={16} strokeWidth={2} />
                <span>Laporkan Penjual</span>
              </button>

              <div className="mx-4 h-px bg-gray-100" />

              <button
                onClick={() => {
                  setIsBlocked((v) => !v);
                }}
                className="
    flex w-full items-center gap-2.5
    px-3 py-2
    text-left
    text-[12.5px] font-medium
    text-gray-700
    transition-colors
    hover:bg-gray-50
    active:bg-gray-100
  "
              >
                {isBlocked ? (
                  <VolumeX size={16} strokeWidth={2} className="text-red-600" />
                ) : (
                  <Volume2
                    size={16}
                    strokeWidth={2}
                    className="text-gray-700"
                  />
                )}

                <span>{isBlocked ? "Dibisukan" : "Bisukan"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      <ChatReportSheet
        show={isReportSheetOpen}
        onClose={() => setIsReportSheetOpen(false)}
        sellerName={name}
      />
    </div>
  );
}
