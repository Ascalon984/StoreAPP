"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronDown,
  Loader,
  CheckCircle,
  Banknote,
  Wallet,
  Building2,
  Tag,
  Minus,
  Plus,
  QrCode,
  Receipt,
  Trash2,
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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, updateQuantity, removeItem } = useCartStore();
  const { showToast } = useToastStore();
  const { openModal } = useReviewModalStore();
  const { triggerRefresh } = useReviewStore();
  const navStore = useNavigationStore();

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

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) router.replace("/");
  }, [items.length, router, isSubmitting]);

  const toggleAccordion = (id: string) => {
    if (expandedAccordion === id) setExpandedAccordion(null);
    else {
      setExpandedAccordion(id);
      if (id === "qr") {
        setSelectedPayment("qr");
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

  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0);

  const totalSavings = items.reduce((sum, item) => {
    const orig = item.product?.originalPrice;
    const price = item.product?.price;
    const qty = item.quantity || 0;

    if (orig && price && orig > price) {
      return sum + (orig - price) * qty;
    }

    return sum;
  }, 0);
  const pointsToUse = usePoints ? Math.min(userPoints, subtotal) : 0;
  const total = subtotal - totalSavings - pointsToUse;

  const isPaymentSelected =
    selectedPayment !== null &&
    (selectedPayment === "qr" || selectedSubPayment !== null);

  const allTargetsFilled = items.every((item) => {
    const type = item.product.targetType;

    if (!type || type === "none") return true;

    const val = targetIds[item.product.id];
    return val && val.trim().length > 0;
  });

  const canSubmit = allTargetsFilled && isPaymentSelected && items.length > 0;

  const executeOrderSubmission = async () => {
    if (!canSubmit || isSubmitting) return false;
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
            targetId: targetIds[item.product.id],
            paymentMethod: selectedPayment,
            paymentDetail: selectedSubPayment,
          }),
        }),
      );
      await Promise.all(orderPromises);

      triggerRefresh();
      clearCart();
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
    if (items.length === 1) openModal(items[0].product.slug);
    else openModal();
    const source = navStore.checkoutSource;
    navStore.setCheckoutSource(null);
    setPaymentStep("idle");
    if (source === "product" && items.length === 1) router.back();
    else router.replace("/");
    router.refresh();
  };

  const handleCheckoutClick = () => {
    if (!canSubmit || isSubmitting) return;
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

  if (items.length === 0 && !isSubmitting) return null;

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
                {items.map((item) => {
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
                        <button
                          onClick={() => removeItem(product.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors active:scale-90 flex-shrink-0"
                          aria-label="Hapus produk"
                        >
                          <Trash2 size={15} strokeWidth={2.2} />
                        </button>
                      </div>
                      <div className="mt-2.5 mb-1 pl-[56px] pr-2">
                        <input
                          type="text"
                          placeholder={getTargetPlaceholder(product.targetType)}
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
                          className="w-full text-[12px] bg-gray-50 border border-gray-200/80 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                        />
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
                    <span>Subtotal ({totalQty} item)</span>
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

                {/* Points row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <Tag size={12} strokeWidth={2} />
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
                      Total Pembayaran
                    </span>

                    <span className="text-[15px] font-extrabold text-emerald-700 tracking-tight">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ BLOK 2: METODE PEMBAYARAN ═══ */}
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
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
            <div className="h-3 bg-gradient-to-b from-white to-gray-50/30" />
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
              onClick={handleCheckoutClick}
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                canSubmit
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/20"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>Bayar Sekarang</span>
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
