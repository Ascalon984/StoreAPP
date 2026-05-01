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
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[380px] ${animationClass}`}>
      <div className="bg-white/95 backdrop-blur-md border border-emerald-100/50 pl-3.5 pr-5 py-3 rounded-2xl shadow-soft flex items-center gap-3.5">
        {/* Ikon: Sekarang Center secara vertikal terhadap 2 baris teks */}
        <div className="bg-emerald-500 p-1.5 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm">
          <CheckCircle size={15} strokeWidth={3} className="text-white" />
        </div>

        {/* Kontainer Teks */}
        <div className="flex flex-col min-w-0 flex-1 border-l border-gray-100 pl-3.5">
          <p className="text-[13px] font-bold text-gray-900 leading-tight">
            Berhasil
          </p>
          <p className="text-[12px] text-gray-500 font-medium leading-snug mt-0.5 break-words line-clamp-2">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}