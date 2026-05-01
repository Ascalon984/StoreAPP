'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export default function Toast() {
  const { message, isVisible } = useToastStore();
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('animate-toast-in');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setAnimationClass('animate-toast-in');
    } else {
      setAnimationClass('animate-toast-out');
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[340px] ${animationClass}`}>
      <div className="bg-white/90 backdrop-blur-md border border-emerald-100/50 pl-3 pr-4 py-2.5 rounded-full shadow-soft flex items-center gap-3">
        {/* Ikon Lebih Kecil & Ramping */}
        <div className="bg-emerald-500 p-1 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm">
          <CheckCircle size={12} strokeWidth={3.5} className="text-white" />
        </div>

        {/* Kontainer Teks: Ganti ke items-center agar lebih simetris */}
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <span className="text-[11px] font-bold text-gray-900 whitespace-nowrap">
            Berhasil
          </span>
          <div className="w-[1px] h-3 bg-gray-200 flex-shrink-0" />
          <p className="text-[10px] text-gray-500 font-medium truncate tracking-tight pt-[1px]">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}