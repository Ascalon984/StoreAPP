import Image from "next/image";
import {
  ChevronLeft,
  QrCode,
  Check,
  Download,
  Loader,
  Info,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";

export type PaymentStep = "idle" | "qr" | "pending" | "success";

interface PaymentModalProps {
  paymentStep: PaymentStep;
  setPaymentStep: (step: PaymentStep) => void;
  isSubmitting: boolean;
  executeOrderSubmission: () => void;
  total: number;
}

export default function PaymentModal({
  paymentStep,
  setPaymentStep,
  isSubmitting,
  executeOrderSubmission,
  total,
}: PaymentModalProps) {
  const { showToast } = useToastStore();

  if (paymentStep === "idle") return null;

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col animate-in fade-in duration-200">
      {paymentStep === "qr" && (
        <div className="flex-1 flex flex-col">
          {/* ── HEADER ── */}
          <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-100">
            <button
              onClick={() => setPaymentStep("idle")}
              className="p-1 active:scale-95 transition"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>

            <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">
              Pembayaran QRIS
            </h2>
          </div>

          {/* ── CONTENT ── */}
          <div className="flex-1 flex flex-col px-6 pt-6 max-w-lg mx-auto w-full">
            {/* QR (naik, tidak center penuh) */}
            <div className="flex flex-col items-center mt-2">
              <div className="w-52 h-52 bg-white border border-gray-200 rounded-3xl flex items-center justify-center shadow-sm">
                {/* QR REAL nanti ganti image */}
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
                  <div className="flex gap-2 items-start">
                    <span className="w-4 shrink-0">1.</span>
                    <p>
                      Scan QR menggunakan e-wallet atau mobile banking yang
                      mendukung QRIS.
                    </p>
                  </div>

                  <div className="flex gap-2 items-start">
                    <span className="w-4 shrink-0">2.</span>
                    <p>QR dapat diunduh untuk pembayaran nanti.</p>
                  </div>

                  <div className="flex gap-2 items-start">
                    <span className="w-4 shrink-0">3.</span>
                    <p>
                      Pastikan detail transaksi sudah benar sebelum konfirmasi.
                    </p>
                  </div>

                  <div className="flex gap-2 items-start">
                    <span className="w-4 shrink-0">4.</span>
                    <p>Proses verifikasi berlangsung 5–10 menit.</p>
                  </div>

                  <div className="flex gap-2 items-start">
                    <span className="w-4 shrink-0">5.</span>
                    <p>Notifikasi akan dikirim setelah pembayaran berhasil.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER ACTION ── */}
          <div className="px-6 pb-5 pt-3 border-t border-gray-100 bg-white">
            <div className="flex gap-3 max-w-lg mx-auto w-full">
              {/* DOWNLOAD */}
              <button
                className="flex-none px-4 py-3 rounded-xl font-bold text-[12px] text-gray-700 bg-white border border-gray-200 active:scale-95 transition-all flex items-center gap-2"
                onClick={() => {
                  showToast("QR Code berhasil didownload!");
                }}
              >
                <Download size={15} />
                Unduh QR
              </button>

              {/* CONFIRM */}
              <button
                className="flex-1 py-3 rounded-xl font-bold text-[12px] text-white bg-emerald-600 active:scale-[0.98] transition-all hover:bg-emerald-700 flex items-center justify-center"
                onClick={executeOrderSubmission}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  "Saya sudah membayar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentStep === "pending" && (
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
      )}

      {paymentStep === "success" && (
        <div className="flex-1 flex flex-col px-6 py-6 max-w-lg mx-auto w-full animate-in fade-in duration-300">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/40 animate-in zoom-in-50 duration-500 ease-out">
              <Check className="text-white" size={56} strokeWidth={3.5} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
              Pembayaran Berhasil!
            </h2>
            <p className="text-[14px] text-gray-500 text-center max-w-[260px] leading-relaxed">
              Terima kasih, pesanan Anda telah kami terima dan sedang dalam
              proses.
            </p>
          </div>
          <div className="mt-auto w-full">
            <button
              className="w-full py-4 rounded-xl font-bold text-[14px] text-white bg-emerald-600 shadow-xl shadow-emerald-600/25 active:scale-[0.98] transition-all hover:bg-emerald-700 flex items-center justify-center gap-2"
              onClick={executeOrderSubmission}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Menyelesaikan...</span>
                </>
              ) : (
                <span>Selesai</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
