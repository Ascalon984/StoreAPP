import { useEffect, useRef, useState } from "react";
import { useToastStore } from "@/store/useToastStore";
import { PaymentStep, PaymentMethod, PaymentModalProps } from "./payment/types";
import { BackConfirmDialog } from "./payment/SharedComponents";
import { QrisStep } from "./payment/QrisStep";
import { VaStep } from "./payment/VaStep";
import { EwalletStep } from "./payment/E-walletStep";
import { PendingStep, FailedStep, SuccessStep } from "./payment/StatusSteps";

export type { PaymentStep, PaymentMethod };

// ── Helpers ────────────────────────────────────────────────────────────────
function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${ts}-${rand}`;
}

/** Bonus poin transaksi: 1 poin per Rp 2.000 dibayarkan */
function calcBonusPoints(total: number): number {
  return Math.floor(total / 2000);
}

/** Human-readable label untuk metode & sub-metode pembayaran */
function resolveMethodLabel(
  paymentMethod?: PaymentMethod | null,
  paymentDetail?: string | null,
): string {
  if (!paymentMethod) return "-";

  const detailMap: Record<string, string> = {
    // e-wallet
    gopay: "GoPay",
    dana: "DANA",
    ovo: "OVO",
    linkaja: "LinkAja",
    shopeepay: "ShopeePay",
    // virtual account
    bca: "BCA",
    mandiri: "Mandiri",
    bri: "BRI",
    bni: "BNI",
  };

  if (paymentMethod === "qris") return "QRIS";

  const detailLabel = paymentDetail
    ? (detailMap[paymentDetail] ?? paymentDetail)
    : null;

  if (paymentMethod === "va")
    return detailLabel ? `Virtual Account ${detailLabel}` : "Virtual Account";
  if (paymentMethod === "ewallet") return detailLabel ?? "E-Wallet";

  return "-";
}

// ── Component ──────────────────────────────────────────────────────────────
export default function PaymentModal({
  paymentStep,
  paymentMethod,
  paymentDetail,
  setPaymentStep,
  isSubmitting,
  executeOrderSubmission,
  onFinish,
  total,
}: PaymentModalProps) {
  const { showToast } = useToastStore();

  // ── Guard: mencegah double-submit ────────────────────────────────────────
  const isProcessingRef = useRef(false);

  // ── Cleanup: simpan ref ke setTimeout agar bisa di-clear saat unmount ───
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Konfirmasi back di tengah pembayaran ──────────────────────────────
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // ── Pesan error untuk state "failed" ────────────────────────────────────
  const [failedMessage, setFailedMessage] = useState<string>(
    "Pembayaran gagal diproses. Silakan coba lagi.",
  );

  // ── Transaction info (generated once per payment attempt) ───────────────
  const [orderId, setOrderId] = useState<string>(() => generateOrderId());
  const [transactionDateTime, setTransactionDateTime] = useState<Date>(
    () => new Date(),
  );
  const bonusPoints = calcBonusPoints(total);
  const paymentMethodLabel = resolveMethodLabel(paymentMethod, paymentDetail);

  // Cleanup timer saat komponen unmount
  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }
    };
  }, []);

  // ── Handler: Download receipt ────────────────────────────────────────────
  const handleDownloadReceipt = () => {
    showToast("Bukti transaksi berhasil disimpan");
  };

  // ── Handler: Tombol back saat pembayaran aktif ───────────────────────────
  const handleBackWithConfirm = () => {
    setShowBackConfirm(true);
  };

  const handleConfirmBack = () => {
    setShowBackConfirm(false);
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    isProcessingRef.current = false;
    setPaymentStep("idle");
  };

  // ── Handler: Proses pembayaran QRIS & VA ─────────────────────────────────
  const handleProcessPayment = () => {
    if (isProcessingRef.current || isSubmitting) return;
    isProcessingRef.current = true;

    // Buat orderId & timestamp baru setiap kali mencoba bayar
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);

    setPaymentStep("success");

    pendingTimerRef.current = setTimeout(async () => {
      try {
        const success = await executeOrderSubmission();
        if (success !== false) {
          setTransactionDateTime(new Date());
          setPaymentStep("success");
        } else {
          setTransactionDateTime(new Date());
          setFailedMessage("Pembayaran gagal diproses. Silakan coba lagi.");
          setPaymentStep("failed");
        }
      } catch (err) {
        setTransactionDateTime(new Date());
        setFailedMessage("Terjadi kesalahan tak terduga. Silakan coba lagi.");
        setPaymentStep("failed");
      } finally {
        isProcessingRef.current = false;
        pendingTimerRef.current = null;
      }
    }, 2500);
  };

  // ── Handler: E-Wallet ────────────────────────────────────────────────────
  const ewalletPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleOpenEwallet = () => {
    if (isProcessingRef.current || isSubmitting) return;
    isProcessingRef.current = true;

    const newOrderId = generateOrderId();
    setOrderId(newOrderId);

    setPaymentStep("success");

    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    ewalletPollRef.current = setInterval(async () => {
      attempts++;
      try {
        const success = await executeOrderSubmission();
        if (success !== false) {
          clearInterval(ewalletPollRef.current!);
          ewalletPollRef.current = null;
          isProcessingRef.current = false;
          setTransactionDateTime(new Date());
          setPaymentStep("success");
          return;
        }
      } catch {
        // lanjut polling
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(ewalletPollRef.current!);
        ewalletPollRef.current = null;
        isProcessingRef.current = false;

        const providerName = paymentDetail
          ? paymentDetail.charAt(0).toUpperCase() + paymentDetail.slice(1)
          : "E-Wallet";

        setTransactionDateTime(new Date());
        setFailedMessage(
          `Pembayaran ${providerName} belum terverifikasi. Cek status di aplikasi Anda.`,
        );
        setPaymentStep("failed");
      }
    }, 3000);
  };

  // Cleanup E-wallet poll saat unmount
  useEffect(() => {
    return () => {
      if (ewalletPollRef.current) {
        clearInterval(ewalletPollRef.current);
      }
    };
  }, []);

  // ── Render guard ──────────────────────────────────────────────────────────
  if (paymentStep === "idle") return null;

  const activePaymentSteps: PaymentStep[] = ["qr", "va", "ewallet"];
  const isActivePayment = activePaymentSteps.includes(paymentStep);

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-white flex flex-col animate-in fade-in duration-200">
        {paymentStep === "qr" && (
          <QrisStep
            total={total}
            onBack={handleBackWithConfirm}
            onProcessPayment={handleProcessPayment}
            isSubmitting={isSubmitting}
            isProcessing={isProcessingRef.current}
          />
        )}

        {paymentStep === "va" && (
          <VaStep
            total={total}
            provider={paymentDetail}
            onBack={handleBackWithConfirm}
            onProcessPayment={handleProcessPayment}
            isSubmitting={isSubmitting}
            isProcessing={isProcessingRef.current}
          />
        )}

        {paymentStep === "ewallet" && (
          <EwalletStep
            total={total}
            provider={paymentDetail}
            onBack={handleBackWithConfirm}
            onOpenEwallet={handleOpenEwallet}
            isSubmitting={isSubmitting}
            isProcessing={isProcessingRef.current}
          />
        )}

        {paymentStep === "pending" && <PendingStep />}

        {paymentStep === "failed" && (
          <FailedStep
            total={total}
            orderId={orderId}
            paymentMethodLabel={paymentMethodLabel}
            transactionDateTime={transactionDateTime}
            failedMessage={failedMessage}
            onRetry={() => {
              isProcessingRef.current = false;
              if (paymentMethod === "qris") setPaymentStep("qr");
              else if (paymentMethod === "va") setPaymentStep("va");
              else if (paymentMethod === "ewallet") setPaymentStep("ewallet");
              else setPaymentStep("idle");
            }}
            onChangeMethod={() => {
              isProcessingRef.current = false;
              setPaymentStep("idle");
            }}
          />
        )}

        {paymentStep === "success" && (
          <SuccessStep
            total={total}
            orderId={orderId}
            paymentMethodLabel={paymentMethodLabel}
            transactionDateTime={transactionDateTime}
            bonusPoints={bonusPoints}
            isSubmitting={isSubmitting}
            onFinish={() => {
              if (onFinish) onFinish();
              else setPaymentStep("idle");
            }}
            onDownloadReceipt={handleDownloadReceipt}
          />
        )}
      </div>

      {showBackConfirm && isActivePayment && (
        <BackConfirmDialog
          onConfirm={handleConfirmBack}
          onCancel={() => setShowBackConfirm(false)}
        />
      )}
    </>
  );
}
