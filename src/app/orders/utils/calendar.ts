export const MONTH_NAMES = [
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

export type QuickFilterKey = "1 Minggu Lalu" | "1 Bulan Lalu" | "3 Bulan Lalu";

export const QUICK_FILTER_OFFSETS: Record<
  QuickFilterKey,
  { unit: "day" | "month"; amount: number }
> = {
  "1 Minggu Lalu": { unit: "day", amount: 7 },
  "1 Bulan Lalu": { unit: "month", amount: 1 },
  "3 Bulan Lalu": { unit: "month", amount: 3 },
};

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Senin = 0 ... Minggu = 6 (grid dimulai dari "Sen") */
export function getMondayFirstWeekday(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // Minggu=0 ... Sabtu=6
  return (jsDay + 6) % 7;
}

/**
 * Anchor date: hasil geseran quick filter dari referenceDate.
 * Untuk unit "month" dipatok ke tanggal 1 (hindari overflow, mis. 31 Jan -> 3 Mar).
 * Untuk unit "day" (1 Minggu) tidak dipatok, karena basisnya per-hari.
 */
export function getAnchorDate(
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
export function resolveFilterDate(
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

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
