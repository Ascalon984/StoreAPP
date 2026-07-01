"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mockOrders } from "@/lib/data";
import { Order } from "@/lib/types";
import { Search, CalendarDays } from "lucide-react";

import {
  FilterTab,
  FILTER_TABS,
  OrderCard,
  SkeletonCard,
  EmptyState,
  groupOrders,
} from "./components/OrderComponents";

// ══════════════════════════════════════════════════════════
// CALENDAR FILTER LOGIC — Quick Filter + Manual Date
// ══════════════════════════════════════════════════════════

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type QuickFilterKey = "1 Minggu" | "1 Bulan" | "3 Bulan" | "6 Bulan";

const QUICK_FILTER_OFFSETS: Record<
  QuickFilterKey,
  { unit: "day" | "month"; amount: number }
> = {
  "1 Minggu": { unit: "day", amount: 7 },
  "1 Bulan": { unit: "month", amount: 1 },
  "3 Bulan": { unit: "month", amount: 3 },
  "6 Bulan": { unit: "month", amount: 6 },
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Senin = 0 ... Minggu = 6 (grid dimulai dari "Sen") */
function getMondayFirstWeekday(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // Minggu=0 ... Sabtu=6
  return (jsDay + 6) % 7;
}

/**
 * Anchor date: hasil geseran quick filter dari referenceDate.
 * Untuk unit "month" dipatok ke tanggal 1 (hindari overflow, mis. 31 Jan -> 3 Mar).
 * Untuk unit "day" (1 Minggu) tidak dipatok, karena basisnya per-hari.
 */
function getAnchorDate(
  quickFilter: string | null,
  referenceDate: Date = new Date(),
): Date {
  const offset = quickFilter
    ? QUICK_FILTER_OFFSETS[quickFilter as QuickFilterKey]
    : null;

  if (!offset) return new Date(referenceDate);

  const base = new Date(referenceDate);
  if (offset.unit === "month") {
    base.setDate(1);
    base.setMonth(base.getMonth() - offset.amount);
  } else {
    base.setDate(base.getDate() - offset.amount);
  }
  return base;
}

/**
 * Gabungkan quick filter + tanggal manual jadi satu tanggal final.
 * - Hanya quick filter (tanpa tanggal)      -> pakai anchor apa adanya.
 * - Hanya tanggal (tanpa quick filter)      -> tanggal tsb di bulan berjalan.
 * - Quick filter berbasis bulan + tanggal   -> anchor (tgl 1) + (selectedDate - 1) hari.
 * - "1 Minggu" + tanggal                    -> tanggal tsb di bulan berjalan (override).
 */
function resolveFilterDate(
  quickFilter: string,
  selectedDate: number | null,
  referenceDate: Date = new Date(),
): Date {
  const anchor = getAnchorDate(quickFilter || null, referenceDate);

  if (selectedDate == null) {
    return anchor;
  }

  const offset = quickFilter
    ? QUICK_FILTER_OFFSETS[quickFilter as QuickFilterKey]
    : null;

  if (!offset || offset.unit === "month") {
    const result = new Date(anchor);
    result.setDate(result.getDate() + (selectedDate - 1));
    return result;
  }

  const result = new Date(referenceDate);
  result.setDate(selectedDate);
  return result;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ── Main Page ──
export default function OrdersPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setOrders(mockOrders);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<
    QuickFilterKey | ""
  >("");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [appliedDate, setAppliedDate] = useState<Date | null>(null);
  const hasActiveDateFilter = appliedDate !== null;
  const canApplyFilter = selectedQuickFilter !== "" || selectedDate !== null;

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Calendar derived state ──
  const calendarAnchor = getAnchorDate(selectedQuickFilter || null, new Date());
  const calendarYear = calendarAnchor.getFullYear();
  const calendarMonth = calendarAnchor.getMonth();
  const calendarMonthLabel = `${MONTH_NAMES[calendarMonth]} ${calendarYear}`;
  const daysInCalendarMonth = getDaysInMonth(calendarYear, calendarMonth);
  const leadingBlanks = getMondayFirstWeekday(calendarYear, calendarMonth);

  const today = new Date();

  const isCurrentMonth =
    calendarYear === today.getFullYear() && calendarMonth === today.getMonth();

  // Reset tanggal terpilih kalau quick filter berubah dan tanggal jadi tidak valid
  useEffect(() => {
    if (selectedDate !== null && selectedDate > daysInCalendarMonth) {
      setSelectedDate(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuickFilter]);

  const handleApplyFilter = () => {
    const result = resolveFilterDate(
      selectedQuickFilter,
      selectedDate,
      new Date(),
    );
    setAppliedDate(result);
    setShowDateSheet(false);
  };

  // ── Orders filtering (status tab + optional applied date) ──
  const filtered = orders.filter((o) => {
    if (activeFilter !== "all" && o.status !== activeFilter) return false;
    if (appliedDate && !isSameDay(new Date(o.createdAt), appliedDate))
      return false;
    return true;
  });

  const groups = groupOrders(filtered);

  return (
    <div className="min-h-screen bg-gray-50/80 pb-[88px]">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200/80">
        <div
          className="px-4 flex items-center justify-between"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            height: "52px",
          }}
        >
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold tracking-[-0.01em] text-gray-700">
              Riwayat Transaksi
            </h1>
          </div>

          <div className="flex items-center gap-5 flex-shrink-0">
            <button
              onClick={() => setShowDateSheet(true)}
              className={`
                transition-all
                active:scale-95
                ${
                  hasActiveDateFilter
                    ? `
                      text-emerald-600
                    `
                    : `
                      text-gray-500
                      hover:text-gray-700
                    `
                }
              `}
            >
              <CalendarDays size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-3 pt-1.5 pb-3">
          <div
            className="
                flex items-center gap-1 overflow-x-auto
                scrollbar-none [-ms-overflow-style:none]
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
          >
            {FILTER_TABS.map((tab) => {
              const active = activeFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`
            h-7 px-2.5 rounded-lg
            border
            text-[10px] font-semibold tracking-[-0.01em]
            whitespace-nowrap
            transition-all duration-200
            active:scale-[0.97]
            ${
              active
                ? `
                  bg-emerald-600
                  border-emerald-600
                  text-white
                  shadow-[0_1px_6px_rgba(5,150,105,0.16)]
                `
                : `
                  bg-white
                  border-gray-200
                  text-gray-500
                  hover:bg-gray-50
                  hover:border-gray-300
                `
            }
          `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="pt-[22px]">
        {isLoading ? (
          <div className="px-2 space-y-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : groups.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.label}>
                {/* Group Label */}
                <div className="px-3 pb-1.5">
                  <h2 className="text-[11px] font-semibold text-gray-400 tracking-wide uppercase">
                    {group.label}
                  </h2>
                </div>

                {/* Cards */}
                <div className="mx-2 bg-white rounded-xl overflow-hidden shadow-sm">
                  {group.orders.map((order, idx) => (
                    <div key={order.id}>
                      <OrderCard order={order} activeFilter={activeFilter} />

                      {idx < group.orders.length - 1 && (
                        <div className="border-t border-gray-200/90 mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      {showDateSheet && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[70] bg-black/25 backdrop-blur-[1px]"
            onClick={() => setShowDateSheet(false)}
          />

          {/* Sheet */}
          <div
            className="
              fixed bottom-0 inset-x-0 z-[80]
              bg-white rounded-t-[20px]
              px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+20px)]
              shadow-xl
              animate-in slide-in-from-bottom duration-300
            "
          >
            {/* Header */}
            <div className="relative flex items-center justify-center">
              <h3 className="text-[15px] font-bold tracking-[-0.01em] text-gray-700">
                Filter Tanggal
              </h3>

              <button
                onClick={() => setShowDateSheet(false)}
                className="
                  absolute right-0
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

            {/* Quick Filter */}
            <div
              className="
      flex items-center gap-2
      overflow-x-auto mt-5
      scrollbar-none
      [-ms-overflow-style:none]
      [scrollbar-width:none]
      [&::-webkit-scrollbar]:hidden
    "
            >
              {(
                [
                  "1 Minggu",
                  "1 Bulan",
                  "3 Bulan",
                  "6 Bulan",
                ] as QuickFilterKey[]
              ).map((item) => {
                const active = selectedQuickFilter === item;

                return (
                  <button
                    key={item}
                    onClick={() =>
                      setSelectedQuickFilter((prev) =>
                        prev === item ? "" : item,
                      )
                    }
                    className={`
                      h-7 px-4 rounded-xl
                      flex-shrink-0
                      text-[11px] font-semibold
                      transition-all active:scale-[0.98]
                      ${
                        active
                          ? `
                            bg-emerald-600
                            border border-emerald-600
                            text-white
                          `
                          : `
                            bg-white
                            border border-gray-200
                            text-gray-600
                            hover:bg-gray-50
                          `
                      }
                    `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Current Month */}
            <div className="mt-5 flex items-center justify-center">
              <h4 className="text-[16px] font-bold tracking-[-0.01em] text-gray-700">
                {calendarMonthLabel}
              </h4>
            </div>

            {/* Calendar */}
            <div className="mt-5">
              {/* Days */}
              <div
                className="
        grid grid-cols-7
        pb-3 mb-3
        border-b border-gray-100
        text-center
      "
              >
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                  <div
                    key={d}
                    className="
            text-[12px]
            font-semibold
            tracking-[-0.01em]
            text-gray-600
          "
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-7 gap-y-4 text-center">
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}

                {Array.from({ length: daysInCalendarMonth }).map((_, i) => {
                  const day = i + 1;
                  const active = selectedDate === day;
                  const isFutureDate = isCurrentMonth && day > today.getDate();

                  const disabled = !selectedQuickFilter && isFutureDate;

                  return (
                    <button
                      disabled={disabled}
                      key={day}
                      onClick={() => {
                        if (disabled) return;

                        setSelectedDate((prev) => (prev === day ? null : day));
                      }}
                      className={`
              w-9 h-9 mx-auto rounded-xl
              text-[12px] font-medium
              transition-all active:scale-95
              ${
                disabled
                  ? `
      text-gray-300
      cursor-not-allowed
    `
                  : active
                    ? `
        bg-emerald-600
        text-white
        shadow-layer-sm
      `
                    : `
        text-gray-700
        hover:bg-gray-100
      `
              }
            `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-7 flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedQuickFilter("");
                  setSelectedDate(null);
                  setAppliedDate(null);
                }}
                disabled={!hasActiveDateFilter}
                className={`
                  flex-1 h-11 rounded-lg
                  border
                  text-[14px] font-semibold
                  transition-all active:scale-[0.99]
                  ${
                    hasActiveDateFilter
                      ? `
                        border-gray-200
                        text-gray-700
                        hover:bg-gray-50
                      `
                      : `
                        border-gray-100
                        text-gray-300
                        cursor-not-allowed
                      `
                  }
                `}
              >
                Reset
              </button>

              <button
                disabled={!canApplyFilter}
                onClick={() => {
                  if (!canApplyFilter) return;

                  handleApplyFilter();
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
      )}
    </div>
  );
}
