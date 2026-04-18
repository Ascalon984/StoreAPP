'use client';

import { CheckCircle } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export default function Toast() {
  const { message, isVisible } = useToastStore();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className="bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <CheckCircle size={20} strokeWidth={1.5} className="text-green-400 flex-shrink-0" />
        <span className="text-sm font-medium whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
}
