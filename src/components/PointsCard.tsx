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
  const CHECKIN_REWARD = 20;
  const STREAK_REWARD = 100;

  const FLOAT_DURATION = 900;
  const PULSE_DURATION = 500;
  const COUNT_INTERVAL = 60;
  const [currentStreak, setCurrentStreak] = useState(points.dailyStreak);
  const [displayTotal, setDisplayTotal] = useState(points.total);
  const [targetTotal, setTargetTotal] = useState(points.total);

  // Digabung: sebelumnya showFloating + showFloating100 (duplikat & nilai salah)
  const [floatingReward, setFloatingReward] = useState<number | null>(null);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [walletPulse, setWalletPulse] = useState(false);
  const [activeTab, setActiveTab] = useState<"diskon" | "ongkir">("diskon");

  // ── Sync state ketika props berubah dari parent ──
  useEffect(() => {
    setCurrentStreak(points.dailyStreak);
  }, [points.dailyStreak]);

  useEffect(() => {
    setTargetTotal(points.total);
  }, [points.total]);

  // ── Animasi counting angka ──
  useEffect(() => {
    if (displayTotal >= targetTotal) return;

    const interval = setInterval(() => {
      setDisplayTotal((prev) => {
        const diff = targetTotal - prev;
        const step = diff >= 100 ? 2 : 1;
        const next = prev + step;
        return next >= targetTotal ? targetTotal : next;
      });
    }, COUNT_INTERVAL);

    return () => clearInterval(interval);
  }, [displayTotal, targetTotal]);

  // ── Fungsi reward: sebelumnya menerima setter terpisah (duplikat), sekarang cukup angka ──
  const playPointReward = (reward: number) => {
    setFloatingReward(reward);

    setTimeout(() => {
      setFloatingReward(null);

      // pulse icon wallet
      setWalletPulse(true);
      setTimeout(() => setWalletPulse(false), PULSE_DURATION);

      // mulai counting
      setTargetTotal((prev) => prev + reward);
    }, FLOAT_DURATION);
  };

  // ── Handler check-in dengan validasi ──
  const handleCheckin = () => {
    if (points.checkedInToday) return;
    if (floatingReward !== null) return;

    const isDay7 = currentStreak === 6;

    if (isDay7) {
      setAnimationFinished(false);
      setShowRewardModal(true);
    } else {
      playPointReward(CHECKIN_REWARD);
      setCurrentStreak((prev) => prev + 1);
    }
  };

  return (
    <>
      {/* Row 1: Dua kartu terpisah */}
      <div className="mx-4 mt-2 flex gap-2">
        {/* ─── Region Kiri: Poin Saya ─── */}
        <div className="w-[40%] bg-white rounded-lg px-3.5 pt-3.5 pb-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100 relative shrink-0">
          <button
            onClick={onOpenInfo}
            className="absolute top-3.5 right-2.5 p-0.5 active:scale-90 transition-transform"
          >
            <CircleQuestionMark
              size={13}
              className="text-gray-500"
              strokeWidth={2.5}
            />
          </button>

          <p className="text-[10px] font-bold text-gray-500 mb-2">POIN SAYA</p>

          <div className="flex items-center gap-1.5 mb-2 relative">
            <span className="text-[20px] font-bold text-gray-700 tabular-nums leading-none">
              {displayTotal.toLocaleString("id-ID")}
            </span>
            {/* Sebelumnya: +10 (salah) dan +50 (salah), sekarang tampil nilai asli */}
            {floatingReward !== null && (
              <span
                className="absolute -top-3 right-0 text-[11px] font-black text-emerald-500 pointer-events-none"
                style={{ animation: "floatUp 1.8s ease-out forwards" }}
              >
                +{floatingReward}
              </span>
            )}
          </div>

          <button
            onClick={onOpenInfo}
            className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 w-fit active:opacity-70"
          >
            Riwayat <ChevronRight size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* ─── Region Kanan: Bonus Lainnya ─── */}
        <div
          onClick={() => setShowBonusModal(true)}
          className="flex-1 bg-white rounded-lg px-3.5 pt-3.5 pb-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden active:bg-gray-50/50 transition-colors"
        >
          {/* Watermark */}
          <img
            src="/icons/reward_soft.png"
            alt=""
            aria-hidden="true"
            className="absolute -right-7 -bottom-6 w-[104px] h-auto pointer-events-none select-none z-0"
            style={{
              transform: "rotate(5deg)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,.8) 45%, rgba(0,0,0,.15) 80%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,.8) 45%, rgba(0,0,0,.15) 80%, transparent 100%)",
            }}
          />

          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-500 mb-2">
              BONUS LAINNYA
            </p>
            <div className="flex items-start gap-1.5 mb-3">
              <span className="text-[12px] font-bold text-gray-700 leading-tight">
                Check-in & Voucher
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 w-fit">
              Klaim Reward <ChevronRight size={12} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Voucher Saya — dengan ticket notch (transparan asli) */}
      <div className="mx-4 mt-2">
        <div
          onClick={() => setShowBonusModal(true)}
          className="relative bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-stretch active:bg-gray-50/50 transition-colors"
          style={{
            WebkitMaskImage: `radial-gradient(circle 5px at 78% 0%, transparent 99%, black 100%),
                         radial-gradient(circle 5px at 78% 100%, transparent 99%, black 100%)`,
            maskImage: `radial-gradient(circle 5px at 78% 0%, transparent 99%, black 100%),
                   radial-gradient(circle 5px at 78% 100%, transparent 99%, black 100%)`,
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        >
          {/* Left: Icon + Label */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 flex-1">
            <Ticket
              size={19}
              strokeWidth={1.5}
              className="text-gray-900 shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-gray-700 leading-tight">
                Voucher Saya
              </span>
            </div>
          </div>

          {/* Garis putus-putus */}
          <div
            className="absolute inset-y-1 border-l border-dashed border-gray-300"
            style={{
              left: "78%",
              transform: "translateX(-0.5px)",
            }}
          />

          {/* Right: Badge + Chevron */}
          <div className="relative z-10 flex items-center justify-center gap-[1px] w-[22%]">
            <span className="text-[10px] font-bold text-emerald-600">
              8 Aktif
            </span>
            <ChevronRight
              size={15}
              strokeWidth={2.5}
              className="text-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* ─── Modal: Bonus & Voucher ─── */}
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
              {/* Check-in Harian */}
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

                  <div className="relative flex items-center gap-1.5">
                    {floatingReward !== null && (
                      <span
                        className="absolute -left-10 -top-1 text-[14px] font-black text-emerald-500 pointer-events-none z-20"
                        style={{ animation: "floatUp 1.8s ease-out forwards" }}
                      >
                        +{floatingReward}
                      </span>
                    )}

                    <img
                      src="/icons/stack_poin.svg"
                      alt="Poin"
                      className={`w-8 h-auto ${
                        walletPulse ? "animate-walletPulse" : ""
                      }`}
                    />

                    <span className="text-[18.5px] font-extrabold text-gray-700 tabular-nums">
                      {displayTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Days */}
                <div className="flex items-center justify-between">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const completed = i < currentStreak;
                    const isRewardDay = i === 6;

                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="w-7 h-7 flex items-center justify-center">
                          {completed ? (
                            <div className="w-[24px] h-[24px] rounded-full bg-emerald-500 flex items-center justify-center shadow-inner">
                              <Check
                                size={14}
                                strokeWidth={3}
                                className="text-white"
                              />
                            </div>
                          ) : isRewardDay ? (
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
                        <span className="text-[9px] font-bold text-gray-500 leading-none">
                          Hari {i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleCheckin}
                  disabled={points.checkedInToday || floatingReward !== null}
                  className="
                    mt-5
                    w-full
                    h-10
                    rounded-lg
                    bg-emerald-600
                    text-white
                    text-[12px]
                    font-bold
                    transition
                    active:scale-[0.98]
                    disabled:bg-gray-100
                    disabled:text-gray-400
                    disabled:active:scale-100
                    disabled:cursor-not-allowed
                    "
                >
                  {points.checkedInToday
                    ? "Sudah Check-in Hari Ini"
                    : "Check-in Hari Ini"}
                </button>
              </div>

              {/* Voucher Tabs */}
              <div className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-h-[400px]">
                <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
                  {(["diskon", "ongkir"] as const).map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 py-3 text-[11px] font-bold border-b-2 transition-colors ${
                        activeTab === tab
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-gray-500"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      Voucher {tab === "diskon" ? "Diskon" : "Ongkir"}
                    </button>
                  ))}
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

      {/* ─── Modal: Reward ─── */}
      {showRewardModal &&
        createPortal(
          <div
            onClick={() => {
              if (!animationFinished) return;
              setShowRewardModal(false);
              playPointReward(STREAK_REWARD);
              setCurrentStreak(0);
            }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center px-6"
          >
            <video
              src="/icons/reward.webm"
              autoPlay
              muted
              playsInline
              className="w-[180px] h-auto pointer-events-none"
              onEnded={() => setAnimationFinished(true)}
            />
            <p className="mt-4 text-center text-white/80 text-[13px]">
              Selamat, Kamu mendapatkan
            </p>
            <p className="mt-1 text-center text-3xl font-bold text-emerald-400 tracking-tight">
              +100 Poin
            </p>
            {animationFinished && (
              <p className="mt-8 text-[11px] text-white/80 animate-pulse">
                Tap di mana saja untuk melanjutkan
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
