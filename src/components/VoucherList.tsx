"use client";

import { createPortal } from "react-dom";
import { ArrowLeft, Ticket, Gift } from "lucide-react";
import { useEffect, useState } from "react";

interface VoucherListProps {
  activeVouchers: ActiveVoucher[];
  onClose: () => void;
}

export interface ActiveVoucher {
  id: string;
  title: string;
  description: string;
  value: string;
  type: "tukar" | "gratis";
  claimedAt: string;
  expiresAt: string;
}

function getDaysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - new Date().getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export default function VoucherList({
  activeVouchers,
  onClose,
}: VoucherListProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const validVouchers = activeVouchers.filter(
    (v) => getDaysLeft(v.expiresAt) > 0,
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-50 animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3.5 shadow-sm">
        <button
          onClick={onClose}
          className="p-1 -ml-1 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>

        <h2 className="text-[13px] font-bold text-gray-800">Voucher Aktif</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {validVouchers.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <Ticket size={28} strokeWidth={1.5} className="text-gray-300" />
            </div>

            <p className="text-[12px] font-bold text-gray-700">
              Belum ada voucher aktif
            </p>

            <p className="mt-1 text-[10px] text-gray-500">
              Klaim voucher di halaman Bonus & Voucher
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {validVouchers.map((voucher) => {
              const panelClass =
                voucher.type === "tukar"
                  ? "from-emerald-500 via-emerald-700 to-emerald-800"
                  : "from-amber-400 via-orange-500 to-orange-600";

              return (
                <div
                  key={voucher.id}
                  className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md"
                  style={{
                    WebkitMask: `
                        radial-gradient(circle 10.5px at 0% top, transparent 98%, #000 100%),
                        radial-gradient(circle 10.5px at 0% bottom, transparent 98%, #000 100%),
                        radial-gradient(circle 9.5px at 25% top, transparent 98%, #000 100%),
                        radial-gradient(circle 9.5px at 25% bottom, transparent 98%, #000 100%)
                      `,
                    mask: `
                        radial-gradient(circle 10.5px at 0% top, transparent 98%, #000 100%),
                        radial-gradient(circle 10.5px at 0% bottom, transparent 98%, #000 100%),
                        radial-gradient(circle 9.5px at 25% top, transparent 98%, #000 100%),
                        radial-gradient(circle 9.5px at 25% bottom, transparent 98%, #000 100%)
                      `,
                    maskComposite: "intersect",
                    WebkitMaskComposite: "destination-in",
                  }}
                >
                  {/* Emerald / Amber Panel */}
                  <div
                    className={`absolute inset-y-0 left-0 w-[25%] bg-gradient-to-b ${panelClass}`}
                  />

                  {/* Perforation */}
                  <div className="absolute left-[25%] top-3.5 bottom-3.5 -translate-x-1/2 flex flex-col items-center space-y-[4px]">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-[5px] w-[5px] rounded-full bg-white"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <div className="relative flex h-[108px]">
                    {/* Left */}
                    <div className="flex w-[25%] items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center">
                        {voucher.type === "tukar" ? (
                          <Ticket
                            size={35}
                            strokeWidth={1.2}
                            className="text-white"
                          />
                        ) : (
                          <Gift
                            size={35}
                            strokeWidth={1.2}
                            className="text-white"
                          />
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex h-full flex-1 min-w-0 flex-col justify-between px-5 py-4">
                      <div className="min-w-0">
                        <p
                          className="truncate text-[14px] font-bold leading-tight text-gray-700"
                          title={voucher.title}
                        >
                          {voucher.title}
                        </p>

                        <p
                          className="mt-1 line-clamp-2 text-[11px] leading-[1.3] text-gray-500"
                          title={voucher.description}
                        >
                          {voucher.description}
                        </p>
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <button
                          type="button"
                          className="shrink-0 text-[9.5px] font-medium text-emerald-700 underline underline-offset-2"
                        >
                          Syarat & Ketentuan
                        </button>

                        <div className="shrink-0 text-right leading-tight">
                          <span className="block text-[9px] text-gray-400">
                            Berlaku s.d
                          </span>
                          <span className="block text-[10px] text-gray-600">
                            {formatDate(voucher.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
