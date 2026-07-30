"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  CalendarCheck,
  ChevronRight,
  ArrowLeft,
  Ticket,
  CircleQuestionMark,
} from "lucide-react";
import VoucherPage from "./VoucherPage";
import HistoryPoinPage from "./HistoryPoinPage";
import VoucherList from "./VoucherList";
import { usePointsStore } from "@/store/usePointsStore";
import { useHistoryPoin } from "@/store/useHistoryPoin";
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

  const { addPoints, deductPoints, checkIn } = usePointsStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [currentStreak, setCurrentStreak] = useState(points.dailyStreak);
  const [displayTotal, setDisplayTotal] = useState(points.total);
  const [targetTotal, setTargetTotal] = useState(points.total);
  const animateNextUpdate = useRef(false);

  // Digabung: sebelumnya showFloating + showFloating100 (duplikat & nilai salah)
  const [floatingReward, setFloatingReward] = useState<number | null>(null);
  const [floatingDeduction, setFloatingDeduction] = useState<number | null>(
    null,
  );
  const [activeVouchers, setActiveVouchers] = useState(0);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showVoucherListModal, setShowVoucherListModal] = useState(false);
  const [walletPulse, setWalletPulse] = useState(false);

  // ── Sync state ketika props berubah dari parent ──
  useEffect(() => {
    setCurrentStreak(points.dailyStreak);
  }, [points.dailyStreak]);

  useEffect(() => {
    if (animateNextUpdate.current) {
      setTargetTotal(points.total);
      animateNextUpdate.current = false;
    } else {
      // Refresh / Hydration (Jangan ada animasi)
      setDisplayTotal(points.total);
      setTargetTotal(points.total);
    }
  }, [points.total]);

  // ── Animasi counting angka ──
  useEffect(() => {
    if (displayTotal === targetTotal) return;

    const startValue = displayTotal;
    const endValue = targetTotal;
    const diff = endValue - startValue;
    const absDiff = Math.abs(diff);

    // Durasi berdasarkan jumlah perubahan
    let duration: number;

    if (absDiff <= 500) {
      duration = 1000; // ≤500 poin = 1 detik
    } else if (absDiff >= 1000) {
      duration = 2000; // ≥1000 poin = 2 detik
    } else {
      // interpolasi linear 500 → 1000 poin
      duration = 1000 + ((absDiff - 500) / 500) * 1000;
    }

    const startTime = performance.now();

    let rafId: number;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);

      // Ease Out Cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const value = Math.round(startValue + diff * eased);

      setDisplayTotal((prev) => (prev === value ? prev : value));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplayTotal(endValue);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [targetTotal]);

  // ── Fungsi reward: sebelumnya menerima setter terpisah (duplikat), sekarang cukup angka ──
  const playPointReward = (reward: number, title: string) => {
    setFloatingReward(reward);

    setTimeout(() => {
      setFloatingReward(null);

      // pulse icon wallet
      setWalletPulse(true);
      setTimeout(() => setWalletPulse(false), PULSE_DURATION);

      // trigger state & history update
      animateNextUpdate.current = true;
      addPoints(reward);
      useHistoryPoin.getState().addHistoryTransaction({
        type: "plus",
        amount: reward,
        title,
        description: "Dari event & hadiah",
        balance: points.total + reward,
      });
    }, FLOAT_DURATION);
  };

  const playPointDeduction = (deduction: number, title: string) => {
    setFloatingDeduction(deduction);

    setTimeout(() => {
      setFloatingDeduction(null);

      // pulse icon wallet
      setWalletPulse(true);
      setTimeout(() => setWalletPulse(false), PULSE_DURATION);

      // trigger state & history update
      animateNextUpdate.current = true;
      deductPoints(deduction);
      useHistoryPoin.getState().addHistoryTransaction({
        type: "minus",
        amount: deduction,
        title,
        description: "Penukaran Poin",
        balance: Math.max(0, points.total - deduction),
      });
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
      playPointReward(CHECKIN_REWARD, "Check-in Harian");
      checkIn(CHECKIN_REWARD);
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
            {mounted ? (
              <span className="text-[20px] font-bold text-gray-700 tabular-nums leading-none">
                {displayTotal.toLocaleString("id-ID")}
              </span>
            ) : (
              <span className="block h-[22px] w-16 rounded bg-gray-200 animate-pulse" />
            )}
            {/* Sebelumnya: +10 (salah) dan +50 (salah), sekarang tampil nilai asli */}
            {floatingReward !== null && (
              <span
                className="absolute -top-3 right-0 text-[11px] font-black text-emerald-500 pointer-events-none"
                style={{ animation: "floatUp 1.8s ease-out forwards" }}
              >
                +{floatingReward}
              </span>
            )}
            {floatingDeduction !== null && (
              <span
                className="absolute -top-3 right-0 text-[11px] font-black text-rose-500 pointer-events-none"
                style={{ animation: "floatUp 1.8s ease-out forwards" }}
              >
                -{floatingDeduction}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 w-fit active:opacity-70"
          >
            Riwayat <ChevronRight size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* ─── Region Kanan: Bonus Lainnya ─── */}
        <div className="flex-1 bg-white rounded-lg px-3.5 pt-3.5 pb-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
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
            <button
              onClick={() => setShowBonusModal(true)}
              className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 w-fit active:opacity-70"
            >
              Klaim Reward
              <ChevronRight size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Voucher Saya — dengan ticket notch (transparan asli) */}
      <div className="mx-4 mt-2">
        <div
          className="relative bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-stretch"
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
          <button
            onClick={() => setShowVoucherListModal(true)}
            className="relative z-10 flex items-center justify-center gap-[1px] w-[22%] active:opacity-70"
          >
            <span className="text-[10px] font-bold text-emerald-600">
              {activeVouchers} Aktif
            </span>

            <ChevronRight
              size={15}
              strokeWidth={2.5}
              className="text-emerald-600"
            />
          </button>
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

            <div
              className="flex-1 overflow-y-auto pb-20"
              id="bonus-modal-scroll"
            >
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
                    {floatingDeduction !== null && (
                      <span
                        className="absolute -left-10 -top-1 text-[14px] font-black text-rose-500 pointer-events-none z-20"
                        style={{ animation: "floatUp 1.8s ease-out forwards" }}
                      >
                        -{floatingDeduction}
                      </span>
                    )}

                    <img
                      src="/icons/stack_poin.svg"
                      alt="Poin"
                      className={`w-8 h-auto ${
                        walletPulse ? "animate-walletPulse" : ""
                      }`}
                    />

                    {mounted ? (
                      <span className="text-[18.5px] font-extrabold text-gray-700 tabular-nums">
                        {displayTotal.toLocaleString("id-ID")}
                      </span>
                    ) : (
                      <span className="block h-[20px] w-16 rounded bg-gray-200 animate-pulse" />
                    )}
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
                    disabled:shadow-inner
                    disabled:active:scale-100
                    disabled:cursor-not-allowed
                    "
                >
                  {points.checkedInToday
                    ? "Sudah Check-in Hari Ini"
                    : "Check-in Hari Ini"}
                </button>
              </div>

              {/*Dev Tools Reset Button Check-in*/}
              {/* {process.env.NODE_ENV === "development" && (
                <button
                  onClick={() =>
                    usePointsStore.getState().setPoints({
                      checkedInToday: false,
                    })
                  }
                  className="mt-0 w-full text-center text-[10px] text-gray-400 underline"
                >
                  [DEV] Reset Check-in Hari Ini
                </button>
              )} */}

              {/* Voucher Tabs */}
              <VoucherPage
                onVoucherClaimed={(pointsCost, voucher) => {
                  setActiveVouchers((prev) => prev + 1);
                  if (pointsCost > 0) {
                    playPointDeduction(pointsCost, `Tukar ${voucher.title}`);
                  }
                }}
              />
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
              playPointReward(STREAK_REWARD, "Bonus Check-in 7 Hari");
              checkIn(STREAK_REWARD);
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

      {showHistoryModal && (
        <HistoryPoinPage onClose={() => setShowHistoryModal(false)} />
      )}

      {showVoucherListModal && (
        <VoucherList onClose={() => setShowVoucherListModal(false)} />
      )}
    </>
  );
}
