'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export default function Toast() {
  const { message, isVisible } = useToastStore();
  const [animationClass, setAnimationClass] = useState('animate-toast-in');

  useEffect(() => {
    if (isVisible) {
      setAnimationClass('animate-toast-in');
    } else {
      setAnimationClass('animate-toast-out');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[350px] ${animationClass}`}>
      <div className="bg-white/90 backdrop-blur-md border border-emerald-100 px-4 py-3 rounded-2xl shadow-soft flex items-center gap-3">
        {/* Ikon: Putih di atas Hijau (Lebih Pop) */}
        <div className="bg-emerald-500 p-1 rounded-full flex-shrink-0 flex items-center justify-center">
          <CheckCircle size={14} strokeWidth={3} className="text-white" />
        </div>

        <div className="flex flex-col min-w-0">
          <p className="text-[12px] font-bold text-gray-900 leading-none mb-1">
            Berhasil
          </p>
          <p className="text-[11px] text-gray-500 font-medium truncate tracking-tight">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}