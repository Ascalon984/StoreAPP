"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Clock3,
  ClockFading,
  CheckCircle2,
  XCircleIcon,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import ProductImage from "@/components/ProductImage";
import { products, mockOrders } from "@/lib/data";
import { Order, OrderItem, OrderStatus } from "@/lib/types";

type FilterTab = "all" | "processing" | "completed" | "cancelled";



function getOrderGroupLabel(dateStr: string): string {
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

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    ", " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

// ── Status config — FIXED: badge style, bukan plain text ──
const STATUS_CONFIG: Record<
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
    textClass: "text-gray-500",
  },

  processing: {
    label: "Diproses",
    icon: ClockFading,
    iconClass: "text-yellow-500",
    textClass: "text-gray-500",
  },

  completed: {
    label: "Selesai",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    textClass: "text-gray-500",
  },

  cancelled: {
    label: "Dibatalkan",
    icon: XCircle,
    iconClass: "text-rose-500",
    textClass: "text-gray-500",
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "processing", label: "Diproses" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
];

// ── Carousel Product Preview ──
function ProductCarousel({ items }: { items: OrderItem[] }) {
  const [active, setActive] = useState(0);
  const totalSlides = items.length + 1;
  const touchStartX = useRef(0);
  const touchStartY = useRef(0); // ← tambah ini

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY; // ← catat Y juga
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY; // ← hitung Y

    // Abaikan jika gerakan vertikal lebih dominan (scroll halaman)
    if (Math.abs(diffY) > Math.abs(diffX)) return; // ← filter ini

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
          <div className="w-full flex-shrink-0 flex items-center gap-3 px-4 py-4">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="flex items-center">
                {items.slice(0, 3).map((item, i) => (
                  <div
                    key={item.productId}
                    className="w-13.5 h-13.5 rounded-xl border-2 border-white shadow-sm
                    overflow-hidden bg-gray-50 flex-shrink-0"
                    style={{
                      marginLeft: i === 0 ? 0 : -16,
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
                    className="w-13.5 h-13.5 rounded-xl border-2 border-white shadow-sm
                    bg-gray-100 flex items-center justify-center
                    flex-shrink-0 -ml-3.5"
                    style={{ zIndex: 0 }}
                  >
                    <span className="text-[10px] font-semibold text-gray-500">
                      +{items.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-800 leading-[1.3] line-clamp-2 break-words">
                {items.length === 1
                  ? items[0].name
                  : `${items[0].name.split(" ").slice(0, 4).join(" ")} & ${items.length - 1} lainnya`}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-1">
                {items.length} produk
              </p>
            </div>
          </div>

          {/* ── Slide 1..N — Detail per produk ── */}
          {items.map((item, idx) => (
            <div
              key={item.productId}
              className="w-full flex-shrink-0 flex items-center gap-3 px-4 py-4"
            >
              <div className="flex flex-col items-center flex-shrink-0">
                {/* FIXED: rounded-xl konsisten dengan stack */}
                <div className="w-13.5 h-13.5 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                  <ProductImage
                    category={item.category}
                    name={item.name}
                    src={item.image ?? undefined}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-800 leading-[1.3] line-clamp-2 break-words">
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">
                  {item.quantity}× · {formatRupiah(item.price)}
                </p>
              </div>

              {/* FIXED: harga item gray-700, bukan gray-900 */}
              <div className="text-right flex-shrink-0">
                <p className="text-[12px] font-bold text-gray-700">
                  {formatRupiah(item.price * item.quantity)}
                </p>
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

// ── Order Card ──
function OrderCard({
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
    <div className="bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-500 tracking-tight">
          #{order.orderId}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeFilter === "all" && (
            <div className="flex items-center gap-1">
              <StatusIcon size={13} strokeWidth={2.4} className={iconClass} />

              <span className={`text-[10px] font-semibold ${textClass}`}>
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

      {/* Footer — FIXED: py lebih longgar */}
      <div className="px-4 py-2 flex items-center justify-between gap-2.5">
        <div>
          {/* FIXED: gray-900 font-black — paling gelap di card */}
          <p className="text-[13px] font-bold text-gray-800 tracking-[-0.01em] leading-none">
            {formatRupiah(order.total)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {order.status === "completed" && (
            <>
              <button
                className="px-3 py-1.5 rounded-lg
                border border-gray-200
                bg-white
                text-[11px] font-semibold text-gray-600
                hover:border-gray-300 hover:bg-gray-50
                active:scale-95
                transition-all"
              >
                Ulasan
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-3 py-1.5 rounded-lg
                bg-emerald-600
                text-white text-[11px] font-semibold
                hover:bg-emerald-600
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
                    const p = products.find((pp) => pp.id === it.productId);
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
px-3 py-1 rounded-lg
border border-gray-200
bg-white
text-[11px] font-semibold text-gray-700
hover:bg-gray-50
active:scale-95
transition-all
"
            >
              Hubungi Penjual
            </button>
          )}

          {order.status === "pending" && (
            <>
              <button
                className="text-[11px] font-semibold text-gray-400
                hover:text-gray-600
                transition-colors
                active:scale-95"
              >
                Batalkan
              </button>
              <button
                onClick={() => {
                  const imgs = order.items
                    .map((it, i) => {
                      const p = products.find((pp) => pp.id === it.productId);
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
px-3 py-1 rounded-lg
border border-gray-200
bg-white
text-[11px] font-semibold text-gray-700
hover:bg-gray-50
active:scale-95
transition-all
"
              >
                Hubungi Penjual
              </button>
            </>
          )}

          {order.status === "cancelled" && (
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 rounded-lg
              bg-emerald-600
              text-white text-[11px] font-semibold
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

// ── Skeleton ──
function SkeletonCard() {
  return (
    <div className="bg-white overflow-hidden">
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

// ── Empty State ──
function EmptyState({ filter }: { filter: FilterTab }) {
  const router = useRouter();
  const map: Record<FilterTab, { Icon: any; title: string; sub: string }> = {
    all: {
      Icon: Package,
      title: "Belum ada pesanan",
      sub: "Yuk mulai belanja produk favoritmu!",
    },
    processing: {
      Icon: RefreshCw,
      title: "Tidak ada pesanan diproses",
      sub: "Pesanan aktif akan tampil di sini.",
    },
    completed: {
      Icon: CheckCircle,
      title: "Belum ada pesanan selesai",
      sub: "Pesanan selesai akan tampil di sini.",
    },
    cancelled: {
      Icon: XCircle,
      title: "Tidak ada pesanan dibatalkan",
      sub: "Pesanan dibatalkan akan tampil di sini.",
    },
  };
  const { Icon, title, sub } = map[filter];
  return (
    <div className="flex flex-col items-center py-16 px-6">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-[15px] font-bold text-gray-800 text-center">
        {title}
      </h3>
      <p className="text-[12px] text-gray-400 font-medium text-center mt-1.5 leading-relaxed">
        {sub}
      </p>
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

// ── Grouped order structure ──
type OrderGroup = {
  label: string;
  orders: Order[];
};

function groupOrders(orders: Order[]): OrderGroup[] {
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

// ── Main Page ──
export default function OrdersPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setOrders(mockOrders);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const currentTab = tabRefs.current[activeFilter];
    if (currentTab) {
      setIndicatorStyle({
        width: currentTab.offsetWidth,
        left: currentTab.offsetLeft,
      });
    }
  }, [activeFilter]);

  const filtered = orders.filter((o) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "processing")
      return o.status === "pending" || o.status === "processing";
    return o.status === activeFilter;
  });

  const groups = groupOrders(filtered);

  const HEADER_H = 48;
  const FILTER_H = 40;

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/80 pb-[88px]">
      <div className="sticky top-0 z-50">
        <div
          className="bg-emerald-700 rounded-b-[22px] pb-2"
          style={{
            boxShadow: isScrolled
              ? "0 10px 24px rgba(0,0,0,0.18)"
              : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "box-shadow 250ms ease-in-out",
          }}
        >
          {/* Title */}
          <div className="flex items-center justify-center px-4 h-10">
            <span className="text-[15px] font-extrabold text-white leading-none">
              Riwayat Pesanan
            </span>
          </div>

          {/* Tabs */}
          <div className="px-4 mt-2">
            <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-[2px] flex ring-1 ring-white/10">
              {/* Active indicator */}
              <div
                className="
                absolute top-[2px] bottom-[2px]
                rounded-[10px]
                bg-white
                shadow-[0_2px_8px_rgba(0,0,0,0.12)]
                transition-[transform] duration-300
                ease-[cubic-bezier(0.25,1,0.5,1)]
              "
                style={{
                  transform: `translateX(${
                    FILTER_TABS.findIndex((t) => t.key === activeFilter) * 100
                  }%)`,
                  width: `calc(100% / ${FILTER_TABS.length})`,
                }}
              />

              {FILTER_TABS.map((tab) => {
                const active = activeFilter === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`
                    relative z-10 flex-1 h-8
                    text-[12px] font-semibold
                    transition-[color] duration-200
                    ${active ? "text-emerald-800" : "text-white/70"}
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

      {/* List */}
      <div className="pt-[22px]">
        {isLoading ? (
          <div className="px-2 space-y-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : groups.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.label}>
                {/* Label grup — sekali di atas */}
                <div className="px-3 pb-1.5">
                  <h2 className="text-[11px] font-semibold text-gray-400 tracking-wide uppercase">
                    {group.label}
                  </h2>
                </div>

                {/* Card digabung dalam satu container */}
                <div className="mx-2 bg-white rounded-xl overflow-hidden shadow-sm">
                  {group.orders.map((order, idx) => (
                    <div key={order.id}>
                      <OrderCard order={order} activeFilter={activeFilter} />
                      {/* Divider antar card, kecuali card terakhir */}
                      {idx < group.orders.length - 1 && (
                        <div className="border-t border-gray-200/90 mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
