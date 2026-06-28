"use client";

import { useState, useRef, useEffect } from "react";
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
import PointsCard from "@/components/PointsCard";
import { AvatarCircle, Toggle, FieldRow } from "@/components/ProfileComponents";

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
        <div 
          className="absolute top-0 left-0 w-full z-0 bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46] rounded-b-[18px]"
          style={{ height: "calc(158px + env(safe-area-inset-top))" }}
        />

        {/* CONTENT */}
        <div 
          className="relative z-10 px-4 pb-0 flex items-start justify-between"
          style={{ paddingTop: "calc(16px + env(safe-area-inset-top))" }}
        >
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
              className="crop-scroll flex-1 min-h-0 overflow-y-auto bg-white p-2"
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
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            onClick={() => setPointsInfoOpen(false)}
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
