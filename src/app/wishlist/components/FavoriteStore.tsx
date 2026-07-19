"use client";

import { useState } from "react";
import { Store, MapPin, Star, ChevronRight, MoreVertical } from "lucide-react";
import { MOCK_SELLERS } from "@/lib/mockSellers";

export default function FavoriteStore({ filterOpen }: { filterOpen: boolean }) {
  type FilterType = "aktif" | "terlaris" | "rating";

  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filters: { key: "all" | FilterType; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "aktif", label: "Aktif" },
    { key: "terlaris", label: "Terlaris" },
    { key: "rating", label: "Rating Tinggi" },
  ];

  const toggleFilter = (key: "all" | FilterType) => {
    if (key === "all") {
      setActiveFilters([]);
      return;
    }

    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const normalizeLocation = (location?: string) => {
    if (!location) return "";

    return location
      .replace(/^Kabupaten\s+/i, "Kab. ")
      .replace(/^Kab\s+/i, "Kab. ")
      .replace(/^Kota\s+/i, "Kota ");
  };

  const getFullLocation = (kabupaten?: string, provinsi?: string) => {
    const city = normalizeLocation(kabupaten);

    if (!city) return provinsi || "";
    if (!provinsi) return city;

    return `${city}, ${provinsi}`;
  };

  return (
    <>
      {filterOpen && (
        <div className="sticky top-12 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
          <div className="px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {filters.map((item) => {
                const isActive =
                  item.key === "all"
                    ? activeFilters.length === 0
                    : activeFilters.includes(item.key);

                return (
                  <button
                    key={item.key}
                    onClick={() => toggleFilter(item.key)}
                    className={`
                      h-7 px-3 rounded-lg border text-[12px] font-medium
                      whitespace-nowrap transition-colors
                      ${
                        isActive
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-700 border-gray-200"
                      }
                    `}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div
        className={`relative w-full z-20 ${
          filterOpen ? "pointer-events-none" : ""
        }`}
      >
        {/* Global Overlay for Dropdown */}
        {openMenuId && (
          <div
            className="fixed inset-0 z-30"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(null);
            }}
          />
        )}

        <div className="flex flex-col gap-3 px-4 pt-3 pb-24">
          {MOCK_SELLERS.map((store) => (
            <div
              key={store.id}
              className={`bg-white rounded-lg shadow-layer-sm overflow-visible relative flex items-stretch min-h-[100px] transform-gpu ${
                openMenuId === store.id ? "z-40" : ""
              }`}
            >
              {/* LEFT (30%) */}
              <div
                className={`relative z-10 w-[30%] shrink-0 rounded-l-lg rounded-tr-3xl border-r shadow-[2px_0_8px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center px-2 py-3 ${
                  store.isActive
                    ? "bg-emerald-600 border-emerald-700/20"
                    : "bg-gray-400 border-gray-500/20"
                }`}
              >
                <div
                  className={`w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border ${
                    store.isActive
                      ? "text-emerald-600 border-emerald-100"
                      : "text-gray-500 border-gray-200"
                  }`}
                >
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

                {store.isActive ? (
                  <button className="mt-2.5 flex w-full items-center justify-center gap-0.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-80 translate-x-[2px]">
                    <span>Kunjungi</span>
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </button>
                ) : (
                  <div className="mt-2.5 flex w-full items-center justify-center">
                    <span className="text-[11px] font-semibold text-white/80">
                      Tidak Aktif
                    </span>
                  </div>
                )}
              </div>

              {/* RIGHT (70%) */}
              <div className="relative w-[70%] flex-1 flex flex-col justify-between px-3 py-3">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="pr-8 text-[13px] font-semibold text-gray-700 line-clamp-1">
                      {store.name}
                    </h3>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOpenMenuId(
                          openMenuId === store.id ? null : store.id,
                        );
                      }}
                      className="absolute top-2.5 right-1.5 rounded-full p-1 text-gray-500 active:bg-gray-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[10.5px] text-gray-600">
                    <span className="truncate">
                      {getFullLocation(store.kabupaten, store.provinsi)}
                    </span>
                  </div>
                </div>

                {/* Dropdown */}
                <div
                  className={`
                    absolute
                    left-0
                    right-0
                    top-[40px]
                    z-50
                    overflow-hidden
                    rounded-md
                    border border-gray-100
                    bg-white
                    shadow-sm
                    transition-all
                    duration-200
                    ease-out
                    ${
                      openMenuId === store.id
                        ? "opacity-100 translate-y-0 pointer-events-auto visible"
                        : "opacity-0 -translate-y-1 pointer-events-none invisible"
                    }
                  `}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(null);
                    }}
                    className="w-full px-4 py-1.5 text-left text-[12.5px] text-rose-600 active:bg-rose-50"
                  >
                    Hapus Toko dari Favorit
                  </button>

                  <div className="h-px bg-gray-100" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(null);
                    }}
                    className="w-full px-4 py-2 text-left text-[12.5px] text-gray-700 active:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-3 border-t border-gray-200 pt-1.5 mt-1.5 translate-y-[4px]">
                  <div className="flex flex-col items-center">
                    <Star
                      size={10}
                      fill="currentColor"
                      className="mb-0.5 text-amber-500"
                    />
                    <span className="text-[11px] font-medium text-gray-700 translate-y-[1px]">
                      4.9
                    </span>
                  </div>

                  <div className="flex flex-col items-center border-x border-gray-100">
                    <span className="text-[10px] text-gray-500">Produk</span>
                    <span className="text-[11px] font-medium text-gray-700 translate-y-[1px]">
                      58
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-500">Terjual</span>
                    <span className="text-[11px] font-medium text-gray-700 translate-y-[1px]">
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
