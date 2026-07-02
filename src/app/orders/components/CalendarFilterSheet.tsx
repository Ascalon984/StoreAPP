"use client";

import { useState, useEffect } from "react";
import {
  QuickFilterKey,
  getAnchorDate,
  getDaysInMonth,
  getMondayFirstWeekday,
  MONTH_NAMES,
  resolveFilterDate,
} from "../utils/calendar";

interface CalendarFilterSheetProps {
  show: boolean;
  onClose: () => void;
  appliedDate: Date | null;
  onApply: (date: Date | null) => void;
}

export function CalendarFilterSheet({
  show,
  onClose,
  appliedDate,
  onApply,
}: CalendarFilterSheetProps) {
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<
    QuickFilterKey | ""
  >("");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Sync internal state with applied state when opened
  useEffect(() => {
    if (show) {
      if (!appliedDate) {
        setSelectedQuickFilter("");
        setSelectedDate(null);
      }
      // If there's an appliedDate, ideally we'd reverse-engineer it to set the UI,
      // but for simplicity (and based on the original code), we'll just leave the current state
      // or reset if needed. Actually the original code didn't reset the sheet state, it kept it.
    }
  }, [show, appliedDate]);

  const hasActiveDateFilter = appliedDate !== null;
  const canApplyFilter = selectedQuickFilter !== "" || selectedDate !== null;

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
    onApply(result);
    onClose();
  };

  const handleReset = () => {
    setSelectedQuickFilter("");
    setSelectedDate(null);
    onApply(null);
    onClose();
  };

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
          bg-white rounded-t-[20px]
          px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+20px)]
          shadow-xl
          animate-in slide-in-from-bottom duration-300
        "
      >
        {/* Header */}
        <div className="relative flex items-center justify-center">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-gray-700">
            Filter Tanggal
          </h3>

          <button
            onClick={onClose}
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
        <div className="flex items-center justify-center gap-2 mt-5">
          {(
            [
              "1 Minggu Lalu",
              "1 Bulan Lalu",
              "3 Bulan Lalu",
            ] as QuickFilterKey[]
          ).map((item) => {
            const active = selectedQuickFilter === item;

            return (
              <button
                key={item}
                onClick={() =>
                  setSelectedQuickFilter((prev) => (prev === item ? "" : item))
                }
                className={`
                  h-7 px-3.5 rounded-xl
                  flex-shrink-0
                  text-[11px] font-medium
                  tracking-[-0.01em]
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
          <h4 className="text-[16px] font-semibold tracking-[-0.01em] text-gray-700">
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
            onClick={handleReset}
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
  );
}
