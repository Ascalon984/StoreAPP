"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { mockOrders } from "@/lib/data";
import { Order } from "@/lib/types";
import { Search, CalendarDays } from "lucide-react";

import {
  FilterTab,
  FILTER_TABS,
  OrderCard,
  SkeletonCard,
  EmptyState,
  groupOrders,
} from "./components/OrderComponents";

import { isSameDay } from "./utils/calendar";
import { CalendarFilterSheet } from "./components/CalendarFilterSheet";

// ── Main Page ──
export default function OrdersPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
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
    const activeTab = tabRefs.current[activeFilter];

    activeTab?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeFilter]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [appliedDate, setAppliedDate] = useState<Date | null>(null);
  const hasActiveDateFilter = appliedDate !== null;

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Orders filtering (status tab + optional applied date) ──
  const filtered = orders.filter((o) => {
    if (activeFilter !== "all" && o.status !== activeFilter) return false;
    if (appliedDate && !isSameDay(new Date(o.createdAt), appliedDate))
      return false;
    return true;
  });

  const groups = groupOrders(filtered);

  return (
    <div className="min-h-screen bg-gray-50/80 pb-[88px]">
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div
          className="px-4 flex items-center justify-between"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            height: "50px",
          }}
        >
          <div className="min-w-0">
            <div className="inline-flex flex-col">
              <h1 className="text-[17px] font-bold tracking-[-0.01em] text-gray-700">
                Riwayat Pesanan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-shrink-0">
            <button
              onClick={() => setShowDateSheet(true)}
              className={`
                transition-all
                active:scale-95
                ${
                  hasActiveDateFilter
                    ? `
                      text-emerald-600
                    `
                    : `
                      text-gray-600
                      hover:text-gray-800
                    `
                }
              `}
            >
              <CalendarDays size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-3 pt-1">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="inline-flex min-w-max items-end px-1">
              {FILTER_TABS.map((tab, index) => {
                const isActive = tab.key === activeFilter;

                return (
                  <div key={tab.key} className="relative flex items-end">
                    {index !== 0 && !isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-px bg-gray-200" />
                    )}
                    <button
                      ref={(el) => {
                        tabRefs.current[tab.key] = el;
                      }}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`
                        relative
                        rounded-t-lg
                        px-3 py-1.5
                        text-[11.5px]
                        font-medium
                        whitespace-nowrap
                        transition-colors
                        ${isActive ? "bg-emerald-600 text-white" : "text-gray-500 hover:text-gray-700"}
                      `}
                    >
                      {tab.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="pt-[16px]">
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
            {groupOrders(orders).map((group) => (
              <div key={group.label} className="mb-4">
                <p className="pl-5 py-0.5 text-[10.5px] font-semibold text-gray-400 uppercase tracking-[0.08em]">
                  {group.label}
                </p>

                <div className="space-y-2 px-2">
                  {group.orders.map((order) => (
                    <div
                      key={order.orderId}
                      className="rounded-2xl border border-gray-100 bg-white shadow-sm"
                    >
                      <OrderCard order={order} activeFilter={activeFilter} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <CalendarFilterSheet
        show={showDateSheet}
        onClose={() => setShowDateSheet(false)}
        appliedDate={appliedDate}
        onApply={setAppliedDate}
      />
    </div>
  );
}
