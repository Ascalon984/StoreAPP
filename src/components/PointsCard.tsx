"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  CalendarCheck,
  ChevronRight,
  ArrowLeft,
  Ticket,
  CircleQuestionMark,
} from "lucide-react";

// ── Types ──
export interface PointsData {
  total: number;
  transactionPoints: number;
  checkinPoints: number;
  dailyStreak: number;
  checkedInToday: boolean;
  rewardStreakPoints: number;
}

interface PointsCardProps {
  points: PointsData;
  onOpenInfo: () => void;
}

// ── Points Card ──
export default function PointsCard({ points, onOpenInfo }: PointsCardProps) {
  const [currentStreak, setCurrentStreak] = useState(points.dailyStreak);
  const [displayTotal, setDisplayTotal] = useState(points.total);
  const [targetTotal, setTargetTotal] = useState(points.total);
  const [showFloating, setShowFloating] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showFloating100, setShowFloating100] = useState(false);

  // New state
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"diskon" | "ongkir">("diskon");

  useEffect(() => {
    if (displayTotal >= targetTotal) return;

    const interval = setInterval(() => {
      setDisplayTotal((prev) => {
        const diff = targetTotal - prev;
        const step = diff >= 100 ? 2 : 1;

        const next = prev + step;

        return next >= targetTotal ? targetTotal : next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [displayTotal, targetTotal]);

  const playPointReward = (
    reward: number,
    setFloating: (v: boolean) => void,
  ) => {
    setFloating(true);

    setTimeout(() => {
      setFloating(false);

      setTargetTotal((prev) => prev + reward);
    }, 1800);
  };

  const handleCheckin = () => {
    const isDay7 = currentStreak === 6; // 0-indexed, streak ke-6 = hari ke-7

    if (isDay7) {
      setAnimationFinished(false);
      setShowRewardModal(true);
    } else {
      // Animasi +20 biasa
      playPointReward(20, setShowFloating);
      setCurrentStreak((prev) => prev + 1);
    }
  };

  return (
    <>
      <div className="mx-4 mt-2">
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100">
          {/* TOP Grid */}
          <div className="flex">
            {/* Poin Saya */}
            <div className="w-[40%] relative px-3.5 pt-3.5 pb-2 border-r border-gray-100 flex flex-col">
              {/* Icon Question di pojok kanan atas */}
              <button
                onClick={onOpenInfo}
                className="absolute top-2.5 right-2.5 p-0.5 active:scale-90 transition-transform"
              >
                <CircleQuestionMark
                  size={13}
                  className="text-gray-400"
                  strokeWidth={2.5}
                />
              </button>

              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-2">
                  POIN SAYA
                </p>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[20px] font-bold text-gray-700 tabular-nums leading-none">
                    {displayTotal.toLocaleString("id-ID")}
                  </span>
                  {/* ICON + FLOATING +20 */}
                  <div className="relative mb-0 flex items-center">
                    {showFloating && (
                      <span
                        className="absolute -top-3 -right-6 text-[11px] font-black text-emerald-500 pointer-events-none"
                        style={{
                          animation: "floatUp 1.8s ease-out forwards",
                        }}
                      >
                        +10
                      </span>
                    )}
                    {showFloating100 && (
                      <span
                        className="absolute -top-3 -right-8 text-[11px] font-black text-emerald-500 pointer-events-none"
                        style={{ animation: "floatUp 1.8s ease-out forwards" }}
                      >
                        +50
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenInfo}
                className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 w-fit active:opacity-70"
              >
                Riwayat <ChevronRight size={12} strokeWidth={2.5} />
              </button>
            </div>

            {/* Right Column: BONUS LAINNYA */}
            <div className="flex-1 px-3.5 pt-3.5 pb-2 flex flex-col">
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-2">
                  BONUS LAINNYA
                </p>
                <div className="flex items-start gap-1.5 mb-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-700 leading-tight">
                      Check-in & Voucher
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowBonusModal(true)}
                className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 w-fit active:opacity-70"
              >
                Buka <ChevronRight size={12} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* BOTTOM: Voucher Saya */}
          <div
            className="border-t border-gray-100 px-3.5 pt-2 pb-3.5 flex items-center justify-between active:bg-gray-50 transition-colors"
            onClick={() => setShowBonusModal(true)}
          >
            <div className="flex items-center gap-2.5">
              <Ticket
                size={18}
                strokeWidth={2}
                className="text-emerald-600 shrink-0"
              />

              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-700 leading-tight">
                  Voucher Saya
                </span>
                <span className="text-[9px] font-medium text-gray-500 leading-tight mt-0.5">
                  Diskon • Ongkir
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                8 Aktif
              </span>
              <ChevronRight
                size={14}
                strokeWidth={2.5}
                className="text-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {showBonusModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
            {/* Header */}
            <div className="bg-white px-4 py-3.5 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
              <button
                onClick={() => setShowBonusModal(false)}
                className="p-1 -ml-1 active:scale-95 transition-transform"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
              <h2 className="text-[13px] font-bold text-gray-800">
                Bonus & Voucher
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
              {/* Check-in Harian Section */}
              <div className="bg-white p-4 mb-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[12px] font-bold text-gray-800">
                      Check-in Harian
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Kumpulkan poin setiap hari
                    </p>
                  </div>

                  {/* Wrapper dibuat relative untuk menampung animasi */}
                  <div className="relative flex items-center gap-1.5">
                    {/* Animasi Floating +20 (Muncul di kiri icon) */}
                    {showFloating && (
                      <span
                        className="absolute -left-8 -top-1 text-[14px] font-black text-emerald-500 pointer-events-none z-20"
                        style={{ animation: "floatUp 1.8s ease-out forwards" }}
                      >
                        +20
                      </span>
                    )}

                    {showFloating100 && (
                      <span
                        className="absolute -left-10 -top-1 text-[14px] font-black text-emerald-500 pointer-events-none z-20"
                        style={{ animation: "floatUp 1.8s ease-out forwards" }}
                      >
                        +100
                      </span>
                    )}

                    <img
                      src="/icons/stack_poin.svg"
                      alt="Poin"
                      className="w-8 h-6"
                    />
                    <span className="text-[14.5px] font-bold text-gray-800 tabular-nums">
                      {displayTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* DAYS */}
                <div className="flex items-center justify-between">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const completed = i < currentStreak;
                    const isRewardDay = i === 6;

                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1.5"
                      >
                        {completed ? (
                          <div className="w-7 h-7 flex items-center justify-center">
                            <div className="w-[24px] h-[24px] rounded-full bg-emerald-500 flex items-center justify-center shadow-inner">
                              <Check
                                size={14}
                                strokeWidth={3}
                                className="text-white"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-7 h-7 flex items-center justify-center">
                            {isRewardDay ? (
                              <img
                                src="/icons/gift.png"
                                alt="Reward"
                                className="w-[22px] h-auto object-contain drop-shadow-sm"
                              />
                            ) : (
                              <div className="w-[24px] h-[24px] rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                <CalendarCheck
                                  size={12}
                                  strokeWidth={2.5}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <span className="text-[9px] font-bold text-gray-500 leading-none">
                          Hari {i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleCheckin}
                  className="mt-5 w-full h-10 rounded-lg bg-emerald-600 text-white text-[12px] font-bold active:scale-[0.98] transition"
                >
                  Check-in Hari Ini
                </button>
              </div>

              {/* Voucher Tabs Section */}
              <div className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-h-[400px]">
                <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
                  <button
                    className={`flex-1 py-3 text-[11px] font-bold border-b-2 transition-colors ${activeTab === "diskon" ? "border-emerald-500 text-emerald-600" : "border-transparent text-gray-500"}`}
                    onClick={() => setActiveTab("diskon")}
                  >
                    Voucher Diskon
                  </button>
                  <button
                    className={`flex-1 py-3 text-[11px] font-bold border-b-2 transition-colors ${activeTab === "ongkir" ? "border-emerald-500 text-emerald-600" : "border-transparent text-gray-500"}`}
                    onClick={() => setActiveTab("ongkir")}
                  >
                    Voucher Ongkir
                  </button>
                </div>

                <div className="p-4 flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl opacity-50 grayscale">🎫</span>
                  </div>
                  <p className="text-[12px] font-bold text-gray-700">
                    Belum ada voucher {activeTab}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Cek lagi nanti ya!
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showRewardModal &&
        createPortal(
          <div
            onClick={() => {
              if (!animationFinished) return;

              setShowRewardModal(false);
              playPointReward(100, setShowFloating100);
              setCurrentStreak(0); // Reset ke 0 setelah reward hari ke-7
            }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center px-6"
          >
            <video
              src="/icons/reward.webm"
              autoPlay
              muted
              playsInline
              className="w-[180px] h-auto pointer-events-none"
              onEnded={() => {
                setAnimationFinished(true); // hanya trigger reveal teks, count up tidak di sini
              }}
            />

            {/* Muncul SEJAK AWAL modal terbuka, tidak perlu tunggu animationFinished */}
            <p className="mt-4 text-center text-white/70 text-[13px]">
              Selamat, Kamu mendapatkan
            </p>
            <p className="mt-1 text-center text-3xl font-bold text-emerald-400 tracking-tight">
              +100 Poin
            </p>

            {/* Muncul SETELAH video selesai */}
            {animationFinished && (
              <p className="mt-8 text-[11px] text-white/50 animate-pulse">
                Tap di mana saja untuk melanjutkan
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
