"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import ProductImage from "@/components/ProductImage";
import { products, mockHighlightProducts } from "@/lib/data";
import { Order, OrderItem, OrderStatus } from "@/lib/types";
import { MOCK_SELLERS } from "@/lib/mockSellers";
import { SingleProductItem } from "./SingleProductItem";
import { MultiProductCarousel } from "./MultiProductCarousel";

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
    textClass: string;
  }
> = {
  pending: {
    label: "Belum Bayar",
    textClass: "text-amber-600",
  },
  processing: {
    label: "Diproses",
    textClass: "text-gray-600",
  },
  shipped: {
    label: "Dikirim",
    textClass: "text-gray-600",
  },
  completed: {
    label: "Selesai",
    textClass: "text-gray-600",
  },
  cancelled: {
    label: "Dibatalkan",
    textClass: "text-gray-600",
  },
};

export const FILTER_TABS: {
  key: FilterTab;
  label: string;
}[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Belum Bayar" },
  { key: "processing", label: "Diproses" },
  { key: "shipped", label: "Dikirim" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
];



export function OrderCard({
  order,
  activeFilter,
}: {
  order: Order;
  activeFilter: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const activeItem =
    order.items.length === 1
      ? order.items[0]
      : active > 0
        ? order.items[active - 1]
        : undefined;
  const { label, textClass } = STATUS_CONFIG[order.status];

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-500 tracking-tight">
          #{order.orderId}
        </p>
        <div className="flex items-center gap-1">
          {activeFilter === "all" && (
            <>
              <span className={`text-[10px] font-medium ${textClass}`}>
                {label}
              </span>

              <span className="w-px h-2.5 bg-gray-300 mx-0.5" />
            </>
          )}

          <p className="text-[10px] text-gray-500 whitespace-nowrap">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Carousel */}
      <div className={order.items.length > 1 ? "bg-gray-50/[0.35]" : ""}>
        {order.items.length === 1 ? (
          <SingleProductItem item={order.items[0]} />
        ) : (
          <MultiProductCarousel
            items={order.items}
            active={active}
            setActive={setActive}
          />
        )}
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

          {order.status === "processing" &&
            (order.items.length === 1 || active > 0) && (
              <button
                onClick={() => {
                  if (!activeItem) return;

                  const allProducts = [...products, ...mockHighlightProducts];

                  const p = allProducts.find(
                    (pp) => pp.id === activeItem.productId,
                  );

                  const sellerId = p?.sellerId || "s1";

                  const image = p
                    ? `/products/${p.id}.jpg`
                    : `/products/${products[0].id}.jpg`;

                  router.push(
                    `/chat?source=order&orderId=${encodeURIComponent(
                      order.orderId,
                    )}&orderStatus=${encodeURIComponent(
                      order.status,
                    )}&total=${order.total}&images=${encodeURIComponent(
                      image,
                    )}&sellerId=${encodeURIComponent(sellerId)}`,
                  );
                }}
                className="px-3 py-1.5 rounded-[6px]
        bg-emerald-600
        text-white text-[11px] font-medium
        hover:bg-emerald-700
        active:scale-95
        transition-all"
              >
                Hubungi Penjual
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
