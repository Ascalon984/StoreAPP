import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useHistoryPoin } from "./useHistoryPoin";

export interface PointsData {
  total: number;
  transactionPoints: number;
  checkinPoints: number;
  dailyStreak: number;
  checkedInToday: boolean;
  rewardStreakPoints: number;
}

interface PointsState {
  points: PointsData;

  setPoints: (points: Partial<PointsData>) => void;
  addPoints: (amount: number, title?: string, description?: string) => void;
  deductPoints: (amount: number, title?: string, description?: string) => void;
  checkIn: (reward?: number, title?: string) => void;

  resetTestingData: () => void;
  clearStorage: () => void;
}

// Data awal testing
const initialPoints: PointsData = {
  total: 15250,
  transactionPoints: 11250,
  checkinPoints: 1200,
  dailyStreak: 0,
  checkedInToday: false,
  rewardStreakPoints: 100,
};

// ─────────────────────────────────────────
// TESTING HELPER (Dev Only)
//
// Reset semua data lokal:
// localStorage.removeItem("points_store");
// localStorage.removeItem("history_poin_cache");
// location.reload();

// localStorage.clear();
// location.reload();

//
// Gunakan saat ingin simulasi user baru.
// ─────────────────────────────────────────

// true = simpan saat refresh untuk testing
// false = selalu mulai dari initialPoints
export const ENABLE_TESTING = true;

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const usePointsStore = create<PointsState>()(
  persist(
    (set, get) => ({
      points: initialPoints,

      setPoints: (newPoints) =>
        set((state) => ({
          points: {
            ...state.points,
            ...newPoints,
          },
        })),

      addPoints: (amount, title = "Bonus Poin", description = "Dari event & hadiah") => {
        set((state) => ({
          points: {
            ...state.points,
            total: state.points.total + amount,
          },
        }));
        useHistoryPoin.getState().addHistoryTransaction({
          type: "plus",
          amount,
          title,
          description,
          balance: get().points.total,
        });
      },

      deductPoints: (amount, title = "Penukaran Poin", description = "Penukaran Poin") => {
        set((state) => ({
          points: {
            ...state.points,
            total: Math.max(0, state.points.total - amount),
          },
        }));
        useHistoryPoin.getState().addHistoryTransaction({
          type: "minus",
          amount,
          title,
          description,
          balance: get().points.total,
        });
      },

      checkIn: (reward = 20, title = "Check-in Harian") => {
        set((state) => {
          const nextStreak =
            state.points.dailyStreak >= 6
              ? 0 // sudah capai hari ke-7 → reset siklus
              : state.points.dailyStreak + 1;

          return {
            points: {
              ...state.points,
              total: state.points.total + reward,
              checkinPoints: state.points.checkinPoints + reward,
              dailyStreak: nextStreak,
              checkedInToday: true,
            },
          };
        });

        useHistoryPoin.getState().addHistoryTransaction({
          type: "plus",
          amount: reward,
          title,
          description: "Dari event & hadiah",
          balance: get().points.total,
        });
      },

      resetTestingData: () =>
        set({
          points: initialPoints,
        }),

      clearStorage: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("points_store");
        }

        set({
          points: initialPoints,
        });
      },
    }),

    {
      name: "points_store",

      // persist hanya ketika testing
      storage: ENABLE_TESTING
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => noopStorage),
    },
  ),
);
