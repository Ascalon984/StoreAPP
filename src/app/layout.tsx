import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import SearchOverlay from '@/components/SearchOverlay';
import MiniCart from '@/components/MiniCart';
import Toast from '@/components/Toast';
import ReviewModal from '@/components/ReviewModal';
import { SITE_NAME } from '@/lib/constants';

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
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_ADMIN_API_URL} crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-[#F8F9FA] text-gray-900 mx-auto min-h-screen relative`}>
        <Navbar />
        <main className="max-w-container mx-auto bg-white min-h-[calc(100vh-64px)] shadow-[0_0_40px_rgba(0,0,0,0.03)] antialiased">
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
