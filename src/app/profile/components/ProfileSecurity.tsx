"use client";

import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Smartphone,
  Mail,
  KeyRound,
  History,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { NavRowButton } from "./ProfileNavRow";
import { useNavigationStore } from "@/store/useNavigationStore";

export default function ProfileSecurity() {
  const [isOpen, setIsOpen] = useState(false);
  const setProfileSubPageOpen = useNavigationStore(
    (s) => s.setProfileSubPageOpen,
  );

  const openPanel = () => {
    setIsOpen(true);
    setProfileSubPageOpen(true);
  };
  const closePanel = () => {
    setIsOpen(false);
    setProfileSubPageOpen(false);
  };
  const [subPage, setSubPage] = useState<{ id: string; title: string } | null>(
    null,
  );

  const [keamananData] = useState({
    phone: "0812****3456",
    phoneVerified: true,
    email: "u***r@email.com",
    emailVerified: true,
    pinSet: true,
    lastPasswordChange: "15 Jan 2025",
  });

  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [pinDigits, setPinDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [confirmPinDigits, setConfirmPinDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinInput = (
    index: number,
    value: string,
    type: "new" | "confirm",
  ) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const setFn = type === "new" ? setPinDigits : setConfirmPinDigits;
    const current = type === "new" ? pinDigits : confirmPinDigits;
    const refs = type === "new" ? pinRefs : confirmPinRefs;

    const next = [...current];
    next[index] = digit;
    setFn(next);

    if (digit && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePinKeydown = (
    index: number,
    e: React.KeyboardEvent,
    type: "new" | "confirm",
  ) => {
    if (e.key === "Backspace") {
      const current = type === "new" ? pinDigits : confirmPinDigits;
      const refs = type === "new" ? pinRefs : confirmPinRefs;
      const setFn = type === "new" ? setPinDigits : setConfirmPinDigits;

      if (!current[index] && index > 0) {
        const next = [...current];
        next[index - 1] = "";
        setFn(next);
        refs.current[index - 1]?.focus();
      } else {
        const next = [...current];
        next[index] = "";
        setFn(next);
      }
    }
  };

  const [loginHistory] = useState([
    {
      device: "iPhone 15 Pro",
      location: "Jakarta, ID",
      time: "Hari ini, 14:32",
      status: "aktif" as const,
    },
    {
      device: "Chrome · Windows",
      location: "Jakarta, ID",
      time: "Kemarin, 09:15",
      status: "berhasil" as const,
    },
    {
      device: "Samsung Galaxy S24",
      location: "Bandung, ID",
      time: "20 Jun 2025, 18:45",
      status: "berhasil" as const,
    },
    {
      device: "Safari · macOS",
      location: "Surabaya, ID",
      time: "18 Jun 2025, 11:20",
      status: "gagal" as const,
    },
    {
      device: "Chrome · Android",
      location: "Jakarta, ID",
      time: "15 Jun 2025, 08:00",
      status: "berhasil" as const,
    },
  ]);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  /* ────────────────────────────────────────────
     List items config
  ──────────────────────────────────────────── */
  const securityItems = [
    {
      id: "ubah-no-hp",
      title: "Nomor HP",
      icon: Smartphone,
      subtitle: keamananData.phone,
      badge: keamananData.phoneVerified ? "Terverifikasi" : null,
    },
    {
      id: "ubah-email",
      title: "Email",
      icon: Mail,
      subtitle: keamananData.email,
      badge: keamananData.emailVerified ? "Terverifikasi" : null,
    },
    {
      id: "ubah-pin",
      title: "PIN Transaksi",
      icon: KeyRound,
      subtitle: keamananData.pinSet ? "Sudah diatur" : "Belum diatur",
      badge: null,
    },
    {
      id: "ubah-password",
      title: "Password",
      icon: Lock,
      subtitle: `Diubah ${keamananData.lastPasswordChange}`,
      badge: null,
    },
    {
      id: "riwayat-login",
      title: "Riwayat Login",
      icon: History,
      subtitle: "Lihat perangkat yang pernah login",
      badge: null,
    },
  ];

  /* ────────────────────────────────────────────
     Render: Main List (AddressPage list style)
  ──────────────────────────────────────────── */
  const renderList = () => (
    <div className="py-4">
      <div className="bg-white">
        {securityItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id}>
              <div
                onClick={() =>
                  setSubPage({ id: item.id, title: `Ubah ${item.title}` })
                }
                className="relative px-4 py-4 cursor-pointer active:bg-gray-50 transition-colors"
              >
                {item.badge && (
                  <span className="absolute top-4 right-4 h-7 px-2.5 rounded-md border border-blue-600 bg-white text-[10px] font-semibold text-blue-700 flex items-center">
                    {item.badge}
                  </span>
                )}

                <div className="flex items-start gap-2.5 mb-1.5">
                  <Icon size={15} className="shrink-0 text-gray-500 mt-0.5" />
                  <h3
                    className={`min-w-0 flex-1 truncate text-[14px] font-semibold text-gray-800 ${
                      item.badge ? "pr-24" : ""
                    }`}
                  >
                    {item.title}
                  </h3>
                </div>

                <p className="text-[12px] text-gray-500 pl-[26px]">
                  {item.subtitle}
                </p>
              </div>

              {index !== securityItems.length - 1 && (
                <div className="mx-4 h-px bg-gray-100" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  /* ────────────────────────────────────────────
     Render: Ubah Password
  ──────────────────────────────────────────── */
  const renderUbahPassword = () => {
    const pwLen = passwordForm.newPassword.length;
    const strength =
      pwLen >= 12 ? "Kuat" : pwLen >= 8 ? "Sedang" : pwLen >= 3 ? "Lemah" : "";
    const strengthColor =
      pwLen >= 12
        ? "bg-green-400"
        : pwLen >= 8
          ? "bg-yellow-400"
          : pwLen >= 3
            ? "bg-red-400"
            : "bg-gray-200";
    const isMatch =
      passwordForm.confirmPassword &&
      passwordForm.newPassword === passwordForm.confirmPassword;
    const isMismatch =
      passwordForm.confirmPassword &&
      passwordForm.newPassword !== passwordForm.confirmPassword;
    const canSubmit =
      passwordForm.oldPassword &&
      passwordForm.newPassword.length >= 8 &&
      passwordForm.newPassword === passwordForm.confirmPassword;

    return (
      <>
        <div className="py-4">
          <div className="bg-white px-4 py-4">
            <div className="space-y-4">
              {/* Password Lama */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-700">
                  Password Lama
                </label>
                <div className="flex items-center border-b border-gray-100 pb-1.5">
                  <input
                    type={showOldPw ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        oldPassword: e.target.value,
                      }))
                    }
                    placeholder="Masukkan password lama"
                    className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPw(!showOldPw)}
                    className="text-gray-400 ml-2 shrink-0"
                  >
                    {showOldPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-700">
                  Password Baru
                </label>
                <div className="flex items-center border-b border-gray-100 pb-1.5">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Minimal 8 karakter"
                    className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="text-gray-400 ml-2 shrink-0"
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="flex items-center gap-1 pt-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          pwLen >= lvl * 3 ? strengthColor : "bg-gray-200"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-2">
                      {strength}
                    </span>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-700">
                  Konfirmasi Password Baru
                </label>
                <div className="flex items-center border-b border-gray-100 pb-1.5">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({
                        ...f,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Ulangi password baru"
                    className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="text-gray-400 ml-2 shrink-0"
                  >
                    {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {isMatch && (
                  <p className="text-[10px] text-green-600 pt-1 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Password cocok
                  </p>
                )}
                {isMismatch && (
                  <p className="text-[10px] text-red-500 pt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> Password tidak cocok
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
          <button
            disabled={!canSubmit}
            onClick={() => {
              setPasswordForm({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              showToast("Password berhasil diubah");
              setSubPage(null);
            }}
            className={`w-full py-3.5 rounded-lg text-[13.5px] font-bold transition-all ${
              canSubmit
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Simpan Password Baru
          </button>
        </div>
      </>
    );
  };

  /* ────────────────────────────────────────────
     Render: Ubah PIN
  ──────────────────────────────────────────── */
  const renderUbahPIN = () => {
    const pinComplete = pinDigits.every((d) => d !== "");
    const confirmComplete = confirmPinDigits.every((d) => d !== "");
    const pinsMatch =
      pinComplete &&
      confirmComplete &&
      pinDigits.join("") === confirmPinDigits.join("");
    const pinsMismatch =
      confirmComplete && pinDigits.join("") !== confirmPinDigits.join("");
    const canSubmit = pinComplete && confirmComplete && pinsMatch;

    return (
      <>
        <div className="py-4">
          <div className="bg-white px-4 py-4">
            <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
              PIN transaksi digunakan untuk memverifikasi pembayaran dan
              penarikan dana. Gunakan 6 digit angka.
            </p>

            <div className="space-y-5">
              {/* PIN Baru */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-gray-700">
                  PIN Baru
                </label>
                <div className="flex justify-center gap-2.5">
                  {pinDigits.map((digit, i) => (
                    <input
                      key={`pin-${i}`}
                      ref={(el) => {
                        pinRefs.current[i] = el;
                      }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinInput(i, e.target.value, "new")}
                      onKeyDown={(e) => handlePinKeydown(i, e, "new")}
                      className="w-10 h-11 text-center text-[18px] font-bold text-gray-800 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Konfirmasi PIN */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-gray-700">
                  Konfirmasi PIN Baru
                </label>
                <div className="flex justify-center gap-2.5">
                  {confirmPinDigits.map((digit, i) => (
                    <input
                      key={`cpin-${i}`}
                      ref={(el) => {
                        confirmPinRefs.current[i] = el;
                      }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handlePinInput(i, e.target.value, "confirm")
                      }
                      onKeyDown={(e) => handlePinKeydown(i, e, "confirm")}
                      className="w-10 h-11 text-center text-[18px] font-bold text-gray-800 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                  ))}
                </div>
                {pinsMatch && (
                  <p className="text-[10px] text-green-600 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 size={10} /> PIN cocok
                  </p>
                )}
                {pinsMismatch && (
                  <p className="text-[10px] text-red-500 text-center flex items-center justify-center gap-1">
                    <AlertCircle size={10} /> PIN tidak cocok
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
          <button
            disabled={!canSubmit}
            onClick={() => {
              setPinDigits(["", "", "", "", "", ""]);
              setConfirmPinDigits(["", "", "", "", "", ""]);
              showToast("PIN berhasil diubah");
              setSubPage(null);
            }}
            className={`w-full py-3.5 rounded-lg text-[13.5px] font-bold transition-all ${
              canSubmit
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Simpan PIN Baru
          </button>
        </div>
      </>
    );
  };

  /* ────────────────────────────────────────────
     Render: Ubah No HP
  ──────────────────────────────────────────── */
  const renderUbahNoHP = () => (
    <>
      <div className="py-4">
        <div className="bg-white px-4 py-4">
          <div className="space-y-4">
            {/* Nomor HP Saat Ini */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">
                Nomor HP Saat Ini
              </label>
              <div className="flex items-center border-b border-gray-100 pb-1.5 gap-2">
                <input
                  type="text"
                  value={keamananData.phone}
                  disabled
                  className="flex-1 bg-transparent text-[13px] text-gray-400 outline-none cursor-not-allowed"
                />
                <span className="text-[10px] font-semibold text-blue-700 shrink-0">
                  Terverifikasi
                </span>
              </div>
            </div>

            {/* Nomor HP Baru */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">
                Nomor HP Baru
              </label>
              <div className="flex items-center border-b border-gray-100 pb-1.5 gap-2">
                <span className="text-[13px] text-gray-500 shrink-0">+62</span>
                <input
                  type="tel"
                  placeholder="8xx xxxx xxxx"
                  className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Kode Verifikasi */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">
                Kode Verifikasi
              </label>
              <div className="flex items-center border-b border-gray-100 pb-1.5 gap-2">
                <input
                  type="text"
                  placeholder="Masukkan 6 digit kode"
                  maxLength={6}
                  className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400 tracking-[.25em] text-center"
                />
                <button className="text-[11px] font-semibold text-blue-600 shrink-0 active:opacity-70 transition-opacity">
                  Kirim Kode
                </button>
              </div>
              <p className="text-[10px] text-gray-400">
                Kode verifikasi akan dikirim via SMS
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <button
          onClick={() => {
            showToast("Nomor HP berhasil diubah");
            setSubPage(null);
          }}
          className="w-full py-3.5 rounded-lg text-[13.5px] font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          Simpan Nomor HP
        </button>
      </div>
    </>
  );

  /* ────────────────────────────────────────────
     Render: Ubah Email
  ──────────────────────────────────────────── */
  const renderUbahEmail = () => (
    <>
      <div className="py-4">
        <div className="bg-white px-4 py-4">
          <div className="space-y-4">
            {/* Email Saat Ini */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">
                Email Saat Ini
              </label>
              <div className="flex items-center border-b border-gray-100 pb-1.5 gap-2">
                <input
                  type="email"
                  value={keamananData.email}
                  disabled
                  className="flex-1 bg-transparent text-[13px] text-gray-400 outline-none cursor-not-allowed"
                />
                <span className="text-[10px] font-semibold text-blue-700 shrink-0">
                  Terverifikasi
                </span>
              </div>
            </div>

            {/* Email Baru */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">
                Email Baru
              </label>
              <div className="flex items-center border-b border-gray-100 pb-1.5">
                <input
                  type="email"
                  placeholder="contoh@email.com"
                  className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Kode Verifikasi */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">
                Kode Verifikasi
              </label>
              <div className="flex items-center border-b border-gray-100 pb-1.5 gap-2">
                <input
                  type="text"
                  placeholder="Masukkan 6 digit kode"
                  maxLength={6}
                  className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400 tracking-[.25em] text-center"
                />
                <button className="text-[11px] font-semibold text-blue-600 shrink-0 active:opacity-70 transition-opacity">
                  Kirim Kode
                </button>
              </div>
              <p className="text-[10px] text-gray-400">
                Kode verifikasi akan dikirim ke email baru
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <button
          onClick={() => {
            showToast("Email berhasil diubah");
            setSubPage(null);
          }}
          className="w-full py-3.5 rounded-lg text-[13.5px] font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          Simpan Email
        </button>
      </div>
    </>
  );

  /* ────────────────────────────────────────────
     Render: Riwayat Login
  ──────────────────────────────────────────── */
  const renderRiwayatLogin = () => {
    const activeSessions = loginHistory.filter((l) => l.status === "aktif");
    const otherSessions = loginHistory.filter((l) => l.status !== "aktif");

    return (
      <div className="py-4 space-y-3">
        {/* Sesi Aktif */}
        {activeSessions.length > 0 && (
          <div className="bg-white">
            <div className="px-4 pt-3 pb-0.5">
              <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                Sesi Aktif
              </p>
            </div>
            {activeSessions.map((item, i) => (
              <React.Fragment key={`active-${i}`}>
                <div className="relative px-4 py-3.5">
                  <span className="absolute top-3.5 right-4 h-7 px-2.5 rounded-md border border-blue-600 bg-white text-[10px] font-semibold text-blue-700 flex items-center">
                    Aktif
                  </span>

                  <div className="flex items-start gap-2.5 mb-1">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={13} className="text-blue-500" />
                    </div>
                    <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-800 pr-16">
                      {item.device}
                    </h3>
                  </div>

                  <p className="text-[11px] text-gray-500 pl-[34px]">
                    {item.location} · {item.time}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Perangkat Lain */}
        {otherSessions.length > 0 && (
          <div className="bg-white">
            <div className="px-4 pt-3 pb-0.5">
              <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                Perangkat Lain
              </p>
            </div>
            {otherSessions.map((item, i) => {
              const isFailed = item.status === "gagal";
              return (
                <React.Fragment key={`other-${i}`}>
                  <div className="relative px-4 py-3.5">
                    <span
                      className={`absolute top-3.5 right-4 h-6 px-2 rounded-md text-[10px] font-semibold flex items-center ${
                        isFailed
                          ? "border border-red-200 text-red-500 bg-red-50"
                          : "border border-gray-200 text-gray-400 bg-white"
                      }`}
                    >
                      {isFailed ? "Gagal" : "Berhasil"}
                    </span>

                    <div className="flex items-start gap-2.5 mb-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isFailed ? "bg-red-50" : "bg-gray-100"
                        }`}
                      >
                        {isFailed ? (
                          <AlertCircle size={13} className="text-red-400" />
                        ) : (
                          <History size={13} className="text-gray-400" />
                        )}
                      </div>
                      <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-800 pr-16">
                        {item.device}
                      </h3>
                    </div>

                    <p className="text-[11px] text-gray-500 pl-[34px]">
                      {item.location} · {item.time}
                    </p>
                  </div>

                  {i !== otherSessions.length - 1 && (
                    <div className="mx-4 h-px bg-gray-100" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Tombol Keluar Semua Perangkat */}
        <button
          onClick={() => showToast("Semua perangkat lain telah dikeluarkan")}
          className="w-full py-3 rounded-lg text-[13px] font-semibold text-red-500 bg-red-50 active:scale-[0.98] transition-all"
        >
          Keluar dari Semua Perangkat Lain
        </button>
      </div>
    );
  };

  /* ────────────────────────────────────────────
     Sub-page router
  ──────────────────────────────────────────── */
  const renderSubPage = () => {
    switch (subPage?.id) {
      case "ubah-password":
        return renderUbahPassword();
      case "ubah-pin":
        return renderUbahPIN();
      case "ubah-no-hp":
        return renderUbahNoHP();
      case "ubah-email":
        return renderUbahEmail();
      case "riwayat-login":
        return renderRiwayatLogin();
      default:
        return null;
    }
  };

  /* ────────────────────────────────────────────
     Main Render
  ──────────────────────────────────────────── */
  return (
    <>
      <NavRowButton
        key="keamanan"
        icon={ShieldCheck}
        title="Keamanan Akun"
        subtitle="Nomor HP, email, PIN, password, riwayat login"
        page="keamanan-akun"
        onClick={openPanel}
      />

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-right-full duration-300">
          {/* ── Header ── */}
          <div
            className={`bg-white px-4 py-3 flex items-center sticky top-0 z-30 ${
              subPage ? "shadow-sm" : "border-b border-gray-100"
            }`}
            style={{ gap: subPage ? "4px" : "2px" }}
          >
            <button
              onClick={subPage ? () => setSubPage(null) : closePanel}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors -translate-x-[5px]"
            >
              <ArrowLeft size={22} className="text-gray-700" />
            </button>

            <h1
              className={`font-bold -translate-x-[2px] ${
                subPage
                  ? "text-[16px] text-gray-800"
                  : "text-[15px] text-gray-700"
              }`}
            >
              {subPage ? subPage.title : "Keamanan Akun"}
            </h1>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto pb-20">
            {subPage ? renderSubPage() : renderList()}
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gray-800 text-white text-[12px] font-medium px-4 py-2.5 rounded-full shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
