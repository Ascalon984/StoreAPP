'use client';

import { useState } from 'react';
import { Handbag, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import AuthForgotPassword from './AuthForgotPassword';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'masuk' | 'daftar'>('masuk');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-primary-dark overflow-hidden select-none">

      {/* AREA ATAS */}
      <div className="flex-1 flex flex-col items-center justify-center pt-4 pb-2 text-center">
        {/* ✅ Menggunakan backdrop-glass-light dari config */}
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-glass-light shadow-layer-xs">
          <Handbag size={40} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black italic tracking-tighter mt-4 text-white">
          STORE <span className="text-accent">APP</span>
        </h1>
      </div>

      {/* AREA BAWAH */}
      {/* ✅ Menggunakan shadow-elevation-3 dari config */}
      <div className="bg-white rounded-t-[32px] px-6 pt-8 pb-8 flex flex-col min-h-[58vh] w-full shadow-elevation-3 animate-slide-up">

        {isForgotPassword ? (
          <AuthForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex border-b border-gray-100 relative mb-5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('masuk')}
                className={`flex-1 pb-3 text-center text-sm font-bold tracking-wide transition-colors ${activeTab === 'masuk' ? 'text-primary-dark' : 'text-gray-400'
                  }`}
              >
                MASUK
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('daftar')}
                className={`flex-1 pb-3 text-center text-sm font-bold tracking-wide transition-colors ${activeTab === 'daftar' ? 'text-primary-dark' : 'text-gray-400'
                  }`}
              >
                DAFTAR
              </button>
              {/* ✅ Warna slider mengikuti primary-dark */}
              <div
                className="absolute bottom-0 h-[2px] bg-primary-dark transition-all duration-300 ease-out"
                style={{
                  width: '50%',
                  transform: activeTab === 'masuk' ? 'translateX(0%)' : 'translateX(100%)',
                }}
              />
            </div>

            {/* Kontainer Form — tinggi stabil antar tab */}
            <div className="flex-1 flex flex-col justify-between min-h-[352px]">

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  {activeTab === 'masuk' ? 'Masuk ke akun Anda' : 'Buat akun baru Anda'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* ── Nama Lengkap (hanya daftar) ── */}
                  {activeTab === 'daftar' && (
                    <div className="relative h-11 group animate-fade-in">
                      {/* ✅ Icon focus mengikuti primary-dark */}
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-dark transition-colors duration-200 pointer-events-none">
                        <User size={18} strokeWidth={1.5} />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        placeholder=" "
                        className="peer w-full h-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm text-gray-800 placeholder-transparent focus:outline-none focus:border-primary-dark transition-all duration-200 font-medium"
                        required
                      />
                      <label
                        className="
    absolute left-3 top-0 -translate-y-1/2
    text-xs text-gray-500 font-medium
    pointer-events-none
    bg-white px-1.5 rounded-sm

    transition-[top,left,transform,font-size,color]
    duration-300 ease-out

    peer-placeholder-shown:left-10
    peer-placeholder-shown:top-1/2
    peer-placeholder-shown:-translate-y-1/2
    peer-placeholder-shown:text-sm
    peer-placeholder-shown:text-gray-400

    peer-focus:left-3
    peer-focus:top-0
    peer-focus:-translate-y-1/2
    peer-focus:text-xs
    peer-focus:text-primary-dark
    peer-focus:font-semibold

    [:not(:placeholder-shown)]:left-3
    [:not(:placeholder-shown)]:top-0
    [:not(:placeholder-shown)]:-translate-y-1/2
    [:not(:placeholder-shown)]:text-xs
    [:not(:placeholder-shown)]:text-gray-500
  "
                      >
                        Nama Lengkap
                      </label>
                    </div>
                  )}

                  {/* ── Email / No HP ── */}
                  <div className="relative h-11 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-dark transition-colors duration-200 pointer-events-none">
                      <Mail size={18} strokeWidth={1.5} />
                    </div>
                    <input
                      type="text"
                      id="email"
                      placeholder=" "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="peer w-full h-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm text-gray-800 placeholder-transparent focus:outline-none focus:border-primary-dark transition-all duration-200 font-medium"
                      required
                    />
                    <label
                      className="
    absolute left-3 top-0 -translate-y-1/2
    text-xs text-gray-500 font-medium
    pointer-events-none
    bg-white px-1.5 rounded-sm

    transition-[top,left,transform,font-size,color]
    duration-300 ease-out

    peer-placeholder-shown:left-10
    peer-placeholder-shown:top-1/2
    peer-placeholder-shown:-translate-y-1/2
    peer-placeholder-shown:text-sm
    peer-placeholder-shown:text-gray-400

    peer-focus:left-3
    peer-focus:top-0
    peer-focus:-translate-y-1/2
    peer-focus:text-xs
    peer-focus:text-primary-dark
    peer-focus:font-semibold

    [:not(:placeholder-shown)]:left-3
    [:not(:placeholder-shown)]:top-0
    [:not(:placeholder-shown)]:-translate-y-1/2
    [:not(:placeholder-shown)]:text-xs
    [:not(:placeholder-shown)]:text-gray-500
  "
                    >
                      E-mail atau No. Telp
                    </label>
                  </div>

                  {/* ── Password ── */}
                  <div className="relative h-11 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-dark transition-colors duration-200 pointer-events-none">
                      <Lock size={18} strokeWidth={1.5} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder=" "
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="peer w-full h-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm text-gray-800 placeholder-transparent focus:outline-none focus:border-primary-dark transition-all duration-200 font-medium"
                      required
                    />
                    <label
                      className="
    absolute left-3 top-0 -translate-y-1/2
    text-xs text-gray-500 font-medium
    pointer-events-none
    bg-white px-1.5 rounded-sm

    transition-[top,left,transform,font-size,color]
    duration-300 ease-out

    peer-placeholder-shown:left-10
    peer-placeholder-shown:top-1/2
    peer-placeholder-shown:-translate-y-1/2
    peer-placeholder-shown:text-sm
    peer-placeholder-shown:text-gray-400

    peer-focus:left-3
    peer-focus:top-0
    peer-focus:-translate-y-1/2
    peer-focus:text-xs
    peer-focus:text-primary-dark
    peer-focus:font-semibold

    [:not(:placeholder-shown)]:left-3
    [:not(:placeholder-shown)]:top-0
    [:not(:placeholder-shown)]:-translate-y-1/2
    [:not(:placeholder-shown)]:text-xs
    [:not(:placeholder-shown)]:text-gray-500
  "
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                    </button>
                  </div>

                  {/* ── Konfirmasi Password (hanya daftar) ── */}
                  {activeTab === 'daftar' && (
                    <div className="relative h-11 group animate-fade-in">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-dark transition-colors duration-200 pointer-events-none">
                        <Lock size={18} strokeWidth={1.5} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        placeholder=" "
                        className="peer w-full h-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm text-gray-800 placeholder-transparent focus:outline-none focus:border-primary-dark transition-all duration-200 font-medium"
                        required
                      />
                      <label
                        className="
    absolute left-3 top-0 -translate-y-1/2
    text-xs text-gray-500 font-medium
    pointer-events-none
    bg-white px-1.5 rounded-sm

    transition-[top,left,transform,font-size,color]
    duration-300 ease-out

    peer-placeholder-shown:left-10
    peer-placeholder-shown:top-1/2
    peer-placeholder-shown:-translate-y-1/2
    peer-placeholder-shown:text-sm
    peer-placeholder-shown:text-gray-400

    peer-focus:left-3
    peer-focus:top-0
    peer-focus:-translate-y-1/2
    peer-focus:text-xs
    peer-focus:text-primary-dark
    peer-focus:font-semibold

    [:not(:placeholder-shown)]:left-3
    [:not(:placeholder-shown)]:top-0
    [:not(:placeholder-shown)]:-translate-y-1/2
    [:not(:placeholder-shown)]:text-xs
    [:not(:placeholder-shown)]:text-gray-500
  "
                      >
                        Konfirmasi Password
                      </label>
                    </div>
                  )}

                  {/* Lupa Password — hanya masuk */}
                  {activeTab === 'masuk' && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs font-bold text-gray-500 underline underline-offset-2 hover:text-gray-700 transition-colors"
                      >
                        Lupa password?
                      </button>
                    </div>
                  )}

                  {/* Tombol Utama */}
                  {/* ✅ Menggunakan warna & shadow dari config */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-[#B45309] text-white font-bold text-sm rounded-full shadow-layer-md active:scale-[0.98] transition-all tracking-wider disabled:opacity-70 mt-2 flex-shrink-0 hover:bg-primary-dark"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      activeTab === 'masuk' ? 'MASUK' : 'DAFTAR'
                    )}
                  </button>
                </form>
              </div>

              {/* Social Login — hanya masuk */}
              {activeTab === 'masuk' && (
                <div className="animate-fade-in">
                  <div className="relative flex py-4 items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100" />
                    </div>
                    <span className="relative px-3 bg-white text-xs font-medium text-gray-400">
                      atau masuk dengan
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-8">

                    {/* Google */}
                    <button
                      type="button"
                      aria-label="Masuk dengan Google"
                      className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-black/[0.03] active:scale-[0.92] transition-all duration-200"
                    >
                      <svg className="w-8 h-8" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.56 1.7 15 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.77 2.92c.9-2.7 3.42-4.38 6.73-4.38z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.71 2.88c2.17-2 3.72-4.94 3.72-8.56z" />
                        <path fill="#FBBC05" d="M5.27 14.58A7.16 7.16 0 0 1 4.8 12c0-.9.16-1.76.47-2.58L1.5 6.5A11.93 11.93 0 0 0 0 12c0 2.03.5 3.94 1.5 5.5l3.77-2.92z" />
                        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.71-2.88c-1.03.69-2.35 1.11-4.25 1.11-3.31 0-5.83-1.68-6.73-4.38L1.5 16.85C3.4 20.35 7.35 23 12 23z" />
                      </svg>
                    </button>

                    {/* Facebook */}
                    <button
                      type="button"
                      aria-label="Masuk dengan Facebook"
                      className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-black/[0.03] active:scale-[0.92] transition-all duration-200"
                    >
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>

                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}