import { Copy, Info, Check } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";
import { BackButton } from "./SharedComponents";

const VA_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; image: string }
> = {
  bca: {
    label: "BCA",
    color: "#003D79",
    bgColor: "#003D7912",
    image: "BCA.png",
  },
  mandiri: {
    label: "Mandiri",
    color: "#003876",
    bgColor: "#00387612",
    image: "Mandiri.png",
  },
  bri: {
    label: "BRI",
    color: "#00529C",
    bgColor: "#00529C12",
    image: "BRI.png",
  },
  bni: {
    label: "BNI",
    color: "#F05A22",
    bgColor: "#F05A2212",
    image: "BNI.png",
  },
};

interface VaStepProps {
  total: number;
  onBack: () => void;
  onProcessPayment: () => void;
  isSubmitting: boolean;
  isProcessing: boolean;
  provider?: string | null;
}

export function VaStep({
  total,
  onBack,
  onProcessPayment,
  isSubmitting,
  isProcessing,
  provider,
}: VaStepProps) {
  const { showToast } = useToastStore();
  const [copied, setCopied] = useState(false);

  const config = provider
    ? VA_CONFIG[provider] || VA_CONFIG.bca
    : VA_CONFIG.bca;

  const handleCopy = () => {
    // Salin nomor VA ke clipboard
    navigator.clipboard.writeText("1234567890123456");
    setCopied(true);
    showToast("Nomor VA berhasil disalin");

    // Reset ikon setelah 2 detik
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div className="flex flex-col items-center">
          {/* BANK */}
          <div className="w-32 h-12 relative">
            <Image
              src={`/icons/${config.image}`}
              alt={config.label}
              fill
              className="object-contain"
            />
          </div>

          {/* TOTAL */}
          <p className="mt-5 text-[11px] font-medium text-gray-500">
            Total Pembayaran
          </p>

          <p className="mt-1 text-[28px] font-black text-gray-700 tracking-tight">
            {formatRupiah(total)}
          </p>

          {/* VA NUMBER */}
          <div className="w-full mt-5 py-4">
            <div className="flex items-center gap-3">
              <p className="text-[11px] text-gray-500 font-medium">
                Nomor Virtual Account
              </p>

              <button
                onClick={handleCopy}
                className="
                  text-gray-400
                  hover:text-gray-600
                  active:scale-90
                  transition-all
                "
                aria-label="Salin nomor VA"
              >
                {copied ? (
                  <Check
                    size={13}
                    className="text-emerald-600 animate-in zoom-in duration-300"
                  />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>

            <p className="mt-2 font-mono text-[20px] font-black tracking-wider text-gray-800">
              1234 5678 9012 3456
            </p>
          </div>

          {/* EXPIRY */}
          <div className="w-full mt-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-center">
            <p className="text-[11px] font-medium text-amber-600">
              Bayar Sebelum
            </p>

            <p className="mt-1 text-[13px] font-medium text-gray-500">
              03 Juni 2026, Pukul 23:59 WIB
            </p>
          </div>

          {/* INSTRUCTIONS */}
          <div className="w-full mt-4 pt-3 border-t border-gray-100 px-2">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-gray-500" strokeWidth={2.2} />

              <p className="text-[11px] font-semibold text-gray-700">
                Petunjuk
              </p>
            </div>

            <div className="space-y-2.5 text-[11px] text-gray-600 font-medium">
              {[
                `Transfer ke nomor Virtual Account ${config.label} di atas.`,
                `Gunakan aplikasi m-Banking ${config.label} atau ATM terdekat.`,
                "Pastikan nominal pembayaran sesuai.",
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
        <div className="max-w-lg mx-auto w-full space-y-2"></div>
      </div>
    </div>
  );
}
