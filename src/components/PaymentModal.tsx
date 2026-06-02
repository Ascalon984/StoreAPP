import { useEffect, useRef, useState } from "react";
import { useToastStore } from "@/store/useToastStore";
import { PaymentStep, PaymentMethod, PaymentModalProps } from "./payment/types";
import { BackConfirmDialog } from "./payment/SharedComponents";
import { QrisStep } from "./payment/QrisStep";
import { VaStep } from "./payment/VaStep";
import { EwalletStep } from "./payment/E-walletStep";
import { PendingStep, FailedStep, SuccessStep } from "./payment/StatusSteps";

export type { PaymentStep, PaymentMethod };

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

  // ── Guard: mencegah double-submit ──────────────────────────────────────
  const isProcessingRef = useRef(false);

  // ── Cleanup: simpan ref ke setTimeout agar bisa di-clear saat unmount ──
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Konfirmasi back di tengah pembayaran ───────────────────────────────
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // ── Pesan error untuk state "failed" ──────────────────────────────────
  const [failedMessage, setFailedMessage] = useState<string>(
    "Pembayaran gagal diproses. Silakan coba lagi.",
  );

  // Cleanup timer saat komponen unmount
  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }
    };
  }, []);

  // ── Handler: Download receipt ──────────────────────────────────────────
  const handleDownloadReceipt = () => {
    showToast("Bukti transaksi berhasil disimpan");
  };

  // ── Handler: Tombol back saat pembayaran aktif ─────────────────────────
  const handleBackWithConfirm = () => {
    setShowBackConfirm(true);
  };

  const handleConfirmBack = () => {
    setShowBackConfirm(false);
    // Bersihkan timer jika masih berjalan
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    isProcessingRef.current = false;
    setPaymentStep("idle");
  };

  // ── Handler: Proses pembayaran QRIS & VA ───────────────────────────────
  const handleProcessPayment = () => {
    // Guard: tolak jika sedang dalam proses
    if (isProcessingRef.current || isSubmitting) return;
    isProcessingRef.current = true;

    setPaymentStep("pending");

    // Simulasi verifikasi pihak ketiga / bank
    pendingTimerRef.current = setTimeout(async () => {
      try {
        const success = await executeOrderSubmission();
        if (success !== false) {
          setPaymentStep("success");
        } else {
          setFailedMessage("Pembayaran gagal diproses. Silakan coba lagi.");
          setPaymentStep("failed");
        }
      } catch (err) {
        setFailedMessage("Terjadi kesalahan tak terduga. Silakan coba lagi.");
        setPaymentStep("failed");
      } finally {
        isProcessingRef.current = false;
        pendingTimerRef.current = null;
      }
    }, 2500);
  };

  // ── Handler: E-Wallet — setelah user diarahkan ke app e-wallet ──────────────
  const ewalletPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleOpenEwallet = () => {
    if (isProcessingRef.current || isSubmitting) return;
    isProcessingRef.current = true;

    // 1. Arahkan user ke deeplink E-Wallet (di production gunakan URL asli)
    // window.location.href = "gojek://gopay/...";

    // 2. Masuk ke state pending
    setPaymentStep("pending");

    // 3. Poll status pembayaran setiap 3 detik (max 5x = 15 detik)
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
        
        // Dynamic error message
        const providerName = paymentDetail ? paymentDetail.charAt(0).toUpperCase() + paymentDetail.slice(1) : "E-Wallet";
        
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

  // ── Render guard ───────────────────────────────────────────────────────
  if (paymentStep === "idle") return null;

  // Step mana saja yang dianggap "pembayaran sedang berjalan" untuk konfirmasi back
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
