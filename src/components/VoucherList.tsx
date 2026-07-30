"use client";

import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface VoucherListProps {
  onClose: () => void;
}

export default function VoucherList({ onClose }: VoucherListProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="bg-white px-4 py-3.5 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <button
          onClick={onClose}
          className="p-1 -ml-1 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="text-[13px] font-bold text-gray-800">Voucher Aktif</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 p-4">
        {/* Konten dikosongkan untuk diedit manual nantinya */}
      </div>
    </div>,
    document.body,
  );
}
