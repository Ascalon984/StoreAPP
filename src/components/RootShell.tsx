"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import OfflineOverlay from "@/components/OfflineOverlay";
import { useAutoBackup } from "@/hooks/useAutoBackup";

const excludedRoutes = ["/welcome", "/auth", "/splash", "/chat"];

// Known route prefixes (for detecting 404 pages)
const knownRoutes = [
  "/",
  "/product",
  "/profile",
  "/orders",
  "/wishlist",
  "/checkout",
  "/notifications",
  "/review",
  "/api",
];

export default function RootShell({ children }: PropsWithChildren<{}>) {
  const pathname = usePathname() ?? "";

  // Initialize auto-backup on app load
  useAutoBackup();

  // Check if route is explicitly excluded
  const isExplicitlyExcluded = excludedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if route is known (if not, it's likely a 404)
  const isKnownRoute = knownRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );

  // Hide shell if explicitly excluded OR if it's an unknown route (404)
  const hideShell = isExplicitlyExcluded || !isKnownRoute;

  return (
    <>
      {!hideShell && <Navbar />}

      <main
        className={`w-full bg-[#F8F9FA] shadow-layer-sm antialiased ${
          hideShell ? "min-h-screen" : "min-h-[calc(100vh-64px)]"
        }`}
      >
        {children}
      </main>

      {!hideShell && <BottomNav />}

      {/* Offline overlay - shown when internet disconnects */}
      <OfflineOverlay />
    </>
  );
}
