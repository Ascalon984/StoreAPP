"use client";

import { createPortal } from "react-dom";
import { ArrowLeft, Ticket, Gift } from "lucide-react";
import { useEffect, useState } from "react";

interface VoucherListProps {
  onClose: () => void;
}

interface ActiveVoucher {
  id: string;
  title: string;
  description: string;
  value: string;
  type: "tukar" | "gratis";
  claimedAt: string;
  expiresAt: string;
}

// TODO: Ganti dengan data store/backend
const mockActiveVouchers: ActiveVoucher[] = [
  {
    id: "1",
    title: "Diskon Rp10.000",
    description: "Min. belanja Rp50.000",
    value: "300 poin",
    type: "tukar",
    claimedAt: "2026-07-28T10:00:00",
    expiresAt: "2026-08-04T10:00:00",
  },
  {
    id: "2",
    title: "Gratis Ongkir",
    description: "Maks. Rp20.000",
    value: "400 poin",
    type: "tukar",
    claimedAt: "2026-07-30T10:00:00",
    expiresAt: "2026-08-02T10:00:00",
  },
  {
    id: "3",
    title: "Voucher Member Baru",
    description: "Tanpa minimum belanja",
    value: "Gratis",
    type: "gratis",
    claimedAt: "2026-07-29T09:00:00",
    expiresAt: "2026-08-01T09:00:00",
  },
];

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

function getBadge(days: number) {
  if (days === 3)
    return {
      text: "H-3",
      className: "bg-amber-50 text-amber-700",
    };

  if (days === 2)
    return {
      text: "H-2",
      className: "bg-orange-50 text-orange-700",
    };

  if (days === 1)
    return {
      text: "H-1",
      className: "bg-rose-50 text-rose-600",
    };

  if (days <= 0)
    return {
      text: "Hari Terakhir",
      className: "bg-rose-100 text-rose-700",
    };

  return null;
}

export default function VoucherList({ onClose }: VoucherListProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
        {mockActiveVouchers.length === 0 ? (
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
            {mockActiveVouchers.map((voucher) => {
              const days = getDaysLeft(voucher.expiresAt);
              const badge = getBadge(days);

              const panelClass =
                voucher.type === "tukar"
                  ? "from-emerald-500 via-emerald-600 to-emerald-800"
                  : "from-amber-400 via-amber-500 to-orange-600";

              return (
                <div
                  key={voucher.id}
                  className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md"
                  style={{
                    WebkitMask: `
                        radial-gradient(circle 10px at 0% top, transparent 98%, #000 100%),
                        radial-gradient(circle 10px at 0% bottom, transparent 98%, #000 100%),
                        radial-gradient(circle 10px at 25% top, transparent 98%, #000 100%),
                        radial-gradient(circle 10px at 25% bottom, transparent 98%, #000 100%)
                      `,
                    mask: `
                        radial-gradient(circle 10px at 0% top, transparent 98%, #000 100%),
                        radial-gradient(circle 10px at 0% bottom, transparent 98%, #000 100%),
                        radial-gradient(circle 10px at 25% top, transparent 98%, #000 100%),
                        radial-gradient(circle 10px at 25% bottom, transparent 98%, #000 100%)
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
                  <div className="relative flex min-h-[102px]">
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
                    <div className="flex flex-1 flex-col justify-between px-5 py-4">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex-1 text-[14px] font-bold leading-tight text-gray-800">
                            {voucher.title}
                          </p>

                          {badge && (
                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${badge.className}`}
                            >
                              {badge.text}
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
                          {voucher.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="text-[10.5px] font-medium text-emerald-700 transition-colors hover:text-emerald-800 active:scale-[0.98]"
                        >
                          Syarat & Ketentuan
                        </button>

                        <span className="text-[10px] text-gray-400">
                          s/d {formatDate(voucher.expiresAt)}
                        </span>
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
