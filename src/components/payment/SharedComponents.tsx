import { ChevronLeft } from "lucide-react";
import Image from "next/image";

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1 active:scale-95 transition"
      aria-label="Kembali"
    >
      <ChevronLeft size={20} className="text-gray-800" />
    </button>
  );
}

export function BackConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-[320px] w-full p-6 text-center border border-gray-50 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center">
          <div className="w-[140px] h-[140px] mb-2 relative">
            <Image
              src="/illustrations/Checkout confirmation.svg"
              alt="Batalkan pesanan"
              fill
              sizes="118px"
              unoptimized
              priority
              className="object-contain"
            />
          </div>
          <div className="space-y-1.5 mb-5">
            <h3 className="text-base font-black text-gray-900 leading-tight">
              Batalkan Pembayaran?
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed px-1">
              Proses pembayaran belum selesai. Yakin ingin kembali?
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 h-11 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all"
            >
              Tetap di Sini
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-11 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 shadow-sm shadow-emerald-800/25 active:scale-95 transition-all"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
