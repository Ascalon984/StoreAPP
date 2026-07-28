import React from "react";

const quickActions = [
  { id: "alamat", label: "Alamat Saya", icon: "/icons/adress.png" },
  { id: "pembayaran", label: "Kelola Dompet", icon: "/icons/payment.png" },
  { id: "terakhir", label: "Terakhir Dilihat", icon: "/icons/last_seen.png" },
];

interface ProfileQuickActionsProps {
  onActionClick?: (id: string) => void;
}

export default function ProfileQuickActions({
  onActionClick,
}: ProfileQuickActionsProps) {
  return (
    <div className="mx-2 mt-3 bg-white rounded-lg shadow-sm flex translate-y-[10px]">
      {quickActions.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onActionClick && onActionClick(id)}
          className="flex-1 flex flex-col items-center justify-center gap-2 py-2 active:bg-gray-50 transition-colors"
        >
          <img
            src={icon}
            alt={label}
            className="w-[28px] h-auto object-contain"
          />
          <span
            className="text-[9.5px] font-semibold text-white tracking-[0.02em]"
            style={{
              WebkitTextStroke: "1.8px black",
              paintOrder: "stroke fill",
            }}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
