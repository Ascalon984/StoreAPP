import { Copy, Info } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";
import { BackButton } from "./SharedComponents";

interface VaStepProps {
  total: number;
  onBack: () => void;
  onProcessPayment: () => void;
  isSubmitting: boolean;
  isProcessing: boolean;
}

export function VaStep({
  total,
  onBack,
  onProcessPayment,
  isSubmitting,
  isProcessing,
}: VaStepProps) {
  const { showToast } = useToastStore();

  return (
    <div className="flex-1 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-100">
        <BackButton onClick={onBack} />
        <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">
          Pembayaran VA
        </h2>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col px-6 pt-6 max-w-lg mx-auto w-full">
        <div className="flex flex-col items-center mt-2">
          <div className="px-4 py-1.5 bg-blue-50 text-blue-700 font-bold text-lg rounded-md mb-1">
            BCA
          </div>
          <p className="text-[13px] text-gray-600 font-medium">
            Virtual Account
          </p>
        </div>

        {/* VA NUMBER */}
        <div className="mt-6 flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
          <span className="font-mono text-lg font-bold text-gray-800 tracking-wider">
            1234 5678 9012 3456
          </span>
          <button
            onClick={() => showToast("Nomor VA berhasil disalin")}
            className="p-2 text-gray-500 hover:text-emerald-600 active:scale-95 transition"
            aria-label="Salin nomor VA"
          >
            <Copy size={18} />
          </button>
        </div>

        {/* ORDER INFO */}
        <div className="flex items-center justify-between w-full mt-6 px-2">
          <div>
            <p className="text-[11px] text-gray-500">Total Pembayaran</p>
            <p className="text-[15px] font-bold text-emerald-700">
              {formatRupiah(total)}
            </p>
          </div>
        </div>

        <div className="w-full mt-4 pt-4 border-t border-gray-100 px-2">
          <p className="text-[11px] text-gray-500">Bayar Sebelum</p>
          <p className="text-[13px] font-bold text-gray-800">
            02 Jun 2026 • 23:59 WIB
          </p>
        </div>

        {/* CARA PEMBAYARAN */}
        <div className="w-full mt-5 pt-4 border-t border-gray-100 px-2">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-gray-500" strokeWidth={2.2} />
            <p className="text-[11px] font-semibold text-gray-700">
              Cara Pembayaran
            </p>
          </div>
          <div className="space-y-2.5 text-[11px] text-gray-600 font-medium ml-1">
            {[
              "Transfer ke nomor Virtual Account di atas.",
              "Dapat dibayar melalui m-BCA, KlikBCA, atau ATM BCA.",
              "Pembayaran akan diverifikasi secara otomatis.",
            ].map((text, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 pb-5 pt-3 border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-lg mx-auto w-full space-y-2">
          <button
            className="w-full py-3 rounded-xl font-bold text-[13px] text-white bg-emerald-600 active:scale-[0.98] transition-all hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:pointer-events-none"
            onClick={onProcessPayment}
            disabled={isSubmitting || isProcessing}
          >
            Cek Status Pembayaran
          </button>
          <button
            className="w-full py-3 rounded-xl font-bold text-[13px] text-gray-700 bg-white border border-gray-200 active:scale-[0.98] transition-all hover:bg-gray-50"
            onClick={onBack}
          >
            Ganti Metode
          </button>
        </div>
      </div>
    </div>
  );
}
