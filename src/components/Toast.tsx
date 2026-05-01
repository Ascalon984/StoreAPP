'use client';

import { useEffect, useState, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export default function Toast() {
  const { message, isVisible, hideToast } = useToastStore();
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('animate-toast-in');
  const [dragX, setDragX] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [isSwiped, setIsSwiped] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setAnimationClass('animate-toast-in');
      setDragX(0);
      setOpacity(1);
      setIsSwiped(false);
    } else if (shouldRender) {
      // Jika ditutup via swipe, jangan jalankan animasi keluar CSS (animate-toast-out)
      if (isSwiped) {
        setShouldRender(false);
      } else {
        setAnimationClass('animate-toast-out');
        const timer = setTimeout(() => setShouldRender(false), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, isSwiped, shouldRender]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    // Hentikan animasi CSS saat mulai geser agar transform inline tidak konflik
    setAnimationClass('');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;

    // Berikan sedikit resistance agar tidak terlalu liar
    setDragX(deltaX);

    // Kurangi opacity seiring jauhnya geseran (maksimal transparan di 150px)
    const newOpacity = Math.max(0, 1 - Math.abs(deltaX) / 150);
    setOpacity(newOpacity);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Jika geseran lebih dari 80px, anggap sebagai perintah tutup
    if (Math.abs(dragX) > 80) {
      setIsSwiped(true);
      hideToast();
    } else {
      // Jika tidak cukup jauh, kembalikan ke posisi semula
      setDragX(0);
      setOpacity(1);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[360px] touch-none select-none ${animationClass}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translate(calc(-50% + ${dragX}px), 0)`,
        opacity: opacity,
        transition: isDragging.current ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="bg-white/95 backdrop-blur-md border border-gray-100/80 px-4 py-3 rounded-2xl shadow-soft flex items-center gap-3.5 cursor-grab active:cursor-grabbing">
        {/* Ikon: Ukuran sedikit diperbesar agar seimbang dengan 2 baris teks */}
        <div className="bg-emerald-500 w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm shadow-emerald-200">
          <CheckCircle size={18} strokeWidth={2.5} className="text-white" />
        </div>

        {/* Kontainer Teks: Dibuat rapat dan tajam */}
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-[13px] font-bold text-gray-900 leading-tight">
            Berhasil
          </p>
          <p className="text-[11px] text-gray-500 font-medium leading-snug mt-0.5 break-words line-clamp-2 tracking-tight">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}