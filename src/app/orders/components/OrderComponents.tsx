"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Clock3,
  ClockFading,
  CheckCircle2,
  Package,
  CheckCircle,
  XCircle,
  MessageCircle,
  Truck,
  MoveRight,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import ProductImage from "@/components/ProductImage";
import { products, mockHighlightProducts } from "@/lib/data";
import { Order, OrderItem, OrderStatus } from "@/lib/types";

export type FilterTab =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export function getOrderGroupLabel(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const orderDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.floor(
    (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Hari Ini";
  if (diffDays > 0 && diffDays <= 7) return "7 Hari Terakhir";
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    ", " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    icon: any;
    iconClass: string;
    textClass: string;
  }
> = {
  pending: {
    label: "Menunggu",
    icon: Clock3,
    iconClass: "text-amber-500",
    textClass: "text-amber-600",
  },

  processing: {
    label: "Diproses",
    icon: ClockFading,
    iconClass: "text-violet-500",
    textClass: "text-violet-600",
  },

  shipped: {
    label: "Dikirim",
    icon: Truck,
    iconClass: "text-sky-500",
    textClass: "text-sky-600",
  },

  completed: {
    label: "Berhasil",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    textClass: "text-emerald-600",
  },

  cancelled: {
    label: "Gagal",
    icon: XCircle,
    iconClass: "text-rose-500",
    textClass: "text-rose-600",
  },
};

export const FILTER_TABS: {
  key: FilterTab;
  label: string;
}[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "processing", label: "Diproses" },
  { key: "shipped", label: "Dikirim" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
];

export function ProductCarousel({ items }: { items: OrderItem[] }) {
  const [active, setActive] = useState(0);
  const totalSlides = items.length + 1;
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffY) > Math.abs(diffX)) return;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) setActive((p) => Math.min(p + 1, totalSlides - 1));
      else setActive((p) => Math.max(p - 1, 0));
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="select-none"
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {/* ── Slide 0 — Overview ── */}
          <div className="w-full flex-shrink-0 flex items-center gap-3 px-4 py-1.5">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="flex items-center">
                {items.slice(0, 3).map((item, i) => (
                  <div
                    key={item.productId}
                    className="w-16 h-16 rounded-lg border border-white/80 ring-1 ring-black/[0.04] shadow-sm overflow-hidden bg-gray-50 flex-shrink-0"
                    style={{
                      marginLeft: i === 0 ? 0 : -22,
                      zIndex: 3 - i,
                    }}
                  >
                    <ProductImage
                      category={item.category}
                      name={item.name}
                      src={item.image ?? undefined}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {items.length > 3 && (
                  <div
                    className="w-15 h-15 rounded-lg border-2 border-white shadow-sm
          bg-gray-100 flex items-center justify-center
          flex-shrink-0 -ml-4"
                    style={{ zIndex: 0 }}
                  >
                    <span className="text-[10px] font-semibold text-gray-500">
                      +{items.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-[12px] font-medium text-gray-600 leading-[1.3] line-clamp-2 break-words">
                  {items.length === 1
                    ? items[0].name
                    : `${items[0].name.split(" ").slice(0, 4).join(" ")} & ${items.length - 1} lainnya`}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">
                  {items.length} produk
                </p>
              </div>

              {items.length > 1 && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  <MoveRight
                    size={13}
                    strokeWidth={2.2}
                    className="text-gray-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Slide 1..N — Detail per produk ── */}
          {items.map((item, idx) => (
            <div
              key={item.productId}
              className="w-full flex-shrink-0 flex items-center gap-3 px-4 py-2"
            >
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-16 h-16 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                  <ProductImage
                    category={item.category}
                    name={item.name}
                    src={item.image ?? undefined}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-600 leading-[1.3] line-clamp-2 break-words">
                  {item.name}
                </p>

                <p className="text-[10px] text-gray-400 font-medium mt-1">
                  {item.quantity}× · {formatRupiah(item.price)}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-[9px] text-gray-400 mt-0.5">
                  {idx + 1}/{items.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrderCard({
  order,
  activeFilter,
}: {
  order: Order;
  activeFilter: string;
}) {
  const router = useRouter();
  const {
    label,
    icon: StatusIcon,
    iconClass,
    textClass,
  } = STATUS_CONFIG[order.status];

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-500 tracking-tight">
          #{order.orderId}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeFilter === "all" && (
            <div className="flex items-center gap-1.5">
              <StatusIcon size={12.5} strokeWidth={2.3} className={iconClass} />

              <span
                className={`text-[10px] font-medium tracking-[-0.01em] ${textClass}`}
              >
                {label}
              </span>
            </div>
          )}
          <p className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Carousel */}
      <div className="bg-gray-50/[0.35]">
        <ProductCarousel items={order.items} />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 flex items-center justify-between gap-2.5">
        <div className="leading-tight">
          <p className="text-[9px] text-gray-500">Total</p>

          <p className="text-[13px] font-semibold text-gray-700 tracking-[-0.01em]">
            {formatRupiah(order.total)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {order.status === "completed" && (
            <>
              <button
                className="px-3 py-[5.45px] rounded-[6px]
                border border-gray-200
                bg-white
                text-[11px] font-medium text-gray-600
                hover:border-gray-300 hover:bg-gray-50
                active:scale-95
                transition-all"
              >
                Beri Ulasan
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-3 py-1.5 rounded-[6px]
                bg-emerald-600
                text-white text-[11px] font-medium
                hover:bg-emerald-700
                active:scale-95
                transition-all"
              >
                Beli Lagi
              </button>
            </>
          )}

          {order.status === "processing" && (
            <button
              onClick={() => {
                const imgs = order.items
                  .map((it, i) => {
                    const allProducts = [...products, ...mockHighlightProducts];
                    const p = allProducts.find((pp) => pp.id === it.productId);
                    return p
                      ? `/products/${p.id}.jpg`
                      : `/products/${products[i % products.length].id}.jpg`;
                  })
                  .slice(0, 3)
                  .join(",");

                router.push(
                  `/chat?source=order&orderId=${encodeURIComponent(order.orderId)}&orderStatus=${encodeURIComponent(order.status)}&total=${order.total}&images=${encodeURIComponent(imgs)}`,
                );
              }}
              className="
                px-3 py-1.5 rounded-[6px]
                bg-emerald-600
                text-white
                text-[11px] font-medium
                hover:bg-emerald-700
                active:scale-95
                transition-all
              "
            >
              Hubungi Penjual
            </button>
          )}

          {order.status === "shipped" && (
            <button
              className="
                px-3 py-1.5 rounded-[6px]
                bg-emerald-600
                text-white text-[11px] font-medium
                hover:bg-emerald-700
                active:scale-95
                transition-all
              "
            >
              Lacak Paket
            </button>
          )}

          {order.status === "pending" && (
            <>
              <button
                className="px-3 py-[5.45px] rounded-[6px]
                border border-gray-200
                bg-white
                text-[11px] font-medium text-gray-700
                hover:bg-gray-50
                active:scale-95
                transition-all"
              >
                Batalkan
              </button>
              <button
                className="px-4 py-1.5 rounded-[6px]
                bg-emerald-600
                text-white text-[11px] font-medium
                hover:bg-emerald-700
                active:scale-95
                transition-all"
              >
                Bayar
              </button>
            </>
          )}

          {order.status === "cancelled" && (
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 rounded-[6px]
              bg-emerald-600
              text-white text-[11px] font-medium
              hover:bg-emerald-600
              active:scale-95
              transition-all"
            >
              Beli Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 flex justify-between">
        <div className="h-3.5 w-28 bg-gray-100 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-14 bg-gray-100 rounded-full" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="border-t border-gray-100 mx-4" />
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-13.5 h-13.5 rounded-xl bg-gray-100 flex-shrink-0"
              style={{ marginLeft: i === 0 ? 0 : -10 }}
            />
          ))}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded w-2/5" />
        </div>
      </div>
      <div className="border-t border-gray-100 mx-4" />
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="space-y-1">
          <div className="h-2.5 w-16 bg-gray-100 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="h-7 w-20 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export function EmptyState({ filter }: { filter: FilterTab }) {
  const router = useRouter();
  const map: Record<FilterTab, { title: string }> = {
    all: {
      title: "Belum ada riwayat pesanan",
    },

    pending: {
      title: "Tidak ada pesanan yang menunggu pembayaran",
    },

    processing: {
      title: "Belum ada pesanan yang sedang diproses",
    },

    shipped: {
      title: "Belum ada pesanan dalam pengiriman",
    },

    completed: {
      title: "Belum ada pesanan yang selesai",
    },

    cancelled: {
      title: "Tidak ada pesanan yang dibatalkan",
    },
  };
  const { title } = map[filter];
  return (
    <div className="flex flex-col items-center py-16 px-6">
      <div
        className="
    w-36 h-36 rounded-full
    bg-gradient-to-b from-emerald-50 to-emerald-50/40
    ring-1 ring-emerald-100/50
    flex items-center justify-center
    mb-4
  "
      >
        <img
          src="/illustrations/missing transactions.png"
          alt="Kosong"
          className="
      w-34 h-34
      object-contain
      select-none
      pointer-events-none
    "
        />
      </div>
      <h3 className="text-[13px] font-semibold text-gray-600 text-center">
        {title}
      </h3>
      {filter === "all" && (
        <button
          onClick={() => router.push("/")}
          className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-700 text-white
            text-[13px] font-bold hover:bg-emerald-800 active:scale-95
            transition-all shadow-md shadow-emerald-700/20"
        >
          Mulai Belanja
        </button>
      )}
    </div>
  );
}

export type OrderGroup = {
  label: string;
  orders: Order[];
};

export function groupOrders(orders: Order[]): OrderGroup[] {
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const groups: OrderGroup[] = [];
  let lastLabel = "";
  for (const order of sorted) {
    const label = getOrderGroupLabel(order.createdAt);
    if (label !== lastLabel) {
      groups.push({ label, orders: [order] });
      lastLabel = label;
    } else {
      groups[groups.length - 1].orders.push(order);
    }
  }
  return groups;
}
