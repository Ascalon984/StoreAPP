import { createPortal } from "react-dom";
import { ArrowLeft, Check, CalendarCheck } from "lucide-react";
import VoucherPage, { Voucher } from "./VoucherPage";
import { PointsData } from "./PointsCard";
import { usePointsStore } from "@/store/usePointsStore";

interface PoinRewardModalProps {
  onClose: () => void;
  points: PointsData;
  floatingReward: number | null;
  floatingDeduction: number | null;
  walletPulse: boolean;
  mounted: boolean;
  displayTotal: number;
  currentStreak: number;
  handleCheckin: () => void;
  onVoucherClaimed: (pointsCost: number, voucher: Voucher) => void;
}

export default function PoinRewardModal({
  onClose,
  points,
  floatingReward,
  floatingDeduction,
  walletPulse,
  mounted,
  displayTotal,
  currentStreak,
  handleCheckin,
  onVoucherClaimed,
}: PoinRewardModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="bg-white px-4 py-3.5 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <button
          onClick={onClose}
          className="p-1 -ml-1 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="text-[13px] font-bold text-gray-800">Bonus & Voucher</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-20" id="bonus-modal-scroll">
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
                <div key={i} className="flex flex-col items-center gap-1.5">
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

        {/*Dev Tools Cuma Tes Logic Streak doang jir*/}
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
        <VoucherPage onVoucherClaimed={onVoucherClaimed} />
      </div>
    </div>,
    document.body,
  );
}
