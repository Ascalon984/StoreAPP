import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ActiveVoucher } from "@/components/VoucherList";

interface VoucherStore {
  activeVouchers: ActiveVoucher[];
  addVoucher: (voucher: ActiveVoucher) => void;
  removeExpired: () => void;
}

export const useVoucherStore = create<VoucherStore>()(
  persist(
    (set) => ({
      activeVouchers: [],
      addVoucher: (voucher) =>
        set((state) => ({
          activeVouchers: [voucher, ...state.activeVouchers],
        })),
      removeExpired: () =>
        set((state) => ({
          activeVouchers: state.activeVouchers.filter(
            (v) => new Date(v.expiresAt).getTime() > Date.now(),
          ),
        })),
    }),
    { name: "voucher-storage" },
  ),
);
