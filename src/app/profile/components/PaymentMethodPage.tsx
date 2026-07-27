import React, { useState } from "react";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";

interface PaymentMethodPageProps {
  onClose: () => void;
}

interface EWalletAccount {
  id: string;
  name: string;
  logoUrl?: string;
  accountName?: string | null;
  phoneNumber: string | null;
  isConnected: boolean;
}

// Mask nomor HP: tampilkan 4 digit awal & 2 digit akhir, sisanya disensor
function maskPhoneNumber(phone: string): string {
  if (phone.length <= 6) return phone;
  const start = phone.slice(0, 4);
  const end = phone.slice(-2);
  const masked = "*".repeat(phone.length - 6);
  return `${start}${masked}${end}`;
}

const EWALLET_CONFIG: Record<string, { image: string; color: string }> = {
  gopay: {
    image: "Gopay.png",
    color: "#00AED6",
  },
  dana: {
    image: "DANA.png",
    color: "#108EE9",
  },
  ovo: {
    image: "OVO.png",
    color: "#4C3494",
  },
  linkaja: {
    image: "LinkAja.png",
    color: "#E82529",
  },
  shopeepay: {
    image: "Shoppepay.png",
    color: "#EE4D2D",
  },
};

const initialWallets: EWalletAccount[] = [
  {
    id: "ovo",
    name: "OVO",
    accountName: "Aditya Tri Prasetyo",
    phoneNumber: "081234567890",
    isConnected: true,
  },
  {
    id: "gopay",
    name: "GoPay",
    accountName: null,
    phoneNumber: null,
    isConnected: false,
  },
  {
    id: "dana",
    name: "DANA",
    accountName: null,
    phoneNumber: null,
    isConnected: false,
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    accountName: "Aditya Tri Prasetyo",
    phoneNumber: "081298765432",
    isConnected: true,
  },
  {
    id: "linkaja",
    name: "LinkAja",
    accountName: null,
    phoneNumber: null,
    isConnected: false,
  },
];

export default function PaymentMethodPage({ onClose }: PaymentMethodPageProps) {
  const [wallets, setWallets] = useState<EWalletAccount[]>(initialWallets);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<EWalletAccount | null>(null);
  // ==============================
  // TODO: REMOVE MOCK (Payment Gateway)
  // Percobaan pertama gagal, kedua berhasil
  // ==============================
  const [connectAttempts, setConnectAttempts] = useState<
    Record<string, number>
  >({});

  const handleConnect = (id: string) => {
    setConnectingId(id);

    setTimeout(() => {
      // const success = Math.random() > 0.5;
      // ==============================
      // TODO: REMOVE MOCK (Payment Gateway)
      // ==============================
      const attempt = (connectAttempts[id] ?? 0) + 1;

      setConnectAttempts((prev) => ({
        ...prev,
        [id]: attempt,
      }));

      const success = attempt >= 2;

      if (success) {
        setWallets((prev) =>
          prev.map((w) =>
            w.id === id
              ? {
                  ...w,
                  isConnected: true,
                  accountName: "Budi Santoso",
                  phoneNumber: "081200000000",
                }
              : w,
          ),
        );
      } else {
        const wallet = wallets.find((w) => w.id === id);
        if (wallet) {
          setConnectError(wallet);
        }
      }

      setConnectingId(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-right-full duration-300">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-1 sticky top-0 z-10">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-[16px] font-bold text-gray-800 -translate-x-[2px]">
          Dompet
        </h1>
      </div>

      <div
        className={`flex-1 px-5 pt-5 pb-12 ${
          connectingId || connectError ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <div className="space-y-3">
          {[...wallets]
            .sort((a, b) => Number(b.isConnected) - Number(a.isConnected))
            .map((wallet) => {
              const config = EWALLET_CONFIG[wallet.id] ?? {
                image: "Wallet.png",
                color: "#E5E7EB",
              };

              return (
                <div
                  key={wallet.id}
                  className="relative min-h-[108px] bg-white border border-gray-100 rounded-[10px] shadow-md"
                >
                  {/* Trash */}
                  {wallet.isConnected && (
                    <button
                      onClick={() => {
                        // TODO: Dialog konfirmasi putuskan akun
                        console.log("Disconnect", wallet.id);
                      }}
                      className="
                        absolute
                        top-0.5
                        right-1
                        p-2
                        rounded-lg
                        text-gray-400
                        hover:text-red-500
                        hover:bg-red-50
                        active:bg-red-100
                        transition-colors
                      "
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {/* Status */}
                  {wallet.isConnected && (
                    <div
                      className="
                        absolute
                        top-0
                        left-0
                        flex
                        items-center
                        rounded-br-[12px]
                        rounded-tl-[10px]
                        bg-gradient-to-r
                        from-orange-500
                        to-amber-500
                        px-3
                        py-[3px]
                      "
                    >
                      <span
                        className="text-[9px] font-medium text-white"
                        style={{
                          textShadow: "0 0 5px rgba(0,0,0,.35)",
                        }}
                      >
                        Terhubung
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-7 px-4 pt-5 pb-4">
                    {/* Logo */}
                    <div
                      className={`relative w-12 h-12 shrink-0 translate-x-[1px] ${
                        wallet.isConnected
                          ? "translate-y-[14px]"
                          : "translate-y-[8px]"
                      }`}
                    >
                      <Image
                        src={`/icons/${config.image}`}
                        alt={wallet.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14.5px] font-bold text-gray-800">
                        {wallet.name}
                      </h3>

                      {wallet.isConnected ? (
                        <div className="mt-2.5 space-y-1.5">
                          <p className="text-[12px] font-medium text-gray-700 truncate">
                            {wallet.accountName}
                          </p>

                          <p className="text-[11px] text-gray-500">
                            {maskPhoneNumber(wallet.phoneNumber!)}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[12px] text-gray-500">
                              Belum terhubung
                            </p>

                            <button
                              onClick={() => handleConnect(wallet.id)}
                              disabled={connectingId !== null}
                              className="
                                px-2.5
                                h-7
                                rounded-xl
                                bg-emerald-600
                                text-white
                                text-[11.5px]
                                font-semibold
                                tracking-[0.0005em]
                                transition-all
                                duration-200
                                hover:bg-emerald-700
                                hover:shadow-md
                                hover:-translate-y-[1px]
                                active:translate-y-0
                                active:bg-emerald-800
                                disabled:opacity-60
                                disabled:cursor-not-allowed
                              "
                            >
                              Hubungkan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        {/* Overlay Loading */}
        {connectingId && (
          <div className="fixed inset-0 z-[200] bg-black/15 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl px-8 py-7 flex flex-col items-center animate-in zoom-in-95 duration-200">
              <Loader2 size={34} className="text-emerald-600 animate-spin" />

              <p className="mt-4 text-sm font-semibold text-gray-800">
                Menghubungkan...
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Mohon tunggu sebentar
              </p>
            </div>
          </div>
        )}
        {/* Modal Gagal */}
        {connectError && (
          <div className="fixed inset-0 z-[210] bg-black/30 flex items-center justify-center px-5">
            <div className="bg-white rounded-2xl w-full max-w-[350px] p-5 text-center shadow-xl">
              <Image
                src="/illustrations/fail_connect_wallet.png"
                alt="Gagal"
                width={170}
                height={170}
                className="mx-auto"
              />

              <h3 className="mt-2 text-[16px] font-semibold text-gray-800">
                Gagal Menghubungkan
              </h3>

              <p className="mt-2 text-[13px] text-gray-500 leading-6">
                Tidak dapat menghubungkan akun {connectError.name}. Silakan coba
                beberapa saat lagi.
              </p>

              <div className="mt-7 flex gap-3">
                <button
                  onClick={() => setConnectError(null)}
                  className="
                    flex-1
                    h-11
                    rounded-[11px]
                    border
                    border-gray-200
                    bg-white
                    text-gray-700
                    font-medium
                    transition-colors
                    hover:bg-gray-50
                  "
                >
                  Kembali
                </button>

                <button
                  onClick={() => {
                    const wallet = connectError;
                    setConnectError(null);

                    if (wallet) {
                      handleConnect(wallet.id);
                    }
                  }}
                  className="
                    flex-1
                    h-11
                    rounded-[11px]
                    bg-emerald-600
                    text-white
                    font-medium
                    transition-all
                    duration-200
                    hover:bg-emerald-700
                    hover:shadow-md
                    active:bg-emerald-800
                  "
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
