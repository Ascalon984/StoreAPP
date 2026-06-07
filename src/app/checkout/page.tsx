"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Loader,
  CheckCircle,
  HandCoins,
  Wallet,
  Building2,
  Tag,
  Minus,
  Plus,
  QrCode,
  Box,
  Receipt,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useReviewModalStore } from "@/store/useReviewModalStore";
import { useReviewStore } from "@/store/useReviewStore";
import { formatRupiah } from "@/lib/utils";
import ProductImage from "@/components/ProductImage";
import PaymentModal, { PaymentStep } from "@/components/PaymentModal";

const formatTargetInput = (value: string, type?: string) => {
  const digits = value.replace(/\D/g, "");

  switch (type) {
    case "phone": {
      const limited = digits.slice(0, 12);

      if (limited.length <= 3) return limited;
      if (limited.length <= 7)
        return `${limited.slice(0, 3)}-${limited.slice(3)}`;

      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }

    case "number":
      return digits;

    default:
      return value;
  }
};

const getTargetPlaceholder = (type?: string) => {
  switch (type) {
    case "phone":
      return "Nomor HP (08123456789)";
    case "email":
      return "Email aktif";
    case "number":
      return "ID angka / nomor akun";
    case "none":
      return "Tidak diperlukan";
    default:
      return "ID tujuan / username";
  }
};

// Mock user dari profil
const PROFILE_USER = {
  name: "Ahmad Fauzi",
  phone: "081-234-5678",
};

// ── Payment method data ──
const PAYMENT_METHODS = {
  qr: {
    id: "qr",
    label: "QRIS",
    icon: QrCode,
    description: "Scan QR untuk menyelesaikan pembayaran",
    options: null,
  },
  ewallet: {
    id: "ewallet",
    label: "E-Wallet",
    icon: Wallet,
    description: "Bayar dengan dompet digital",
    options: [
      { id: "gopay", name: "GoPay", image: "Gopay.png" },
      { id: "dana", name: "DANA", image: "DANA.png" },
      { id: "ovo", name: "OVO", image: "OVO.png" },
      { id: "linkaja", name: "LinkAja", image: "LinkAja.png" },
      { id: "shopeepay", name: "ShopeePay", image: "Shoppepay.png" },
    ],
  },
  va: {
    id: "va",
    label: "Virtual Account",
    icon: Building2,
    description: "Transfer via bank virtual account",
    options: [
      { id: "bca", name: "BCA", image: "BCA.png" },
      { id: "mandiri", name: "Mandiri", image: "Mandiri.png" },
      { id: "bri", name: "BRI", image: "BRI.png" },
      { id: "bni", name: "BNI", image: "BNI.png" },
    ],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    clearCart,
    updateQuantity,
    removeItem,
    buyNowItem,
    setBuyNowItem,
  } = useCartStore();
  const { showToast } = useToastStore();
  const { openModal } = useReviewModalStore();
  const { triggerRefresh } = useReviewStore();
  const navStore = useNavigationStore();

  const isBuyNow = navStore.checkoutSource === "product";
  const displayItems = isBuyNow && buyNowItem ? [buyNowItem] : items;

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (isBuyNow && buyNowItem) {
      if (qty <= 0) setBuyNowItem(null);
      else setBuyNowItem({ ...buyNowItem, quantity: qty });
    } else {
      updateQuantity(productId, qty);
    }
  };

  const handleRemoveItem = (productId: string) => {
    if (isBuyNow) setBuyNowItem(null);
    else removeItem(productId);
  };

  const paymentSectionRef = useRef<HTMLDivElement | null>(null);
  const [targetIds, setTargetIds] = useState<Record<string, string>>({});
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedSubPayment, setSelectedSubPayment] = useState<string | null>(
    null,
  );
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("idle");
  const userPoints = 12500;
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const toggleAccordion = (id: string) => {
    if (expandedAccordion === id) setExpandedAccordion(null);
    else {
      setExpandedAccordion(id);
      if (id === "qr") {
        setSelectedPayment("qr");
        setSelectedSubPayment(null);
      }

      // Auto-scroll ke section pembayaran agar pilihan terlihat
      setTimeout(() => {
        if (paymentSectionRef.current) {
          const yOffset = -70; // Offset agar tidak terlalu mepet ke header sticky
          const element = paymentSectionRef.current;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100); // Delay kecil menunggu accordion mulai mengembang
    }
  };

  const handleSubPaymentSelect = (parentId: string, subId: string) => {
    setSelectedPayment(parentId);
    setSelectedSubPayment(subId);
  };

  // ── Kalkulasi ──
  const subtotal = displayItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0,
  );

  const totalQty = displayItems.reduce((s, i) => s + (i.quantity || 0), 0);

  const totalSavings = displayItems.reduce((sum, item) => {
    const orig = item.product?.originalPrice;
    const price = item.product?.price;
    const qty = item.quantity || 0;

    if (orig && price && orig > price) {
      return sum + (orig - price) * qty;
    }

    return sum;
  }, 0);
  const pointsToUse = usePoints ? Math.min(userPoints, subtotal) : 0;
  const serviceFee = 1000; // Data mock biaya layanan
  const grossSubtotal = subtotal + totalSavings;
  const discountPercentage =
    grossSubtotal > 0 ? Math.round((totalSavings / grossSubtotal) * 100) : 0;
  const total = grossSubtotal - totalSavings - pointsToUse + serviceFee;

  const hasValidTargets = displayItems.every((item) => {
    const type = item.product.targetType;
    if (type === "none") return true; // hanya "none" eksplisit yang dibebaskan

    const val = targetIds[item.product.id];
    return typeof val === "string" && val.trim().length > 0;
  });

  const isPaymentValid =
    selectedPayment === "qr" || Boolean(selectedSubPayment);

  const canSubmit =
    displayItems.length > 0 &&
    selectedPayment !== null &&
    isPaymentValid &&
    hasValidTargets &&
    !isSubmitting;

  const executeOrderSubmission = async () => {
    if (!canSubmit || isSubmitting) return false;
    try {
      setIsSubmitting(true);
      const adminApiUrl =
        process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3000";
      const orderPromises = displayItems.map((item) =>
        fetch(`${adminApiUrl}/api/admin/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
            customerName: PROFILE_USER.name,
            phone: PROFILE_USER.phone,
            targetId: targetIds[item.product.id],
            paymentMethod: selectedPayment,
            paymentDetail: selectedSubPayment,
          }),
        }),
      );
      await Promise.all(orderPromises);

      triggerRefresh();
      if (isBuyNow) setBuyNowItem(null);
      else clearCart();
      return true;
    } catch (error) {
      console.error("[Checkout Error]", error);
      showToast("Terjadi kesalahan saat memproses pesanan.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishCheckout = () => {
    showToast("Pesanan berhasil dibuat! 🎉");
    if (displayItems.length === 1) openModal(displayItems[0].product.slug);
    else openModal();
    const source = navStore.checkoutSource;
    navStore.setCheckoutSource(null);
    setPaymentStep("idle");
    if (source === "product" && displayItems.length === 1) router.back();
    else router.replace("/");
    router.refresh();
  };

  const handleCheckoutClick = () => {
    setHasAttemptedSubmit(true);

    if (isSubmitting) return;

    if (!selectedPayment) {
      showToast("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    if (selectedPayment !== "qr" && !selectedSubPayment) {
      showToast("Pilih detail metode pembayaran");
      return;
    }

    if (!hasValidTargets) {
      showToast("Lengkapi data tujuan produk");
      return;
    }

    if (!canSubmit) {
      showToast("Data checkout belum lengkap");
      return;
    }

    if (selectedPayment === "qr") {
      setPaymentStep("qr");
    } else if (selectedPayment === "va") {
      setPaymentStep("va");
    } else if (selectedPayment === "ewallet") {
      setPaymentStep("ewallet");
    }
  };

  const handleBack = useCallback(() => {
    const source = navStore.checkoutSource;
    navStore.setCheckoutSource(null);
    if (source === "product") router.back();
    else router.push("/");
  }, [navStore, router]);

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
    if (selectedPayment === "qr") return "QRIS";
    const method =
      PAYMENT_METHODS[selectedPayment as keyof typeof PAYMENT_METHODS];
    if (!method?.options || !selectedSubPayment) return "";
    const sub = method.options.find((o) => o.id === selectedSubPayment);
    return sub ? `${method.label} - ${sub.name}` : "";
  };

  if (displayItems.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* ── HEADER ── */}
        <div
          className="sticky top-0 z-50 bg-[#048750] shadow-layer-xs"
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
                Keranjang
              </h1>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-start px-6 pt-20">
          <div className="relative w-48 h-48 mb-4">
            <Image
              src="/illustrations/Empty Cart.png"
              alt="Keranjang Kosong"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-[16px] font-bold text-gray-900 mb-2">
            Keranjang masih kosong
          </h2>
          <p className="text-[13px] text-gray-500 text-center mb-8 max-w-[280px]">
            Tambahkan produk terlebih dahulu untuk melanjutkan checkout
          </p>
          <button
            onClick={() => router.push("/")}
            className="
            w-full
            max-w-[260px]
            h-11
            rounded-xl
            bg-emerald-600
            text-white
            font-semibold
            text-[13px]
            active:scale-95
            transition-all
            shadow-layer-sm
          "
          >
            Mulai Belanja
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* ── HEADER ── */}
        <div
          className="sticky top-0 z-50 bg-[#048750] shadow-md"
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
        <div className="flex-1 overflow-y-auto checkout-scroll">
          <div className="max-w-lg mx-auto">
            {/* ═══ BLOK 1: RINGKASAN PESANAN & TARGET ID ═══ */}
            <div className="mx-4 mt-5 mb-2">
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                Detail Pesanan
              </h2>
            </div>

            <div className="bg-white border-y border-gray-100">
              {/* Product list */}
              <div className="px-3 py-1 divide-y divide-gray-50">
                {displayItems.map((item) => {
                  const product = item.product;
                  const qty = item.quantity || 0;
                  const price = product?.price ?? 0;
                  const originalPrice = product?.originalPrice;
                  const subtotalItem = price * qty;
                  const hasDiscount = originalPrice && originalPrice > price;
                  const cartImg = getCartImage(product);

                  return (
                    <div key={product.id} className="py-2.5">
                      <div className="flex gap-3 items-center">
                        {/* IMAGE */}
                        <ProductImage
                          category={product.category}
                          name={product.name}
                          src={cartImg}
                          className="w-16 h-16 rounded-xl flex-shrink-0 border border-gray-100/50 object-cover bg-white"
                        />

                        {/* RIGHT CONTENT */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                          {/* TOP ROW */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[13px] font-semibold text-gray-800 leading-snug">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-emerald-600 font-bold text-[12px]">
                                  {formatRupiah(price)}
                                </span>
                                {product.variant && (
                                  <>
                                    <div className="w-[1px] h-3 bg-gray-200" />
                                    <span className="text-[11px] text-gray-400 font-medium truncate">
                                      {product.variant}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(product.id)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-amber-500 active:scale-90 transition -mr-1"
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>

                          {/* INPUT ROW — FIX ALIGNMENT */}
                          {product.targetType !== "none" && (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={getTargetPlaceholder(
                                  product.targetType,
                                )}
                                value={targetIds[product.id] || ""}
                                onChange={(e) =>
                                  setTargetIds((prev) => ({
                                    ...prev,
                                    [product.id]: formatTargetInput(
                                      e.target.value,
                                      product.targetType,
                                    ),
                                  }))
                                }
                                className="w-full h-8 px-2.5 pr-14 text-[12px] text-gray-800 bg-gray-50 border border-gray-200/60 rounded-lg placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
                              />

                              {!targetIds[product.id] && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-amber-500/80">
                                  wajib
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Rincian Pembayaran ── */}
              <div
                className="
    relative z-10
    px-4 py-3 space-y-2
    bg-[#f8faf8]/70
    border-t border-white/60
  "
              >
                {/* HEADER BARU */}
                <h2 className="text-[15px] font-bold text-gray-900">Rincian</h2>

                {/* TOTAL ITEM (REPLACE SUBTOTAL) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <Box size={12} strokeWidth={2} />
                    <span>Total item</span>
                  </div>

                  <span className="text-[12px] font-semibold text-gray-700">
                    {totalQty}
                  </span>
                </div>

                {/* Diskon */}
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px] text-emerald-600">
                      <Tag size={12} strokeWidth={2} />
                      <span>Diskon ({discountPercentage}%)</span>
                    </div>

                    <span className="text-[12px] font-semibold text-emerald-600">
                      -{formatRupiah(totalSavings)}
                    </span>
                  </div>
                )}

                {/* Biaya layanan */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <Receipt size={12} strokeWidth={2} />
                    <span>Biaya layanan</span>
                  </div>

                  <span className="text-[12px] font-semibold text-gray-700">
                    {formatRupiah(serviceFee)}
                  </span>
                </div>

                {/* Points row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <HandCoins size={12} strokeWidth={2} />
                    <span>Gunakan Poin</span>
                  </div>
                  <button
                    onClick={() => setUsePoints((p) => !p)}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                      usePoints ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                    aria-label="Gunakan poin"
                    role="switch"
                    aria-checked={usePoints}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        usePoints ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {usePoints && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 pl-[18px]">
                      Poin kamu ({userPoints.toLocaleString()} poin)
                    </span>
                    <span className="text-[12px] font-semibold text-emerald-600">
                      -{formatRupiah(pointsToUse)}
                    </span>
                  </div>
                )}

                {/* Divider + Total */}
                <div className="border-t border-dashed border-gray-200 pt-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-gray-800">
                      Total Bayar
                    </span>

                    <span className="text-[15px] font-extrabold text-emerald-700 tracking-tight">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ BLOK 2: METODE PEMBAYARAN ═══ */}
            <div ref={paymentSectionRef} className="px-4 pt-4 pb-2">
              <h2 className="text-[15px] font-bold text-gray-900">
                Metode Pembayaran
              </h2>
            </div>

            <div className="bg-white border-y border-gray-100">
              <div className="divide-y divide-gray-100/60">
                {Object.values(PAYMENT_METHODS).map((method) => {
                  const Icon = method.icon;
                  const isExpanded = expandedAccordion === method.id;
                  const isSelected = selectedPayment === method.id;

                  return (
                    <div key={method.id}>
                      <button
                        onClick={() => toggleAccordion(method.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                          isSelected
                            ? "bg-emerald-50/50"
                            : "hover:bg-gray-50/50"
                        }`}
                      >
                        {/* LEFT CONTENT */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                              isSelected ? "bg-emerald-100" : "bg-gray-100"
                            }`}
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
                              className={`text-[12px] font-semibold leading-none ${
                                isSelected
                                  ? "text-emerald-800"
                                  : "text-gray-800"
                              }`}
                            >
                              {method.label}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1 leading-none">
                              {method.description}
                            </p>
                          </div>
                        </div>

                        {/* RIGHT CHEVRON (INI TARUH DI SINI) */}
                        {method.options && (
                          <div className="ml-auto">
                            {isExpanded ? (
                              <ChevronDown
                                size={20}
                                className="text-gray-600"
                              />
                            ) : (
                              <ChevronRight
                                size={20}
                                className="text-gray-600"
                              />
                            )}
                          </div>
                        )}
                      </button>

                      {method.options && (
                        <div
                          className="overflow-hidden transition-all duration-300 ease-in-out"
                          style={{
                            maxHeight: isExpanded ? "400px" : "0px",
                            opacity: isExpanded ? 1 : 0,
                          }}
                        >
                          <div
                            className={`px-4 pt-2 pb-4 ${
                              method.id === "ewallet"
                                ? "grid grid-cols-3 gap-2"
                                : method.id === "va"
                                  ? "grid grid-cols-2 gap-2"
                                  : "space-y-1.5"
                            }`}
                          >
                            {method.options.map((opt) => {
                              const isSubSelected =
                                selectedPayment === method.id &&
                                selectedSubPayment === opt.id;

                              if (method.id === "ewallet") {
                                return (
                                  <button
                                    key={opt.id}
                                    onClick={() =>
                                      handleSubPaymentSelect(method.id, opt.id)
                                    }
                                    className={`flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all shadow-layer-xs ${
                                      isSubSelected
                                        ? "bg-emerald-50 border-emerald-500 shadow-sm"
                                        : "bg-white border-gray-50"
                                    }`}
                                  >
                                    <div className="w-9 h-9 flex-shrink-0 relative">
                                      <Image
                                        src={`/icons/${(opt as any).image}`}
                                        alt={opt.name}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                    <span
                                      className={`text-[11px] font-bold text-center leading-none ${isSubSelected ? "text-emerald-800" : "text-gray-600"}`}
                                    >
                                      {opt.name}
                                    </span>
                                  </button>
                                );
                              }

                              return (
                                <button
                                  key={opt.id}
                                  onClick={() =>
                                    handleSubPaymentSelect(method.id, opt.id)
                                  }
                                  className={`flex items-center justify-center h-12 rounded-xl transition-all shadow-layer-xs ${
                                    isSubSelected
                                      ? "bg-emerald-50 border-emerald-500 shadow-sm"
                                      : "bg-white border-gray-50"
                                  }`}
                                >
                                  <div className="relative w-24 h-7">
                                    <Image
                                      src={`/icons/${(opt as any).image}`}
                                      alt={opt.name}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
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
            <div className="h-3 bg-gradient-to-b from-white to-gray-50/30" />
          </div>
        </div>

        {/* ── STICKY FOOTER ── */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-2.5 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-lg mx-auto">
            {selectedPayment && (
              <div className="text-right mb-2.5">
                <p className="text-[10px] text-gray-500 leading-none">Metode</p>
                <p className="text-[12px] font-semibold text-emerald-700 mt-0.5">
                  {getPaymentLabel()}
                </p>
              </div>
            )}
            <button
              onClick={handleCheckoutClick}
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                canSubmit
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/20"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>Bayar {formatRupiah(total)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── PAYMENT MODALS ── */}
      <PaymentModal
        paymentStep={paymentStep}
        paymentMethod={selectedPayment as any}
        paymentDetail={selectedSubPayment}
        setPaymentStep={setPaymentStep}
        isSubmitting={isSubmitting}
        executeOrderSubmission={executeOrderSubmission}
        onFinish={handleFinishCheckout}
        total={total}
      />
    </>
  );
}
