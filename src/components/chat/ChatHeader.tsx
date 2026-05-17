'use client';

import { ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  onBack: () => void;
  isOnline?: boolean;
}

export default function ChatHeader({ onBack, isOnline = true }: ChatHeaderProps) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-[#065F46] shadow-sm">
      {/* Back button */}
      <button
        onClick={onBack}
        aria-label="Kembali"
        className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
      </button>

      {/* Agent avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm border-2 border-white/20">
          <span className="text-emerald-700 font-black text-sm leading-none">CS</span>
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#065F46]" />
        )}
      </div>

      {/* Name & status */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-white leading-none">Customer Service</p>
        <p className="text-[11px] text-white/60 font-medium mt-0.5 leading-none">
          {isOnline ? 'Online sekarang' : 'Terakhir kali online baru saja'}
        </p>
      </div>
    </div>
  );
}
