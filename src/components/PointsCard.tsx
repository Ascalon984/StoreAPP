"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, CalendarCheck } from "lucide-react";
import { CircleQuestionMark } from "lucide-react";

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
      <div className="mx-3 mt-2">
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          {/* TOP */}
          <div className="px-4 pt-4 pb-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 mb-1">
                Poin Kamu
              </p>

              <div className="flex items-end gap-2">
                <span className="text-[23px] font-black text-gray-600 tabular-nums leading-none">
                  {displayTotal.toLocaleString("id-ID")}
                </span>
                {/* ICON + FLOATING +20 */}
                <div className="relative mb-0">
                  <img
                    src="/icons/stack_poin.svg"
                    alt="Poin"
                    className="w-8 h-auto opacity-90"
                  />
                  {showFloating && (
                    <span
                      className="absolute -top-2 -right-7 text-[13px] font-black text-emerald-500 pointer-events-none"
                      style={{
                        animation: "floatUp 1.8s ease-out forwards",
                      }}
                    >
                      +20
                    </span>
                  )}
                  {showFloating100 && (
                    <span
                      className="absolute -top-2 -right-9 text-[13px] font-black text-emerald-500 pointer-events-none"
                      style={{ animation: "floatUp 1.8s ease-out forwards" }}
                    >
                      +100
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-gray-500 mt-1">
                Bisa dipakai untuk belanja
              </p>
            </div>

            <button
              onClick={onOpenInfo}
              className="w-8 h-8 rounded-full hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center"
            >
              <CircleQuestionMark
                size={16}
                className="text-gray-500"
                strokeWidth={2.3}
              />
            </button>
          </div>

          {/* STREAK */}
          <div className="px-4 pt-1 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] font-bold text-gray-700">
                  Check-in harianmu
                </p>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  Raih bonus poin tambahan
                </p>
              </div>

              <button
                onClick={handleCheckin}
                className="px-2.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1.5 relative"
              >
                <span className="text-[9.5px] font-black text-white">
                  Check-in
                </span>
                {/* Dot merah selalu aktif untuk testing */}
                <span className="absolute -top-0.5 -right-0 w-2 h-2 rounded-full bg-rose-500" />
              </button>
            </div>

            {/* DAYS */}
            <div className="flex items-center justify-between">
              {Array.from({ length: 7 }).map((_, i) => {
                const completed = i < currentStreak;
                const isRewardDay = i === 6;

                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    {completed ? (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <div className="w-[22px] h-[22px] rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check
                            size={12}
                            strokeWidth={3}
                            className="text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center translate-y-[-1px]">
                        {isRewardDay ? (
                          <img
                            src="/icons/gift.png"
                            alt="Reward"
                            className="w-[20px] h-auto object-contain"
                          />
                        ) : (
                          <CalendarCheck
                            size={17}
                            strokeWidth={2.3}
                            className="text-gray-400"
                          />
                        )}
                      </div>
                    )}
                    <span className="text-[9px] font-bold text-gray-600 leading-none">
                      Hari {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
