"use client";

import React from "react";
import { useState, useEffect } from "react";
import { formatPhoneNumber, parsePhoneInput } from "@/utils/phone";
import {
  normalizeEmailLight,
  normalizeEmailOnBlur,
} from "@/utils/normalizeEmail";
import { OtpBoxInput, useOtpCooldown } from "./SecurityPasswordForms";
import Image from "next/image";

/* ────────────────────────────────────────────
   Form: Ubah Nomor HP
──────────────────────────────────────────── */
export function UbahNoHPForm({
  onClose,
  showToast,
  currentPhone,
}: {
  onClose: () => void;
  showToast: (msg: string) => void;
  currentPhone: string;
}) {
  const STORAGE_KEY = "form_ubah_nohp_state";

  const [newPhone, setNewPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(`${STORAGE_KEY}_phone`) || "";
  });
  const [otpSent, setOtpSent] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(`${STORAGE_KEY}_sent`) === "1";
  });
  const [otpSentForPhone, setOtpSentForPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(`${STORAGE_KEY}_sent_for`) || "";
  });
  const [otp, setOtp] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["", "", "", "", "", ""];
    const saved = sessionStorage.getItem(`${STORAGE_KEY}_otp`);
    return saved ? JSON.parse(saved) : ["", "", "", "", "", ""];
  });
  const [justSent, setJustSent] = useState(false);
  const { cooldown, start } = useOtpCooldown("otp_cooldown_phone");

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_phone`, newPhone);
  }, [newPhone]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_sent`, otpSent ? "1" : "0");
  }, [otpSent]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_sent_for`, otpSentForPhone);
  }, [otpSentForPhone]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_otp`, JSON.stringify(otp));
  }, [otp]);

  useEffect(() => {
    if (cooldown === 0 && otpSent) {
      setOtpSent(false);
      setJustSent(false);
      setOtp(["", "", "", "", "", ""]);
      setOtpSentForPhone("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooldown]);

  const isPhoneValid = /^62\d{11}$/.test(newPhone);
  const otpComplete = otp.every((d) => d !== "");
  const otpMatchesCurrentPhone = otpSentForPhone === newPhone;
  const canSubmit =
    isPhoneValid && otpSent && otpMatchesCurrentPhone && otpComplete;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parsePhoneInput(raw, newPhone);
    setNewPhone(parsed);

    // Nomor berubah/dihapus dari yang terakhir dikirimi OTP → OTP lama sudah
    // tidak relevan lagi, reset supaya tombol kembali jadi "Kirim OTP"
    if (otpSent && parsed !== otpSentForPhone) {
      setOtpSent(false);
      setJustSent(false);
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const handleSendOtp = () => {
    if (!isPhoneValid || cooldown > 0) return;
    setOtpSent(true);
    setOtpSentForPhone(newPhone);
    setJustSent(true);
    setOtp(["", "", "", "", "", ""]);
    start();
  };

  const clearStorage = () => {
    sessionStorage.removeItem(`${STORAGE_KEY}_phone`);
    sessionStorage.removeItem(`${STORAGE_KEY}_sent`);
    sessionStorage.removeItem(`${STORAGE_KEY}_sent_for`);
    sessionStorage.removeItem(`${STORAGE_KEY}_otp`);
    sessionStorage.removeItem("otp_cooldown_phone");
  };

  return (
    <>
      <div className="pt-4 pb-20">
        <div className="bg-white px-4 py-4">
          {/* Bagian Form */}
          <div className="space-y-4">
            {/* Nomor HP Saat Ini */}
            <div className="rounded-lg bg-gray-50 px-4 py-3 shadow-inner">
              <p className="mb-2 text-[11px] font-semibold text-gray-500">
                Nomor HP Saat Ini
              </p>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-semibold text-gray-700">
                  {formatPhoneNumber(currentPhone)}
                </span>
              </div>
            </div>

            {/* Nomor HP Baru */}
            <div className="px-2 flex flex-col gap-1">
              <label className="mt-2.5 text-[12px] font-semibold text-gray-700">
                Nomor HP Baru
              </label>

              <div className="mt-1.5 flex items-center gap-3 border-b border-gray-100 pb-1.5">
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
                  className={`shrink-0 text-[11px] font-semibold underline underline-offset-2 transition-opacity ${
                    !isPhoneValid || cooldown > 0
                      ? "cursor-not-allowed text-gray-400 no-underline"
                      : "text-emerald-600 active:opacity-70"
                  }`}
                >
                  {cooldown > 0
                    ? `${cooldown} dtk`
                    : otpSent && otpMatchesCurrentPhone
                      ? "Kirim Ulang"
                      : "Kirim OTP"}
                </button>
              </div>
            </div>
          </div>

          {/* Area Verifikasi */}
          <div className="mt-5 flex min-h-[140px] items-center justify-center">
            {otpSent ? (
              <div className="w-full">
                <div className="flex flex-col gap-3">
                  <label className="text-center text-[11px] font-semibold text-gray-700">
                    Masukkan Kode Verifikasi
                  </label>
                  <OtpBoxInput
                    value={otp}
                    onChange={setOtp}
                    autoFocus={justSent}
                  />
                  <p className="text-center text-[10px] text-gray-400 mt-1.5">
                    Kode verifikasi telah dikirim via SMS ke nomor baru
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Image
                  src="/icons/otp.png"
                  alt=""
                  width={96}
                  height={96}
                  draggable={false}
                  className="pointer-events-none select-none"
                />

                <p className="mt-3 text-center text-[10px] text-gray-400">
                  Kirim kode OTP untuk melanjutkan verifikasi nomor baru.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <button
          disabled={!canSubmit}
          onClick={() => {
            showToast("Nomor HP berhasil diubah");
            clearStorage();
            onClose();
          }}
          className={`w-full rounded-lg py-3.5 text-[13.5px] font-bold transition-all ${
            canSubmit
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          Simpan Nomor HP
        </button>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────
   Form: Ubah Email (Magic Link)
──────────────────────────────────────────── */
export function UbahEmailForm({
  onClose,
  showToast,
  currentEmail,
}: {
  onClose: () => void;
  showToast: (msg: string) => void;
  currentEmail: string;
}) {
  const STORAGE_KEY = "form_ubah_email_state";

  const [newEmail, setNewEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(`${STORAGE_KEY}_email`) || "";
  });
  const [linkSent, setLinkSent] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(`${STORAGE_KEY}_sent`) === "1";
  });
  const [linkSentForEmail, setLinkSentForEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(`${STORAGE_KEY}_sent_for`) || "";
  });
  // Simulasi status verifikasi — di real app ini dicek via polling/websocket
  // ke server setelah user klik link di email, bukan diisi manual oleh user.
  const [verified, setVerified] = useState(false);
  const { cooldown, start } = useOtpCooldown("magiclink_cooldown_email");

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_email`, newEmail);
  }, [newEmail]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_sent`, linkSent ? "1" : "0");
  }, [linkSent]);

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY}_sent_for`, linkSentForEmail);
  }, [linkSentForEmail]);

  useEffect(() => {
    if (cooldown === 0 && linkSent && !verified) {
      setLinkSent(false);
      setLinkSentForEmail("");
      setVerified(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooldown]);

  const normalizedEmail = normalizeEmailOnBlur(newEmail);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail);
  const linkMatchesCurrentEmail = linkSentForEmail === newEmail;
  const canSubmit =
    isEmailValid && linkSent && linkMatchesCurrentEmail && verified;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = normalizeEmailLight(e.target.value);
    setNewEmail(val);

    if (linkSent && val !== linkSentForEmail) {
      setLinkSent(false);
      setVerified(false);
    }
  };

  const handleEmailBlur = () => {
    const corrected = normalizeEmailOnBlur(newEmail);
    if (corrected !== newEmail) {
      setNewEmail(corrected);
    }
  };

  const handleSendLink = () => {
    const email = normalizeEmailOnBlur(newEmail);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || cooldown > 0) {
      return;
    }

    setNewEmail(email);
    setLinkSent(true);
    setLinkSentForEmail(email);
    setVerified(false);
    start();

    // TODO: panggil API kirim magic link ke `email`
  };

  const clearStorage = () => {
    sessionStorage.removeItem(`${STORAGE_KEY}_email`);
    sessionStorage.removeItem(`${STORAGE_KEY}_sent`);
    sessionStorage.removeItem(`${STORAGE_KEY}_sent_for`);
    sessionStorage.removeItem("magiclink_cooldown_email");

    setVerified(false);
    setLinkSent(false);
    setLinkSentForEmail("");
    setNewEmail("");
  };

  return (
    <>
      <div className="pt-4 pb-20">
        <div className="bg-white px-4 py-4">
          <div className="space-y-4">
            {/* Email Saat Ini — reuse style Nomor HP Saat Ini */}
            <div className="rounded-lg bg-gray-50 px-4 py-3 shadow-inner">
              <p className="mb-2 text-[11px] font-semibold text-gray-500">
                Email Saat Ini
              </p>

              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-[14px] font-semibold text-gray-700">
                  {currentEmail}
                </span>
              </div>
            </div>

            {/* Email Baru — inline, tombol jadi "Verifikasi" */}
            <div className="flex flex-col gap-1 px-2">
              <label className="mt-2.5 text-[12px] font-semibold text-gray-700">
                Email Baru
              </label>

              <div className="mt-1.5 flex items-center gap-3 border-b border-gray-100 pb-1.5">
                <input
                  type="email"
                  placeholder="contoh@email.com"
                  value={newEmail}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  autoComplete="email"
                  className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={handleSendLink}
                  disabled={!isEmailValid || cooldown > 0}
                  className={`shrink-0 text-[11px] font-semibold underline underline-offset-2 transition-opacity ${
                    !isEmailValid || cooldown > 0
                      ? "cursor-not-allowed text-gray-400 no-underline"
                      : "text-emerald-600 active:opacity-70"
                  }`}
                >
                  {cooldown > 0
                    ? `${cooldown} dtk`
                    : linkSent && linkMatchesCurrentEmail
                      ? "Kirim Ulang"
                      : "Verifikasi"}
                </button>
              </div>
            </div>
          </div>

          {linkSent && linkMatchesCurrentEmail && (
            <div className="mt-5 flex flex-col items-center px-4 text-center">
              <Image
                src="/icons/email_link.png"
                alt=""
                width={96}
                height={96}
                draggable={false}
                className="pointer-events-none select-none"
              />

              <p className="mt-3 text-[12px] font-semibold text-gray-700">
                Cek Email Kamu
              </p>

              <p className="mt-1 text-[10px] leading-relaxed text-gray-400">
                Kami telah mengirim link verifikasi ke{" "}
                <span className="font-medium text-gray-500">{newEmail}</span>.
                Silakan cek inbox atau folder spam.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <button
          disabled={!canSubmit}
          onClick={() => {
            showToast("Email berhasil diubah");
            clearStorage();
            onClose();
          }}
          className={`w-full py-3.5 rounded-lg text-[13.5px] font-bold transition-all ${
            canSubmit
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {verified ? "Simpan Email" : "Menunggu Verifikasi"}
        </button>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────
   Form: Riwayat Login
──────────────────────────────────────────── */
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
