"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

interface ChatReportSheetProps {
  show: boolean;
  onClose: () => void;
  sellerName: string;
}

type TabKey = "Komunikasi" | "Keamanan" | "Konten & SARA";

export function ChatReportSheet({
  show,
  onClose,
  sellerName,
}: ChatReportSheetProps) {
  const [selectedTab, setSelectedTab] = useState<TabKey>("Komunikasi");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const { showToast } = useToastStore();

  const MIN_CHARS = 50;
  const MAX_CHARS = 300;
  const isDetailValid =
    detail.trim().length === 0 ||
    (detail.trim().length >= MIN_CHARS && detail.trim().length <= MAX_CHARS);
  const showError =
    !isFocused && detail.trim().length > 0 && detail.trim().length < MIN_CHARS;

  if (!show) return null;

  const reasons: Record<TabKey, string[]> = {
    Komunikasi: [
      "Tidak merespons pesan",
      "Bahasa tidak sopan",
      "Spam atau pesan berulang",
    ],
    Keamanan: [
      "Penipuan",
      "Mengarahkan transaksi di luar aplikasi",
      "Mengirim tautan mencurigakan",
    ],
    "Konten & SARA": [
      "Konten tidak pantas",
      "Diskriminasi atau SARA",
      "Pelanggaran hak cipta",
    ],
  };

  const canSubmit = !!selectedReason && isDetailValid;

  const handleApply = () => {
    showToast(
      "Laporan berhasil dikirim. Terima kasih atas masukan Anda.",
      "success",
    );

    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/25 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="
          fixed inset-x-0 bottom-0 z-[80]
          h-[73.5vh]
          bg-white rounded-t-[20px]
          shadow-xl
          animate-in slide-in-from-bottom duration-300
          flex flex-col
        "
      >
        {/* Header */}
        <div className="relative flex items-center justify-center px-5 pt-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-gray-700">
            Laporkan {sellerName}
          </h3>

          <button
            onClick={onClose}
            className="
              absolute right-5
              w-8 h-8
              flex items-center justify-center
              rounded-full
              text-gray-400
              hover:bg-gray-100
              hover:text-gray-600
              active:scale-95
              transition-all
            "
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5">
          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {(["Komunikasi", "Keamanan", "Konten & SARA"] as TabKey[]).map(
              (item) => {
                const active = selectedTab === item;

                return (
                  <button
                    key={item}
                    onClick={() => {
                      setSelectedTab(item);
                      setSelectedReason("");
                    }}
                    className={`
                    h-8 px-3.5 rounded-[10.5px]
                    flex-shrink-0
                    text-[12px] font-medium
                    tracking-[-0.01em]
                    transition-all active:scale-[0.98]
                    ${
                      active
                        ? "bg-emerald-600 border border-emerald-600 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }
                  `}
                  >
                    {item}
                  </button>
                );
              },
            )}
          </div>

          {/* Reasons */}
          <div className="mt-5 flex flex-col gap-2">
            {reasons[selectedTab].map((reason) => {
              const active = selectedReason === reason;
              return (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`
                    w-full rounded-lg border px-3 py-2
                    flex items-center justify-between
                    text-left text-[12.5px] font-medium
                    transition-all
                    ${
                      active
                        ? "border-emerald-400 bg-white text-gray-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                    }
                  `}
                >
                  <span>{reason}</span>

                  {active && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="h-3 w-3 text-white stroke-[2.2]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail box */}
          <div className="mt-5">
            <label className="flex items-center gap-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
              Detail laporan
              <span className="text-[12px] font-normal text-gray-500">
                (Opsional)
              </span>
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value.slice(0, MAX_CHARS))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Jelaskan lebih detail laporan Anda disini..."
              rows={4}
              className={`
                mt-2 w-full resize-none rounded-lg border
                px-3 py-3 text-[13px] text-gray-700
                placeholder:text-gray-400
                focus:outline-none
                transition-colors
                ${
                  detail.length === 0
                    ? "border-gray-200 bg-white focus:border-gray-400"
                    : isDetailValid
                      ? "border-emerald-300 focus:border-emerald-400"
                      : showError
                        ? "border-rose-200 focus:border-rose-300"
                        : "border-gray-200 focus:border-gray-400"
                }
              `}
            />
            <div className="flex items-center justify-between text-[10.5px]">
              {showError ? (
                <span className="text-rose-500">
                  Minimal {MIN_CHARS} karakter
                </span>
              ) : (
                <span />
              )}

              <span
                className={
                  detail.length === MAX_CHARS
                    ? "text-rose-500"
                    : "text-gray-400"
                }
              >
                {detail.length}/{MAX_CHARS}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="px-5 pb-5 pt-4 flex items-center gap-3 border-t border-gray-100">
          <button
            disabled={!canSubmit}
            onClick={handleApply}
            className={`
              w-full h-11 rounded-lg
              text-[14px] font-semibold
              transition-all active:scale-[0.99]
              ${
                canSubmit
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Kirim Laporan
          </button>
        </div>
      </div>
    </>
  );
}
