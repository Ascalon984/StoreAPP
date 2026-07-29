"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Ticket, Gift } from "lucide-react";

interface Voucher {
  id: string;
  title: string;
  description: string;
  value: string;
  type: "tukar" | "gratis";
}

const vouchers: Voucher[] = [
  // Voucher Tukar
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `tukar-${i}`,
    title: [
      "Diskon Rp10.000",
      "Gratis Ongkir",
      "Cashback Rp15.000",
      "Diskon 20%",
      "Voucher Belanja",
      "Potongan Rp25.000",
    ][i % 6],
    description: [
      "Min. belanja Rp50.000",
      "Maks. Rp20.000",
      "Berlaku semua produk",
      "Min. belanja Rp100.000",
      "Khusus kategori tertentu",
      "Tidak berlaku kelipatan",
    ][i % 6],
    value: `${300 + (i % 6) * 100} poin`,
    type: "tukar" as const,
  })),

  // Voucher Gratis
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `gratis-${i}`,
    title: [
      "Voucher Member Baru",
      "Gratis Ongkir",
      "Voucher Event",
      "Cashback Gratis",
      "Diskon Spesial",
    ][i % 5],
    description: [
      "Tanpa minimum belanja",
      "Khusus periode tertentu",
      "Berlaku semua produk",
      "Selama persediaan ada",
      "Klaim sekali saja",
    ][i % 5],
    value: "Gratis",
    type: "gratis" as const,
  })),
];

export default function VoucherPage() {
  const [activeTab, setActiveTab] = useState<"tukar" | "gratis">("tukar");
  const [hasSeenGratis, setHasSeenGratis] = useState(false);

  const tabs = ["tukar", "gratis"] as const;
  const activeIndex = tabs.indexOf(activeTab);

  const gratisCount = vouchers.filter((v) => v.type === "gratis").length;

  // Refs to measure each panel's natural height
  const panelRefs = useRef<Record<"tukar" | "gratis", HTMLDivElement | null>>({
    tukar: null,
    gratis: null,
  });

  const [panelHeights, setPanelHeights] = useState<{
    tukar?: number;
    gratis?: number;
  }>({});

  const measureAll = () => {
    setPanelHeights({
      tukar: panelRefs.current.tukar?.scrollHeight,
      gratis: panelRefs.current.gratis?.scrollHeight,
    });
  };

  useLayoutEffect(() => {
    measureAll();
    window.addEventListener("resize", measureAll);
    return () => window.removeEventListener("resize", measureAll);
  }, []);

  const containerHeight = panelHeights[activeTab];

  const renderGrid = (tab: "tukar" | "gratis") => {
    const list = vouchers.filter((v) => v.type === tab);

    if (list.length === 0) {
      return (
        <div className="p-4 flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Ticket size={28} strokeWidth={1.5} className="text-gray-300" />
          </div>
          <p className="text-[12px] font-bold text-gray-700">
            Belum ada{" "}
            {tab === "tukar" ? "voucher untuk ditukar" : "voucher gratis"}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">Cek lagi nanti ya!</p>
        </div>
      );
    }

    return (
      <div className="px-3 pt-4 pb-4 grid grid-cols-2 gap-3">
        {list.map((voucher) => (
          <div
            key={voucher.id}
            className="relative isolate bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden min-h-[175px] flex flex-col"
            style={{
              WebkitMaskImage: `
                radial-gradient(circle 9px at left calc(100% - 73px), transparent 98%, black 100%),
                radial-gradient(circle 9px at right calc(100% - 73px), transparent 98%, black 100%)
              `,
              maskImage: `
                radial-gradient(circle 9px at left calc(100% - 73px), transparent 98%, black 100%),
                radial-gradient(circle 9px at right calc(100% - 73px), transparent 98%, black 100%)
              `,
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          >
            {/* Main */}
            <div className="flex-1 px-3 pt-5 pb-3 flex flex-col">
              {/* Content */}
              <div className="flex flex-col items-center text-center -translate-y-[5px]">
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center mb-2">
                  {tab === "tukar" ? (
                    <Ticket
                      size={34}
                      strokeWidth={1.5}
                      className="text-gray-500"
                    />
                  ) : (
                    <Gift
                      size={34}
                      strokeWidth={1.5}
                      className="text-gray-500"
                    />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-[13px] font-bold text-gray-800 leading-tight">
                  {voucher.title}
                </h3>

                {/* Description */}
                <p className="mt-1 text-[10px] text-gray-500 leading-tight">
                  {voucher.description}
                </p>
              </div>

              {/* Footer Info */}
              <div className="mt-auto pt-3 w-full flex items-center justify-between">
                <button
                  type="button"
                  className="text-[9px] font-medium text-gray-500 underline underline-offset-2 decoration-gray-400 hover:text-gray-700 active:text-gray-800 transition-colors translate-y-[2px]"
                >
                  S&K Berlaku
                </button>

                <span className="text-[11.5px] font-bold text-amber-600 translate-y-[2px]">
                  {voucher.value}
                </span>
              </div>
            </div>

            {/* Perforation */}
            <div
              className="absolute left-3 right-3 border-t border-dashed border-gray-300"
              style={{ bottom: "72px" }}
            />

            {/* Action */}
            <button className="w-full h-9 border-t border-gray-100 bg-emerald-600 text-white text-[11px] font-semibold active:bg-emerald-800 transition-colors">
              {tab === "tukar" ? "Tukar" : "Klaim"}
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-h-[400px]">
      {/* Tabs */}
      <div className="sticky top-[0px] z-20 flex bg-white border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,.04)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`flex-1 flex items-center justify-center gap-1 py-3 text-[11px] font-bold border-b-2 transition-colors ${
              activeTab === tab
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "gratis") {
                setHasSeenGratis(true);
              }
            }}
          >
            <span>{tab === "tukar" ? "Tukar Voucher" : "Voucher Gratis"}</span>

            {tab === "gratis" && gratisCount > 0 && !hasSeenGratis && (
              <span className="min-w-[18px] h-4 px-1.5 rounded-tl-[7px] rounded-br-[7px] bg-rose-500 text-white text-[9px] font-bold leading-none flex items-center justify-center">
                {gratisCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Swipeable Content */}
      <div className="overflow-hidden" style={{ height: containerHeight }}>
        <div
          className="flex w-[200%] transition-transform duration-300 ease-out items-start"
          style={{ transform: `translateX(-${activeIndex * 50}%)` }}
        >
          <div
            className="w-1/2 flex-shrink-0"
            ref={(el) => {
              panelRefs.current.tukar = el;
            }}
          >
            {renderGrid("tukar")}
          </div>
          <div
            className="w-1/2 flex-shrink-0"
            ref={(el) => {
              panelRefs.current.gratis = el;
            }}
          >
            {renderGrid("gratis")}
          </div>
        </div>
      </div>
    </div>
  );
}
