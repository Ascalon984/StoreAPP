"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Bell,
  TicketPercent,
  CheckCheck,
} from "lucide-react";

// ── Types ──
type NotifType = "activity" | "promo";
type NotifTab = "all" | "activity" | "promo";

type Notification = {
  id: string;
  type: NotifType;
  isRead: boolean;
  createdAt: string; // ISO string
  // Activity-specific
  activityTitle?: string;
  productName?: string;
  orderId?: string;
  // Promo-specific
  promoProduct?: string;
  promoDiscount?: number; // percent
  promoCopy?: string;
};

// ── Helper: relative time ──
function timeAgo(iso: string): string {
  const now = new Date();
  const past = new Date(iso);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} mnt yg lalu`;
  if (diffHour < 24) return `${diffHour} jam yg lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari yg lalu`;
  return past.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

// ── Mock Data ──
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "activity",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mnt lalu
    activityTitle: "Pesanan berhasil dibuat",
    productName: "Indomie Goreng Original × 5",
    orderId: "ORD-2026-010",
  },
  {
    id: "n2",
    type: "promo",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mnt lalu
    promoProduct: "Aqua 600ml",
    promoDiscount: 20,
    promoCopy: "Hidrasi hemat, stok terbatas — jangan sampai kehabisan!",
  },
  {
    id: "n3",
    type: "activity",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 jam lalu
    activityTitle: "Pesanan berhasil dibuat",
    productName: "Mie Sedaap Korean Spicy × 3",
    orderId: "ORD-2026-009",
  },
  {
    id: "n4",
    type: "promo",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 jam lalu
    promoProduct: "SilverQueen Almond 65g",
    promoDiscount: 15,
    promoCopy: "Coklat premium favoritmu kini lebih terjangkau!",
  },
  {
    id: "n5",
    type: "activity",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // kemarin
    activityTitle: "Pesanan berhasil dibuat",
    productName: "Good Day Cappuccino × 6",
    orderId: "ORD-2026-007",
  },
  {
    id: "n6",
    type: "promo",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), // 2 hari lalu
    promoProduct: "Chitato Beef Barbeque 68g",
    promoDiscount: 25,
    promoCopy: "Snack kesukaanmu diskon gede, yuk borong sekarang!",
  },
  {
    id: "n7",
    type: "activity",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 hari lalu
    activityTitle: "Pesanan berhasil dibuat",
    productName: "Coca Cola 390ml × 2",
    orderId: "ORD-2026-004",
  },
];

// ── Tab Config ──
const TABS: { key: NotifTab; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "activity", label: "Aktivitas" },
  { key: "promo", label: "Promo" },
];

// ── Notification Row ──
function NotifRow({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) {
  const isActivity = notif.type === "activity";

  return (
    <button
      onClick={() => onRead(notif.id)}
      className="
    w-full flex items-start gap-3 px-4 py-[10px]
    text-left transition-colors duration-150
    active:bg-gray-100
    bg-white
  "
    >
      {/* Icon circle */}
      <div
        className={`
          relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5
          ${isActivity
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-600"
          }
        `}
      >
        {isActivity ? (
          <Bell size={18} strokeWidth={0} fill="currentColor" />
        ) : (
          <TicketPercent size={18} strokeWidth={2} />
        )}

        {/* Unread dot */}
        {!notif.isRead && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[13px] leading-snug ${notif.isRead
              ? "font-medium text-gray-600"
              : "font-bold text-gray-800"
              }`}
          >
            {isActivity ? notif.activityTitle : "Promo Spesial!"}
          </p>
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap flex-shrink-0 mt-0.5">
            {timeAgo(notif.createdAt)}
          </span>
        </div>

        {isActivity ? (
          <div className="flex items-center justify-between gap-3 mt-0.5">
            <p className="text-[12px] text-gray-500 font-medium truncate">
              {notif.productName}
            </p>

            <span className="text-[11px] text-gray-400 font-semibold flex-shrink-0">
              {notif.orderId}
            </span>
          </div>
        ) : (
          <p className="text-[12px] text-gray-400 font-medium mt-0.5 leading-relaxed">
            <span className="font-bold text-amber-600">
              {notif.promoProduct}
            </span>{" "}
            turun{" "}
            <span className="font-black text-amber-600">
              {notif.promoDiscount}%
            </span>
            {" — "}
            {notif.promoCopy}
          </p>
        )}
      </div>
    </button>
  );
}

// ── Divider ──
function RowDivider() {
  return (
    <div className="ml-[68px] mr-4 h-px bg-black/[0.05]" />
  );
}

// ── Empty State ──
function EmptyState({ tab }: { tab: NotifTab }) {
  const map: Record<NotifTab, { emoji: string; title: string; sub: string }> = {
    all: {
      emoji: "🔔",
      title: "Belum ada notifikasi",
      sub: "Aktivitas dan promo akan muncul di sini.",
    },
    activity: {
      emoji: "📦",
      title: "Belum ada aktivitas",
      sub: "Update pesanan kamu akan tampil di sini.",
    },
    promo: {
      emoji: "🎫",
      title: "Belum ada promo",
      sub: "Penawaran spesial akan muncul di sini.",
    },
  };
  const { emoji, title, sub } = map[tab];
  return (
    <div className="flex flex-col items-center py-16 px-6">
      <span className="text-4xl mb-4">{emoji}</span>
      <h3 className="text-[15px] font-bold text-gray-800 text-center">{title}</h3>
      <p className="text-[12px] text-gray-400 font-medium text-center mt-1.5 leading-relaxed">
        {sub}
      </p>
    </div>
  );
}

// ── Main Page ──
export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NotifTab>("all");
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Sort: unread di atas, read di bawah; dalam grup, terbaru di atas
  const sorted = [...notifications].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filter berdasarkan tab
  const filtered = sorted.filter((n) => {
    if (activeTab === "all") return true;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  return (
    <div className="min-h-screen bg-white pb-5">
      {/* Sticky Header + Tabs */}
      <div className="sticky top-0 z-50">
        <div className="bg-[#048750] rounded-b-[14px] shadow-xs">
          {/* Title bar */}
          <div className="flex items-end justify-between px-3 h-11 pb-1">

            <div className="flex items-center gap-1">
              <button
                onClick={() => router.back()}
                className="
        w-9 h-9 flex items-center justify-center
        text-white/90
        active:scale-90
        transition-transform
      "
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>

              <span className="text-[15px] font-black text-white">
                Notifikasi
              </span>
            </div>

            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className={`
      w-9 h-9 flex items-center justify-center
      transition-all active:scale-90
      ${unreadCount > 0
                  ? "text-white/90"
                  : "text-white/30 pointer-events-none"
                }
    `}
            >
              <CheckCheck size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-4 pb-[3px]">
            <div
              className="
                relative bg-white rounded-lg p-[2px] flex
                translate-y-[9px]
                ring-1 ring-slate-900/[0.04] shadow-layer-sm
              "
            >
              {/* Sliding active background */}
              <div
                className="
                  absolute top-[2px] bottom-[2px]
                  rounded-[6px]
                  bg-[#D89B2B]
                  shadow-[0_1px_4px_rgba(216,155,43,0.35)]
                  transition-all duration-300
                "
                style={{
                  left: "2px",
                  width: `calc((100% - 4px) / ${TABS.length})`,
                  transform: `translateX(${TABS.findIndex((t) => t.key === activeTab) * 100
                    }%)`,
                }}
              />

              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      relative z-10 flex-1 h-7 rounded-[6px]
                      text-[12px] font-bold
                      transition-colors duration-300
                      active:scale-[0.97]
                      border-none outline-none
                      ${isActive ? "text-white" : "text-gray-400"}
                    `}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* List area */}
      <div className="pt-[18px]">
        {/* Unread count label — hanya tampil jika ada yang belum dibaca */}
        {unreadCount > 0 && activeTab !== "promo" && (
          <div className="px-4 pb-2 pt-1">
            <span className="text-[11px] font-medium text-gray-400">
              3 pesan belum dibaca
            </span>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div>
            {filtered.map((notif, idx) => (
              <div key={notif.id}>
                <NotifRow notif={notif} onRead={handleRead} />
                {idx < filtered.length - 1 && <RowDivider />}
              </div>
            ))}
            {/* Bottom divider */}
            <RowDivider />
          </div>
        )}
      </div>
    </div>
  );
}
