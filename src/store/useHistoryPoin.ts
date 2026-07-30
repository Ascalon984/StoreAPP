import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { fetchHistory } from "@/services/historyApi";
import { ENABLE_TESTING } from "./usePointsStore";

export interface PointHistory {
  id: number;
  type: "plus" | "minus";
  amount: number;
  title: string;
  description: string;
  date: string;
  balance: number;
}

interface HistoryPoinState {
  data: PointHistory[];
  isLoading: boolean;
  lastFetch: number | null;
  fetchData: (force?: boolean) => Promise<void>;
  addHistoryTransaction: (transaction: Omit<PointHistory, "id" | "date">) => void;
  clearStorage: () => void;
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 menit

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useHistoryPoin = create<HistoryPoinState>()(
  persist(
    (set, get) => ({
      data: [],
      isLoading: false,
      lastFetch: null,

      fetchData: async (force = false) => {
        const { lastFetch, data } = get();
        const now = Date.now();
        
        // Cek jika cache masih valid
        if (!force && lastFetch && now - lastFetch < CACHE_EXPIRY_MS && data.length > 0) {
          return;
        }

        set({ isLoading: true });
        try {
          const result = await fetchHistory(50);
          set({ data: result, lastFetch: Date.now() });
        } catch (error) {
          console.error("Gagal mengambil riwayat poin:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addHistoryTransaction: (transaction) => {
        const { data } = get();
        const newTransaction: PointHistory = {
          ...transaction,
          id: Date.now(),
          date: new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date()).replace(".", ":"),
        };
        set({ data: [newTransaction, ...data] });
      },

      clearStorage: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("history_poin_store");
        }
        set({ data: [], lastFetch: null });
      }
    }),
    {
      name: "history_poin_store",
      storage: ENABLE_TESTING
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => noopStorage),
    }
  )
);
