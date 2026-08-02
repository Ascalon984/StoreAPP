"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, CheckCircle2, CircleCheckBig } from "lucide-react";
import { formatPhoneNumber, parsePhoneInput } from "@/utils/phone";

/* ────────────────────────────────────────────
   Reusable: OTP Box Input (6 digit)
   Style diambil dari AuthForgotPassword.tsx
──────────────────────────────────────────── */
function OtpBoxInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);

    if (digit && index < value.length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeydown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        const next = [...value];
        next[index - 1] = "";
        onChange(next);
        refs.current[index - 1]?.focus();
      } else {
        const next = [...value];
        next[index] = "";
        onChange(next);
      }
    }
  };

  return (
    <div className="flex justify-center gap-2.5">
      {value.map((digit, i) => {
        const isActive = i === value.findIndex((d) => d === "");
        return (
          <div
            key={i}
            className={`relative w-11 h-12 rounded-xl border flex items-center justify-center text-[17px] font-bold transition-all duration-150 ${
              digit
                ? "border-blue-600 bg-white text-gray-800 scale-105"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeydown(i, e)}
              className="absolute inset-0 w-full h-full text-center bg-transparent outline-none text-[17px] font-bold text-gray-800 caret-blue-600"
            />
            {!digit && isActive && (
              <span className="w-[2px] h-5 bg-blue-600 animate-pulse pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────
   Reusable: Cooldown hook untuk kirim/kirim ulang OTP
──────────────────────────────────────────── */
function useOtpCooldown() {
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { cooldown, start };
}

export function UbahPasswordForm({
  onClose,
  showToast,
}: {
  onClose: () => void;
  showToast: (msg: string) => void;
}) {
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
                  Password cocok
                </p>
              )}
              {isMismatch && (
                <p className="text-[10px] text-red-500 pt-1 flex items-center gap-1">
                  Password tidak cocok
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
            onClose();
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
}

export function UbahPINForm({
  onClose,
  showToast,
}: {
  onClose: () => void;
  showToast: (msg: string) => void;
}) {
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
            PIN transaksi digunakan untuk memverifikasi pembayaran dan penarikan
            dana. Gunakan 6 digit angka.
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
                  PIN cocok
                </p>
              )}
              {pinsMismatch && (
                <p className="text-[10px] text-red-500 text-center flex items-center justify-center gap-1">
                  PIN tidak cocok
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
            onClose();
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
}

export function UbahNoHPForm({
  onClose,
  showToast,
  currentPhone,
}: {
  onClose: () => void;
  showToast: (msg: string) => void;
  currentPhone: string;
}) {
  const [newPhone, setNewPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const { cooldown, start } = useOtpCooldown();

  const isPhoneValid = /^62\d{11}$/.test(newPhone);
  const otpComplete = otp.every((d) => d !== "");
  const canSubmit = isPhoneValid && otpSent && otpComplete;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parsePhoneInput(raw, newPhone);
    setNewPhone(parsed);
  };

  const handleSendOtp = () => {
    if (!isPhoneValid || cooldown > 0) return;
    setOtpSent(true);
    setOtp(["", "", "", "", "", ""]);
    start();
    showToast("Kode OTP telah dikirim via SMS");
  };

  return (
    <>
      <div className="py-4">
        <div className="bg-white px-4 py-4">
          <div className="space-y-4">
            {/* Nomor HP Saat Ini */}
            <div className="rounded-lg bg-gray-50 shadow-inner px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold text-gray-500">
                Nomor HP Saat Ini
              </p>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-gray-700">
                    {formatPhoneNumber(currentPhone)}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 translate-y-[2px]">
                  <CircleCheckBig size={14} className="text-emerald-600" />
                  <span className="text-[10px] font-medium text-emerald-700 translate-y-[0.1px]">
                    Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            {/* Nomor HP Baru */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">
                Nomor HP Baru
              </label>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-1.5">
                <input
                  type="tel"
                  placeholder="08xx xxxx xxxx"
                  value={newPhone ? formatPhoneNumber(newPhone) : ""}
                  onChange={handlePhoneChange}
                  className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isPhoneValid || cooldown > 0}
                  className={`shrink-0 text-[11px] font-semibold transition-opacity ${
                    !isPhoneValid || cooldown > 0
                      ? "cursor-not-allowed text-gray-300"
                      : "text-blue-600 active:opacity-70"
                  }`}
                >
                  {cooldown > 0
                    ? `${cooldown} dtk`
                    : otpSent
                      ? "Kirim Ulang"
                      : "Kirim OTP"}
                </button>
              </div>
            </div>

            {/* Kode Verifikasi (Box Style) */}
            {otpSent && (
              <div className="flex flex-col gap-2 pt-1">
                <label className="text-[11px] font-semibold text-gray-700 text-center">
                  Masukkan Kode Verifikasi
                </label>
                <OtpBoxInput value={otp} onChange={setOtp} />
                <p className="text-[10px] text-gray-400 text-center">
                  Kode verifikasi dikirim via SMS ke nomor baru
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <button
          disabled={!canSubmit}
          onClick={() => {
            showToast("Nomor HP berhasil diubah");
            onClose();
          }}
          className={`w-full py-3.5 rounded-lg text-[13.5px] font-bold transition-all ${
            canSubmit
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Simpan Nomor HP
        </button>
      </div>
    </>
  );
}

export function UbahEmailForm({
  onClose,
  showToast,
  currentEmail,
}: {
  onClose: () => void;
  showToast: (msg: string) => void;
  currentEmail: string;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const { cooldown, start } = useOtpCooldown();

  const isEmailValid = /\S+@\S+\.\S+/.test(newEmail);
  const otpComplete = otp.every((d) => d !== "");
  const canSubmit = isEmailValid && otpSent && otpComplete;

  const handleSendOtp = () => {
    if (!isEmailValid || cooldown > 0) return;
    setOtpSent(true);
    setOtp(["", "", "", "", "", ""]);
    start();
    showToast("Kode OTP telah dikirim ke email baru");
  };

  return (
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
                  value={currentEmail}
                  disabled
                  className="flex-1 bg-transparent text-[13px] text-gray-400 outline-none cursor-not-allowed"
                />

                <CheckCircle2
                  size={17}
                  strokeWidth={2.2}
                  className="shrink-0 text-emerald-500"
                />
              </div>
            </div>

            {/* Email Baru */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-gray-700">
                  Email Baru
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isEmailValid || cooldown > 0}
                  className={`text-[11px] font-semibold shrink-0 active:opacity-70 transition-opacity ${
                    !isEmailValid || cooldown > 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-blue-600"
                  }`}
                >
                  {cooldown > 0
                    ? `Kirim ulang (${cooldown}d)`
                    : otpSent
                      ? "Kirim Ulang OTP"
                      : "Kirim OTP"}
                </button>
              </div>
              <div className="flex items-center border-b border-gray-100 pb-1.5">
                <input
                  type="email"
                  placeholder="contoh@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Kode Verifikasi (Box Style) */}
            {otpSent && (
              <div className="flex flex-col gap-2 pt-1">
                <label className="text-[11px] font-semibold text-gray-700 text-center">
                  Masukkan Kode Verifikasi
                </label>
                <OtpBoxInput value={otp} onChange={setOtp} />
                <p className="text-[10px] text-gray-400 text-center">
                  Kode verifikasi dikirim ke email baru
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <button
          disabled={!canSubmit}
          onClick={() => {
            showToast("Email berhasil diubah");
            onClose();
          }}
          className={`w-full py-3.5 rounded-lg text-[13.5px] font-bold transition-all ${
            canSubmit
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Simpan Email
        </button>
      </div>
    </>
  );
}

export function RiwayatLoginForm({
  loginHistory,
  showToast,
}: {
  loginHistory: {
    device: string;
    location: string;
    time: string;
    status: "aktif" | "berhasil" | "gagal";
  }[];
  showToast: (msg: string) => void;
}) {
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
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5"></div>
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
}
