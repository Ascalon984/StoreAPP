'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, ShieldCheck, Delete } from 'lucide-react';

interface Props {
    onBackToLogin: () => void;
}

type Step = 1 | 2 | 3;

export default function AuthForgotPassword({ onBackToLogin }: Props) {
    const [step, setStep] = useState<Step>(1);
    const [contact, setContact] = useState('');
    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [lastContact, setLastContact] = useState('');

    const startCooldown = () => {
        if (cooldownRef.current) clearInterval(cooldownRef.current); // ← clear dulu sebelum mulai baru
        setCooldown(60);
        cooldownRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => () => {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
    }, []);

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);

            // Hanya restart cooldown jika contact berbeda dari sebelumnya
            // atau jika cooldown sudah habis
            if (contact !== lastContact || cooldown === 0) {
                setLastContact(contact);
                startCooldown();
            }
        }, 800);
    };

    const handleResetPass = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => { setIsLoading(false); onBackToLogin(); }, 800);
    };

    const handleBack = () => {
        if (step === 1) {
            onBackToLogin();
        } else if (step === 2) {
            setOtp(Array(6).fill(''));
            setCooldown(0);
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            setStep(1);
        } else if (step === 3) {
            setOtp(Array(6).fill(''));
            setStep(2);
        }
    };

    // ── Handler Step 2 (Custom Dialpad) ──
    const handleDialPress = (key: string) => {
        if (isLoading) return;

        if (key === 'delete') {
            const newOtp = [...otp];
            for (let i = otp.length - 1; i >= 0; i--) {
                if (otp[i] !== '') {
                    newOtp[i] = '';
                    break;
                }
            }
            setOtp(newOtp);
        } else {
            const emptyIndex = otp.indexOf('');
            if (emptyIndex === -1) return; // Sudah penuh

            const newOtp = [...otp];
            newOtp[emptyIndex] = key;
            setOtp(newOtp);

            // Auto-submit jika sudah mengisi digit ke-6
            if (emptyIndex === 5) {
                setIsLoading(true);
                setTimeout(() => { setIsLoading(false); setStep(3); }, 800);
            }
        }
    };

    const handleResendOtp = () => {
        if (cooldown > 0) return;
        setIsLoading(true);
        setOtp(Array(6).fill('')); // Reset OTP
        setTimeout(() => {
            setIsLoading(false);
            startCooldown();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-slide-up">

            {/* ── AREA ATAS: Header & Step Indicator Center ── */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6 flex-shrink-0">
                <div className="w-full flex justify-start mb-8">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-6">
                    {step === 1 && 'Lupa Password'}
                    {step === 2 && 'Verifikasi Kode'}
                    {step === 3 && 'Buat Password Baru'}
                </h2>

                {/* Step Indicator Center */}
                <div className="flex items-center">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">

                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 z-10
                ${step >= s
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                {step > s ? '✓' : s}
                            </div>

                            {s < 3 && (
                                <div
                                    className={`w-14 h-[3px] -mx-[2px] transition-colors duration-300
                    ${step > s
                                            ? 'bg-primary'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── AREA KONTEN (Bervariasi per Step) ── */}
            <div className="flex-1 flex flex-col w-full px-6 pb-8 overflow-hidden">

                {/* ━━━━━━━━━━━━ STEP 1: INPUT EMAIL/TELP ━━━━━━━━━━━━ */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="flex-1 flex flex-col animate-fade-in">
                        <div className="space-y-4 mb-auto mt-8">
                            <p className="text-sm text-gray-500 text-left leading-relaxed">
                                Masukkan e-mail atau nomor telepon yang terdaftar untuk menerima kode verifikasi.
                            </p>
                            <div className="relative h-12 group mt-6">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-dark transition-colors pointer-events-none">
                                    <Mail size={18} strokeWidth={1.5} />
                                </div>
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
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
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-[#B45309] text-white font-bold text-sm rounded-full shadow-layer-md active:scale-[0.98] transition-all tracking-wider disabled:opacity-70 hover:bg-[#B45309]-dark"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    <span>Mengirim...</span>
                                </div>
                            ) : 'KIRIM KODE'}
                        </button>
                    </form>
                )}

                {/* ━━━━━━━━━━━━ STEP 2: DIALPAD KUSTOM ━━━━━━━━━━━━ */}
                {step === 2 && (
                    <div className="flex-1 flex flex-col animate-fade-in">
                        <div className="mb-2">
                            <p className="text-sm text-gray-500 text-left leading-relaxed">
                                Masukkan 6 digit kode yang dikirim ke{' '}
                                <span className="font-semibold text-gray-800">
                                    {/* ✅ Sensor Dinamis Tepat 40% Karakter Asli di Akhir */}
                                    {(() => {
                                        if (typeof contact !== 'string') return '';

                                        if (contact.includes('@')) {
                                            const [username, domain] = contact.split('@');
                                            const censorCount = Math.max(1, Math.round(username.length * 0.40)); // 40% dari username
                                            const visibleCount = username.length - censorCount;

                                            return username.slice(0, visibleCount) + '*'.repeat(censorCount) + '@' + domain;
                                        } else {
                                            const censorCount = Math.max(1, Math.round(contact.length * 0.40)); // 40% dari nomor telepon
                                            const visibleCount = contact.length - censorCount;

                                            return contact.slice(0, visibleCount) + '*'.repeat(censorCount);
                                        }
                                    })()}
                                </span>
                            </p>
                            {cooldown > 0 ? (
                                <p className="text-xs font-semibold text-gray-400 mt-1">
                                    Kirim ulang dalam{' '}
                                    <span className="text-primary-dark font-black tabular-nums">{cooldown}d</span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-xs font-bold text-primary-dark hover:underline underline-offset-2 transition-colors mt-1"
                                >
                                    Kirim ulang kode?
                                </button>
                            )}
                        </div>

                        {/* ✅ Tambahkan style global untuk animasi berkedip jika belum ada di project Anda */}
                        <style>{`
    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
    .animate-blink {
        animation: blink 1s infinite;
    }
`}</style>

                        {/* ✅ Menambahkan mt-4 di sini untuk menurunkan seluruh baris box OTP */}
                        <div className="relative mt-4">
                            {/* ✅ Indikator OTP */}
                            <div className="flex justify-center gap-3 mb-2" role="group" aria-label="OTP Input">
                                {otp.map((digit, i) => {
                                    // Kotak aktif adalah kotak kosong pertama yang siap diisi
                                    const isActive = i === otp.findIndex(d => d === '');

                                    return (
                                        <div
                                            key={i}
                                            className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl font-bold transition-all duration-150 ${digit
                                                ? 'border-primary bg-white text-primary-dark scale-105'
                                                : 'border-gray-400 bg-white'
                                                }`}
                                        >
                                            {/* Jika digit ada, tampilkan angkanya */}
                                            {digit}

                                            {/* Jika kosong DAN aktif, tampilkan animasi kursor vertikal | */}
                                            {!digit && isActive && (
                                                <span className="w-[2px] h-6 bg-primary animate-blink" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ✅ Overlay Loading — FULL SCREEN */}
                            {isLoading && (
                                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-white/60 backdrop-blur-sm">
                                    <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* ✅ WRAPPER DIALPAD */}
                        <div className="bg-gray-100 rounded-t-[32px] px-0 pt-6 pb-10 mt-4 -mx-6">
                            {/* Grid Dialpad 3x4 */}
                            <div className="grid grid-cols-3 gap-3 max-w-[320px] mx-auto w-full">
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'].map((key) => {
                                    const isDelete = key === 'delete';

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            disabled={key === '' || isLoading}
                                            onClick={() => handleDialPress(key)}
                                            className={`h-14 rounded-2xl flex items-center justify-center text-2xl font-medium transition-all duration-150 disabled:opacity-0 disabled:cursor-default focus:outline-none active:scale-95
                        ${isDelete
                                                    ? 'bg-transparent text-gray-400 hover:text-gray-500'
                                                    : 'bg-white text-gray-800 shadow-layer-sm hover:shadow-layer-md'
                                                }`}
                                        >
                                            {/* ✅ Menampilkan ikon delete dengan warna abu-abu bawaan awal */}
                                            {isDelete ? <Delete size={24} className="text-gray-400" /> : key}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ━━━━━━━━━━━━ STEP 3: RESET PASSWORD ━━━━━━━━━━━━ */}
                {step === 3 && (
                    <form onSubmit={handleResetPass} className="flex-1 flex flex-col animate-fade-in">
                        <div className="space-y-4 mb-auto mt-8">
                            <div className="relative h-12 group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-dark transition-colors pointer-events-none">
                                    <Lock size={18} strokeWidth={1.5} />
                                </div>
                                <input
                                    type="password"
                                    placeholder=" "
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    className="peer w-full h-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm text-gray-800 placeholder-transparent focus:outline-none focus:border-primary-dark transition-all font-medium"
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
                                    Password Baru
                                </label>
                            </div>

                            <div className="relative h-12 group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-dark transition-colors pointer-events-none">
                                    <ShieldCheck size={18} strokeWidth={1.5} />
                                </div>
                                <input
                                    type="password"
                                    placeholder=" "
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="peer w-full h-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm text-gray-800 placeholder-transparent focus:outline-none focus:border-primary-dark transition-all font-medium"
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
                                    Konfirmasi Password Baru
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-[#B45309] text-white font-bold text-sm rounded-full shadow-layer-md active:scale-[0.98] transition-all tracking-wider disabled:opacity-70 hover:bg-primary-dark"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    <span>Menyimpan...</span>
                                </div>
                            ) : 'SIMPAN PASSWORD'}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}