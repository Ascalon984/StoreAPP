import Image from "next/image";
import { X, AlertCircle, RefreshCw, Check, Download, Loader } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

// ─── PENDING STEP ───────────────────────────────────────────────────────────
export function PendingStep() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
      <div className="w-32 h-32 relative mb-6">
        <Image
          src="/icons/sandclock.gif"
          alt="Pending Processing"
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
        Memproses Pembayaran
      </h2>
      <p className="text-[13px] text-gray-500 text-center max-w-[280px] font-medium leading-relaxed">
        Mohon tunggu sebentar, kami sedang mengonfirmasi pembayaran Anda...
      </p>
    </div>
  );
}

// ─── FAILED STEP ────────────────────────────────────────────────────────────
interface FailedStepProps {
  total: number;
  failedMessage: string;
  onRetry: () => void;
  onChangeMethod: () => void;
}

export function FailedStep({
  total,
  failedMessage,
  onRetry,
  onChangeMethod,
}: FailedStepProps) {
  return (
    <div className="flex-1 flex flex-col px-6 py-6 max-w-lg mx-auto w-full animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* FAILED ICON */}
        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-5">
          <X className="text-white" size={32} strokeWidth={3} />
        </div>

        <h2 className="text-[20px] font-bold text-gray-800 tracking-tight mb-2">
          Pembayaran Gagal
        </h2>

        {/* ERROR MESSAGE BOX */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-2 w-full">
          <AlertCircle
            size={16}
            className="text-red-500 mt-0.5 shrink-0"
            strokeWidth={2}
          />
          <p className="text-[12px] text-red-700 font-medium leading-relaxed">
            {failedMessage}
          </p>
        </div>

        {/* DETAIL RINGKAS */}
        <div className="w-full mt-6 divide-y divide-gray-100 border-t border-b border-gray-100">
          <div className="flex items-center justify-between py-3">
            <span className="text-[12px] text-gray-500">Total</span>
            <span className="text-[13px] font-bold text-gray-800">
              {formatRupiah(total)}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[12px] text-gray-500">ID Pesanan</span>
            <span className="text-[12px] font-semibold text-gray-900">
              #ORD-XXXX
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 w-full space-y-2">
        <button
          className="w-full py-4 rounded-xl font-bold text-[14px] text-white bg-emerald-600 active:scale-[0.98] transition-all hover:bg-emerald-700 flex items-center justify-center gap-2"
          onClick={onRetry}
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>

        <button
          className="w-full py-3.5 rounded-xl font-bold text-[13px] text-gray-700 bg-white border border-gray-200 active:scale-[0.98] transition-all hover:bg-gray-50"
          onClick={onChangeMethod}
        >
          Ganti Metode Pembayaran
        </button>
      </div>
    </div>
  );
}

// ─── SUCCESS STEP ───────────────────────────────────────────────────────────
interface SuccessStepProps {
  total: number;
  isSubmitting: boolean;
  onFinish: () => void;
  onDownloadReceipt: () => void;
}

export function SuccessStep({
  total,
  isSubmitting,
  onFinish,
  onDownloadReceipt,
}: SuccessStepProps) {
  return (
    <div className="flex-1 flex flex-col px-6 py-6 max-w-lg mx-auto w-full animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* SUCCESS ICON */}
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-5">
          <Check className="text-white" size={32} strokeWidth={3} />
        </div>

        <h2 className="text-[20px] font-bold text-gray-700 tracking-tight">
          Pembayaran Berhasil
        </h2>

        {/* DETAIL TRANSAKSI */}
        <div className="w-full mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold text-gray-700">
              Detail Transaksi
            </p>
            <button
              onClick={onDownloadReceipt}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 active:scale-95 transition"
              aria-label="Simpan bukti transaksi"
            >
              <Download size={15} />
            </button>
          </div>

          <div className="divide-y divide-gray-100 border-b border-gray-100">
            <div className="flex items-center justify-between py-3">
              <span className="text-[12px] text-gray-500">Total</span>
              <span className="text-[13px] font-bold text-emerald-700">
                {formatRupiah(total)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[12px] text-gray-500">ID Pesanan</span>
              <span className="text-[12px] font-semibold text-gray-900">
                #ORD-XXXX
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[12px] text-gray-500">Tanggal</span>
              <span className="text-[12px] font-semibold text-gray-900">
                02 Jun 2026
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[12px] text-gray-500">Waktu</span>
              <span className="text-[12px] font-semibold text-gray-900">
                10:45 AM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 w-full">
        <button
          className="w-full py-4 rounded-xl font-bold text-[14px] text-white bg-emerald-600 active:scale-[0.98] transition-all hover:bg-emerald-700 flex items-center justify-center disabled:opacity-50"
          onClick={onFinish}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader className="animate-spin text-white" size={20} />
          ) : (
            <span>OK</span>
          )}
        </button>
      </div>
    </div>
  );
}
