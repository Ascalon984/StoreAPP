import React, { useState } from "react";
import { ArrowLeft, Wallet, Trash2 } from "lucide-react";
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

  const handleConnect = (id: string) => {
    setConnectingId(id);

    // TODO: Ganti dengan flow linked account tokenization PG (mis. Xendit)
    setTimeout(() => {
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

      setConnectingId(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-right-full duration-300">
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-[15px] font-bold text-gray-800">Dompet</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
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
                      <Trash2 size={15} />
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
                    <div className="relative w-12 h-12 shrink-0 translate-y-[14px] translate-x-[1px]">
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
                              disabled={connectingId === wallet.id}
                              className="
                          px-3
                          h-7
                          rounded-xl
                          bg-emerald-600
                          text-white
                          text-[11.5px]
                          font-semibold
                          hover:bg-emerald-700
                          active:bg-emerald-800
                          transition-colors
                          disabled:opacity-60
                        "
                            >
                              {connectingId === wallet.id
                                ? "Menghubungkan..."
                                : "Hubungkan"}
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
      </div>
    </div>
  );
}
