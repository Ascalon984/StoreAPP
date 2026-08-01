"use client";

import React, { useState } from "react";
import { Bell, ArrowLeft } from "lucide-react";
import { NavRowButton, ToggleRow } from "./ProfileNavRow";
import { useNavigationStore } from "@/store/useNavigationStore";

export default function ProfileNotification() {
  const [isOpen, setIsOpen] = useState(false);
  const setProfileSubPageOpen = useNavigationStore(
    (s) => s.setProfileSubPageOpen,
  );

  const openPanel = () => {
    setIsOpen(true);
    setProfileSubPageOpen(true);
  };
  const closePanel = () => {
    setIsOpen(false);
    setProfileSubPageOpen(false);
  };
  const initialPrefs = {
    orderUpdates: true,
    sellerChat: true,
    promoOffers: false,
  };

  const [notifPrefs, setNotifPrefs] = useState(initialPrefs);

  const hasChanges =
    notifPrefs.orderUpdates !== initialPrefs.orderUpdates ||
    notifPrefs.sellerChat !== initialPrefs.sellerChat ||
    notifPrefs.promoOffers !== initialPrefs.promoOffers;

  const handleSave = () => {
    try {
      localStorage.setItem(
        "notification-preferences",
        JSON.stringify(notifPrefs),
      );
    } catch (e) {
      console.warn("Gagal menyimpan preferensi", e);
    }

    closePanel();
  };

  return (
    <>
      <NavRowButton
        key="notifikasi"
        icon={Bell}
        title="Notifikasi"
        subtitle="Pesanan, chat penjual, promo, aktivitas akun"
        page="notifikasi"
        onClick={openPanel}
      />

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-50 animate-in slide-in-from-bottom-full duration-300">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center gap-1.5 border-b border-gray-100 bg-white px-4 py-3.5">
            <button
              onClick={closePanel}
              className="p-1 -ml-1 active:scale-95 transition-transform"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>

            <h2 className="text-[18px] font-bold text-gray-800">Notifikasi</h2>
          </div>

          {/* Content */}
          <div className="flex-1 py-4">
            <div className="overflow-hidden rounded-lg bg-white">
              <div className="divide-y divide-gray-100/60">
                <ToggleRow
                  title="Update Pesanan"
                  desc="Info status pemesanan real-time"
                  on={notifPrefs.orderUpdates}
                  onToggle={() =>
                    setNotifPrefs((p) => ({
                      ...p,
                      orderUpdates: !p.orderUpdates,
                    }))
                  }
                />

                <ToggleRow
                  title="Chat Penjual"
                  desc="Notifikasi pesan masuk dari penjual"
                  on={notifPrefs.sellerChat}
                  onToggle={() =>
                    setNotifPrefs((p) => ({
                      ...p,
                      sellerChat: !p.sellerChat,
                    }))
                  }
                />

                <ToggleRow
                  title="Promo & Penawaran"
                  desc="Diskon dan voucher eksklusif"
                  on={notifPrefs.promoOffers}
                  onToggle={() =>
                    setNotifPrefs((p) => ({
                      ...p,
                      promoOffers: !p.promoOffers,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
            <button
              disabled={!hasChanges}
              onClick={handleSave}
              className={`h-11 w-full rounded-lg text-[13.5px] font-bold transition-all ${
                hasChanges
                  ? "bg-emerald-600 text-white active:scale-[0.98]"
                  : "cursor-not-allowed bg-gray-100 text-gray-400"
              }`}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}
    </>
  );
}
