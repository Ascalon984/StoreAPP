import React, { useState, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
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
import { Toggle, FieldRow } from "@/components/ProfileComponents";

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface ProfileContentProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  points: any;
  onOpenPointsInfo: () => void;
}

export default function ProfileContent({ user, setUser, points, onOpenPointsInfo }: ProfileContentProps) {
  const [notifPrefs, setNotifPrefs] = useState({ orderUpdates: true, promoOffers: false });
  const [dataPribadiOpen, setDataPribadiOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const pengaturanRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative z-10 -mt-[45px]">
      <PointsCard
        points={points}
        onOpenInfo={onOpenPointsInfo}
      />

      {/* ── QUICK ACCESS ROW ── */}
      <div className="mx-2 mt-3 bg-white rounded-lg shadow-sm flex translate-y-[10px]">
        {[
          { label: "Alamat Saya", icon: "/icons/adress.png" },
          { label: "Metode Pembayaran", icon: "/icons/payment.png" },
          { label: "Terakhir Dilihat", icon: "/icons/last_seen.png" },
        ].map(({ label, icon }) => (
          <button
            key={label}
            className="flex-1 flex flex-col items-center justify-center gap-2 py-2 active:bg-gray-50 transition-colors"
          >
            <img
              src={icon}
              alt={label}
              className="w-[28px] h-[28px] object-contain"
            />
            <span
              className="text-[9.5px] font-semibold text-white tracking-[0.02em]"
              style={{
                WebkitTextStroke: "1.8px black",
                paintOrder: "stroke fill",
              }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ── SINGLE SETTINGS CARD ── */}
      <div
        ref={pengaturanRef}
        className="mx-2 mt-5 bg-white rounded-lg overflow-hidden scroll-mt-4"
      >
        {/* ── Label Pengaturan (di dalam wrapper) ── */}
        <div className="px-4 pt-3.5 pb-1">
          <p className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
            Pengaturan
          </p>
        </div>
      </div>

      <div className="mx-2 bg-white rounded-lg overflow-hidden">
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
  );
}
