import { QrCode, Info, Download } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";
import { BackButton } from "./SharedComponents";

interface QrisStepProps {
  total: number;
  onBack: () => void;
  onProcessPayment: () => void;
  isSubmitting: boolean;
  isProcessing: boolean;
}

export function QrisStep({
  total,
  onBack,
  onProcessPayment,
  isSubmitting,
  isProcessing,
}: QrisStepProps) {
  const { showToast } = useToastStore();

  return (
    <div className="flex-1 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-100">
        <BackButton onClick={onBack} />
        <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">
          Pembayaran QRIS
        </h2>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col px-6 pt-6 max-w-lg mx-auto w-full">
        <div className="flex flex-col items-center mt-2">
          <div className="w-52 h-52 bg-white border border-gray-200 rounded-3xl flex items-center justify-center shadow-sm">
            {/* Ganti dengan <Image> QR asli saat production */}
            <QrCode size={120} className="text-gray-200" strokeWidth={1} />
          </div>

          <p className="mt-3 text-[11px] text-gray-500">
            Selesaikan pembayaran sebelum{" "}
            <span className="font-semibold underline decoration-gray-400 underline-offset-2 text-gray-700">
              10:45
            </span>
          </p>

          {/* ORDER INFO */}
          <div className="flex items-center justify-between w-full mt-5 px-2">
            <div>
              <p className="text-[11px] text-gray-500">No. Pesanan</p>
              <p className="text-[13px] font-semibold text-gray-700">
                #ORD-XXXX
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-500">Total</p>
              <p className="text-[13px] font-bold text-emerald-700">
                {formatRupiah(total)}
              </p>
            </div>
          </div>

          {/* CARA PEMBAYARAN */}
          <div className="w-full mt-4 pt-3 border-t border-gray-100 px-2">
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-gray-500" strokeWidth={2.2} />
              <p className="text-[11px] font-semibold text-gray-700">
                Cara Pembayaran
              </p>
            </div>
            <div className="space-y-2 text-[11px] text-gray-600 font-medium">
              {[
                "Scan QR menggunakan e-wallet atau mobile banking yang mendukung QRIS.",
                "QR dapat diunduh untuk pembayaran nanti.",
                "Pastikan detail transaksi sudah benar sebelum konfirmasi.",
                "Proses verifikasi berlangsung 5–10 menit.",
                "Notifikasi akan dikirim setelah pembayaran berhasil.",
              ].map((text, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="w-4 shrink-0">{i + 1}.</span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
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
            Saya Sudah Bayar
          </button>
          <button
            className="w-full py-3 rounded-xl font-bold text-[12px] text-gray-700 bg-white border border-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
            onClick={() => showToast("QR Code berhasil didownload!")}
          >
            <Download size={15} />
            Unduh QR
          </button>
        </div>
      </div>
    </div>
  );
}
