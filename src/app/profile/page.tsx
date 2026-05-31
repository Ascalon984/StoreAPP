"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Check,
  X,
  Bell,
  Info,
  LogOut,
  Phone,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Gift,
  CircleQuestionMark,
  CalendarCheck,
} from "lucide-react";
import Image from "next/image";

// ── Mock data ──
const mockUser = {
  name: "Pengguna",
  username: "pengguna1",
  email: "user_1@email.com",
  phone: "081-234-5678",
  avatar: null,
};

const mockNotifPrefs = { orderUpdates: true, promoOffers: false };
const mockPoints = {
  total: 12450,
  transactionPoints: 11250,
  checkinPoints: 1200,
  dailyStreak: 4,
  checkedInToday: false,
  rewardStreakPoints: 100,
};

// ── Helper ──
function getInitials(name: string): string {
  if (!name.trim()) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── Sub-components ──
function AvatarCircle({
  name,
  src,
  size = 56,
}: {
  name: string;
  src: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full border-2 border-white shadow-lg overflow-hidden flex-shrink-0 bg-gray-100"
      >
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full border-2 border-white shadow-lg overflow-hidden flex-shrink-0 bg-gray-100"
    >
      <img
        src="/icons/avatar.png"
        alt="avatar"
        className="w-full h-full object-cover opacity-70"
      />
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mx-4 mt-5 mb-2">
      <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
        {label}
      </h2>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${on ? "bg-emerald-500" : "bg-gray-200"}`}
      aria-checked={on}
      role="switch"
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${on ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

function FieldRow({
  label,
  value,
  icon,
  editingField,
  fieldKey,
  onEditStart,
  onEditCancel,
  onEditSave,
  editValue,
  setEditValue,
  inputType = "text",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  editingField: string | null;
  fieldKey: string;
  onEditStart: (key: string, val: string) => void;
  onEditCancel: () => void;
  onEditSave: (key: string) => void;
  editValue: string;
  setEditValue: (v: string) => void;
  inputType?: string;
}) {
  const isEditing = editingField === fieldKey;
  const isDisabled = editingField !== null && !isEditing;

  return (
    <div
      className={`px-4 py-3 transition-colors ${isDisabled ? "opacity-60" : ""}`}
    >
      <div
        className={`flex ${isEditing ? "items-stretch" : "items-start"} gap-3`}
      >
        {!isEditing && (
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 leading-none mb-1">
            {label}
          </p>
          {isEditing ? (
            <input
              type={inputType}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={onEditCancel}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditSave(fieldKey);
                if (e.key === "Escape") onEditCancel();
              }}
              autoFocus
              className="w-full text-[13px] font-medium text-gray-800 bg-gray-50 rounded-lg px-2.5 py-1.5 outline-none border border-emerald-600/50 focus:border-emerald-600 transition-colors duration-150"
            />
          ) : (
            <p className="text-[13px] font-medium text-gray-800 truncate">
              {value || "—"}
            </p>
          )}
        </div>
        {isEditing ? (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onEditSave(fieldKey)}
            className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 active:scale-90 transition-all flex-shrink-0 self-end"
          >
            <Check size={15} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={() => !isDisabled && onEditStart(fieldKey, value)}
            disabled={isDisabled}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 active:scale-90 transition-all flex-shrink-0 mt-0.5"
          >
            <Pencil size={15} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Points Card (muncul setelah profil lengkap) ──
function PointsCard({
  points,
  onOpenInfo,
}: {
  points: {
    total: number;
    transactionPoints: number;
    checkinPoints: number;
    dailyStreak: number;
    checkedInToday: boolean;
    rewardStreakPoints: number;
  };
  onOpenInfo: () => void;
}) {
  const [currentStreak, setCurrentStreak] = useState(points.dailyStreak);
  const [displayTotal, setDisplayTotal] = useState(points.total);
  const [showFloating, setShowFloating] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showFloating100, setShowFloating100] = useState(false);

  const playPointReward = (
    reward: number,
    setFloating: (v: boolean) => void,
  ) => {
    setFloating(true);

    setTimeout(() => {
      setFloating(false);

      const end = displayTotal + reward;
      let current = displayTotal;

      const interval = setInterval(() => {
        current += reward >= 100 ? 2 : 1;

        if (current >= end) {
          current = end;
          clearInterval(interval);
        }

        setDisplayTotal(current);
      }, 60);
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

// ── Main Page ──
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const [notifPrefs, setNotifPrefs] = useState(mockNotifPrefs);
  const [dataPribadiOpen, setDataPribadiOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pointsInfoOpen, setPointsInfoOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar,
  );
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const pengaturanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cropSrc) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cropSrc]);

  // ── Hitung kelengkapan profil (shared logic) ──
  const isProfileComplete =
    !!user.name.trim() &&
    !!user.email.trim() &&
    !!user.phone.trim() &&
    !!avatarPreview;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(
      centerCrop(
        makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
        width,
        height,
      ),
    );
  };

  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;
    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      200,
      200,
    );
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setAvatarPreview(URL.createObjectURL(blob));
        setCropSrc(null);
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleEditStart = (key: string, val: string) => {
    setEditingField(key);
    setEditValue(val);
  };
  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue("");
  };
  const handleEditSave = (key: string) => {
    setUser((prev) => ({ ...prev, [key]: editValue }));
    handleEditCancel();
  };

  const handleLengkapi = () => {
    setDataPribadiOpen(true);
    setTimeout(() => {
      pengaturanRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  return (
    <div className="min-h-screen bg-gray-50/80 pb-24">
      {/* ── CONVEX HERO HEADER ── */}
      <div className="relative">
        {/* HEADER BACKGROUND (SAMA DENGAN HOME NAVBAR) */}
        <div className="absolute top-0 left-0 w-full h-[158px] z-0 bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46] rounded-b-[18px]" />

        {/* CONTENT */}
        <div className="relative z-10 px-4 pt-4 pb-0 flex items-start justify-between">
          {/* LEFT: AVATAR + NAME */}
          <div className="flex items-start gap-3.5">
            <div className="relative flex-shrink-0">
              <AvatarCircle name={user.name} src={avatarPreview} size={46} />
              <label className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-white border border-white-500 flex items-center justify-center shadow-sm active:scale-90 transition-all cursor-pointer">
                <Pencil
                  size={9}
                  strokeWidth={2.5}
                  className="text-emerald-700"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div className="flex flex-col leading-tight">
              <h1 className="text-[16px] font-black text-white tracking-tight">
                {user.name || "Pengguna"}
              </h1>
              <p className="text-[11px] text-white/70 font-medium tracking-wide mt-1.5">
                @{user.username}
              </p>
            </div>
          </div>

          {/* RIGHT: LIVE CHAT */}
          <div className="flex-shrink-0 -mt-0.5">
            <button
              onClick={() => router.push("/chat?source=profile")}
              aria-label="Buka Live Chat"
              className="relative w-8 h-8 flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-sm"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle cx="9" cy="12" r="1" fill="#111" />
                <circle cx="12" cy="12" r="1" fill="#111" />
                <circle cx="15" cy="12" r="1" fill="#111" />
              </svg>

              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>

        {/* spacing bawah agar overlap card tetap enak */}
        <div className="h-[55px]" />
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="relative z-10 -mt-[45px]">
        <PointsCard
          points={mockPoints}
          onOpenInfo={() => setPointsInfoOpen(true)}
        />

        {/* ── SINGLE SETTINGS CARD ── */}
        <div ref={pengaturanRef} className="mt-7" />

        <div className="mx-3 bg-white rounded-xl overflow-hidden">
          {/* ── Data Pribadi ── */}
          <button
            onClick={() => {
              setDataPribadiOpen((p) => !p);
              setEditingField(null);
            }}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                <User size={15} className="text-gray-500" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-800 leading-none">
                  Data Pribadi
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  Nama, email, no telepon
                </p>
              </div>
            </div>
            {dataPribadiOpen ? (
              <ChevronDown size={20} className="text-gray-400" />
            ) : (
              <ChevronRight size={20} className="text-gray-400" />
            )}
          </button>

          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: dataPribadiOpen ? "500px" : "0px",
              opacity: dataPribadiOpen ? 1 : 0,
            }}
          >
            <div className="border-t border-gray-100 divide-y divide-gray-100/60">
              <FieldRow
                label="Nama Lengkap"
                fieldKey="name"
                value={user.name}
                icon={<User size={14} />}
                inputType="text"
                editingField={editingField}
                editValue={editValue}
                setEditValue={setEditValue}
                onEditStart={handleEditStart}
                onEditCancel={handleEditCancel}
                onEditSave={handleEditSave}
              />
              <FieldRow
                label="Email"
                fieldKey="email"
                value={user.email}
                icon={<Mail size={15} />}
                inputType="email"
                editingField={editingField}
                editValue={editValue}
                setEditValue={setEditValue}
                onEditStart={handleEditStart}
                onEditCancel={handleEditCancel}
                onEditSave={handleEditSave}
              />
              <FieldRow
                label="Nomor Telepon"
                fieldKey="phone"
                value={user.phone}
                icon={<Phone size={15} />}
                inputType="tel"
                editingField={editingField}
                editValue={editValue}
                setEditValue={setEditValue}
                onEditStart={handleEditStart}
                onEditCancel={handleEditCancel}
                onEditSave={handleEditSave}
              />
            </div>
          </div>

          <div className="ml-[60px] border-t border-gray-100/80" />

          {/* ── Notifikasi ── */}
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                <Bell size={15} className="text-gray-500" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-800 leading-none">
                  Preferensi Notifikasi
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  Atur notifikasi yang kamu terima
                </p>
              </div>
            </div>
            {notifOpen ? (
              <ChevronDown size={20} className="text-gray-400" />
            ) : (
              <ChevronRight size={20} className="text-gray-400" />
            )}
          </button>

          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: notifOpen ? "300px" : "0px",
              opacity: notifOpen ? 1 : 0,
            }}
          >
            <div className="border-t border-gray-100 divide-y divide-gray-100/60">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 leading-none">
                    Update Pesanan
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Info status pemesanan real-time
                  </p>
                </div>
                <Toggle
                  on={notifPrefs.orderUpdates}
                  onToggle={() =>
                    setNotifPrefs((p) => ({
                      ...p,
                      orderUpdates: !p.orderUpdates,
                    }))
                  }
                />
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 leading-none">
                    Promo & Penawaran
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Diskon dan voucher eksklusif
                  </p>
                </div>
                <Toggle
                  on={notifPrefs.promoOffers}
                  onToggle={() =>
                    setNotifPrefs((p) => ({
                      ...p,
                      promoOffers: !p.promoOffers,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="ml-[60px] border-t border-gray-100/80" />

          {/* ── Kebijakan & Privasi ── */}
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <ShieldCheck
                size={15}
                className="text-gray-500"
                strokeWidth={2.5}
              />
            </div>
            <span className="flex-1 text-left text-[13px] font-semibold text-gray-800">
              Kebijakan & Privasi
            </span>
            <ArrowRight size={16} className="text-gray-300" />
          </button>

          {/* ── Tentang Aplikasi ── */}
          <button className="w-full flex items-center gap-3 px-4 pt-3 pb-4 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <Info size={17} className="text-gray-500" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-left text-[13px] font-semibold text-gray-800">
              Tentang Aplikasi
            </span>
            <ArrowRight size={16} className="text-gray-300" />
          </button>
        </div>

        {/* ── CTA Logout ── */}
        <div className="mx-3 mt-4 mb-2">
          <button className="group w-full py-3.5 px-4 rounded-xl border border-red-200 hover:border-red-400 hover:bg-red-500 active:scale-[0.96] transition-all duration-200 flex items-center justify-center gap-2">
            <LogOut
              size={15}
              strokeWidth={2}
              className="text-red-400 group-hover:text-white transition-colors duration-200"
            />
            <span className="font-semibold text-[13px] text-red-400 group-hover:text-white transition-colors duration-200">
              Keluar Akun
            </span>
          </button>
        </div>
      </div>

      {/* Modal Crop */}
      {cropSrc && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 pb-0 sm:pb-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCropSrc(null)}
          />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-[360px] max-h-[84vh] flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[13px] font-bold text-gray-800">
                Sesuaikan Foto
              </p>
              <button
                onClick={() => setCropSrc(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-90 transition-all"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
            <div
              className="crop-scroll flex-1 min-h-0 overflow-y-auto bg-gray-50 p-2"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              <div className="min-w-full flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  minWidth={60}
                >
                  <img
                    ref={imgRef}
                    src={cropSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="w-full h-auto block"
                  />
                </ReactCrop>
              </div>
            </div>
            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100">
              <button
                onClick={handleCropConfirm}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-[13px] font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Gunakan Foto Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── POINTS INFO MODAL ── */}
      {pointsInfoOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">
          {/* BACKDROP */}
          <button
            onClick={() => setPointsInfoOpen(false)}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
          />

          {/* MODAL */}
          <div className="relative w-full max-w-[320px] rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            {/* CLOSE */}
            <button
              onClick={() => setPointsInfoOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 active:scale-90 transition-all flex items-center justify-center"
            >
              <X size={15} className="text-gray-400" strokeWidth={2.5} />
            </button>

            {/* CONTENT */}
            <div className="px-5 pt-5 pb-5">
              <div className="flex items-center gap-2">
                <img src="/icons/poin.svg" alt="Poin" className="w-5 h-5" />

                <h3 className="text-[15px] font-bold text-gray-900">
                  Cara Mendapatkan Poin
                </h3>
              </div>

              <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
                Poin kamu didapat dari transaksi dan aktivitas check-in harian.
                Semakin sering kamu bertransaksi dan menjaga streak check-in,
                semakin banyak poin yang terkumpul.
              </p>

              {/* LIST */}
              <div className="mt-5 space-y-3">
                {[
                  "Dapatkan poin setiap kali melakukan transaksi.",
                  "Bonus poin bertambah saat kamu check-in berturut-turut.",
                  "Streak check-in meningkatkan total reward mingguan kamu.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />

                    <p className="text-[11px] leading-relaxed text-gray-600">
                      {item}
                    </p>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <img
                      src="/icons/Tips.png"
                      alt="Tips"
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                    />

                    <p className="text-[11px] leading-relaxed text-gray-500">
                      Pertahankan streak check-in untuk bonus poin maksimal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
