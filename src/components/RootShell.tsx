'use client';

import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

const excludedRoutes = ['/welcome', '/auth', '/splash', '/chat'];

export default function RootShell({ children }: PropsWithChildren<{}>) {
  const pathname = usePathname() ?? '';
  const hideShell = excludedRoutes.some((route) => pathname.startsWith(route));

  return (
    <>
      {!hideShell && <Navbar />}

      <main
        className={`w-full bg-[#F8F9FA] shadow-layer-sm antialiased ${
          hideShell ? 'min-h-screen' : 'min-h-[calc(100vh-64px)]'
        }`}
      >
        {children}
      </main>

      {!hideShell && <BottomNav />}
    </>
  );
}
