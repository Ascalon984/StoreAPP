"use client";

import React, { useState } from "react";
import { Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { NavRowButton, ToggleRow } from "./ProfileNavRow";
import { useNavigationStore } from "@/store/useNavigationStore";

export default function ProfilePrivacy() {
  const [isOpen, setIsOpen] = useState(false);
  const setProfileSubPageOpen = useNavigationStore((s) => s.setProfileSubPageOpen);

  const openPanel = () => { setIsOpen(true); setProfileSubPageOpen(true); };
  const closePanel = () => { setIsOpen(false); setProfileSubPageOpen(false); };
  const [privasiPrefs, setPrivasiPrefs] = useState({
    showReviewIdentity: true,
    personalizedRecommendations: true,
    showOnlineStatus: false,
    shareUsageData: false,
    allowSearchByEmail: false,
    allowSearchByPhone: false,
  });

  return (
    <>
      <NavRowButton
        key="privasi"
        icon={Lock}
        title="Privasi"
        subtitle="Identitas ulasan, personalisasi rekomendasi"
        page="privasi"
        onClick={openPanel}
      />

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="bg-white px-4 py-3.5 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
            <button
              onClick={closePanel}
              className="p-1 -ml-1 active:scale-95 transition-transform"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h2 className="text-[13px] font-bold text-gray-800">Privasi</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                    Identitas &amp; Konten
                  </p>
                </div>
                <div className="divide-y divide-gray-100/60">
                  <ToggleRow
                    title="Tampilkan Identitas di Ulasan"
                    desc="Nama dan foto profil terlihat di ulasan produk"
                    on={privasiPrefs.showReviewIdentity}
                    onToggle={() =>
                      setPrivasiPrefs((p) => ({
                        ...p,
                        showReviewIdentity: !p.showReviewIdentity,
                      }))
                    }
                  />
                  <ToggleRow
                    title="Status Online"
                    desc="Tampilkan status online kamu ke penjual"
                    on={privasiPrefs.showOnlineStatus}
                    onToggle={() =>
                      setPrivasiPrefs((p) => ({
                        ...p,
                        showOnlineStatus: !p.showOnlineStatus,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                    Personalisasi
                  </p>
                </div>
                <div className="divide-y divide-gray-100/60">
                  <ToggleRow
                    title="Rekomendasi Personal"
                    desc="Gunakan data aktivitas untuk rekomendasi yang lebih relevan"
                    on={privasiPrefs.personalizedRecommendations}
                    onToggle={() =>
                      setPrivasiPrefs((p) => ({
                        ...p,
                        personalizedRecommendations: !p.personalizedRecommendations,
                      }))
                    }
                  />
                  <ToggleRow
                    title="Bagikan Data Penggunaan"
                    desc="Bantu kami meningkatkan layanan dengan data anonim"
                    on={privasiPrefs.shareUsageData}
                    onToggle={() =>
                      setPrivasiPrefs((p) => ({
                        ...p,
                        shareUsageData: !p.shareUsageData,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                    Temukan Saya
                  </p>
                </div>
                <div className="divide-y divide-gray-100/60">
                  <ToggleRow
                    title="Cari via Email"
                    desc="Orang lain bisa menemukan akunmu lewat email"
                    on={privasiPrefs.allowSearchByEmail}
                    onToggle={() =>
                      setPrivasiPrefs((p) => ({
                        ...p,
                        allowSearchByEmail: !p.allowSearchByEmail,
                      }))
                    }
                  />
                  <ToggleRow
                    title="Cari via Nomor HP"
                    desc="Orang lain bisa menemukan akunmu lewat nomor HP"
                    on={privasiPrefs.allowSearchByPhone}
                    onToggle={() =>
                      setPrivasiPrefs((p) => ({
                        ...p,
                        allowSearchByPhone: !p.allowSearchByPhone,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="bg-blue-50/60 rounded-lg px-4 py-3 flex gap-2.5">
                <AlertCircle size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-600/80 leading-relaxed">
                  Data privasi kamu dilindungi sesuai kebijakan privasi kami. Kamu bisa
                  mengubah preferensi kapan saja.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
