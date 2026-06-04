import { Info, Copy, Check } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";
import { BackButton } from "./SharedComponents";

const EWALLET_CONFIG: Record<
  string,
  { image: string; color: string; label: string }
> = {
  gopay: { image: "Gopay.png", color: "#00AED6", label: "GoPay" },
  dana: { image: "DANA.png", color: "#108EE9", label: "DANA" },
  ovo: { image: "OVO.png", color: "#4C3494", label: "OVO" },
  linkaja: { image: "LinkAja.png", color: "#E82529", label: "LinkAja" },
  shopeepay: { image: "Shoppepay.png", color: "#EE4D2D", label: "ShopeePay" },
};

interface EwalletStepProps {
  total: number;
  onBack: () => void;
  onOpenEwallet: () => void;
  isSubmitting: boolean;
  isProcessing: boolean;
  provider?: string | null;
}

export function EwalletStep({
  total,
  onBack,
  onOpenEwallet,
  isSubmitting,
  isProcessing,
  provider,
}: EwalletStepProps) {
  const { showToast } = useToastStore();
  const [copied, setCopied] = useState(false);

  const config = provider
    ? EWALLET_CONFIG[provider] || EWALLET_CONFIG.gopay
    : EWALLET_CONFIG.gopay;

  const handleCopy = () => {
    // Salin nomor pesanan ke clipboard
    navigator.clipboard.writeText("#ORD-XXXX");
    setCopied(true);
    showToast("Nomor pesanan berhasil disalin");

    // Reset ikon setelah 2 detik
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-100">
        <BackButton onClick={onBack} />

        <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">
          Pembayaran E-Wallet
        </h2>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col px-6 pt-6 max-w-lg mx-auto w-full">
        <div className="flex flex-col items-center">
          {/* LOGO */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center relative overflow-hidden"
            style={{
              backgroundColor: `${config.color}12`,
            }}
          >
            <Image
              src={`/icons/${config.image}`}
              alt={config.label}
              fill
              className="object-contain p-4"
            />
          </div>

          {/* TOTAL */}
          <p className="mt-5 text-[11px] font-medium text-gray-500">
            Total Pembayaran
          </p>

          <p className="text-[28px] font-black text-gray-700 tracking-tight mt-1">
            {formatRupiah(total)}
          </p>

          {/* MASA BERLAKU */}
          <div className="w-full mt-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-center">
            <p className="text-[11px] font-medium text-amber-600">
              Berlaku Hingga
            </p>

            <p className="mt-1 text-[13px] font-medium text-gray-500">
              03 Juni 2026, Pukul 23:59 WIB
            </p>
          </div>

          {/* ORDER INFO */}
          <div className="flex items-center justify-between w-full mt-6 px-2">
            <div className="flex flex-col">
              <p className="text-[11px] text-gray-500">No. Pesanan</p>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[13px] font-semibold text-gray-700">
                  #ORD-XXXX
                </span>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="
    text-gray-500
    hover:text-gray-700
    transition-colors
  "
                >
                  {copied ? (
                    <Check
                      size={12}
                      className="text-emerald-600 animate-in zoom-in duration-300"
                    />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-gray-500">Metode</p>

              <p className="text-[13px] font-semibold text-gray-700">
                {config.label}
              </p>
            </div>
          </div>

          {/* CARA PEMBAYARAN */}
          <div className="w-full mt-2 pt-3 border-t border-gray-100 px-2">
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-gray-500" strokeWidth={2.2} />

              <p className="text-[11px] font-semibold text-gray-700">
                Petunjuk
              </p>
            </div>

            <div className="space-y-2 text-[11px] text-gray-600 font-medium">
              {[
                `Ketuk tombol "Buka ${config.label}" di bawah.`,
                `Anda akan diarahkan ke aplikasi ${config.label}.`,
                "Periksa nominal pembayaran sebelum konfirmasi.",
                "Selesaikan pembayaran sesuai instruksi aplikasi.",
                "Status pesanan akan diperbarui otomatis setelah pembayaran berhasil.",
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
        <div className="max-w-lg mx-auto w-full">
          <button
            onClick={onOpenEwallet}
            disabled={isSubmitting || isProcessing}
            className="
              w-full
              py-3
              rounded-xl
              font-bold
              text-[13px]
              text-white
              bg-emerald-600
              hover:bg-emerald-700
              active:scale-[0.98]
              transition-all
              shadow-sm
              shadow-emerald-600/20
              disabled:opacity-50
              disabled:pointer-events-none
            "
          >
            Buka {config.label}
          </button>
        </div>
      </div>
    </div>
  );
}
