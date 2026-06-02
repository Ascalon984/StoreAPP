import { formatRupiah } from "@/lib/utils";
import { BackButton } from "./SharedComponents";

const EWALLET_CONFIG: Record<string, { iconText: string; color: string; label: string }> = {
  gopay: { iconText: "gopay", color: "#00AED6", label: "GoPay" },
  dana: { iconText: "DANA", color: "#108EE9", label: "DANA" },
  ovo: { iconText: "OVO", color: "#4C3494", label: "OVO" },
  linkaja: { iconText: "LinkAja", color: "#E82529", label: "LinkAja" },
  shopeepay: { iconText: "ShopeePay", color: "#EE4D2D", label: "ShopeePay" },
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
  const config = provider ? EWALLET_CONFIG[provider] || EWALLET_CONFIG.gopay : EWALLET_CONFIG.gopay;

  return (
    <div className="flex-1 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-100">
        <BackButton onClick={onBack} />
        <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">
          Pembayaran {config.label}
        </h2>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col items-center px-6 pt-10 max-w-lg mx-auto w-full text-center">
        <div 
          className="w-20 h-20 mb-6 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <span 
            className="text-lg font-black tracking-tight" 
            style={{ color: config.color }}
          >
            {config.iconText}
          </span>
        </div>

        <p className="text-[12px] text-gray-500 mb-1">Total Pembayaran</p>
        <p className="text-2xl font-bold text-gray-900 mb-8">
          {formatRupiah(total)}
        </p>

        <div className="w-full pt-6 border-t border-gray-100">
          <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
            Anda akan diarahkan ke aplikasi {config.label} untuk menyelesaikan pembayaran.
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed font-medium mt-4">
            Setelah pembayaran selesai, status pesanan akan diperbarui otomatis.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 pb-5 pt-3 border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-lg mx-auto w-full">
          <button
            className="w-full py-3.5 rounded-xl font-bold text-[13px] text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            style={{ backgroundColor: config.color, boxShadow: `0 2px 10px ${config.color}40` }}
            onClick={onOpenEwallet}
            disabled={isSubmitting || isProcessing}
          >
            Buka {config.label}
          </button>
        </div>
      </div>
    </div>
  );
}
