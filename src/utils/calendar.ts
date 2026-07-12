const MS_PER_DAY = 1000 * 60 * 60 * 24;

const MONTH_NAMES_ID = [
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

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function diffInDays(from: Date, to: Date) {
  return Math.floor(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY,
  );
}

export function getGroupLabel(orderDate: Date, now: Date = new Date()): string {
  const days = diffInDays(orderDate, now);

  if (days < 7) {
    return "Terbaru";
  }

  if (days < 14) {
    return "1 Minggu Lalu";
  }

  if (days < 21) {
    return "2 Minggu Lalu";
  }

  if (days < 30) {
    return "3 Minggu Lalu";
  }

  const month = MONTH_NAMES_ID[orderDate.getMonth()];
  return `${month} ${orderDate.getFullYear()}`;
}
