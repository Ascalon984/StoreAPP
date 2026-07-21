import React from "react";
import { ArrowLeft } from "lucide-react";

interface PaymentMethodPageProps {
  onClose: () => void;
}

export default function PaymentMethodPage({ onClose }: PaymentMethodPageProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-right-full duration-300">
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-[15px] font-bold text-gray-800">Metode Pembayaran</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
        <h2 className="text-[14px] font-bold text-gray-800 mb-2">Belum Tersedia</h2>
        <p className="text-[12px] text-gray-500">Halaman metode pembayaran akan segera hadir.</p>
      </div>
    </div>
  );
}
