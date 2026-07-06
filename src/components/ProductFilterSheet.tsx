"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const formatPrice = (value: string) => {
  if (!value) return "";

  return Number(value).toLocaleString("id-ID");
};

export type SortOption = "terbaru" | "terlaris" | "terbaik" | "termurah" | null;

export interface FilterState {
  sort: SortOption;
  minPrice: string;
  maxPrice: string;
  radius: "lokal" | "regional" | "nasional" | null;
  activeFilters: string[];
}

export const defaultFilterState: FilterState = {
  sort: null,
  minPrice: "",
  maxPrice: "",
  radius: null,
  activeFilters: [],
};

interface ProductFilterSheetProps {
  show: boolean;
  onClose: () => void;
  appliedFilters: FilterState | null;
  onApply: (filters: FilterState | null) => void;
}

export function ProductFilterSheet({
  show,
  onClose,
  appliedFilters,
  onApply,
}: ProductFilterSheetProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  const currentApplied = appliedFilters || defaultFilterState;

  const canApplyFilter =
    JSON.stringify(filters) !== JSON.stringify(currentApplied);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  // Sync internal state with applied state when opened
  useEffect(() => {
    if (show) {
      if (appliedFilters) {
        setFilters(appliedFilters);
      } else {
        setFilters(defaultFilterState);
      }
    }
  }, [show, appliedFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(defaultFilterState);
    onApply(null);
  };

  const toggleActiveFilter = (filter: string) => {
    setFilters((prev) => {
      const isActive = prev.activeFilters.includes(filter);
      return {
        ...prev,
        activeFilters: isActive
          ? prev.activeFilters.filter((f) => f !== filter)
          : [...prev.activeFilters, filter],
      };
    });
  };

  const hasActiveFilters =
    filters.sort !== defaultFilterState.sort ||
    filters.minPrice !== defaultFilterState.minPrice ||
    filters.maxPrice !== defaultFilterState.maxPrice ||
    filters.radius !== defaultFilterState.radius ||
    filters.activeFilters.length > 0;

  if (!show) return null;

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
          fixed bottom-0 inset-x-0 z-[80]
          bg-white
          rounded-t-[28px]
          px-4 pt-3
          pb-[calc(env(safe-area-inset-bottom)+20px)]
          shadow-[0_-8px_40px_rgba(0,0,0,0.08)]
          animate-in slide-in-from-bottom duration-300
        "
      >
        {/* Header */}
        <div className="relative flex items-center justify-center pb-4 border-b border-gray-100">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-gray-800">
            Filter Produk
          </h3>
          <button
            onClick={onClose}
            className="absolute right-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-95 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="py-4 space-y-6">
          {/* Urutkan */}
          <div>
            <h4 className="text-[13px] font-semibold text-gray-700 mb-3">
              Urutkan
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(
                ["terbaru", "terlaris", "terbaik", "termurah"] as SortOption[]
              ).map((sort) => {
                const active = filters.sort === sort;
                const label =
                  typeof sort === "string"
                    ? sort.charAt(0).toUpperCase() + sort.slice(1)
                    : "";
                return (
                  <button
                    key={sort}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        sort: filters.sort === sort ? null : sort,
                      })
                    }
                    className={`
                      h-9 px-4 rounded-lg text-[12px] font-medium transition-all active:scale-975 flex items-center justify-center
                      ${
                        active
                          ? "bg-emerald-600 text-white shadow-sm border border-emerald-600"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }
                    `}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Harga */}
          <div>
            <h4 className="text-[13px] font-semibold text-gray-700 mb-3">
              Rentang Harga
            </h4>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[13px] font-medium">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Terendah"
                  value={formatPrice(filters.minPrice)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");

                    setFilters({
                      ...filters,
                      minPrice: raw,
                    });
                  }}
                  className="
                    w-full h-10
                    pl-9 pr-3
                    rounded-lg
                    border border-black/[0.06]
                    text-[13px] text-gray-700
                    placeholder:text-gray-400
                    focus:outline-none
                    focus:border-emerald-500/50
                    transition-colors
                    bg-gray-50/50
                  "
                />
              </div>
              <span className="text-gray-400 font-medium">-</span>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[13px] font-medium">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Tertinggi"
                  value={formatPrice(filters.maxPrice)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");

                    setFilters({
                      ...filters,
                      maxPrice: raw,
                    });
                  }}
                  className="
                    w-full h-10
                    pl-9 pr-3
                    rounded-lg
                    border border-black/[0.06]
                    text-[13px] text-gray-700
                    placeholder:text-gray-400
                    focus:outline-none
                    focus:border-emerald-500/50
                    transition-colors
                    bg-gray-50/50
                  "
                />
              </div>
            </div>
          </div>

          {/* Radius Pengiriman */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[13px] font-semibold text-gray-700">
                Jangkauan Produk
              </h4>
            </div>

            <div className="px-2">
              {/* Slider */}
              <div className="relative h-5">
                {/* Base Line */}
                <div className="absolute top-[48%] left-0 right-0 -translate-y-1/2 h-[6px] bg-gray-200 rounded-full" />

                {/* Active Fill - menunjukkan sejauh mana selection */}
                <div
                  className="absolute top-[48%] left-0 -translate-y-1/2 h-[4px] bg-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: !filters.radius
                      ? "0%"
                      : filters.radius === "lokal"
                        ? "0%"
                        : filters.radius === "regional"
                          ? "50%"
                          : "100%",
                  }}
                />

                {/* Dots */}
                <div className="relative flex justify-between">
                  {[
                    { value: "lokal", label: "Lokal" },
                    { value: "regional", label: "Regional" },
                    { value: "nasional", label: "Nasional" },
                  ].map((option, index) => {
                    // Logic: aktif jika radius sama atau lebih luas
                    const isActive =
                      filters.radius === option.value ||
                      (filters.radius === "regional" &&
                        option.value === "lokal") ||
                      (filters.radius === "nasional" &&
                        (option.value === "lokal" ||
                          option.value === "regional"));

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={`Pilih jangkauan ${option.label}`}
                        onClick={() => {
                          // Jika klik yang sama, unselect (toggle off)
                          if (filters.radius === option.value) {
                            setFilters({ ...filters, radius: null });
                          } else {
                            setFilters({
                              ...filters,
                              radius: option.value as
                                | "lokal"
                                | "regional"
                                | "nasional",
                            });
                          }
                        }}
                        className={`
                w-5 h-5 rounded-full border-2
                transition-all duration-200 active:scale-95
                ${
                  isActive
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-white border-gray-300"
                }
                ${!filters.radius ? "border-gray-300" : ""}
              `}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Labels */}
              <div className="flex mt-0.5">
                {[
                  { value: "lokal", label: "Lokal" },
                  { value: "regional", label: "Regional" },
                  { value: "nasional", label: "Nasional" },
                ].map((option, index) => {
                  const isActive =
                    filters.radius === option.value ||
                    (filters.radius === "regional" &&
                      option.value === "lokal") ||
                    (filters.radius === "nasional" &&
                      (option.value === "lokal" ||
                        option.value === "regional"));

                  return (
                    <div
                      key={option.value}
                      className={`
                        flex-1
                        ${index === 0 ? "text-left" : ""}
                        ${index === 1 ? "text-center" : ""}
                        ${index === 2 ? "text-right" : ""}
                      `}
                    >
                      <span
                        onClick={() => {
                          if (filters.radius === option.value) {
                            setFilters({ ...filters, radius: null });
                          } else {
                            setFilters({
                              ...filters,
                              radius: option.value as
                                | "lokal"
                                | "regional"
                                | "nasional",
                            });
                          }
                        }}
                        className={`
                          inline-block cursor-pointer text-[11px] transition-colors
                          ${
                            isActive
                              ? "text-gray-700 font-semibold"
                              : "text-gray-400 font-medium"
                          }
                        `}
                      >
                        {option.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="mt-2 flex items-center gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className={`
              flex-1 h-11 rounded-lg border text-[14px] font-semibold transition-all active:scale-[0.99]
              ${
                hasActiveFilters
                  ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "border-gray-100 text-gray-300 cursor-not-allowed"
              }
            `}
          >
            Reset
          </button>

          <button
            disabled={!canApplyFilter}
            onClick={() => {
              if (!canApplyFilter) return;
              handleApply();
            }}
            className={`
              flex-[1.3]
              h-11 rounded-lg
              text-[14px] font-semibold
              transition-all active:scale-[0.99]
              ${
                canApplyFilter
                  ? `
                    bg-emerald-600
                    text-white
                    hover:bg-emerald-700
                    shadow-sm
                  `
                  : `
                    bg-gray-100
                    text-gray-400
                    cursor-not-allowed
                  `
              }
            `}
          >
            Terapkan
          </button>
        </div>
      </div>
    </>
  );
}
