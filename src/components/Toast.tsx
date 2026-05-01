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
      // Memberikan waktu untuk animasi keluar sebelum komponen benar-benar unmount
      setAnimationClass('animate-toast-out');
    }
  }, [isVisible]);

  if (!isVisible && animationClass === 'animate-toast-out') {
    // Opsional: Jika store Anda langsung menghapus komponen, 
    // Anda mungkin butuh logic tambahan di store untuk delay 'isVisible = false'
  }

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] ${animationClass}`}>
      <div className="bg-white/95 backdrop-blur-md border border-gray-100/50 text-gray-800 px-5 py-3 rounded-2xl shadow-soft flex items-center gap-3 border-b-2 border-b-emerald-500">
        <div className="bg-emerald-50 p-1.5 rounded-full flex-shrink-0">
          <CheckCircle size={16} strokeWidth={3} className="text-emerald-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold tracking-tight leading-none text-gray-900">
            Berhasil
          </span>
          <span className="text-[11px] text-gray-500 font-medium mt-0.5 whitespace-nowrap">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}