'use client';

import { Headphones } from 'lucide-react';

export default function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <Headphones size={28} className="text-emerald-600" />
      </div>
      <p className="text-sm text-gray-500 text-center leading-relaxed">
        Mulai percakapan dengan Customer Service kami
      </p>
    </div>
  );
}
