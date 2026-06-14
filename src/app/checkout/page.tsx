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

import OrderItemsList from "./components/OrderItemsList";
import PaymentSummary from "./components/PaymentSummary";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import {
  getEffectiveTargetType,
  isTargetValid,
  getPaymentLabel,
} from "./utils";

// Mock user dari profil
const PROFILE_USER = {
  name: "Ahmad Fauzi",
  phone: "081-234-5678",
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

  const [touchedTargets, setTouchedTargets] = useState<Record<string, boolean>>(
    {},
  );

  const handleTargetBlur = (productId: string) => {
    setTouchedTargets((prev) => ({ ...prev, [productId]: true }));
  };

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
    const effectiveType = getEffectiveTargetType(
      item.product.category,
      item.product.targetType,
    );
    return isTargetValid(targetIds[item.product.id] ?? "", effectiveType);
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
          className="sticky top-0 z-50 bg-[#048750] border-b border-emerald-800/10"
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
                Detail Pesanan
              </h1>
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto checkout-scroll">
          <div className="max-w-lg mx-auto">
            {/* ═══ BLOK 1: RINGKASAN PESANAN & TARGET ID ═══ */}
            <OrderItemsList
              displayItems={displayItems}
              targetIds={targetIds}
              setTargetIds={setTargetIds}
              hasAttemptedSubmit={hasAttemptedSubmit}
              touchedTargets={touchedTargets}
              handleTargetBlur={handleTargetBlur}
              handleRemoveItem={handleRemoveItem}
            />

            <PaymentSummary
              totalQty={totalQty}
              totalSavings={totalSavings}
              discountPercentage={discountPercentage}
              serviceFee={serviceFee}
              usePoints={usePoints}
              setUsePoints={setUsePoints}
              userPoints={userPoints}
              pointsToUse={pointsToUse}
              total={total}
            />

            <PaymentMethodSelector
              selectedPayment={selectedPayment}
              selectedSubPayment={selectedSubPayment}
              expandedAccordion={expandedAccordion}
              toggleAccordion={toggleAccordion}
              handleSubPaymentSelect={handleSubPaymentSelect}
              paymentSectionRef={paymentSectionRef}
            />
          </div>
        </div>

        {/* ── STICKY FOOTER ── */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-2.5 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-lg mx-auto">
            {selectedPayment && (
              <div className="text-right mb-2.5">
                <p className="text-[10px] text-gray-500 leading-none">Metode</p>
                <p className="text-[12px] font-semibold text-emerald-700 mt-0.5">
                  {getPaymentLabel(selectedPayment, selectedSubPayment)}
                </p>
              </div>
            )}
            <button
              onClick={handleCheckoutClick}
              disabled={isSubmitting}
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
