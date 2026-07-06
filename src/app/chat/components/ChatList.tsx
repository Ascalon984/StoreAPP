"use client";

import { useRef, useState, useEffect } from "react";
import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Store,
  Headset,
} from "lucide-react";
import { Seller } from "@/lib/types";
import { MOCK_SELLERS } from "@/lib/mockSellers";

const CHAT_CHIPS = ["Semua", "Pesanan", "Belum dibaca"];

interface ChatListProps {
  onSelectSeller: (seller: { id: string; name: string }) => void;
  onBack: () => void;
}

export default function ChatList({ onSelectSeller, onBack }: ChatListProps) {
  const [activeChip, setActiveChip] = useState("Semua");
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handleScroll = () => setIsScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  const displaySellers = MOCK_SELLERS.filter((s) => {
    if (activeChip === "Belum dibaca" && s.unread === 0) return false;
    if (
      searchQuery &&
      !s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        ref={listRef}
        className="sticky top-0 z-50 bg-[#048750] transition-shadow duration-300"
        style={{
          boxShadow: isScrolled
            ? "0 2px 10px rgba(0,0,0,0.06)"
            : "0 1px 0 rgba(0,0,0,0.06)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Back row */}
        <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5">
          <button
            onClick={onBack}
            className="-ml-1.5 flex items-center justify-center w-8 h-8 text-white/90 active:scale-90 transition-all duration-150 flex-shrink-0"
            aria-label="Kembali"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>

          <div className="flex-1 min-w-0 -ml-2">
            <h1 className="text-[15px] font-semibold text-white tracking-tight capitalize truncate">
              Percakapan
            </h1>
          </div>

          <button
            onClick={() =>
              onSelectSeller({ id: "cs", name: "Customer Service" })
            }
            className="flex items-center justify-center w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-150 flex-shrink-0"
            aria-label="Customer Service"
          >
            <Headset size={19} strokeWidth={2} />
          </button>
        </div>

        {/* Search + Filter */}
        <div className="px-4 mt-1 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative group">
              <Search
                size={16}
                strokeWidth={2.2}
                className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 pointer-events-none transition-all duration-300 group-focus-within:opacity-0 group-focus-within:scale-75 group-focus-within:-translate-x-2 ${
                  searchQuery
                    ? "opacity-0 scale-75 -translate-x-2"
                    : "opacity-100 scale-100"
                }`}
              />
              <input
                type="text"
                placeholder="Cari nama toko atau pesan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:placeholder-transparent text-[12px] font-medium outline-none transition-all duration-300 focus:bg-white focus:border-gray-300 ${
                  searchQuery ? "pl-3" : "pl-9 group-focus-within:pl-3"
                }`}
              />
            </div>

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`h-9 w-9 rounded-lg flex items-center justify-center border transition-colors duration-200 ${
                  filterOpen || activeChip !== "Semua"
                    ? "bg-gray-100 border-gray-300 text-gray-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                <SlidersHorizontal size={16} strokeWidth={2.2} />
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-lg border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden z-50">
                  {CHAT_CHIPS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setActiveChip(option);
                        setFilterOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                        option === activeChip
                          ? "text-emerald-700 bg-emerald-50"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seller List */}
      <div className="py-2 pb-20">
        <div className="overflow-hidden bg-white">
          {displaySellers.map((seller, index) => (
            <div key={seller.id}>
              <div
                onClick={() =>
                  onSelectSeller({ id: seller.id, name: seller.name })
                }
                className="relative flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors active:bg-gray-50"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div
                    className={`
                w-10 h-10 rounded-full bg-gray-100 border
                flex items-center justify-center overflow-hidden
                transition-all duration-300
                ${
                  seller.isOnline
                    ? "border-emerald-500/70 ring-1 ring-emerald-500/20"
                    : "border-gray-200"
                }
              `}
                  >
                    {seller.avatar ? (
                      <span className="text-emerald-700 font-semibold text-[12px]">
                        {seller.avatar}
                      </span>
                    ) : (
                      <Store
                        size={19}
                        strokeWidth={1.8}
                        className="text-gray-500"
                      />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="relative flex-1 min-w-0 pr-9">
                  <span className="absolute top-0 right-0 text-[10px] font-medium text-gray-500">
                    {seller.time}
                  </span>
                  <h3 className="truncate pr-10 text-[13px] font-semibold leading-4.5 text-gray-600">
                    {seller.name}
                  </h3>
                  <p className="mt-0.5 truncate pr-1 text-[11px] font-normal leading-4 text-gray-500">
                    {seller.lastMessage}
                  </p>
                  {seller.unread > 0 && (
                    <div className="absolute right-0 bottom-0.5">
                      <div className="flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-rose-600 px-1 text-[8.5px] leading-none font-medium text-white">
                        {seller.unread}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              {index !== displaySellers.length - 1 ? (
                <div className="ml-[62px] h-px bg-gray-200/80" />
              ) : (
                <div className="h-px bg-gray-200/80" />
              )}
            </div>
          ))}

          {displaySellers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Tidak ada chat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
