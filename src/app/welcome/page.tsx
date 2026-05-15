'use client';

import { Handbag } from 'lucide-react';

interface WelcomeScreenProps {
  onStartShopping: () => void;
  onLogin: () => void;
}

export default function WelcomeScreen({ onStartShopping, onLogin }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#065F46] overflow-hidden select-none">

      {/* AREA ATAS: Konten Utama */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        
        {/* 1. Animasi Logo: Turun dari atas (0s) */}
        <div className="animate-[slideDown_0.5s_ease-out_forwards]">
          <Handbag size={72} strokeWidth={1.5} className="text-white/90" />
        </div>

        {/* 2. Animasi Brand: Turun dari atas (setelah icon, delay 0.3s) */}
        <h1 className="text-3xl font-black text-white tracking-tighter mt-5 italic animate-[slideDown_0.5s_ease-out_0.3s_forwards] opacity-0">
          STORE <span className="text-[#F59E0B] italic font-black">APP</span>
        </h1>

        {/* 3. Animasi Deskripsi: Muncul perlahan (setelah brand selesai turun, delay 0.7s) */}
        <p className="text-white/70 text-sm mt-4 max-w-[260px] leading-relaxed animate-[fadeIn_0.6s_ease-out_0.7s_forwards] opacity-0">
          Temukan produk terbaik dengan harga terjangkau langsung dari toko kami
        </p>
      </div>

      {/* LAYER LENGKUNGAN */}
      <div className="relative h-20 w-full flex-shrink-0 bg-[#065F46]">
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            d="M0,70 Q720,10 1440,70 L1440,100 L0,100 Z"
          />
        </svg>
      </div>

      {/* AREA BAWAH: Kotak Putih Tempat Tombol */}
      <div className="bg-white px-8 pb-12 flex flex-col items-center">
        <button
          onClick={onStartShopping}
          className="w-full max-w-[320px] py-4 rounded-full bg-[#B45309] text-white font-bold text-base tracking-wide shadow-lg active:scale-[0.97] transition-all flex items-center justify-center gap-2"
        >
          Mulai Belanja
        </button>

        <button
          onClick={onLogin}
          className="mt-5 text-gray-500 text-sm font-medium"
        >
          Sudah punya akun? <span className="text-[#065F46] font-bold underline underline-offset-2">Masuk</span>
        </button>
      </div>

      {/* Tambahkan keyframes di global CSS atau di file yang sama */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}