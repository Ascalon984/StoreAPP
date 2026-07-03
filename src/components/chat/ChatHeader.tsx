"use client";

import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  onBack: () => void;
  isOnline?: boolean;
  name?: string;
  isOfficial?: boolean;
}

export default function ChatHeader({
  onBack,
  isOnline = true,
  name = "Customer Service",
  isOfficial = false,
}: ChatHeaderProps) {
  const avatarText = name.substring(0, 2).toUpperCase();

  return (
    <div
      className={`
        flex-shrink-0 flex items-center gap-1.5 px-4 py-3
        transition-colors
        ${
          isOfficial
            ? "bg-[#048750] shadow-sm"
            : "bg-white border-b border-gray-200"
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
        <ArrowLeft size={24} strokeWidth={1.5} />
      </button>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`
            w-9 h-9 rounded-full flex items-center justify-center border
            ${
              isOfficial
                ? "bg-emerald-100 border-white/20"
                : "bg-gray-100 border-gray-200"
            }
          `}
        >
          <span className="text-emerald-700 font-semibold text-[11px] leading-none">
            {avatarText}
          </span>
        </div>

        {isOnline && (
          <div className="absolute bottom-0 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
        )}
      </div>

      {/* Name & Status */}
      <div className="flex-1 min-w-0 pl-1">
        <p
          className={`
            text-[12px] font-semibold tracking-[0.02em] leading-none
            ${isOfficial ? "text-white" : "text-gray-700"}
          `}
        >
          {name}
        </p>

        <p
          className={`
            text-[10px] font-medium mt-2 leading-none
            ${isOfficial ? "text-white/70" : "text-gray-500"}
          `}
        >
          {isOnline ? "Online sekarang" : "Terakhir kali online baru saja"}
        </p>
      </div>
    </div>
  );
}
