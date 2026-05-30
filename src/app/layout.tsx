import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import RootShell from "@/components/RootShell";
import { SITE_NAME } from "@/lib/constants";

// Load heavy client components dynamically
const SearchOverlay = dynamic(() => import("@/components/SearchOverlay"), {
  ssr: false,
});
const MiniCart = dynamic(() => import("@/components/MiniCart"), { ssr: false });
const Toast = dynamic(() => import("@/components/Toast"), { ssr: false });
const ReviewModal = dynamic(() => import("@/components/ReviewModal"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: `PalugadaStore — Belanja Harian Lebih Mudah`,
  description:
    "Belanja kebutuhan harian, snack, minuman, dan produk pilihan dengan cepat dan praktis di PalugadaStore.",
  icons: {
    icon: "/icons/logo-web.png",
    shortcut: "/icons/logo-web.png",
    apple: "/icons/logo-web.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} bg-[#F8F9FA] text-gray-900 min-h-screen relative`}
      >
        <RootShell>{children}</RootShell>

        <SearchOverlay />
        <MiniCart />
        <Toast />
        <ReviewModal />
      </body>
    </html>
  );
}
