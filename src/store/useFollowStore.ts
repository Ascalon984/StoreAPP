import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FollowState {
  followedSellerIds: string[];
  isFollowing: (sellerId: string) => boolean;
  toggleFollow: (sellerId: string) => void;
  clearFollowed: () => void; // ⬅️ tambah
}

export const useFollowStore = create<FollowState>()(
  persist(
    (set, get) => ({
      followedSellerIds: [],

      isFollowing: (sellerId) => get().followedSellerIds.includes(sellerId),

      toggleFollow: (sellerId) => {
        const current = get().followedSellerIds;
        const isCurrentlyFollowing = current.includes(sellerId);

        set({
          followedSellerIds: isCurrentlyFollowing
            ? current.filter((id) => id !== sellerId)
            : [...current, sellerId],
        });
      },

      clearFollowed: () => set({ followedSellerIds: [] }), // ⬅️ tambah
    }),
    {
      name: "follow-storage",
    },
  ),
);
