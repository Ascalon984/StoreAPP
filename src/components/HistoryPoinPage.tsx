"use client";

import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

// TODO: Integrasi Riwayat Poin
//
// Konsep:
// - Backend menjadi source of truth untuk seluruh riwayat poin.
// - localStorage hanya sebagai cache agar halaman dapat terbuka instan.
// - Saat membuka halaman:
//   1. Tampilkan data dari cache (jika ada).
//   2. Jika cache expired (±3–5 menit), lakukan background fetch.
//   3. Setelah data terbaru diterima, perbarui UI dan cache.
// - Setelah check-in / redeem berhasil:
//   - Backend otomatis menyimpan transaksi.
//   - Frontend meng-update cache dari respons API dan meng-invalidate query.
// - Saat login di perangkat baru, cache diinisialisasi dari backend.
//
// Rencana implementasi:
// - Endpoint: GET /history (pagination / cursor).
// - React Query / SWR (stale-while-revalidate).
// - Cache expiry ±3–5 menit.
// - Pagination / infinite scroll jika data sudah banyak.

interface HistoryPoinPageProps {
  onClose: () => void;
}

import { useHistoryPoin } from "@/store/useHistoryPoin";

export default function HistoryPoinPage({ onClose }: HistoryPoinPageProps) {
  const [mounted, setMounted] = useState(false);
  const { data: historyData, isLoading, fetchData } = useHistoryPoin();

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-1 -ml-1 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>

        <h2 className="text-[13px] font-bold text-gray-800">Riwayat Poin</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20 pt-4">
        <div className="bg-white relative">
          {isLoading && historyData.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">Memuat riwayat...</div>
          )}
          {!isLoading && historyData.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">Belum ada riwayat poin</div>
          )}
          
          {historyData.map((item, index) => {
            const isLast = index === historyData.length - 1;

            return (
              <div key={item.id} className="flex gap-2 pl-2 pr-4">
                {/* Kolom poin */}
                <div className="w-[60px] shrink-0 flex items-center justify-center">
                  <span
                    className={`font-bold tabular-nums ${
                      item.amount >= 1000 ? "text-[12.5px]" : "text-[14.5px]"
                    } ${
                      item.type === "plus"
                        ? "text-emerald-600"
                        : "text-rose-500"
                    }`}
                  >
                    {item.type === "plus" ? "+" : "-"}
                    {item.amount.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Konten */}
                <div
                  className={`flex-1 min-w-0 py-2.5 ${
                    !isLast ? "border-b border-gray-100" : ""
                  }`}
                >
                  {/* Baris atas */}
                  <div className="flex items-start justify-between gap-4 min-w-0">
                    <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-gray-800">
                      {item.title}
                    </p>
                    <p className="shrink-0 text-[10px] text-gray-500">
                      {item.date}
                    </p>
                  </div>

                  {/* Baris bawah */}
                  <div className="mt-1.5 flex items-center justify-between gap-4 min-w-0">
                    <p className="min-w-0 flex-1 truncate text-[10px] text-gray-500">
                      {item.description}
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <img src="/icons/poin.svg" className="w-4 h-4" alt="" />
                      <span className="text-[11px] font-semibold text-gray-700 tabular-nums">
                        {item.balance.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
