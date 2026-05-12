'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronLeft, ChevronRight, MapPin, ChevronDown, ChevronUp, Loader,
  CheckCircle, CreditCard, Banknote, Wallet, Building2,
  Package, ShieldCheck, Truck, Plus, Minus
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { useToastStore } from '@/store/useToastStore';
import { useReviewModalStore } from '@/store/useReviewModalStore';
import { useReviewStore } from '@/store/useReviewStore';
import { formatRupiah } from '@/lib/utils';
import ProductImage from '@/components/ProductImage';

// ── Payment method data ──
const PAYMENT_METHODS = {
  cod: {
    id: 'cod',
    label: 'Bayar di Tempat (COD)',
    icon: Banknote,
    description: 'Bayar saat barang diterima',
    options: null,
  },
  ewallet: {
    id: 'ewallet',
    label: 'E-Wallet',
    icon: Wallet,
    description: 'Bayar dengan dompet digital',
    options: [
      { id: 'gopay', name: 'GoPay', color: '#00AED6' },
      { id: 'dana', name: 'DANA', color: '#108EE9' },
      { id: 'ovo', name: 'OVO', color: '#4C3494' },
      { id: 'linkaja', name: 'LinkAja', color: '#E82529' },
      { id: 'shopeepay', name: 'ShopeePay', color: '#EE4D2D' },
    ],
  },
  va: {
    id: 'va',
    label: 'Virtual Account',
    icon: Building2,
    description: 'Transfer via bank virtual account',
    options: [
      { id: 'bca', name: 'BCA', color: '#003D79' },
      { id: 'mandiri', name: 'Mandiri', color: '#003876' },
      { id: 'bri', name: 'BRI', color: '#00529C' },
      { id: 'bni', name: 'BNI', color: '#F05A22' },
    ],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, updateQuantity } = useCartStore();
  const { deliveryInfo, isLoadingLocation, setIsLoadingLocation, getAddressFromCoords, updateDeliveryInfo } = useDeliveryStore();
  const { showToast } = useToastStore();
  const { openModal } = useReviewModalStore();
  const { triggerRefresh } = useReviewStore();

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedSubPayment, setSelectedSubPayment] = useState<string | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.replace('/');
    }
  }, [items.length, router, isSubmitting]);

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

  const handleSyncLocation = async () => {
    if (!navigator.geolocation) {
      showToast('Geolocation tidak tersedia di browser Anda');
      return;
    }
    setIsLoadingLocation(true);
    try {
      let position: GeolocationPosition;
      try {
        position = await getBestPosition();
      } catch (err: any) {
        if (err?.code === 1) throw err;
        position = await new Promise<GeolocationPosition>((resolve, rejectFallback) => {
          navigator.geolocation.getCurrentPosition(resolve, rejectFallback, {
            enableHighAccuracy: false, timeout: 10000, maximumAge: 120000,
          });
        });
      }
      const { latitude, longitude } = position.coords;
      await getAddressFromCoords(latitude, longitude);
      updateDeliveryInfo({ lat: latitude, lng: longitude });
      showToast('Alamat berhasil disinkronkan');
    } catch (err: any) {
      const code = err?.code;
      if (code === 1) showToast('Izin lokasi ditolak. Aktifkan di pengaturan browser.');
      else if (code === 2) showToast('Lokasi tidak tersedia. Pastikan GPS aktif.');
      else showToast('Gagal mendeteksi lokasi. Coba lagi.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  // ── Accordion toggle ──
  const toggleAccordion = (id: string) => {
    if (expandedAccordion === id) {
      setExpandedAccordion(null);
    } else {
      setExpandedAccordion(id);
      // If COD, auto-select
      if (id === 'cod') {
        setSelectedPayment('cod');
        setSelectedSubPayment(null);
      }
    }
  };

  const handleSubPaymentSelect = (parentId: string, subId: string) => {
    setSelectedPayment(parentId);
    setSelectedSubPayment(subId);
  };

  // ── Calculations ──
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0);
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalSavings = items.reduce((sum, item) => {
    const orig = item.product?.originalPrice;
    const price = item.product?.price;
    const qty = item.quantity || 0;
    if (orig && price && orig > price) return sum + (orig - price) * qty;
    return sum;
  }, 0);

  // ── Validation ──
  const isAddressValid = deliveryInfo.name.trim().length > 0 &&
    deliveryInfo.phone.replace(/\D/g, '').length >= 10 &&
    deliveryInfo.address.trim().length >= 10;
  const isPaymentSelected = selectedPayment !== null &&
    (selectedPayment === 'cod' || selectedSubPayment !== null);
  const canSubmit = isAddressValid && isPaymentSelected && items.length > 0;

  // ── Submit order ──
  const handleSubmitOrder = async () => {
    if (!canSubmit || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';

      const orderPromises = items.map(item =>
        fetch(`${adminApiUrl}/api/admin/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
            customerName: deliveryInfo.name,
            phone: deliveryInfo.phone,
            address: deliveryInfo.address,
            lat: deliveryInfo.lat,
            lng: deliveryInfo.lng,
            paymentMethod: selectedPayment,
            paymentDetail: selectedSubPayment,
          }),
        })
      );

      await Promise.all(orderPromises);

      // Open review modal
      if (items.length === 1) {
        openModal(items[0].product.slug);
      } else {
        openModal();
      }

      triggerRefresh();
      clearCart();
      showToast('Pesanan berhasil dibuat! 🎉');
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('[Checkout Error]', error);
      showToast('Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Back handler with confirmation ──
  const handleBack = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const confirmCancel = () => {
    setShowCancelModal(false);
    router.back();
  };

  // ── Helper: get cart image ──
  const getCartImage = (product: any): string | undefined => {
    const rawImages = product.images || product.image;
    if (Array.isArray(rawImages)) {
      const flat = rawImages.flatMap((img: string) => {
        if (!img || typeof img !== 'string') return [];
        if (img.startsWith('data:image') || img.startsWith('http')) return [img];
        return img.split('|').filter((i: string) => i?.trim()?.startsWith('data:image') || i?.trim()?.startsWith('http'));
      });
      return flat[0];
    } else if (typeof rawImages === 'string') {
      const imgs = rawImages.split('|').map((i: string) => i?.trim()).filter((i: string) => i && (i.startsWith('data:image') || i.startsWith('http')));
      return imgs[0];
    }
    return undefined;
  };

  // ── Payment label helper ──
  const getPaymentLabel = () => {
    if (!selectedPayment) return '';
    if (selectedPayment === 'cod') return 'COD - Bayar di Tempat';
    const method = PAYMENT_METHODS[selectedPayment as keyof typeof PAYMENT_METHODS];
    if (!method?.options || !selectedSubPayment) return '';
    const sub = method.options.find(o => o.id === selectedSubPayment);
    return sub ? `${method.label} - ${sub.name}` : '';
  };

  if (items.length === 0 && !isSubmitting) return null;

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* ── HEADER ── */}
        <div
          className="sticky top-0 z-50 bg-[#0B6B52]
  border-b border-white/10 shadow-md"
          style={{ height: 48 }}
        >
          <div className="flex items-center h-full px-4">

            {/* Back */}
            <button
              onClick={handleBack}
              aria-label="Kembali"
              className="flex items-center gap-1.5
      active:opacity-70 transition-opacity duration-150"
            >
              <ChevronLeft
                size={23}
                strokeWidth={2.7}
                className="text-white
        drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
              />

              <h1
                className="text-[14px] font-bold text-white
        tracking-tight leading-none -mt-[1px]"
              >
                Checkout
              </h1>
            </button>

          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 bg-gray-50/80 overflow-y-auto custom-scrollbar">
          <div className="max-w-lg mx-auto pb-10">

            {/* ═══ BLOK 1: ALAMAT PENGIRIMAN ═══ */}
            <div className="mx-4 mt-4 mb-2">
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                Alamat Pengiriman
              </h2>
            </div>
            <div className="mx-3 bg-white rounded-xl shadow-elevation-1 border border-gray-100/80 overflow-hidden">

              {/* Konten Utama */}
              <div className="px-4 py-3.5 space-y-3">
                {deliveryInfo.name ? (

                  /* ── Kondisi 1: Data Terisi ── */
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-gray-900 tracking-tight">
                          {deliveryInfo.name}
                        </span>
                        {deliveryInfo.phone && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-600 font-medium">{deliveryInfo.phone}</span>
                          </>
                        )}
                      </div>
                      {/* Naikkan kontras address box agar terbaca di mobile */}
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/60">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {deliveryInfo.address || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Tombol GPS — shadow elevation konsisten */}
                    <button
                      onClick={handleSyncLocation}
                      disabled={isLoadingLocation}
                      className="
    w-11 h-11 rounded-xl
    bg-emerald-600
    hover:bg-emerald-700
    text-white
    shadow-md
    active:scale-95
    transition-all duration-200
    flex items-center justify-center
    flex-shrink-0
    disabled:opacity-50
  "
                      aria-label="Sinkronisasi alamat"
                    >
                      {isLoadingLocation ? (
                        <Loader
                          size={16}
                          className="animate-spin text-white"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <MapPin
                          size={16}
                          className="text-white"
                          strokeWidth={2.7}
                        />
                      )}
                    </button>
                  </div>

                ) : (

                  /* ── Kondisi 2: Data Kosong ── */
                  <div className="space-y-3">

                    {/* Row 1: Nama & Nomor Telepon 50%:50% */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-gray-600 leading-none pl-0.5">
                          Nama Penerima
                        </span>
                        {/* h-7.5 tidak valid → h-8 */}
                        <div className="h-8 bg-gray-50/80 border border-gray-200/40
              hover:border-emerald-200 hover:bg-emerald-50/20
              rounded-lg px-2.5 flex items-center
              text-[11px] text-gray-400 font-medium
              select-none truncate transition-colors duration-200">
                          Nama Lengkap...
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-gray-600 leading-none pl-0.5">
                          Nomor Telepon
                        </span>
                        <div className="h-8 bg-gray-50/80 border border-gray-200/40
              hover:border-emerald-200 hover:bg-emerald-50/20
              rounded-lg px-2.5 flex items-center
              text-[11px] text-gray-400 font-medium
              select-none truncate transition-colors duration-200">
                          08xx-xxxx-xxxx
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Detail Alamat + Tombol GPS — slim version */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-gray-600 leading-none pl-0.5">
                        Detail Alamat Tujuan
                      </span>
                      <div className="flex items-center gap-2">

                        {/* Field alamat — slim h-9, items-center bukan items-start */}
                        <div className="flex-1 h-9 bg-gray-50/80 border border-gray-200/40
      hover:border-emerald-200 hover:bg-emerald-50/20
      rounded-lg px-2.5 flex items-center
      text-[11px] text-gray-400 font-medium italic
      select-none truncate transition-colors duration-200">
                          Belum ada alamat terpilih dari profil...
                        </div>

                        {/* Tombol GPS — outline style, lebih subtle */}
                        <button
                          onClick={handleSyncLocation}
                          disabled={isLoadingLocation}
                          className="w-9 h-9 rounded-lg
        bg-emerald-600 text-white
        hover:bg-emerald-700
        active:scale-95 transition-all
        flex items-center justify-center flex-shrink-0
        disabled:opacity-50"
                          aria-label="Sinkronisasi alamat otomatis via GPS"
                        >
                          {isLoadingLocation
                            ? <Loader size={13} className="animate-spin text-white" strokeWidth={2.5} />
                            : <MapPin size={13} className="text-white" strokeWidth={2.5} />
                          }
                        </button>

                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Peringatan */}
              {!isAddressValid && deliveryInfo.name && (
                <div className="px-4 pb-2.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-amber-700 bg-amber-50/60 border border-amber-100/40 px-2.5 py-1.5 rounded-lg">
                    <span>⚠</span>
                    <p className="leading-tight">Lengkapi data koordinat & alamat pengiriman di halaman Profil</p>
                  </div>
                </div>
              )}
            </div>

            {/* ═══ BLOK 2: RINGKASAN PRODUK (Layered Depth & Premium Custom Style) ═══ */}
            <div className="mx-4 mt-5 mb-2">
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                Ringkasan Pesanan
              </h2>
            </div>
            <div className="mx-3 bg-white rounded-xl shadow-elevation-1 border border-gray-100/80 overflow-hidden">

              <div className="px-3 py-1 divide-y divide-gray-50">
                {items.map((item) => {
                  const product = item.product;
                  const qty = item.quantity || 0;
                  const price = product?.price ?? 0;
                  const originalPrice = product?.originalPrice;
                  const subtotal = price * qty;
                  const hasDiscount = originalPrice && originalPrice > price;
                  const cartImg = getCartImage(product);

                  return (
                    <div key={product.id} className="flex gap-3 py-2.5 items-center">
                      {/* Gambar Produk */}
                      <ProductImage
                        category={product.category}
                        name={product.name}
                        src={cartImg}
                        className="w-11 h-11 rounded-lg flex-shrink-0 border border-gray-100/50 object-cover bg-white"
                      />

                      {/* Kolom Informasi Tengah */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-gray-800 truncate leading-tight">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-emerald-600 font-bold text-[11px]">
                            {formatRupiah(price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-gray-400 line-through">
                              {formatRupiah(originalPrice)}
                            </span>
                          )}
                        </div>

                        <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                          Subtotal: <span className="text-gray-600 font-bold">{formatRupiah(subtotal)}</span>
                        </p>
                      </div>

                      {/* AREA - + COUNTER: Diubah menggunakan layer card murni (bg-white) dengan sudut rounded-lg dan shadow-sm agar terasa tombol interaktif */}
                      <div className="flex items-center bg-gray-50 border border-gray-200/60 rounded-lg flex-shrink-0 overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(product.id, qty - 1)}
                          disabled={qty <= 1}
                          className={`w-7 h-7 bg-white flex items-center justify-center transition active:scale-90 border-r border-gray-200/60 ${qty <= 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                          aria-label="Kurangi kuantitas"
                        >
                          <Minus size={10} strokeWidth={2.5} />
                        </button>

                        <span className="w-6 text-center font-bold text-[11px] text-gray-800 select-none" aria-live="polite">
                          {qty}
                        </span>

                        <button
                          onClick={() => handleUpdateQuantity(product.id, qty + 1)}
                          className="w-7 h-7 bg-white flex items-center justify-center transition active:scale-90 text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-l border-gray-200/60"
                          aria-label="Tambah kuantitas"
                        >
                          <Plus size={10} strokeWidth={2.5} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Hanya tampilkan Summary jika ada penghematan, tanpa menampilkan Total Pembayaran lagi */}
              {totalSavings > 0 && (
                <div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100/60">
                  <div className="flex items-center justify-between text-[11px] px-0.5">
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="text-[14px]">✨</span> Total Hemat
                    </span>
                    <span className="font-bold text-emerald-600">-{formatRupiah(totalSavings)}</span>
                  </div>
                </div>
              )}

            </div>

            {/* ═══ BLOK 3: METODE PEMBAYARAN ═══ */}
            <div className="mx-4 mt-5 mb-2">
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                Metode Pembayaran
              </h2>
            </div>
            <div className="mx-3 bg-white rounded-xl shadow-elevation-1 border border-gray-100/80 overflow-hidden">

              {/* Accordion List */}
              <div className="divide-y divide-gray-100/60">
                {Object.values(PAYMENT_METHODS).map((method) => {
                  const Icon = method.icon;
                  const isExpanded = expandedAccordion === method.id;
                  const isSelected = selectedPayment === method.id;

                  return (
                    <div key={method.id}>

                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleAccordion(method.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-gray-50/50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-100' : 'bg-gray-100'
                            }`}>
                            <Icon
                              size={16}
                              className={isSelected ? 'text-emerald-700' : 'text-gray-500'}
                              strokeWidth={2}
                            />
                          </div>
                          <div className="text-left">
                            <p className={`text-[12px] font-semibold leading-none ${isSelected ? 'text-emerald-800' : 'text-gray-800'
                              }`}>
                              {method.label}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1 leading-none">
                              {method.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected && method.id === 'cod' && (
                            <CheckCircle size={15} className="text-emerald-600" strokeWidth={2.5} />
                          )}
                          {method.options && (
                            isExpanded
                              ? <ChevronUp size={15} className="text-gray-400" />
                              : <ChevronRight size={15} className="text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Body — sub-options */}
                      {method.options && (
                        <div
                          className="overflow-hidden transition-all duration-300 ease-in-out"
                          style={{
                            maxHeight: isExpanded ? `${method.options.length * 52}px` : '0px',
                            opacity: isExpanded ? 1 : 0,
                          }}
                        >
                          <div className="px-4 pb-2.5 space-y-1.5">
                            {method.options.map((opt) => {
                              const isSubSelected =
                                selectedPayment === method.id && selectedSubPayment === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => handleSubPaymentSelect(method.id, opt.id)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isSubSelected
                                    ? 'bg-emerald-50 border border-emerald-400 shadow-sm'
                                    : 'border border-transparent hover:border-emerald-100 hover:bg-emerald-50/3'
                                    }`}
                                >
                                  <div
                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0"
                                    style={{ backgroundColor: opt.color }}
                                  >
                                    {opt.name.charAt(0)}
                                  </div>
                                  <span className={`text-[12px] font-medium flex-1 text-left ${isSubSelected ? 'text-emerald-800 font-semibold' : 'text-gray-700'
                                    }`}>
                                    {opt.name}
                                  </span>
                                  {isSubSelected && (
                                    <CheckCircle size={15} className="text-emerald-600" strokeWidth={2.5} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* ── STICKY FOOTER ── */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-2.5 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-lg mx-auto">

            {/* Info Total & Metode */}
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[10px] text-gray-500 leading-none">Total Pembayaran</p>
                <p className="text-xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                  {formatRupiah(total)}
                </p>
              </div>
              {selectedPayment && (
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 leading-none">Metode</p>
                  <p className="text-[12px] font-semibold text-emerald-700 mt-0.5">
                    {getPaymentLabel()}
                  </p>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={!canSubmit || isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${canSubmit && !isSubmitting
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/20'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader size={17} className="animate-spin" strokeWidth={2} />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <span>Bayar Sekarang</span>
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* ── CANCEL CONFIRMATION MODAL ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setShowCancelModal(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-[24px] shadow-elevation-3 max-w-[320px] w-full p-6 text-center animate-scale-in border border-gray-50">
            <div className="flex flex-col items-center">

              {/* Ikon */}
              <div className="w-[118px] h-[118px] mb-2 relative drop-shadow-[0_12px_24px_rgba(245,158,11,0.16)]">
                <Image
                  src="/icons/cancel order.png"
                  alt="Batalkan pesanan"
                  fill
                  sizes="96px"
                  priority
                  className="object-contain"
                />
              </div>

              {/* Teks */}
              <div className="space-y-1.5 mb-5">
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  Batalkan Pesanan?
                </h3>
                <p className="text-[11px] text-gray-500 leading-relaxed px-1">
                  Checkout belum selesai. Anda dapat melanjutkan kembali nanti dari keranjang belanja.
                </p>
              </div>

              {/* Tombol */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 h-11 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Tetap di Sini
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    // router.back();
                  }}
                  className="flex-1 h-11 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 shadow-md shadow-emerald-800/25 active:scale-95 transition-all"
                >
                  Ya, Keluar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
