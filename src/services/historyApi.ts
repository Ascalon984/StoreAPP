import { PointHistory } from "@/store/useHistoryPoin";

// Pure API Call — siap untuk koneksi ke backend GET /history
// Data mock sudah dihapus; history dikelola langsung oleh useHistoryPoin store
export const fetchHistory = async (
  limit: number = 50,
  page: number = 1,
): Promise<PointHistory[]> => {
  // TODO: Ganti dengan fetch betulan ke backend:
  // const res = await fetch(`/api/history?limit=${limit}&page=${page}`);
  // if (!res.ok) throw new Error("Gagal mengambil riwayat");
  // return res.json();

  return [];
};
