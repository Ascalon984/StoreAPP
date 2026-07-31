import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  addPoints: (amount: number) => void;
  deductPoints: (amount: number) => void;
  checkIn: (reward?: number) => void;

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
    (set) => ({
      points: initialPoints,

      setPoints: (newPoints) =>
        set((state) => ({
          points: {
            ...state.points,
            ...newPoints,
          },
        })),

      addPoints: (amount) =>
        set((state) => ({
          points: {
            ...state.points,
            total: state.points.total + amount,
          },
        })),

      deductPoints: (amount) =>
        set((state) => ({
          points: {
            ...state.points,
            total: Math.max(0, state.points.total - amount),
          },
        })),

      checkIn: (reward = 20) =>
        set((state) => {
          const nextStreak =
            state.points.dailyStreak >= 6
              ? 0 // sudah capai hari ke-7 → reset siklus
              : state.points.dailyStreak + 1;

          return {
            points: {
              ...state.points,
              checkinPoints: state.points.checkinPoints + reward,
              dailyStreak: nextStreak,
              checkedInToday: true,
            },
          };
        }),

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
