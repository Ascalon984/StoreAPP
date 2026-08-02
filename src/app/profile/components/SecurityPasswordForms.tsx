"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

/* ────────────────────────────────────────────
   Reusable: OTP Box Input (6 digit)
   Style diambil dari AuthForgotPassword.tsx
──────────────────────────────────────────── */
export function OtpBoxInput({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  // Ref untuk menandai bahwa focus() dipanggil secara programatik (bukan tap user),
  // sehingga handleFocus tidak salah mengalihkan fokus berdasarkan value stale.
  const pendingFocusIndex = useRef<number | null>(null);

  useEffect(() => {
    if (autoFocus) {
      // sedikit delay supaya reliable saat elemen baru mount (mis. modal/section baru muncul)
      const t = setTimeout(() => {
        pendingFocusIndex.current = 0;
        refs.current[0]?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const handleInput = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);

    if (digit && index < value.length - 1) {
      // tandai dulu sebelum focus() agar handleFocus tidak membaca value stale
      pendingFocusIndex.current = index + 1;
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeydown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        const next = [...value];
        next[index - 1] = "";
        onChange(next);
        pendingFocusIndex.current = index - 1;
        refs.current[index - 1]?.focus();
      } else {
        const next = [...value];
        next[index] = "";
        onChange(next);
      }
    }
  };

  const handleFocus = (index: number) => {
    // Jika fokus ini dipicu secara programatik (auto-advance / backspace),
    // langsung terima — jangan redirect ulang berdasarkan value stale.
    if (pendingFocusIndex.current === index) {
      pendingFocusIndex.current = null;
      setFocusedIndex(index);
      return;
    }
    pendingFocusIndex.current = null;

    // Tap manual: arahkan ke box kosong pertama yang seharusnya diisi
    const firstEmpty = value.findIndex((d) => d === "");
    const allowedIndex = firstEmpty === -1 ? value.length - 1 : firstEmpty;

    if (value[index] === "" && index !== allowedIndex) {
      pendingFocusIndex.current = allowedIndex;
      refs.current[allowedIndex]?.focus();
      return;
    }
    setFocusedIndex(index);
  };

  return (
    <div className="flex justify-center gap-2.5">
      {value.map((digit, i) => {
        const isFocused = i === focusedIndex;
        return (
          <div
            key={i}
            className={`relative flex h-12 w-11 items-center justify-center rounded-lg border text-[17px] font-bold transition-colors duration-150 ${
              isFocused
                ? "border-emerald-600 bg-white text-gray-800"
                : digit
                  ? "border-emerald-600 bg-white text-emerald-700"
                  : "border-gray-200 bg-gray-50 text-gray-800"
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
              onFocus={() => handleFocus(i)}
              onBlur={() =>
                setFocusedIndex((prev) => (prev === i ? null : prev))
              }
              className="absolute inset-0 h-full w-full bg-transparent text-center text-[17px] font-bold text-inherit outline-none caret-transparent"
            />
            {!digit && isFocused && (
              <span className="pointer-events-none h-5 w-[2px] rounded-full bg-emerald-600 animate-blink" />
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
export function useOtpCooldown(storageKey: string) {
  // Inisialisasi sinkron dari sessionStorage agar cooldown tidak pernah
  // dimulai dari 0 saat component mount ulang (menghindari effect reset otpSent
  // yang salah memicu ilustrasi OTP di komponen consumer).
  const [cooldown, setCooldown] = useState(() => {
    if (typeof window === "undefined") return 0;
    const until = Number(sessionStorage.getItem(storageKey) || 0);
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = (until: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setCooldown(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        sessionStorage.removeItem(storageKey);
      }
    }, 1000);
  };

  const start = () => {
    const until = Date.now() + 60_000;
    sessionStorage.setItem(storageKey, String(until));
    setCooldown(60);
    tick(until);
  };

  // Jalankan interval tick saat mount jika cooldown masih aktif
  useEffect(() => {
    const until = Number(sessionStorage.getItem(storageKey) || 0);
    const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
    if (remaining > 0) {
      tick(until);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return { cooldown, start };
}

/* ────────────────────────────────────────────
   Form: Ubah Password
──────────────────────────────────────────── */
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
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Simpan Password Baru
        </button>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────
   Form: Ubah PIN
──────────────────────────────────────────── */
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
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Simpan PIN Baru
        </button>
      </div>
    </>
  );
}
