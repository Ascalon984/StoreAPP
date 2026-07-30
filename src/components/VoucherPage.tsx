"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Ticket, Gift, ChevronRight } from "lucide-react";

interface Voucher {
  id: string;
  title: string;
  description: string;
  value: string;
  type: "tukar" | "gratis";
  claimed?: boolean;
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

interface VoucherPageProps {
  onVoucherClaimed: (
    pointsCost: number,
    voucher: { title: string; type: "tukar" | "gratis" },
  ) => void;
}

export default function VoucherPage({ onVoucherClaimed }: VoucherPageProps) {
  const [activeTab, setActiveTab] = useState<"tukar" | "gratis">("tukar");
  const [hasSeenGratis, setHasSeenGratis] = useState(false);
  const [voucherList, setVoucherList] = useState(vouchers);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [selectedTukar, setSelectedTukar] = useState<Voucher | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const tabs = ["tukar", "gratis"] as const;
  const activeIndex = tabs.indexOf(activeTab);

  const gratisCount = voucherList.filter((v) => v.type === "gratis").length;

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

  const handleAction = (voucher: Voucher) => {
    if (voucher.type === "tukar") {
      setSelectedTukar(voucher);
      return;
    }

    setProcessingId(voucher.id);
    setTimeout(() => {
      setVoucherList((prev) =>
        prev.map((v) => (v.id === voucher.id ? { ...v, claimed: true } : v)),
      );
      if (onVoucherClaimed) {
        onVoucherClaimed(0, { title: voucher.title, type: voucher.type }); // ← tambahkan data voucher
      }
      setProcessingId(null);

      const scrollContainer = document.getElementById("bonus-modal-scroll");
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 1000);
  };

  const handleConfirmRedeem = () => {
    if (!selectedTukar) return;
    setIsRedeeming(true);

    setTimeout(() => {
      const pointCost =
        parseInt(selectedTukar.value.replace(/\D/g, ""), 10) || 0;

      if (onVoucherClaimed) {
        onVoucherClaimed(pointCost, {
          title: selectedTukar.title,
          type: selectedTukar.type,
        }); // ← tambahkan data voucher
      }

      setIsRedeeming(false);
      setSelectedTukar(null);

      const scrollContainer = document.getElementById("bonus-modal-scroll");
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 1500);
  };

  const renderGrid = (tab: "tukar" | "gratis") => {
    const list = voucherList.filter((v) => v.type === tab);

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
                <div className="w-12 h-12 flex items-center justify-center mb-2 translate-y-[3px]">
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
                <h3 className="min-h-[32px] text-[13px] font-bold text-gray-800 leading-4 line-clamp-2 flex items-center justify-center">
                  {voucher.title}
                </h3>

                {/* Description */}
                <p className="mt-1 text-[10px] leading-3 text-gray-500 line-clamp-1 -translate-y-[3px]">
                  {voucher.description}
                </p>
              </div>

              {/* Footer Info */}
              <div className="mt-auto pt-3 w-full flex items-center justify-between">
                <button
                  type="button"
                  className="text-[9px] font-medium text-gray-500 underline underline-offset-2 decoration-gray-400 hover:text-gray-700 active:text-gray-800 transition-colors translate-y-[4px]"
                >
                  S&K Berlaku
                </button>

                <span className="text-[11.5px] font-bold text-amber-600 translate-y-[5px]">
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
            <button
              disabled={processingId === voucher.id || voucher.claimed}
              onClick={() => handleAction(voucher)}
              className={`w-full h-[38px] border-t text-[12px] font-semibold transition-colors ${
                processingId === voucher.id
                  ? "bg-emerald-700 border-gray-100 text-white cursor-wait"
                  : voucher.type === "gratis" && voucher.claimed
                    ? "bg-gray-300 border-gray-300 text-gray-600 cursor-default"
                    : "bg-emerald-600 border-gray-100 text-white active:bg-emerald-800"
              }`}
            >
              {processingId === voucher.id
                ? "Memproses..."
                : voucher.type === "gratis"
                  ? voucher.claimed
                    ? "Sudah Diklaim"
                    : "Klaim"
                  : "Tukar"}
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

      {/* Modal Tukar Voucher */}
      {selectedTukar &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !isRedeeming && setSelectedTukar(null)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-[320px] w-full p-6 text-center border border-gray-50 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center">
                <p className="text-[11px] font-bold tracking-wide uppercase text-gray-600 mb-3 -translate-y-[10px]">
                  Konfirmasi Penukaran
                </p>
                <div className="w-16 h-16 flex items-center justify-center mb-4 bg-emerald-50 rounded-full">
                  <Ticket size={32} className="text-emerald-600" />
                </div>

                <h3 className="text-[18px] font-extrabold text-emerald-600 leading-tight mb-2">
                  {selectedTukar.title}
                </h3>
                <p className="text-[12px] text-gray-500 mb-5 px-2">
                  {selectedTukar.description}
                </p>

                <div className="bg-gray-50 shadow-inner w-full rounded-lg p-3.5 mb-5">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[11px] text-gray-500">
                      Biaya Poin
                    </span>
                    <span className="text-[12px] font-bold text-amber-600">
                      {selectedTukar.value}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-[11px] text-gray-500">
                      Masa Berlaku
                    </span>
                    <span className="text-[12px] font-semibold text-gray-700">
                      7 hari setelah ditukar
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-2 pt-2 w-full flex items-center justify-between border-t border-gray-200 text-[11px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <span>Syarat & Ketentuan</span>
                    <ChevronRight size={14} strokeWidth={2} />
                  </button>
                </div>

                <p className="mb-4 text-[10px] leading-4 text-center text-gray-500">
                  Poin akan langsung dipotong setelah penukaran berhasil dan
                  voucher siap digunakan.
                </p>
                <div className="flex gap-2 w-full translate-y-[10px]">
                  <button
                    onClick={() => setSelectedTukar(null)}
                    disabled={isRedeeming}
                    className="flex-1 h-11 rounded-lg border border-gray-300 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleConfirmRedeem}
                    disabled={isRedeeming}
                    className="flex-[1.4] h-11 rounded-lg bg-emerald-600 text-[12px] font-semibold text-white shadow-sm shadow-emerald-800/25 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isRedeeming ? "Memproses..." : "Tukar Sekarang"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
