"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ChevronDown,
  Loader,
  CheckCircle,
  Banknote,
  Wallet,
  Building2,
  Minus,
  Plus,
  Tag,
  Truck,
  Receipt,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { useToastStore } from "@/store/useToastStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useReviewModalStore } from "@/store/useReviewModalStore";
import { useReviewStore } from "@/store/useReviewStore";
import { formatRupiah } from "@/lib/utils";
import ProductImage from "@/components/ProductImage";

// ── Alamat dari profil (mock — ganti dengan data dari store/session) ──
const SAVED_ADDRESSES = [
  {
    id: "1",
    label: "Rumah",
    address: "Jl. Melati No. 12, Telang Indah, Kamal",
    isMain: true,
  },
  {
    id: "2",
    label: "Kantor",
    address: "Gedung Rektorat Lt. 2, Universitas Trunojoyo Madura, Kamal",
    isMain: false,
  },
];

// Mock user dari profil
const PROFILE_USER = {
  name: "Ahmad Fauzi",
  phone: "081-234-5678",
};

// ── Payment method data ──
const PAYMENT_METHODS = {
  cod: {
    id: "cod",
    label: "Bayar di Tempat (COD)",
    icon: Banknote,
    description: "Bayar saat barang diterima",
    options: null,
  },
  ewallet: {
    id: "ewallet",
    label: "E-Wallet",
    icon: Wallet,
    description: "Bayar dengan dompet digital",
    options: [
      { id: "gopay", name: "GoPay", color: "#00AED6" },
      { id: "dana", name: "DANA", color: "#108EE9" },
      { id: "ovo", name: "OVO", color: "#4C3494" },
      { id: "linkaja", name: "LinkAja", color: "#E82529" },
      { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D" },
    ],
  },
  va: {
    id: "va",
    label: "Virtual Account",
    icon: Building2,
    description: "Transfer via bank virtual account",
    options: [
      { id: "bca", name: "BCA", color: "#003D79" },
      { id: "mandiri", name: "Mandiri", color: "#003876" },
      { id: "bri", name: "BRI", color: "#00529C" },
      { id: "bni", name: "BNI", color: "#F05A22" },
    ],
  },
};

const ONGKIR = 0; // Gratis ongkir untuk MVP

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, updateQuantity } = useCartStore();
  const {
    deliveryInfo,
    isLoadingLocation,
    setIsLoadingLocation,
    getAddressFromCoords,
    updateDeliveryInfo,
  } = useDeliveryStore();
  const { showToast } = useToastStore();
  const { openModal } = useReviewModalStore();
  const { triggerRefresh } = useReviewStore();
  const navStore = useNavigationStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    SAVED_ADDRESSES.find((a) => a.isMain)?.id ?? SAVED_ADDRESSES[0]?.id ?? "",
  );
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedSubPayment, setSelectedSubPayment] = useState<string | null>(
    null,
  );
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const selectedAddress = SAVED_ADDRESSES.find(
    (a) => a.id === selectedAddressId,
  );

  const handleOpenDropdown = () => {
    if (dropdownTriggerRef.current) {
      const rect = dropdownTriggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setShowAddressDropdown((p) => !p);
  };

  useEffect(() => {
    if (!showAddressDropdown) return;

    const scrollEl = document.querySelector('.checkout-scroll');
    const onScroll = () => setShowAddressDropdown(false);

    scrollEl?.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollEl?.removeEventListener('scroll', onScroll);
  }, [showAddressDropdown]);

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) router.replace("/");
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
          if (!bestPos || pos.coords.accuracy < bestPos.coords.accuracy)
            bestPos = pos;
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
        { enableHighAccuracy: true, maximumAge: 0 },
      );
      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        navigator.geolocation.clearWatch(watchId);
        if (bestPos) resolve(bestPos);
        else reject({ code: 3, message: "Timeout" });
      }, MAX_WAIT);
    });
  };

  const handleSyncLocation = async () => {
    if (!navigator.geolocation) {
      showToast("Geolocation tidak tersedia");
      return;
    }
    setIsLoadingLocation(true);
    try {
      let position: GeolocationPosition;
      try {
        position = await getBestPosition();
      } catch (err: any) {
        if (err?.code === 1) throw err;
        position = await new Promise<GeolocationPosition>(
          (resolve, rejectFallback) => {
            navigator.geolocation.getCurrentPosition(resolve, rejectFallback, {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 120000,
            });
          },
        );
      }
      const { latitude, longitude } = position.coords;
      await getAddressFromCoords(latitude, longitude);
      updateDeliveryInfo({ lat: latitude, lng: longitude });
      showToast("Koordinat berhasil diperbarui");
    } catch (err: any) {
      const code = err?.code;
      if (code === 1) showToast("Izin lokasi ditolak.");
      else if (code === 2) showToast("Lokasi tidak tersedia.");
      else showToast("Gagal mendeteksi lokasi.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const toggleAccordion = (id: string) => {
    if (expandedAccordion === id) setExpandedAccordion(null);
    else {
      setExpandedAccordion(id);
      if (id === "cod") {
        setSelectedPayment("cod");
        setSelectedSubPayment(null);
      }
    }
  };

  const handleSubPaymentSelect = (parentId: string, subId: string) => {
    setSelectedPayment(parentId);
    setSelectedSubPayment(subId);
  };

  // ── Kalkulasi ──
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0,
  );
  const totalSavings = items.reduce((sum, item) => {
    const orig = item.product?.originalPrice;
    const price = item.product?.price;
    const qty = item.quantity || 0;
    if (orig && price && orig > price) return sum + (orig - price) * qty;
    return sum;
  }, 0);
  const total = subtotal + ONGKIR;

  const isPaymentSelected =
    selectedPayment !== null &&
    (selectedPayment === "cod" || selectedSubPayment !== null);
  const canSubmit =
    selectedAddress !== undefined && isPaymentSelected && items.length > 0;

  const handleSubmitOrder = async () => {
    if (!canSubmit || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const adminApiUrl =
        process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3000";
      const orderPromises = items.map((item) =>
        fetch(`${adminApiUrl}/api/admin/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
            customerName: PROFILE_USER.name,
            phone: PROFILE_USER.phone,
            address: selectedAddress?.address,
            lat: deliveryInfo.lat,
            lng: deliveryInfo.lng,
            paymentMethod: selectedPayment,
            paymentDetail: selectedSubPayment,
          }),
        }),
      );
      await Promise.all(orderPromises);
      if (items.length === 1) openModal(items[0].product.slug);
      else openModal();
      triggerRefresh();
      clearCart();
      showToast("Pesanan berhasil dibuat! 🎉");
      const source = navStore.checkoutSource;
      navStore.setCheckoutSource(null);
      if (source === "product" && items.length === 1) router.back();
      else router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("[Checkout Error]", error);
      showToast("Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = useCallback(() => setShowCancelModal(true), []);

  const confirmCancel = () => {
    setShowCancelModal(false);
    const source = navStore.checkoutSource;
    navStore.setCheckoutSource(null);
    if (source === "product") router.back();
    else router.push("/");
  };

  const getCartImage = (product: any): string | undefined => {
    const rawImages = product.images || product.image;
    if (Array.isArray(rawImages)) {
      const flat = rawImages.flatMap((img: string) => {
        if (!img || typeof img !== "string") return [];
        if (img.startsWith("data:image") || img.startsWith("http"))
          return [img];
        return img
          .split("|")
          .filter(
            (i: string) =>
              i?.trim()?.startsWith("data:image") ||
              i?.trim()?.startsWith("http"),
          );
      });
      return flat[0];
    } else if (typeof rawImages === "string") {
      const imgs = rawImages
        .split("|")
        .map((i: string) => i?.trim())
        .filter(
          (i: string) =>
            i && (i.startsWith("data:image") || i.startsWith("http")),
        );
      return imgs[0];
    }
    return undefined;
  };

  const getPaymentLabel = () => {
    if (!selectedPayment) return "";
    if (selectedPayment === "cod") return "COD - Bayar di Tempat";
    const method =
      PAYMENT_METHODS[selectedPayment as keyof typeof PAYMENT_METHODS];
    if (!method?.options || !selectedSubPayment) return "";
    const sub = method.options.find((o) => o.id === selectedSubPayment);
    return sub ? `${method.label} - ${sub.name}` : "";
  };

  if (items.length === 0 && !isSubmitting) return null;

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* ── HEADER ── */}
        <div
          className="sticky top-0 z-50 bg-[#0B6B52] shadow-md"
          style={{ height: 48 }}
        >
          <div className="flex items-center h-full px-4">
            <button
              onClick={handleBack}
              aria-label="Kembali"
              className="flex items-center gap-1.5 active:opacity-70 transition-opacity duration-150"
            >
              <ChevronLeft size={23} strokeWidth={2.7} className="text-white" />
              <h1 className="text-[14px] font-bold text-white tracking-tight leading-none -mt-[1px]">
                Checkout
              </h1>
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 bg-gray-50/80 overflow-y-auto checkout-scroll">
          <div className="max-w-lg mx-auto pb-10">
            {/* ═══ BLOK 1: ALAMAT PENGIRIMAN ═══ */}
            <div className="mx-4 mt-4 mb-2">
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                Alamat Pengiriman
              </h2>
            </div>

            <div className="mx-3 bg-white rounded-xl ring-1 ring-slate-900/[0.04] shadow-layer-xs overflow-visible">
              <div className="px-4 py-3.5 space-y-3">
                {/* ── Dropdown pilih alamat (RELATIVE container) ── */}
                <div className="relative z-10">
                  <button
                    ref={dropdownTriggerRef}
                    onClick={handleOpenDropdown}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200/70 rounded-xl hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={14}
                        className="text-emerald-600 flex-shrink-0"
                        strokeWidth={2.5}
                      />
                      <span className="text-[13px] font-bold text-gray-800">
                        {selectedAddress?.label ?? "Pilih Alamat"}
                      </span>
                      {selectedAddress?.isMain && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">
                          Utama
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      size={15}
                      strokeWidth={2.5}
                      className={`text-gray-400 transition-transform duration-200 ${showAddressDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* ── DROPDOWN: absolute, menempel, ikut scroll ── */}
                  {showAddressDropdown && (
                    <>
                      {/* Overlay tutup seluruh layar — tetap fixed */}
                      <div
                        className="fixed inset-0 z-[59]"
                        onClick={() => setShowAddressDropdown(false)}
                      />
                      {/* Dropdown menempel di bawah trigger */}
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-[260px] overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-lg z-[60]">
                        {SAVED_ADDRESSES.map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setShowAddressDropdown(false);
                            }}
                            className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors
                  ${selectedAddressId === addr.id ? "bg-emerald-50" : "hover:bg-gray-50"}
                  border-b border-gray-50 last:border-0`}
                          >
                            <div
                              className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                selectedAddressId === addr.id
                                  ? "border-emerald-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddressId === addr.id && (
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[12px] font-bold text-gray-800">
                                  {addr.label}
                                </span>
                                {addr.isMain && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">
                                    Utama
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 leading-snug">
                                {addr.address}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Detail alamat terpilih */}
                {selectedAddress && (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-600 leading-relaxed">
                        {selectedAddress.address}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-500 font-medium">
                        <span className="font-semibold text-gray-700">
                          {PROFILE_USER.name}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span>{PROFILE_USER.phone}</span>
                      </div>
                    </div>

                    {/* Sync GPS */}
                    <button
                      onClick={handleSyncLocation}
                      disabled={isLoadingLocation}
                      className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                      aria-label="Sinkronisasi koordinat GPS"
                    >
                      {isLoadingLocation ? (
                        <Loader
                          size={14}
                          className="animate-spin"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <MapPin size={14} strokeWidth={2.7} />
                      )}
                    </button>
                  </div>
                )}

                {/* Jika belum ada alamat tersimpan */}
                {SAVED_ADDRESSES.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-[12px] text-gray-400 font-medium">
                      Belum ada alamat tersimpan
                    </p>
                    <button
                      onClick={() => router.push("/profile")}
                      className="text-[12px] font-bold text-emerald-600 underline underline-offset-2 mt-1"
                    >
                      Tambah di halaman Profil
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ BLOK 2: RINGKASAN PESANAN ═══ */}
            <div className="mx-4 mt-5 mb-2">
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                Ringkasan Pesanan
              </h2>
            </div>

            <div className="mx-3 bg-white rounded-xl ring-1 ring-slate-900/[0.04] shadow-layer-xs overflow-hidden">
              {/* Product list */}
              <div className="px-3 py-1 divide-y divide-gray-50">
                {items.map((item) => {
                  const product = item.product;
                  const qty = item.quantity || 0;
                  const price = product?.price ?? 0;
                  const originalPrice = product?.originalPrice;
                  const subtotalItem = price * qty;
                  const hasDiscount = originalPrice && originalPrice > price;
                  const cartImg = getCartImage(product);

                  return (
                    <div
                      key={product.id}
                      className="flex gap-3 py-2.5 items-center"
                    >
                      <ProductImage
                        category={product.category}
                        name={product.name}
                        src={cartImg}
                        className="w-11 h-11 rounded-lg flex-shrink-0 border border-gray-100/50 object-cover bg-white"
                      />
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
                          Subtotal:{" "}
                          <span className="text-gray-600 font-bold">
                            {formatRupiah(subtotalItem)}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center bg-gray-50 border border-gray-200/60 rounded-lg flex-shrink-0 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, qty - 1)}
                          disabled={qty <= 1}
                          className={`w-7 h-7 bg-white flex items-center justify-center transition active:scale-90 border-r border-gray-200/60 ${qty <= 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          <Minus size={10} strokeWidth={2.5} />
                        </button>
                        <span className="w-6 text-center font-bold text-[11px] text-gray-800 select-none">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, qty + 1)}
                          className="w-7 h-7 bg-white flex items-center justify-center transition active:scale-90 text-gray-500 hover:text-gray-700 border-l border-gray-200/60"
                        >
                          <Plus size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Rincian Pembayaran ── */}
              <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <Receipt size={12} strokeWidth={2} />
                    <span>
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
                      produk)
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold text-gray-700">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                {/* Diskon */}
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px] text-emerald-600">
                      <Tag size={12} strokeWidth={2} />
                      <span>Diskon</span>
                    </div>
                    <span className="text-[12px] font-semibold text-emerald-600">
                      -{formatRupiah(totalSavings)}
                    </span>
                  </div>
                )}

                {/* Ongkir */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <Truck size={12} strokeWidth={2} />
                    <span>Ongkos Kirim</span>
                  </div>
                  {ONGKIR === 0 ? (
                    <span className="text-[12px] font-bold text-emerald-600">
                      Gratis
                    </span>
                  ) : (
                    <span className="text-[12px] font-semibold text-gray-700">
                      {formatRupiah(ONGKIR)}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200 pt-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-gray-800">
                      Total Pembayaran
                    </span>
                    <span className="text-[15px] font-extrabold text-emerald-700 tracking-tight">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ BLOK 3: METODE PEMBAYARAN ═══ */}
            <div className="mx-4 mt-5 mb-2">
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                Metode Pembayaran
              </h2>
            </div>

            <div className="mx-3 bg-white rounded-xl ring-1 ring-slate-900/[0.04] shadow-layer-xs overflow-hidden">
              <div className="divide-y divide-gray-100/60">
                {Object.values(PAYMENT_METHODS).map((method) => {
                  const Icon = method.icon;
                  const isExpanded = expandedAccordion === method.id;
                  const isSelected = selectedPayment === method.id;

                  return (
                    <div key={method.id}>
                      <button
                        onClick={() => toggleAccordion(method.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${isSelected ? "bg-emerald-50/50" : "hover:bg-gray-50/50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-emerald-100" : "bg-gray-100"}`}
                          >
                            <Icon
                              size={16}
                              className={
                                isSelected
                                  ? "text-emerald-700"
                                  : "text-gray-500"
                              }
                              strokeWidth={2}
                            />
                          </div>
                          <div className="text-left">
                            <p
                              className={`text-[12px] font-semibold leading-none ${isSelected ? "text-emerald-800" : "text-gray-800"}`}
                            >
                              {method.label}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1 leading-none">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && method.id === "cod" && (
                            <CheckCircle
                              size={15}
                              className="text-emerald-600"
                              strokeWidth={2.5}
                            />
                          )}
                          {method.options && (
                            <ChevronDown
                              size={15}
                              className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </button>

                      {method.options && (
                        <div
                          className="overflow-hidden transition-all duration-300 ease-in-out"
                          style={{
                            maxHeight: isExpanded ? "300px" : "0px",
                            opacity: isExpanded ? 1 : 0,
                          }}
                        >
                          <div className="px-4 pb-2.5 space-y-1.5">
                            {method.options.map((opt) => {
                              const isSubSelected =
                                selectedPayment === method.id &&
                                selectedSubPayment === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() =>
                                    handleSubPaymentSelect(method.id, opt.id)
                                  }
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                                    isSubSelected
                                      ? "bg-emerald-50 border border-emerald-400 shadow-sm"
                                      : "border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30"
                                  }`}
                                >
                                  <div
                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0"
                                    style={{ backgroundColor: opt.color }}
                                  >
                                    {opt.name.charAt(0)}
                                  </div>
                                  <span
                                    className={`text-[12px] font-medium flex-1 text-left ${isSubSelected ? "text-emerald-800 font-semibold" : "text-gray-700"}`}
                                  >
                                    {opt.name}
                                  </span>
                                  {isSubSelected && (
                                    <CheckCircle
                                      size={15}
                                      className="text-emerald-600"
                                      strokeWidth={2.5}
                                    />
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
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[10px] text-gray-500 leading-none">
                  Total Pembayaran
                </p>
                <p className="text-xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                  {formatRupiah(total)}
                </p>
              </div>
              {selectedPayment && (
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 leading-none">
                    Metode
                  </p>
                  <p className="text-[12px] font-semibold text-emerald-700 mt-0.5">
                    {getPaymentLabel()}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleSubmitOrder}
              disabled={!canSubmit || isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                canSubmit && !isSubmitting
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/20"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader size={17} className="animate-spin" strokeWidth={2} />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Bayar Sekarang</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── CANCEL MODAL ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-[320px] w-full p-6 text-center border border-gray-50">
            <div className="flex flex-col items-center">
              <div className="w-[118px] h-[118px] mb-2 relative">
                <Image
                  src="/icons/cancel order.png"
                  alt="Batalkan pesanan"
                  fill
                  sizes="96px"
                  priority
                  className="object-contain"
                />
              </div>
              <div className="space-y-1.5 mb-5">
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  Batalkan Pesanan?
                </h3>
                <p className="text-[11px] text-gray-500 leading-relaxed px-1">
                  Checkout belum selesai. Anda dapat melanjutkan kembali nanti
                  dari keranjang belanja.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 h-11 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Tetap di Sini
                </button>
                <button
                  onClick={confirmCancel}
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
