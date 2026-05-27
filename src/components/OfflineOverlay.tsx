"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// ── Disconnect Illustration (inline SVG — no network required) ──
function DisconnectIllustration() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="-translate-x-1"
    >
      {/* Lingkaran background */}
      <circle cx="110" cy="110" r="90" fill="#f0fdf4" />

      {/* Awan */}
      <ellipse cx="110" cy="95" rx="45" ry="28" fill="#d1fae5" />
      <ellipse cx="85" cy="103" rx="28" ry="22" fill="#d1fae5" />
      <ellipse cx="135" cy="103" rx="28" ry="22" fill="#d1fae5" />

      {/* WiFi diperbesar & lebih tegas */}
      <path
        d="M70 112 Q110 82 150 112"
        stroke="#34d399"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M82 128 Q110 104 138 128"
        stroke="#34d399"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      <circle cx="110" cy="144" r="6" fill="#34d399" />

      {/* Garis silang merah */}
      <line
        x1="75"
        y1="108"
        x2="145"
        y2="150"
        stroke="#f87171"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="145"
        y1="108"
        x2="75"
        y2="150"
        stroke="#f87171"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      <DisconnectIllustration />

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
