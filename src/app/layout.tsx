import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import Navbar from '@/components/Navbar';
import { SITE_NAME } from '@/lib/constants';

// Load heavy client components dynamically
const SearchOverlay = dynamic(() => import('@/components/SearchOverlay'), { ssr: false });
const MiniCart = dynamic(() => import('@/components/MiniCart'), { ssr: false });
const Toast = dynamic(() => import('@/components/Toast'), { ssr: false });
const ReviewModal = dynamic(() => import('@/components/ReviewModal'), { ssr: false });

const inter = Inter({ subsets: ['latin'], display: 'swap', });

export const metadata: Metadata = {
  title: `${SITE_NAME} | Marketplace Terpercaya`,
  description: 'Palugada Store - Layanan top up pulsa, data, game, dan voucher cepat & aman.',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-[#F8F9FA] text-gray-900 mx-auto min-h-screen relative`}>
        <Navbar />
        <main className="max-w-container mx-auto bg-[#F8F9FA] min-h-[calc(100vh-64px)] shadow-[0_0_40px_rgba(0,0,0,0.03)] antialiased">
          {children}
        </main>

        <SearchOverlay />
        <MiniCart />
        <Toast />
        <ReviewModal />
      </body>
    </html>
  );
}
