import React from "react";
import { Box, Tag, Receipt, HandCoins } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface PaymentSummaryProps {
  totalQty: number;
  totalSavings: number;
  discountPercentage: number;
  serviceFee: number;
  usePoints: boolean;
  setUsePoints: React.Dispatch<React.SetStateAction<boolean>>;
  userPoints: number;
  pointsToUse: number;
  total: number;
}

export default function PaymentSummary({
  totalQty,
  totalSavings,
  discountPercentage,
  serviceFee,
  usePoints,
  setUsePoints,
  userPoints,
  pointsToUse,
  total,
}: PaymentSummaryProps) {
  return (
    <div
      className="
        relative z-10
        px-4 py-3 space-y-2
        bg-[#f8faf8]/70
        border-t border-white/60
      "
    >
      <h2 className="text-[15px] font-bold text-gray-900">Rincian</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
          <Box size={12} strokeWidth={2} />
          <span>Total item</span>
        </div>
        <span className="text-[12px] font-semibold text-gray-700">
          {totalQty}
        </span>
      </div>

      {totalSavings > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] text-emerald-600">
            <Tag size={12} strokeWidth={2} />
            <span>Diskon ({discountPercentage}%)</span>
          </div>
          <span className="text-[12px] font-semibold text-emerald-600">
            -{formatRupiah(totalSavings)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
          <Receipt size={12} strokeWidth={2} />
          <span>Biaya layanan</span>
        </div>
        <span className="text-[12px] font-semibold text-gray-700">
          {formatRupiah(serviceFee)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
          <HandCoins size={12} strokeWidth={2} />
          <span>Gunakan Poin</span>
        </div>
        <button
          onClick={() => setUsePoints((p) => !p)}
          className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
            usePoints ? "bg-emerald-500" : "bg-gray-200"
          }`}
          aria-label="Gunakan poin"
          role="switch"
          aria-checked={usePoints}
        >
          <span
            className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              usePoints ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {usePoints && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-emerald-600 pl-[18px]">
            Poin kamu ({userPoints.toLocaleString()} poin)
          </span>
          <span className="text-[12px] font-semibold text-emerald-600">
            -{formatRupiah(pointsToUse)}
          </span>
        </div>
      )}

      <div className="border-t border-dashed border-gray-200 pt-2 mt-1">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-gray-800">
            Total Bayar
          </span>
          <span className="text-[15px] font-extrabold text-emerald-700 tracking-tight">
            {formatRupiah(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
