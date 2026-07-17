"use client";

import { useState, useEffect } from "react";
import { ListFilter } from "lucide-react";
import FavoriteProduct from "./components/FavoriteProduct";
import FavoriteStore from "./components/FavoriteStore";

function WishlistContent() {
  const [activeTab, setActiveTab] = useState<"produk" | "toko">("produk");
  const [filterOpen, setFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wishlist-tab");

    if (saved === "produk" || saved === "toko") {
      setActiveTab(saved);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("wishlist-tab", activeTab);
    }
  }, [activeTab, mounted]);

  const changeTab = (tab: "produk" | "toko") => {
    setActiveTab(tab);
    setFilterOpen(false);
  };
  if (!mounted) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] relative overflow-hidden">
      {/* ── HEADER BACKGROUND LAYER ── */}
      <div
        className="absolute inset-x-0 top-0 h-[120px] bg-emerald-700"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex flex-col items-center justify-center h-12 translate-y-[15px]">
          <h1 className="text-[17px] font-bold text-white">Favorit Saya</h1>

          <p className="mt-0.5 text-[12px] text-white/85">
            Produk dan toko yang kamu simpan
          </p>
        </div>
      </div>

      {/* ── CONTENT LAYER ── */}
      <div
        className="
          relative
          z-10
          flex-1
          mt-[85px]
          flex
          flex-col
          rounded-t-[24px]
          bg-[#F7F8FA]
          shadow-[0_-4px_18px_rgba(0,0,0,0.05)]
          overflow-hidden
        "
      >
        {/* TAB HEADER */}
        <div className="relative">
          <div className="relative grid grid-cols-[1fr_44px_1fr] h-12 border-b border-gray-100 bg-white z-30">
            {/* Produk */}
            <button
              onClick={() => changeTab("produk")}
              className={`flex items-center justify-center text-[13px] font-bold transition-colors ${
                activeTab === "produk" ? "text-emerald-700" : "text-gray-700"
              }`}
            >
              Produk Favorit
            </button>

            {/* Filter */}
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`
                flex items-center justify-center
                transition-colors
                ${filterOpen ? "text-emerald-600" : "text-gray-600 active:text-emerald-600"}
              `}
            >
              <ListFilter
                size={20}
                strokeWidth={2}
                className={`
                  transition-transform duration-200
                  ${filterOpen ? "scale-110" : "scale-100"}
                `}
              />
            </button>

            {/* Toko */}
            <button
              onClick={() => changeTab("toko")}
              className={`flex items-center justify-center text-[13px] font-bold transition-colors ${
                activeTab === "toko" ? "text-emerald-700" : "text-gray-700"
              }`}
            >
              Toko di Ikuti
            </button>

            {/* Indicator Produk */}
            <span
              className={`absolute bottom-2 left-0 flex justify-center w-[calc((100%-44px)/2)] transition-opacity duration-200 ${
                activeTab === "produk" ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="w-28 h-[3px] rounded-full bg-emerald-600" />
            </span>

            {/* Indicator Toko */}
            <span
              className={`absolute bottom-2 right-0 flex justify-center w-[calc((100%-44px)/2)] transition-opacity duration-200 ${
                activeTab === "toko" ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="w-28 h-[3px] rounded-full bg-emerald-600" />
            </span>
          </div>
        </div>

        {/* OVERLAY for filter */}
        {filterOpen && (
          <div
            className="absolute inset-x-0 top-12 bottom-0 z-30 bg-black/15"
            onClick={() => setFilterOpen(false)}
          />
        )}

        {/* CONTENT */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          {activeTab === "produk" ? (
            <FavoriteProduct filterOpen={filterOpen} />
          ) : (
            <FavoriteStore filterOpen={filterOpen} />
          )}
        </div>
      </div>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[120px] bg-emerald-700"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex flex-col items-center justify-center h-12 translate-y-[15px]">
          <h1 className="text-[17px] font-bold text-white">Favorit Saya</h1>
          <p className="mt-0.5 text-[12px] text-white/85">
            Produk dan toko yang kamu simpan
          </p>
        </div>
      </div>

      <div
        className="
          relative
          z-10
          flex-1
          mt-[85px]
          flex
          flex-col
          rounded-t-[24px]
          bg-[#F7F8FA]
          shadow-[0_-4px_18px_rgba(0,0,0,0.05)]
          overflow-hidden
        "
      >
        <div className="relative">
          <div className="relative grid grid-cols-[1fr_44px_1fr] h-12 border-b border-gray-100 bg-white z-30">
            <div className="flex items-center justify-center text-[13px] font-bold text-gray-300">
              Produk Favorit
            </div>
            <div className="flex items-center justify-center text-gray-300">
              <ListFilter size={20} strokeWidth={2} />
            </div>
            <div className="flex items-center justify-center text-[13px] font-bold text-gray-300">
              Toko di Ikuti
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden flex flex-col" />
      </div>
    </div>
  );
}
export default function WishlistPage() {
  return <WishlistContent />;
}
