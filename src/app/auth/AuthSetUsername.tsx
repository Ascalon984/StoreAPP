'use client';

import { useState, useRef } from 'react';
import { Check, X, UserCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  // Nama dari Google/FB dipakai sebagai suggested username
  suggestedName?: string;
  onComplete: (username: string) => void;
  onBack: () => void;
}

export default function AuthSetUsername({ suggestedName, onComplete, onBack }: Props) {
  // Generate suggestion dari nama OAuth (lowercase, spasi → underscore)
  const suggested = suggestedName
    ? suggestedName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20)
    : '';

  const [username, setUsername] = useState(suggested);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>(
    suggested.length >= 4 ? 'checking' : 'idle'
  );
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (cleaned.length < 4) {
      setStatus('idle');
      return;
    }

    setStatus('checking');
    timerRef.current = setTimeout(() => {
      // Ganti dengan fetch API cek ketersediaan username
      const taken = ['ahmadfauzi', 'admin', 'palugada'];
      setStatus(taken.includes(cleaned) ? 'taken' : 'available');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'available') return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onComplete(username);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-slide-up">

      {/* ── Header ── */}
      <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center flex-shrink-0">
        <div className="w-full flex justify-start mb-8">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Icon */}
        <div className="mb-5">
          <UserCheck
            size={34}
            strokeWidth={2.2}
            className="text-emerald-700"
          />
        </div>

        <h2 className="text-[20px] font-black text-gray-900 tracking-tight leading-tight mb-2">
          Satu langkah lagi!
        </h2>
        <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[260px]">
          Pilih username unik untuk akunmu. Username tidak bisa diubah setelah dibuat.
        </p>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 px-6">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-1">

            {/* Input username */}
            <div className="relative h-12 group">

              {/* Prefix @ */}
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className={`text-[15px] font-bold transition-colors duration-200 ${status === 'taken' ? 'text-rose-400' : status === 'available' ? 'text-emerald-500' : 'text-gray-400 group-focus-within:text-emerald-700'}`}>
                  @
                </span>
              </div>

              <input
                type="text"
                value={username}
                onChange={(e) => handleChange(e.target.value)}
                placeholder=" "
                maxLength={20}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                className={`peer w-full h-full pl-8 pr-10 bg-white border-2 rounded-2xl text-[15px] font-bold text-gray-800 placeholder-transparent focus:outline-none transition-all duration-200 ${status === 'taken' ? 'border-rose-400 focus:border-rose-500' : status === 'available' ? 'border-emerald-500 focus:border-emerald-600' : 'border-gray-200 focus:border-emerald-700'}`}
                required
              />

              {/* Floating label */}
              <label className="absolute left-8 top-1/2 -translate-y-1/2 text-[15px] font-medium text-gray-400 pointer-events-none bg-white px-1 rounded-sm transition-all duration-300 ease-out peer-focus:left-3 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-emerald-700 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-gray-500">
                Masukkan username
              </label>

              {/* Status icon kanan */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {status === 'checking' && <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-emerald-700 animate-spin" />}

                {status === 'available' && <Check size={16} strokeWidth={2.5} className="text-emerald-500" />}

                {status === 'taken' && <X size={16} strokeWidth={2.5} className="text-rose-400" />}
              </div>
            </div>

            {/* Feedback bawah kiri — tinggi fixed agar layout tidak loncat */}
            <div className="h-5 pl-1">
              {status === 'taken' && (
                <p className="text-[11px] font-semibold text-rose-500">
                  Username sudah digunakan, coba yang lain
                </p>
              )}
              {status === 'available' && (
                <p className="text-[11px] font-semibold text-emerald-600">
                  ✓ Username tersedia
                </p>
              )}
              {status === 'idle' && username.length > 0 && username.length < 4 && (
                <p className="text-[11px] font-medium text-gray-400">
                  Minimal 4 karakter
                </p>
              )}
              {status === 'idle' && username.length === 0 && (
                <p className="text-[11px] font-medium text-gray-400">
                  Hanya huruf kecil, angka, dan underscore (_)
                </p>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Submit */}
          <div className="pb-10">
            <button
              type="submit"
              disabled={status !== 'available' || isLoading}
              className="w-full py-4 bg-emerald-700 text-white font-bold text-sm rounded-full
                shadow-layer-md active:scale-[0.98] transition-all tracking-wider
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>MULAI BELANJA</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
