export type PaymentStep =
  | "idle"
  | "qr"
  | "va"
  | "ewallet"
  | "pending"
  | "success"
  | "failed";

export type PaymentMethod = "qris" | "va" | "ewallet";

export interface PaymentModalProps {
  paymentStep: PaymentStep;
  paymentMethod?: PaymentMethod;
  paymentDetail?: string | null;
  setPaymentStep: (step: PaymentStep) => void;
  isSubmitting: boolean;
  executeOrderSubmission: () => Promise<boolean> | void | any;
  onFinish?: () => void;
  total: number;
}
