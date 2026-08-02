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
  Check,
  ChevronRight,
} from "lucide-react";
import { UbahPasswordForm, UbahPINForm } from "./SecurityPasswordForms";
import {
  UbahNoHPForm,
  UbahEmailForm,
  RiwayatLoginForm,
} from "./SecurityContactForms";
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
    phone: "081234567890",
    phoneVerified: true,
    email: "u***r@email.com",
    emailVerified: true,
    pinSet: true,
    lastPasswordChange: "15 Jan 2025",
  });

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
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
  ]);

  const activeDevices = loginHistory.filter((item) => item.status === "aktif");

  /* ────────────────────────────────────────────
     List items config
  ──────────────────────────────────────────── */
  const securityItems = [
    {
      id: "ubah-no-hp",
      title: "Nomor HP",
      icon: Smartphone,
      subtitle: keamananData.phone,
      verified: keamananData.phoneVerified,
    },
    {
      id: "ubah-email",
      title: "Email",
      icon: Mail,
      subtitle: keamananData.email,
      verified: keamananData.emailVerified,
    },
    {
      id: "ubah-pin",
      title: "PIN Aplikasi",
      icon: KeyRound,
      subtitle: keamananData.pinSet ? "PIN aktif" : "Belum membuat PIN",
      verified: false,
    },
    {
      id: "ubah-password",
      title: "Ubah Password",
      icon: Lock,
      subtitle: `Terakhir di ubah ${keamananData.lastPasswordChange}`,
      verified: false,
    },
    {
      id: "riwayat-login",
      title: "Riwayat Login",
      icon: History,
      subtitle:
        activeDevices.length > 0
          ? `Perangkat aktif: ${activeDevices[0].device}`
          : "Belum ada perangkat aktif",
      verified: false,
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
                className="relative px-4 py-2 cursor-pointer active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4 mb-1.5">
                  <Icon
                    size={15}
                    className="shrink-0 text-gray-600 mt-0.5 translate-y-[2.5px]"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-semibold text-gray-800">
                      {item.title}
                    </h3>

                    <div className="mt-1 flex items-center gap-1">
                      <p className="truncate text-[12px] text-gray-500">
                        {item.subtitle}
                      </p>

                      {item.verified && (
                        <Check
                          size={13}
                          strokeWidth={2.4}
                          className="shrink-0 text-emerald-600"
                        />
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="shrink-0 text-gray-400 mt-0.5"
                  />
                </div>
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
     Sub-page router
  ──────────────────────────────────────────── */
  const renderSubPage = () => {
    switch (subPage?.id) {
      case "ubah-password":
        return (
          <UbahPasswordForm
            onClose={() => setSubPage(null)}
            showToast={showToast}
          />
        );
      case "ubah-pin":
        return (
          <UbahPINForm onClose={() => setSubPage(null)} showToast={showToast} />
        );
      case "ubah-no-hp":
        return (
          <UbahNoHPForm
            onClose={() => setSubPage(null)}
            showToast={showToast}
            currentPhone={keamananData.phone}
          />
        );
      case "ubah-email":
        return (
          <UbahEmailForm
            onClose={() => setSubPage(null)}
            showToast={showToast}
            currentEmail={keamananData.email}
          />
        );
      case "riwayat-login":
        return (
          <RiwayatLoginForm loginHistory={loginHistory} showToast={showToast} />
        );
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
