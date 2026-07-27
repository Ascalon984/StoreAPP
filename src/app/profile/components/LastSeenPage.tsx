import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useLastSeenStore } from "@/store/useLastSeenStore";

interface LastSeenPageProps {
  onClose: () => void;
}

export default function LastSeenPage({ onClose }: LastSeenPageProps) {
  const { items } = useLastSeenStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-right-full duration-300">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-[16px] font-bold text-gray-800 -translate-x-[2px]">
            Terakhir Dilihat
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {!mounted ? (
          <div className="flex flex-col items-center justify-center p-6 text-center h-full">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[60vh]">
            <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h2 className="text-[14px] font-bold text-gray-800 mb-2">Kosong</h2>
            <p className="text-[12px] text-gray-500 max-w-[250px]">
              Kamu belum melihat produk apapun akhir-akhir ini.
            </p>
          </div>
        ) : (
          <div className="px-2 pt-3">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              {items.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
