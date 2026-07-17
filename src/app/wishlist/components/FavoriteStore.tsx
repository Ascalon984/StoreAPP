"use client";

import { useState } from "react";
import { Store, MapPin, Star, ChevronRight } from "lucide-react";
import { MOCK_SELLERS } from "@/lib/mockSellers";

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
        <div className="flex flex-col gap-3 px-4 pt-4 pb-24">
          {MOCK_SELLERS.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl overflow-hidden relative flex items-stretch min-h-[100px]"
            >
              {/* LEFT (30%) */}
              <div className="w-[30%] bg-emerald-600 rounded-tr-2xl border-r border-emerald-700/20 flex flex-col items-center justify-center px-2 py-3">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  {store.avatar ? (
                    <img
                      src={store.avatar}
                      alt={store.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Store size={26} strokeWidth={1.5} />
                  )}
                </div>

                <button className="mt-2.5 flex w-full items-center justify-center gap-0.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-80 translate-x-[2px]">
                  <span>Kunjungi</span>
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* RIGHT (70%) */}
              <div className="w-[70%] flex flex-col justify-between px-3 py-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-semibold text-gray-800 line-clamp-1">
                      {store.name}
                    </h3>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${
                        store.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {store.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-600">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{store.kabupaten}</span>
                  </div>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-3 border-t border-gray-200 pt-1.5 mt-1.5 translate-y-[5px]">
                  <div className="flex flex-col items-center">
                    <Star
                      size={10}
                      fill="currentColor"
                      className="text-amber-500 mb-0.5"
                    />
                    <span className="text-[11px] font-medium text-gray-700">
                      4.9
                    </span>
                  </div>

                  <div className="flex flex-col items-center border-x border-gray-100">
                    <span className="text-[10px] text-gray-500">Produk</span>
                    <span className="text-[11px] font-medium text-gray-700">
                      58
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-500">Terjual</span>
                    <span className="text-[11px] font-medium text-gray-700">
                      1.2k
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
