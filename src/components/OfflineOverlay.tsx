"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineOverlay() {
  const { isOnline } = useOnlineStatus();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [isOnline]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!showOverlay) return null;

  return (
    <div
      className="
        fixed inset-0 z-[999]
        bg-white
        flex flex-col items-center justify-center
        px-6
        overflow-hidden
      "
    >
      <img
        src="/illustrations/Disconnect.svg"
        alt="Tidak terhubung ke internet"
        className="
          w-64 h-64 object-contain
          -translate-x-1
        "
      />

      <div className="-mt-3 flex flex-col items-center text-center">
        <h1 className="text-[22px] font-extrabold text-gray-800 leading-tight">
          Koneksi terputus
        </h1>

        <p className="mt-2 text-[13px] leading-snug text-gray-400 font-medium max-w-[260px]">
          Periksa koneksi internetmu lalu coba lagi beberapa saat.
        </p>

        <button
          onClick={handleRefresh}
          className="
            mt-5 h-11 px-5
            inline-flex items-center justify-center gap-2
            rounded-xl
            bg-emerald-600
            text-white text-[13px] font-bold
            active:scale-[0.98]
            transition-transform
          "
        >
          <RotateCw size={15} strokeWidth={2.5} />
          Coba lagi
        </button>
      </div>
    </div>
  );
}
