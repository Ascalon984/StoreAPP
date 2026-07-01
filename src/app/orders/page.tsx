"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { mockOrders } from "@/lib/data";
import { Order } from "@/lib/types";

import {
  FilterTab,
  FILTER_TABS,
  OrderCard,
  SkeletonCard,
  EmptyState,
  groupOrders,
} from "./components/OrderComponents";

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
    if (activeFilter === "active")
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
          className="bg-emerald-700 rounded-b-[17px] pb-4"
          style={{
            boxShadow: isScrolled
              ? "0 10px 24px rgba(0,0,0,0.18)"
              : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "box-shadow 250ms ease-in-out",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          {/* Title */}
          <div className="flex items-center justify-center px-4 h-8 pt-0.5">
            <span className="text-[14px] font-bold text-white leading-none">
              Riwayat Transaksi
            </span>
          </div>

          {/* Tabs */}
          <div className="px-2 mt-1 relative z-20 -mb-2.5 pt-2">
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-[2px] flex">
              {/* Active indicator */}
              <div
                className="
    absolute top-[2px] bottom-[2px]
    rounded-[14px]
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
                    relative z-10 flex-1 h-9
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
