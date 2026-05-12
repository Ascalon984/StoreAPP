'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Phone, User, Loader, AlertCircle, CheckCircle, Truck, X } from 'lucide-react';
import { useDeliveryStore } from '@/store/useDeliveryStore';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DRAG_CLOSE_THRESHOLD = 100;
const VELOCITY_CLOSE_THRESHOLD = 0.4;
const MAX_NAME_CHARS = 40;
const MAX_PHONE_DIGITS = 13;
const MAX_ADDRESS_CHARS = 250;

export default function CheckoutModal({ open, onClose, onConfirm, loading = false }: CheckoutModalProps) {
  const { deliveryInfo, updateDeliveryInfo, isLoadingLocation, setIsLoadingLocation, getAddressFromCoords } = useDeliveryStore();
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; phone?: boolean; address?: boolean }>({});
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean; address?: boolean }>({});
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const dragVelocity = useRef(0);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const phoneCursorRef = useRef<number>(-1);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const addressTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Reset saat modal buka ──
  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      setTouched({});
      setDragDelta(0);
      dragVelocity.current = 0;
      phoneCursorRef.current = -1;
      const viewport = window.visualViewport;
      if (viewport && overlayRef.current) {
        overlayRef.current.style.height = `${viewport.height}px`;
        overlayRef.current.style.top = `${viewport.offsetTop}px`;
      }
    }
  }, [open]);

  // ── Kunci scroll body + Handle keyboard via Visual Viewport API ──
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const body = document.body;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';

    const viewport = window.visualViewport;

    // ✅ Simpan initial height untuk deteksi keyboard
    let initialHeight = window.innerHeight;

    if (viewport) {
      initialHeight = viewport.height;
    }

    const handleViewportChange = () => {
      if (!viewport) return;

      const currentHeight = viewport.height;
      if (overlayRef.current) {
        overlayRef.current.style.height = `${currentHeight}px`;
        overlayRef.current.style.top = `${viewport.offsetTop}px`;
      }

      // ✅ Deteksi apakah keyboard terbuka
      const heightDiff = initialHeight - currentHeight;
      setIsKeyboardOpen(heightDiff > 100);
    };

    const cleanupBody = () => {
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.overflow = '';
      if (overlayRef.current) {
        overlayRef.current.style.height = '100dvh';
        overlayRef.current.style.top = '0px';
      }
      setIsKeyboardOpen(false);
      window.scrollTo(0, scrollY);
    };

    if (viewport) {
      // Set initial height setelah delay untuk nilai stabil
      const timeoutId = setTimeout(() => {
        if (viewport) {
          initialHeight = viewport.height;
        }
        handleViewportChange();
      }, 100);

      viewport.addEventListener('resize', handleViewportChange);
      viewport.addEventListener('scroll', handleViewportChange);

      return () => {
        clearTimeout(timeoutId);
        viewport.removeEventListener('resize', handleViewportChange);
        viewport.removeEventListener('scroll', handleViewportChange);
        cleanupBody();
      };
    }

    return cleanupBody;
  }, [open]);

  // ── Restore kursor phone setelah re-render ──
  useEffect(() => {
    if (phoneCursorRef.current < 0) return;
    const input = phoneInputRef.current;
    if (input && document.activeElement === input) {
      requestAnimationFrame(() => {
        input.setSelectionRange(phoneCursorRef.current, phoneCursorRef.current);
      });
    }
  }, [deliveryInfo.phone]);

  // ── Drag to close (nonaktif saat keyboard terbuka) ──
  const triggerClose = useCallback(() => {
    setIsClosing(true);
    setDragDelta(0);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setTimeout(() => {
      setIsClosing(false);
      setFieldErrors({});
      setTouched({});
      setIsKeyboardOpen(false);
      onClose();
    }, 280);
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (dragDelta === 0 && !isClosing) triggerClose();
  }, [dragDelta, isClosing, triggerClose]);

  const handleDragStart = (e: React.TouchEvent) => {
    if (isKeyboardOpen) return; // ✅ Gunakan flag sederhana
    if ((e.target as HTMLElement).closest('textarea, input, button')) return;
    dragStartY.current = e.touches[0].clientY;
    lastY.current = dragStartY.current;
    lastTime.current = Date.now();
    dragVelocity.current = 0;
    isDragging.current = true;
  };

  const handleDragMove = (e: React.TouchEvent) => {
    if (!isDragging.current || isClosing || isKeyboardOpen) return;
    const y = e.touches[0].clientY;
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) dragVelocity.current = (y - lastY.current) / dt;
    lastY.current = y;
    lastTime.current = now;
    setDragDelta(Math.max(0, y - dragStartY.current));
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragDelta > DRAG_CLOSE_THRESHOLD || dragVelocity.current > VELOCITY_CLOSE_THRESHOLD) {
      triggerClose();
    } else {
      setDragDelta(0);
    }
    dragVelocity.current = 0;
  };

  // ── Geolocation ──
  const getBestPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      let resolved = false;
      let bestPos: GeolocationPosition | null = null;
      const GOOD_ACCURACY = 30;
      const MAX_WAIT = 8000;

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (resolved) return;
          if (!bestPos || pos.coords.accuracy < bestPos.coords.accuracy) bestPos = pos;
          if (pos.coords.accuracy <= GOOD_ACCURACY) {
            resolved = true;
            navigator.geolocation.clearWatch(watchId);
            resolve(pos);
          }
        },
        (err) => {
          if (resolved) return;
          resolved = true;
          navigator.geolocation.clearWatch(watchId);
          if (bestPos) resolve(bestPos);
          else reject(err);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );

      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        navigator.geolocation.clearWatch(watchId);
        if (bestPos) resolve(bestPos);
        else reject({ code: 3, message: 'Timeout' });
      }, MAX_WAIT);
    });
  };

  const handleAutoDetect = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak tersedia di browser Anda');
      return;
    }

    setIsLoadingLocation(true);
    setError(null);

    try {
      let position: GeolocationPosition;

      try {
        position = await getBestPosition();
      } catch (err: any) {
        // Jika user secara eksplisit menolak izin (code 1), jangan coba lagi di fallback
        if (err?.code === 1) throw err;

        // Gunakan pemanggilan standar jika mode High Accuracy atau Watch gagal
        position = await new Promise<GeolocationPosition>((resolve, rejectFallback) => {
          navigator.geolocation.getCurrentPosition(resolve, rejectFallback, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 120000,
          });
        });
      }

      const { latitude, longitude } = position.coords;
      await getAddressFromCoords(latitude, longitude);
      updateDeliveryInfo({ lat: latitude, lng: longitude });

      setError(null);
    } catch (err: any) {
      const code = err?.code;
      if (code === 1) {
        setError('Izin lokasi ditolak. Aktifkan lokasi di pengaturan browser, lalu coba lagi.');
      } else if (code === 2) {
        setError('Lokasi tidak tersedia. Pastikan GPS aktif dan Anda berada di area dengan sinyal cukup.');
      } else if (code === 3) {
        setError('Waktu habis mendeteksi lokasi. Coba lagi atau isi alamat manual.');
      } else {
        setError('Gagal mendapatkan lokasi. Pastikan halaman dibuka via HTTPS, lalu coba lagi.');
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // ── Helpers ──
  const getPhoneDigits = (phone: string) => phone.replace(/[^\d]/g, '');
  const formatPhone = (digits: string): string => digits.replace(/(\d{3})(?=\d)/g, '$1-');

  // ── Validation ──
  const validateField = (field: 'name' | 'phone' | 'address') => {
    let hasError = false;
    if (field === 'name') {
      hasError = deliveryInfo.name.trim().length === 0;
    } else if (field === 'phone') {
      hasError = getPhoneDigits(deliveryInfo.phone).length < 10;
    } else if (field === 'address') {
      hasError = deliveryInfo.address.trim().length < 10;
    }
    setFieldErrors((prev) => ({ ...prev, [field]: hasError }));
    return !hasError;
  };

  const handleBlur = (field: 'name' | 'phone' | 'address') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // ── Input handlers ──
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.slice(0, MAX_NAME_CHARS);
    const capitalized = raw.replace(/\b\w/g, (c) => c.toUpperCase());
    updateDeliveryInfo({ name: capitalized });
    if (touched.name) validateField('name');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPos = input.selectionStart || 0;
    const oldVal = input.value;

    const digitsBefore = oldVal.slice(0, cursorPos).replace(/[^\d]/g, '').length;
    const rawDigits = oldVal.replace(/[^\d]/g, '').slice(0, MAX_PHONE_DIGITS);
    const formatted = formatPhone(rawDigits);

    const digitPositions: number[] = [];
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) digitPositions.push(i);
    }

    let newCursor: number;
    if (digitsBefore === 0) {
      newCursor = 0;
    } else if (digitsBefore <= digitPositions.length) {
      newCursor = digitPositions[digitsBefore - 1] + 1;
    } else {
      newCursor = formatted.length;
    }

    if (newCursor < formatted.length && formatted[newCursor] === '-') {
      newCursor++;
    }

    phoneCursorRef.current = newCursor;
    updateDeliveryInfo({ phone: formatted });
    if (touched.phone) validateField('phone');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDeliveryInfo({ address: e.target.value.slice(0, MAX_ADDRESS_CHARS) });
    if (touched.address) validateField('address');
  };

  const clearField = (field: 'name' | 'phone' | 'address') => {
    updateDeliveryInfo({ [field]: '' });
    setFieldErrors((prev) => ({ ...prev, [field]: false }));
    if (field === 'phone') phoneCursorRef.current = -1;
  };

  // ── Scroll input ke view saat focus ──
  const handleInputFocus = (inputElement: HTMLElement | null) => {
    if (!inputElement || !scrollContentRef.current) return;

    // Jangan gunakan scrollIntoView karena bisa melempar layar keseluruhan (body) di mobile
    setTimeout(() => {
      const container = scrollContentRef.current;
      if (!container) return;
      const elementRect = inputElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Hitung posisi aman ke dalam scroll container
      const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 40;
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }, 300);
  };

  const phoneDigits = getPhoneDigits(deliveryInfo.phone);
  const isValid =
    deliveryInfo.name.trim().length > 0 &&
    phoneDigits.length >= 10 &&
    deliveryInfo.address.trim().length >= 10;

  if (!open) return null;

  const backdropOpacity = isClosing ? 0 : dragDelta > 0 ? Math.max(0, 1 - dragDelta / 300) : 1;

  const panelMaxHeight = isKeyboardOpen ? '100%' : '92vh';

  const panelTransition = isClosing
    ? 'transform 0.3s ease-out, opacity 0.3s ease-out'
    : dragDelta > 0
      ? 'none'
      : 'max-height 0.15s ease-out, transform 0.3s ease-out';

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 z-[80] bg-black/40 backdrop-blur-md transition-opacity duration-300 ${isClosing ? 'opacity-0 pointer-events-none' : ''
          }`}
        style={{
          touchAction: 'none' as const,
          ...(dragDelta > 0 && !isClosing ? { opacity: backdropOpacity } : {}),
        }}
        onClick={handleClose}
      />

      {/* ── Modal Panel ── */}
      <div
        ref={overlayRef}
        className="fixed inset-x-0 z-[90] flex items-end justify-center pointer-events-none"
        style={{
          height: '100dvh',
          top: 0,
        }}
      >
        <div
          ref={panelRef}
          className={`pointer-events-auto bg-white w-full rounded-t-3xl shadow-layer-xl overflow-hidden flex flex-col ${isClosing ? 'translate-y-full' : ''
            }`}
          style={{
            maxHeight: panelMaxHeight,
            transition: panelTransition,
            ...(dragDelta > 0 && !isClosing ? { transform: `translateY(${dragDelta}px)` } : {}),
          }}
        >
          {/* Drag Trigger Zone */}
          <div
            className="touch-none select-none cursor-grab active:cursor-grabbing flex-shrink-0"
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="px-4 pb-3 pt-0.5 flex items-center border-b border-gray-100">
              <div className="flex items-center gap-3"> {/* Gap dinaikkan sedikit ke 3 */}
                {/* Ikon langsung tanpa background kotak */}
                <Truck
                  size={20} // Ukuran sedikit diperbesar karena tidak ada box
                  className="text-emerald-600"
                  strokeWidth={2} // Stroke sedikit lebih tebal agar tetap tegas
                />
                <div>
                  <h2 className="text-[15px] font-bold text-gray-800 leading-tight tracking-tight">
                    Informasi Pengiriman
                  </h2>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                    Isi data untuk pengiriman COD
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Scrollable Content ── */}
          <div
            ref={scrollContentRef}
            className="overflow-y-auto flex-1"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="p-4 space-y-3">
              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5 animate-badge-pop">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle size={12} className="text-red-500" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed flex-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="p-0.5 hover:bg-red-100 rounded-full transition-colors active:scale-90 flex-shrink-0"
                  >
                    <X size={13} className="text-red-400" strokeWidth={2} />
                  </button>
                </div>
              )}

              {/* Nama */}
              <div className="space-y-1">
                <label htmlFor="checkout-name" className="text-xs font-semibold text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${fieldErrors.name && touched.name ? 'text-red-600' : 'text-gray-400'
                      }`}
                    strokeWidth={1.5}
                  />
                  <input
                    ref={nameInputRef}
                    id="checkout-name"
                    type="text"
                    value={deliveryInfo.name}
                    onChange={handleNameChange}
                    onBlur={() => handleBlur('name')}
                    onFocus={() => handleInputFocus(nameInputRef.current)}
                    placeholder="Nama Anda"
                    autoComplete="name"
                    className={`w-full pl-9 pr-[68px] py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-400 ${fieldErrors.name && touched.name
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 animate-shake'
                      : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                      }`}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {deliveryInfo.name.length > 0 && (
                      <button
                        type="button"
                        onClick={() => clearField('name')}
                        aria-label="Hapus nama"
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-90 flex items-center justify-center"
                      >
                        <X size={13} className="text-gray-500" strokeWidth={2} />
                      </button>
                    )}
                    <span
                      className={`text-[10px] tabular-nums min-w-[30px] text-right ${deliveryInfo.name.length >= MAX_NAME_CHARS ? 'text-red-600 font-semibold' : 'text-gray-500'
                        }`}
                    >
                      {deliveryInfo.name.length}/{MAX_NAME_CHARS}
                    </span>
                  </div>
                </div>
                {fieldErrors.name && touched.name && (
                  <p className="text-[11px] text-red-600 font-medium pl-0.5">Nama wajib diisi</p>
                )}
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-1">
                <label htmlFor="checkout-phone" className="text-xs font-semibold text-gray-700">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone
                    size={14}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${fieldErrors.phone && touched.phone ? 'text-red-600' : 'text-gray-400'
                      }`}
                    strokeWidth={1.5}
                  />
                  <input
                    ref={phoneInputRef}
                    id="checkout-phone"
                    type="tel"
                    inputMode="numeric"
                    value={deliveryInfo.phone}
                    onChange={handlePhoneChange}
                    onBlur={() => handleBlur('phone')}
                    onFocus={() => handleInputFocus(phoneInputRef.current)}
                    placeholder="081-234-567-890"
                    autoComplete="tel"
                    className={`w-full pl-9 pr-[68px] py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-400 tabular-nums ${fieldErrors.phone && touched.phone
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 animate-shake'
                      : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                      }`}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {deliveryInfo.phone.length > 0 && (
                      <button
                        type="button"
                        onClick={() => clearField('phone')}
                        aria-label="Hapus nomor telepon"
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-90 flex items-center justify-center"
                      >
                        <X size={13} className="text-gray-500" strokeWidth={2} />
                      </button>
                    )}
                    <span
                      className={`text-[10px] tabular-nums min-w-[30px] text-right ${phoneDigits.length >= MAX_PHONE_DIGITS ? 'text-red-600 font-semibold' : 'text-gray-500'
                        }`}
                    >
                      {phoneDigits.length}/{MAX_PHONE_DIGITS}
                    </span>
                  </div>
                </div>
                {fieldErrors.phone && touched.phone && (
                  <p className="text-[11px] text-red-600 font-medium pl-0.5">Nomor telepon tidak valid (min. 10 digit)</p>
                )}
              </div>

              {/* Alamat */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="checkout-address" className="text-xs font-semibold text-gray-700">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-medium tabular-nums transition-colors ${deliveryInfo.address.length >= MAX_ADDRESS_CHARS
                      ? 'text-red-600 font-semibold'
                      : deliveryInfo.address.length > MAX_ADDRESS_CHARS * 0.8
                        ? 'text-yellow-600'
                        : 'text-gray-500'
                      }`}
                  >
                    {deliveryInfo.address.length}/{MAX_ADDRESS_CHARS}
                  </span>
                </div>
                <div className="relative">
                  <MapPin
                    size={14}
                    className={`absolute left-3 top-3 pointer-events-none transition-colors ${fieldErrors.address && touched.address ? 'text-red-600' : 'text-gray-400'
                      }`}
                    strokeWidth={1.5}
                  />
                  <textarea
                    ref={addressTextareaRef}
                    id="checkout-address"
                    value={deliveryInfo.address}
                    onChange={handleAddressChange}
                    onBlur={() => handleBlur('address')}
                    onFocus={() => handleInputFocus(addressTextareaRef.current)}
                    placeholder="Jl. Xxx No. 123, Kelurahan Xxx, Kecamatan Xxx, Kota Xxx"
                    rows={3}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm leading-relaxed outline-none transition-all resize-none placeholder:text-gray-400 ${fieldErrors.address && touched.address
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 animate-shake'
                      : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                      }`}
                  />
                </div>
                {fieldErrors.address && touched.address && (
                  <p className="text-[11px] text-red-600 font-medium pl-0.5">Alamat terlalu pendek (min. 10 karakter)</p>
                )}
              </div>

              {/* Auto Detect Button */}
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isLoadingLocation}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-emerald-600/30 text-emerald-700 font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-600/60 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] text-sm"
              >
                {isLoadingLocation ? (
                  <>
                    <Loader size={16} className="animate-spin" strokeWidth={2} />
                    <span className="text-emerald-700">Mendeteksi Lokasi...</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin size={13} className="text-primary" strokeWidth={2} />
                    </div>
                    <span className="text-emerald-700">Deteksi Lokasi Otomatis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 p-4 pt-2 border-t border-gray-100 flex gap-2.5 bg-white">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoadingLocation}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 text-sm disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                if (!loading) onConfirm();
              }}
              disabled={!isValid || isLoadingLocation || loading}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${isValid && !isLoadingLocation && !loading
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" strokeWidth={2} />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} strokeWidth={2} />
                  <span>Lanjut Pesan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes badgePop {
          0% { opacity: 0; transform: scale(0.95) translateY(4px); }
          60% { transform: scale(1.02) translateY(-1px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-badge-pop { animation: badgePop 0.35s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </>
  );
}