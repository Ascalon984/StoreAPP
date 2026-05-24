"use client";

import { useState, useRef } from "react";
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
const mockStats = { orders: 12, favorites: 8, reviews: 4 };

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

function formatStat(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

// ── Sub-components ──
function AvatarCircle({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0 bg-gray-100">
        <Image
          src={src}
          alt={name}
          width={96}
          height={96}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }
  return (
    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
      <span className="text-emerald-700 font-black text-2xl tracking-tight">
        {getInitials(name)}
      </span>
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
        className={`flex ${isEditing ? "items-center" : "items-start"} gap-3`}
      >
        {!isEditing && (
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
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
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onEditCancel}
              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-90 transition-all"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => onEditSave(fieldKey)}
              className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 active:scale-90 transition-all"
            >
              <Check size={13} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => !isDisabled && onEditStart(fieldKey, value)}
            disabled={isDisabled}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 active:scale-90 transition-all flex-shrink-0 mt-0.5"
          >
            <Pencil size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Profile Completion Card ──
function ProfileCompletion({
  user,
  avatarPreview,
  onLengkapi,
}: {
  user: { name: string; username: string; email: string; phone: string };
  avatarPreview: string | null;
  onLengkapi: () => void;
}) {
  const items = [
    { label: "Nama Lengkap", done: !!user.name.trim() },
    { label: "Email", done: !!user.email.trim() },
    { label: "No. Telepon", done: !!user.phone.trim() },
    { label: "Foto Profil", done: !!avatarPreview },
  ];

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = Math.round((completed / total) * 100);
  const isComplete = pct === 100;

  function getCopy(n: number): string {
    if (n === 0) return "Mulai lengkapi profilmu!";
    if (n === 3) return "Tinggal 1 langkah lagi";
    if (n === 4) return "Profilmu sudah lengkap";
    return "Yuk, lengkapi data profilmu!";
  }

  const copy = getCopy(completed);

  const S = 58;
  const SW = 6;
  const R = (S - SW) / 2;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct / 100);

  return (
    <div className="mx-3 mt-5 bg-white rounded-2xl ring-1 ring-slate-900/[0.04] shadow-layer-xs px-3.5 py-4 min-h-[88px]">
      <div className="grid grid-cols-[58px_1fr_auto] gap-x-3 items-start">
        <div
          className="row-span-2 row-start-1 col-start-1 self-center relative flex-shrink-0"
          style={{ width: S, height: S }}
        >
          <svg width={S} height={S} className="-rotate-90">
            <circle
              cx={S / 2}
              cy={S / 2}
              r={R}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={SW}
            />
            <circle
              cx={S / 2}
              cy={S / 2}
              r={R}
              fill="none"
              stroke={isComplete ? "#059669" : "#10b981"}
              strokeWidth={SW}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[13px] font-black text-gray-900 leading-none">
              {pct}
              <span className="text-[8px] font-bold text-gray-500 ml-px">
                %
              </span>
            </span>
          </div>
        </div>

        <p className="row-start-1 col-start-2 text-[13px] font-bold text-gray-800 leading-tight">
          Kelengkapan Profil
        </p>

        <div className="row-start-1 col-start-3 justify-self-end">
          {isComplete ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-600 whitespace-nowrap">
              Lengkap
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-transparent text-[10px] font-bold text-gray-600 tabular-nums whitespace-nowrap">
              {completed}/{total} terisi
            </span>
          )}
        </div>

        <div className="row-start-2 col-start-2 col-span-2 flex items-center justify-between gap-3">
          <p
            className={`text-[11px] font-medium leading-snug ${
              isComplete ? "text-emerald-700" : "text-gray-500"
            }`}
          >
            {copy}
          </p>

          {isComplete ? (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 whitespace-nowrap">
              <Check size={10} strokeWidth={3} /> Selesai
            </span>
          ) : (
            <button
              onClick={onLengkapi}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-[10px] font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20 whitespace-nowrap"
            >
              Lengkapi
              <ArrowRight size={10} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stats Card (muncul setelah profil lengkap) ──
function StatsCard({
  stats,
}: {
  stats: { orders: number; favorites: number; reviews: number };
}) {
  return (
    <div className="mx-3 mt-5 bg-white rounded-2xl ring-1 ring-slate-900/[0.04] shadow-layer-xs px-3.5 py-4 min-h-[88px]">
      <div className="flex-1 flex flex-col items-center gap-0.5">
        <span className="text-[17px] font-black text-gray-900 leading-none tabular-nums">
          {formatStat(stats.orders)}
        </span>
        <span className="text-[10px] font-medium text-gray-400 mt-0.5">
          Pesanan
        </span>
      </div>
      <div className="w-px h-9 bg-gray-200/80" />
      <div className="flex-1 flex flex-col items-center gap-0.5">
        <span className="text-[17px] font-black text-gray-900 leading-none tabular-nums">
          {formatStat(stats.favorites)}
        </span>
        <span className="text-[10px] font-medium text-gray-400 mt-0.5">
          Favorit
        </span>
      </div>
      <div className="w-px h-9 bg-gray-200/80" />
      <div className="flex-1 flex flex-col items-center gap-0.5">
        <span className="text-[17px] font-black text-gray-900 leading-none tabular-nums">
          {formatStat(stats.reviews)}
        </span>
        <span className="text-[10px] font-medium text-gray-400 mt-0.5">
          Ulasan
        </span>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const [notifPrefs, setNotifPrefs] = useState(mockNotifPrefs);
  const [dataPribadiOpen, setDataPribadiOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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
        <div className="absolute top-0 left-0 w-full h-[230px] z-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="dots"
                x="0"
                y="0"
                width="4"
                height="4"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="0.7" fill="white" fillOpacity="0.18" />
              </pattern>

              <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="1" />{" "}
                {/* ← max 1 */}
                <stop offset="60%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>

              <mask id="dotMask">
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  fill="url(#fadeDown)"
                />
              </mask>
            </defs>

            {/* Background hijau */}
            <path d="M0 0 H100 V70 Q50 95 0 70 Z" fill="#048750" />

            {/* Dots dengan fade ke bawah via mask */}
            <rect
              x="0"
              y="0"
              width="100"
              height="100"
              fill="url(#dots)"
              mask="url(#dotMask)"
            />

            {/* Strip amber */}
            <path d="M0 70 Q50 95 100 70 V78 Q50 103 0 78 Z" fill="#D89B2B" />
          </svg>
        </div>

        {/* Live Chat di pojok kanan atas hero header */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => router.push("/chat?source=profile")}
            aria-label="Buka Live Chat"
            className="relative w-10 h-10 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-sm"
            >
              {/* Body bubble — stroke putih */}
              <path
               d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                fill="white"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dot-dot — stroke/fill hitam */}
              <circle cx="9" cy="12" r="1" fill="#111" />
              <circle cx="12" cy="12" r="1" fill="#111" />
              <circle cx="15" cy="12" r="1" fill="#111" />
            </svg>
            {/* Dot rose di luar, dot hitam di dalam icon */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-white" />
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center pt-10 pb-0">
          <div className="relative">
            <AvatarCircle name={user.name} src={avatarPreview} />
            <label className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm hover:bg-emerald-600 active:scale-90 transition-all cursor-pointer">
              <Pencil size={10} strokeWidth={2.5} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <h1 className="text-[17px] font-black text-white tracking-tight leading-none mt-3 min-h-[17px]">
            {user.name || "Pengguna"}
          </h1>
          {/* Username permanen — diambil dari user.username, tidak bisa diedit */}
          <p className="text-[12px] text-white/60 font-medium mt-0.5 tracking-wide">
            @{user.username}
          </p>
        </div>
        <div className="h-[80px]" />
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="relative z-10 -mt-[60px]">
        {/* ══════════════════════════════════════════
            SWAP ZONE: Profile Completion ↔ Stats
            ══════════════════════════════════════════ */}
        {isProfileComplete ? (
          <StatsCard stats={mockStats} />
        ) : (
          <ProfileCompletion
            user={user}
            avatarPreview={avatarPreview}
            onLengkapi={handleLengkapi}
          />
        )}

        {/* ── SECTION: Pengaturan Akun ── */}
        <div ref={pengaturanRef}>
          <SectionLabel label="Pengaturan Akun" />
        </div>

        <div className="mx-3 bg-white rounded-xl ring-1 ring-slate-900/[0.04] shadow-layer-xs overflow-hidden">
          {/* Data Pribadi */}
          <button
            onClick={() => {
              setDataPribadiOpen((p) => !p);
              setEditingField(null);
            }}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <User size={16} className="text-gray-500" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-800 leading-none">
                  Data Pribadi
                </p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                  Nama, email, no telepon
                </p>
              </div>
            </div>
            {dataPribadiOpen ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
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
              {/* ── Data Pribadi fields ──
                  Catatan: username TIDAK dimasukkan di sini karena bersifat permanen.
                  Yang bisa diubah hanya: nama, email, dan nomor telepon.
              ── */}
              <FieldRow
                label="Nama Lengkap"
                fieldKey="name"
                value={user.name}
                icon={<User size={14} />}
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
                icon={<Mail size={14} />}
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
                icon={<Phone size={14} />}
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

          <div className="border-t border-gray-100" />

          {/* Notifikasi */}
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <Bell size={16} className="text-gray-500" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-800 leading-none">
                  Preferensi Notifikasi
                </p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                  Atur notifikasi yang kamu terima
                </p>
              </div>
            </div>
            {notifOpen ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
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
                  <p className="text-[10px] text-gray-600 font-medium mt-0.5">
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
                  <p className="text-[10px] text-gray-600 font-medium mt-0.5">
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
        </div>

        {/* ── SECTION: Informasi ── */}
        <SectionLabel label="Informasi" />
        <div className="mx-3 bg-white rounded-xl ring-1 ring-slate-900/[0.04] shadow-layer-xs overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
              <ShieldCheck
                size={16}
                className="text-gray-500"
                strokeWidth={2.5}
              />
            </div>
            <span className="flex-1 text-left text-[13px] font-semibold text-gray-800">
              Kebijakan & Privasi
            </span>
            <ArrowRight size={15} className="text-gray-300" />
          </button>
          <div className="border-t border-gray-100" />
          <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
              <Info size={16} className="text-gray-500" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-left text-[13px] font-semibold text-gray-800">
              Tentang Aplikasi
            </span>
            <ArrowRight size={15} className="text-gray-300" />
          </button>
        </div>

        {/* ── CTA Logout ── */}
        <div className="mx-3 mt-6">
          <button className="group w-full py-3.5 px-4 rounded-xl border border-amber-600/40 hover:border-amber-600 hover:bg-amber-600 active:scale-[0.96] transition-all duration-200 flex items-center justify-center gap-2">
            <LogOut
              size={16}
              strokeWidth={2}
              className="text-amber-600 group-hover:text-white transition-colors duration-200"
            />
            <span className="font-bold text-sm text-gray-700 group-hover:text-white transition-colors duration-200">
              Keluar Akun
            </span>
          </button>
        </div>
      </div>

      {/* Modal Crop */}
      {cropSrc && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[8vh]">
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
                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-90 transition-all"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 p-2">
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
    </div>
  );
}
