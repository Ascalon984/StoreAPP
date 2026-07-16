"use client";

import { useState } from "react";
import { Store } from "lucide-react";

export default function FavoriteStore({ filterOpen }: { filterOpen: boolean }) {
  type FilterType = "all" | "aktif" | "terlaris" | "rating";

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "aktif", label: "Aktif" },
    { key: "terlaris", label: "Terlaris" },
    { key: "rating", label: "Rating Tinggi" },
  ];

  return (
    <>
      {filterOpen && (
        <div className="absolute -top-2 left-0 right-0 z-40 bg-[#F7F8FA] border-t border-gray-100 shadow-sm">
          <div className="px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {filters.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveFilter(item.key)}
                  className={`
                    h-7 px-3 rounded-lg border text-[12px] font-medium
                    whitespace-nowrap transition-colors
                    ${
                      activeFilter === item.key
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-700 border-gray-200"
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`relative flex-1 overflow-y-auto h-full w-full z-20 ${
          filterOpen ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex flex-col items-center justify-center h-64 text-center mt-10">
          <div className="w-20 h-20 mb-4 rounded-full bg-emerald-600/10 flex items-center justify-center">
            <Store
              size={36}
              strokeWidth={1.5}
              className="text-emerald-600/50"
            />
          </div>

          <h2 className="text-[16px] font-bold text-gray-800 tracking-tight mb-1">
            Belum ada toko favorit
          </h2>

          <p className="text-[13px] text-gray-500 max-w-[200px]">
            Toko yang kamu ikuti akan muncul di sini.
          </p>
        </div>
      </div>
    </>
  );
}
