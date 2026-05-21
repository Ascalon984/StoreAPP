"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Handbag } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#065F46] overflow-hidden select-none">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-white/[0.04] blur-3xl" />

      {/* Logo & Brand Container */}
      <div className="relative animate-splash-fade flex flex-col items-center">
        {/* Logo Icon */}
        <div className="text-white/95 drop-shadow-md">
          <Handbag size={60} strokeWidth={2} />
        </div>

        {/* Brand Text */}
        <h1 className="text-2xl font-black text-white tracking-tighter mt-4 italic">
          STORE <span className="text-[#F59E0B] italic font-black">APP</span>
        </h1>
      </div>

      <style jsx>{`
        @keyframes splash-fade {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          60% {
            opacity: 1;
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-splash-fade {
          animation: splash-fade 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
