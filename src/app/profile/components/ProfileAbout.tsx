"use client";

import React, { useState } from "react";
import { Info, ArrowLeft } from "lucide-react";
import { NavRowButton } from "./ProfileNavRow";
import { useNavigationStore } from "@/store/useNavigationStore";

export default function ProfileAbout() {
  const [isOpen, setIsOpen] = useState(false);
  const setProfileSubPageOpen = useNavigationStore((s) => s.setProfileSubPageOpen);

  const openPanel = () => { setIsOpen(true); setProfileSubPageOpen(true); };
  const closePanel = () => { setIsOpen(false); setProfileSubPageOpen(false); };

  return (
    <>
      <NavRowButton
        key="tentang-aplikasi"
        icon={Info}
        title="Tentang Aplikasi"
        page="tentang-aplikasi"
        iconSize={17}
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
            <h2 className="text-[13px] font-bold text-gray-800">Tentang Aplikasi</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Konten Tentang Aplikasi (sementara kosong untuk diisi manual) */}
          </div>
        </div>
      )}
    </>
  );
}
