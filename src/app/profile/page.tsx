'use client';

import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import {
  ChevronRight, ChevronUp, ChevronDown,
  Pencil, Check, X, Bell, HelpCircle, Info,
  ShoppingBag, Heart, Star, LogOut, Trash2,
  MapPinHouse, MapPinPlus, Phone, Mail, User, ArrowRight
} from 'lucide-react';
import Image from 'next/image';

// ── Mock data — ganti dengan store/API asli ──
const mockUser = {
  name: 'Ahmad Fauzi',
  email: 'ahmad@email.com',
  phone: '081-234-5678',
  avatar: null,
  memberSince: '2026',
};

const initialAddresses = [
  { id: '1', label: 'Rumah', address: 'Jl. Melati No. 12, Telang Indah, Kamal', isMain: true },
  { id: '2', label: 'Kantor', address: 'Gedung Rektorat Lt. 2, Universitas Trunojoyo Madura, Kamal', isMain: false }
];

const mockStats = {
  orders: 12,
  favorites: 8,
  reviews: 4,
};

const mockNotifPrefs = {
  orderUpdates: true,
  promoOffers: false,
};

// ── Helper ──
function formatStat(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Sub-components ──

function AvatarCircle({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      <div className="w-24 h-24 rounded-full border-4 border-white shadow-elevation-2
        overflow-hidden flex-shrink-0 bg-gray-100"> {/* ← bg-gray-100 sebagai fallback area transparan */}
        <Image src={src} alt={name} width={96} height={96} className="object-cover w-full h-full" />
      </div>
    );
  }
  return (
    <div className="w-24 h-24 rounded-full border-4 border-white shadow-elevation-2
      bg-emerald-100 flex items-center justify-center flex-shrink-0">
      <span className="text-emerald-700 font-black text-2xl tracking-tight">
        {getInitials(name)}
      </span>
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-elevation-1 border border-gray-100/80
      flex flex-col items-center justify-center py-2.5 gap-0.5">
      <span className="text-[16px] font-black text-gray-900 leading-none">
        {formatStat(value)}
      </span>
      <span className="text-[10px] font-medium text-gray-400">{label}</span>
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
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${on ? 'bg-emerald-500' : 'bg-gray-200'
        }`}
      aria-checked={on}
      role="switch"
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${on ? 'left-[22px]' : 'left-0.5'
        }`} />
    </button>
  );
}

// ── Field row with inline edit ──
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
  inputType = 'text',
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
    <div className={`px-4 py-3 transition-colors ${isDisabled ? 'opacity-60' : ''}`}>
      {/* Container utama — items-center saat editing, items-start saat read */}
      <div className={`flex ${isEditing ? 'items-center' : 'items-start'} gap-3`}>

        {/* Icon kiri — sembunyikan saat editing agar tidak sesak */}
        {!isEditing && (
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100
            flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 leading-none mb-1">{label}</p>
          {isEditing ? (
            <input
              type={inputType}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus
              className="w-full text-[13px] font-medium text-gray-800
                bg-gray-50 rounded-lg px-2.5 py-1.5 outline-none
                border border-emerald-600/50
                focus:border-emerald-600
                transition-colors duration-150"
            />
          ) : (
            <p className="text-[13px] font-medium text-gray-800 truncate">{value || '—'}</p>
          )}
        </div>
        {/* Tombol aksi */}
        {isEditing ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onEditCancel}
              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center
                text-gray-500 hover:bg-gray-200 active:scale-90 transition-all"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => onEditSave(fieldKey)}
              className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center
                text-white hover:bg-emerald-600 active:scale-90 transition-all"
            >
              <Check size={13} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => !isDisabled && onEditStart(fieldKey, value)}
            disabled={isDisabled}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-gray-300 hover:text-emerald-500 hover:bg-emerald-50
              active:scale-90 transition-all flex-shrink-0 mt-0.5"
          >
            <Pencil size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function ProfilePage() {
  const [user, setUser] = useState(mockUser);
  const [notifPrefs, setNotifPrefs] = useState(mockNotifPrefs);

  const [dataPribadiOpen, setDataPribadiOpen] = useState(false);
  const [alamatOpen, setAlamatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [addresses, setAddresses] = useState(initialAddresses);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Address editing state
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddrLabel, setEditAddrLabel] = useState('');
  const [editAddrText, setEditAddrText] = useState('');

  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrText, setNewAddrText] = useState('');

  // Preview avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);

  // Crop states
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  // Handler pick image
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
      width, height
    );
    setCrop(initial);
  };

  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX, completedCrop.y * scaleY,
      completedCrop.width * scaleX, completedCrop.height * scaleY,
      0, 0, 200, 200
    );
    canvas.toBlob(blob => {
      if (!blob) return;
      const croppedUrl = URL.createObjectURL(blob);
      setAvatarPreview(croppedUrl);
      setCropSrc(null);
    }, 'image/jpeg', 0.9);
  };

  const handleDeleteAddr = (id: string) => {
    setAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      // Jika yang dihapus adalah utama, otomatis set yang pertama jadi utama
      const hasMain = filtered.some(a => a.isMain);
      if (!hasMain && filtered.length > 0) {
        return filtered.map((a, i) => ({ ...a, isMain: i === 0 }));
      }
      return filtered;
    });
  };

  const handleAddAddrSave = () => {
    if (!newAddrLabel.trim() || !newAddrText.trim()) return;
    const newAddr = {
      id: Date.now().toString(),
      label: newAddrLabel.trim(),
      address: newAddrText.trim(),
      isMain: addresses.length === 0,
    };
    setAddresses(prev => [...prev, newAddr]);
    setNewAddrLabel('');
    setNewAddrText('');
    setAddingAddress(false);
  };

  const handleAddAddrCancel = () => {
    setNewAddrLabel('');
    setNewAddrText('');
    setAddingAddress(false);
  };

  const canDelete = addresses.length > 1;   // tidak bisa hapus kalau tinggal 1
  const canAdd = addresses.length < 3;   // maks 3 alamat

  const handleEditStart = (key: string, val: string) => {
    setEditingField(key);
    setEditValue(val);
  };
  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };
  const handleEditSave = (key: string) => {
    setUser(prev => ({ ...prev, [key]: editValue }));
    setEditingField(null);
    setEditValue('');
  };

  const handleEditAddrStart = (addr: any) => {
    setEditingAddressId(addr.id);
    setEditAddrLabel(addr.label);
    setEditAddrText(addr.address);
  };

  const handleEditAddrSave = () => {
    setAddresses(prev => prev.map(a =>
      a.id === editingAddressId ? { ...a, label: editAddrLabel, address: editAddrText } : a
    ));
    setEditingAddressId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50/80 pb-24">

      {/* ── CONVEX HERO HEADER ── */}
      <div className="relative">

        {/* SVG Convex background — referensi dari codebase */}
        <div className="absolute top-0 left-0 w-full h-[230px] z-0">
          <svg
            className="w-full h-full antialiased"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* LAYER 1: Emerald Utama */}
            <path d="M0 0 H100 V70 Q50 95 0 70 Z" fill="#065F46" />

            {/* LAYER 2: Shape N Amber */}
            <path d="M0 70 Q50 95 100 70 V78 Q50 103 0 78 Z" fill="#B45309" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center pt-10 pb-0">
          {/* Avatar + edit button */}
          <div className="relative">
            <AvatarCircle name={user.name} src={avatarPreview} />

            {/* Tombol edit — trigger input file */}
            <label className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500
              border-2 border-white flex items-center justify-center shadow-sm
              hover:bg-emerald-600 active:scale-90 transition-all cursor-pointer">
              <Pencil size={10} strokeWidth={2.5} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          {/* Nama saja di sini, masih di area gelap */}
          <h1 className="text-[17px] font-black text-white tracking-tight leading-none mt-3">
            {user.name}
          </h1>
        </div>

        {/* Spacer to push content below the convex curve */}
        <div className="h-[100px]" />
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="relative z-10 -mt-[60px]">

        {/* Member sejak — tepat di bawah amber, sebelum stats */}
        <p className="text-center text-[11px] text-gray-600 font-medium mb-4 mt-3">
          Terdaftar sejak {user.memberSince}
        </p>

        {/* Quick Stats — 1 card dengan divider vertikal */}
        <div className="mx-3 bg-white rounded-2xl shadow-layer-md border border-gray-100/80
  flex items-center">

          <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
            <span className="text-[16px] font-black text-gray-900 leading-none">
              {formatStat(mockStats.orders)}
            </span>
            <span className="text-[10px] font-medium text-gray-400">Pesanan</span>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
            <span className="text-[16px] font-black text-gray-900 leading-none">
              {formatStat(mockStats.favorites)}
            </span>
            <span className="text-[10px] font-medium text-gray-400">Favorit</span>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
            <span className="text-[16px] font-black text-gray-900 leading-none">
              {formatStat(mockStats.reviews)}
            </span>
            <span className="text-[10px] font-medium text-gray-400">Ulasan</span>
          </div>

        </div>

        {/* ── SECTION: Pengaturan Akun ── */}
        <SectionLabel label="Pengaturan Akun" />
        <div className="mx-3 bg-white rounded-xl shadow-layer-xs border border-gray-100/80 overflow-hidden">

          {/* Row 1: Data Pribadi */}
          <button
            onClick={() => { setDataPribadiOpen(p => !p); setEditingField(null); }}
            className="w-full flex items-center justify-between px-4 py-3.5
              hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <User size={15} className="text-gray-500" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-800 leading-none">Data Pribadi</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Nama, email, no telepon</p>
              </div>
            </div>
            {dataPribadiOpen
              ? <ChevronDown size={16} className="text-gray-400" />
              : <ChevronRight size={16} className="text-gray-400" />
            }
          </button>

          {/* Accordion body: Data Pribadi */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: dataPribadiOpen ? '500px' : '0px', opacity: dataPribadiOpen ? 1 : 0 }}
          >
            <div className="border-t border-gray-100 divide-y divide-gray-100/60">
              <FieldRow
                label="Nama Lengkap" fieldKey="name" value={user.name}
                icon={<User size={14} />} inputType="text"
                editingField={editingField} editValue={editValue}
                setEditValue={setEditValue}
                onEditStart={handleEditStart} onEditCancel={handleEditCancel} onEditSave={handleEditSave}
              />
              <FieldRow
                label="Email" fieldKey="email" value={user.email}
                icon={<Mail size={14} />} inputType="email"
                editingField={editingField} editValue={editValue}
                setEditValue={setEditValue}
                onEditStart={handleEditStart} onEditCancel={handleEditCancel} onEditSave={handleEditSave}
              />
              <FieldRow
                label="Nomor Telepon" fieldKey="phone" value={user.phone}
                icon={<Phone size={14} />} inputType="tel"
                editingField={editingField} editValue={editValue}
                setEditValue={setEditValue}
                onEditStart={handleEditStart} onEditCancel={handleEditCancel} onEditSave={handleEditSave}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Row 2: Alamat Pengiriman */}
          <button
            onClick={() => setAlamatOpen(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3.5
              hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <MapPinHouse size={15} className="text-gray-500" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-800 leading-none">Alamat Pengiriman</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Kelola alamat pengiriman pesanan</p>
              </div>
            </div>
            {alamatOpen
              ? <ChevronDown size={16} className="text-gray-400" />
              : <ChevronRight size={16} className="text-gray-400" />
            }
          </button>

          {/* Accordion body: Alamat Pengiriman */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: alamatOpen ? '500px' : '0px', opacity: alamatOpen ? 1 : 0 }}
          >
            <div className="border-t border-gray-100 p-3 flex flex-col gap-3">
              {addresses.map(addr => {
                const isEditing = editingAddressId === addr.id;

                return (
                  <div
                    key={addr.id}
                    className="p-3 rounded-xl border border-gray-100"
                  >
                    {isEditing ? (
                      // ── Edit mode: full-width inputs, buttons top-right ──
                      <div className="space-y-2">
                        {/* Row atas: label input + tombol X/✓ */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editAddrLabel}
                            onChange={e => setEditAddrLabel(e.target.value)}
                            placeholder="Label (Contoh: Rumah)"
                            className="flex-1 text-[12px] font-bold text-gray-800 bg-gray-50 rounded-lg
            px-2.5 py-1.5 outline-none border border-emerald-600/50
            focus:border-emerald-600 transition-all"
                          />
                          <button
                            onClick={() => setEditingAddressId(null)}
                            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center
            text-gray-500 hover:bg-gray-200 transition-all active:scale-90 flex-shrink-0"
                          >
                            <X size={13} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={handleEditAddrSave}
                            className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center
            text-white hover:bg-emerald-600 transition-all active:scale-90 flex-shrink-0"
                          >
                            <Check size={13} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Row bawah: textarea full-width */}
                        <textarea
                          value={editAddrText}
                          onChange={e => setEditAddrText(e.target.value)}
                          placeholder="Alamat lengkap..."
                          rows={2}
                          className="w-full text-[11px] font-medium text-gray-700 bg-gray-50 rounded-lg
          px-2.5 py-1.5 outline-none border border-emerald-600/50
          focus:border-emerald-600 resize-none transition-all"
                        />
                      </div>
                    ) : (
                      // ── Read mode: tetap sama ──
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0 flex items-center justify-center">
                          <label className={`flex items-center justify-center w-4 h-4 rounded-full border cursor-pointer relative ${addr.isMain ? 'border-emerald-500' : 'border-gray-300'
                            }`}>
                            <input
                              type="radio"
                              name="mainAddress"
                              checked={addr.isMain}
                              onChange={() => setAddresses(prev =>
                                prev.map(a => ({ ...a, isMain: a.id === addr.id }))
                              )}
                              className="opacity-0 absolute w-full h-full cursor-pointer"
                            />
                            {addr.isMain && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                          </label>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-bold text-gray-800">{addr.label}</span>
                            {addr.isMain && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 leading-snug pr-2">{addr.address}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!addr.isMain && canDelete && (
                            <button
                              onClick={() => handleDeleteAddr(addr.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300
                                hover:text-red-400 hover:bg-red-50 transition-all active:scale-90"
                            >
                              <Trash2 size={13} strokeWidth={2.5} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddrStart(addr)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300
                              hover:text-emerald-500 hover:bg-emerald-50 transition-all active:scale-90"
                          >
                            <Pencil size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {addingAddress && (
                <div className="p-3 rounded-xl border border-gray-100 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newAddrLabel}
                      onChange={e => setNewAddrLabel(e.target.value)}
                      placeholder="Label (Contoh: Kos)"
                      autoFocus
                      className="flex-1 text-[12px] font-bold text-gray-800 bg-gray-50 rounded-lg
                        px-2.5 py-1.5 outline-none border border-emerald-600/50 transition-all"
                    />
                    <button
                      onClick={handleAddAddrCancel}
                      className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center
                        text-gray-500 hover:bg-gray-200 transition-all active:scale-90 flex-shrink-0"
                    >
                      <X size={13} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={handleAddAddrSave}
                      className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center
                        text-white hover:bg-emerald-600 transition-all active:scale-90 flex-shrink-0"
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                  <textarea
                    value={newAddrText}
                    onChange={e => setNewAddrText(e.target.value)}
                    placeholder="Alamat lengkap..."
                    rows={2}
                    className="w-full text-[11px] font-medium text-gray-700 bg-gray-50 rounded-lg
                      px-2.5 py-1.5 outline-none border border-emerald-600/50 resize-none transition-all"
                  />
                </div>
              )}

              {canAdd && !addingAddress && (
                <button
                  onClick={() => setAddingAddress(true)}
                  className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl
                    text-[12px] font-bold text-gray-500
                    hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50
                    transition-all flex items-center justify-center gap-2"
                >
                  <MapPinPlus size={14} strokeWidth={2.5} /> Tambah Alamat Baru
                </button>
              )}

              {!canAdd && !addingAddress && (
                <p className="text-center text-[10px] text-gray-400 font-medium py-1">
                  Maksimal 3 alamat tersimpan
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Row 3: Preferensi Notifikasi */}
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3.5
              hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <Bell size={15} className="text-gray-500" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-800 leading-none">Preferensi Notifikasi</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Atur notifikasi yang kamu terima</p>
              </div>
            </div>
            {notifOpen
              ? <ChevronDown size={16} className="text-gray-400" />
              : <ChevronRight size={16} className="text-gray-400" />
            }
          </button>

          {/* Accordion body: Notifikasi */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: notifOpen ? '200px' : '0px', opacity: notifOpen ? 1 : 0 }}
          >
            <div className="border-t border-gray-100 divide-y divide-gray-100/60">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 leading-none">Update Pesanan</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">Info status pengiriman real-time</p>
                </div>
                <Toggle on={notifPrefs.orderUpdates} onToggle={() =>
                  setNotifPrefs(p => ({ ...p, orderUpdates: !p.orderUpdates }))
                } />
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 leading-none">Promo & Penawaran</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">Diskon dan voucher eksklusif</p>
                </div>
                <Toggle on={notifPrefs.promoOffers} onToggle={() =>
                  setNotifPrefs(p => ({ ...p, promoOffers: !p.promoOffers }))
                } />
              </div>
            </div>
          </div>

        </div>

        {/* ── SECTION: Bantuan & Aplikasi ── */}
        <SectionLabel label="Bantuan & Aplikasi" />
        <div className="mx-3 bg-white rounded-xl shadow-layer-xs border border-gray-100/80 overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3.5
            hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
              <HelpCircle size={15} className="text-gray-500" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-left text-[13px] font-semibold text-gray-800">Pusat Bantuan</span>
            <ArrowRight size={15} className="text-gray-300" />
          </button>

          <div className="border-t border-gray-100" />

          <button className="w-full flex items-center gap-3 px-4 py-3.5
            hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
              <Info size={15} className="text-gray-500" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-left text-[13px] font-semibold text-gray-800">Tentang Aplikasi</span>
            <ArrowRight size={15} className="text-gray-300" />
          </button>
        </div>

        {/* ── CTA Logout ── */}
        <div className="mx-3 mt-6">
          <button className="group w-full py-3.5 px-4 rounded-xl
    border border-amber-600/40
    hover:border-amber-600
    hover:bg-amber-600
    active:scale-[0.96]
    transition-all duration-200
    flex items-center justify-center gap-2">

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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCropSrc(null)} />

          {/* Modal container — perlebar dari 320 → 360, kurangi padding crop area */}
          <div className="relative bg-white rounded-2xl shadow-elevation-3
  max-w-[360px] w-full overflow-hidden animate-scale-in">

            {/* Header — sama */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[13px] font-bold text-gray-800">Sesuaikan Foto</p>
              <button onClick={() => setCropSrc(null)}
                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center
        text-gray-500 hover:bg-gray-200 active:scale-90 transition-all">
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Crop area — kurangi padding, batasi tinggi gambar */}
            <div className="px-2 py-2 flex items-center justify-center bg-gray-50">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                minWidth={60}
              >
                <img
                  ref={imgRef}
                  src={cropSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-[180px] w-full object-cover"
                />
              </ReactCrop>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100">
              <button onClick={handleCropConfirm}
                className="w-full py-2.5 rounded-xl bg-emerald-600
        text-[13px] font-bold text-white
        hover:bg-emerald-700 active:scale-95 transition-all">
                Gunakan Foto Ini
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
