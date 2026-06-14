import { Building2, QrCode, Wallet } from "lucide-react";

export const getEffectiveTargetType = (
  category?: string,
  defaultType?: string,
): string => {
  if (defaultType && defaultType !== "text") {
    return defaultType;
  }
  if (!category) return "text";

  const cat = category.toLowerCase();
  if (
    cat.includes("pulsa") ||
    cat.includes("paket data") ||
    cat.includes("e-wallet") ||
    cat.includes("ewallet")
  ) {
    return "phone";
  }
  if (cat.includes("pln") || cat.includes("listrik")) {
    return "pln";
  }

  return defaultType || "text";
};

export const formatTargetInput = (value: string, type?: string) => {
  const digits = value.replace(/\D/g, "");

  switch (type) {
    case "phone": {
      const limited = digits.slice(0, 13);
      if (limited.length <= 3) return limited;
      if (limited.length <= 7)
        return `${limited.slice(0, 3)}-${limited.slice(3)}`;
      return `${limited.slice(0, 3)}-${limited.slice(
        3,
        7,
      )}-${limited.slice(7)}`;
    }
    case "number":
    case "pln":
      return digits;
    default:
      return value;
  }
};

export const getTargetPlaceholder = (type?: string) => {
  switch (type) {
    case "phone":
      return "Masukkan nomor HP";
    case "email":
      return "Masukkan email aktif";
    case "number":
      return "Masukkan ID akun";
    case "pln":
      return "Masukkan nomor meter PLN";
    case "none":
      return "Tidak diperlukan";
    default:
      return "Masukkan ID atau username";
  }
};

export const isTargetValid = (value: string, type?: string): boolean => {
  if (type === "none") return true;

  const val = value?.trim() ?? "";
  if (!val) return false;

  switch (type) {
    case "phone": {
      const digits = val.replace(/\D/g, "");
      return (
        (digits.startsWith("08") || digits.startsWith("62")) &&
        digits.length >= 10 &&
        digits.length <= 13
      );
    }
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    case "pln": {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 11 && digits.length <= 12;
    }
    case "number":
      return val.replace(/\D/g, "").length >= 6;
    default:
      return val.length >= 3;
  }
};

export const getCartImage = (product: any): string | undefined => {
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

export const PAYMENT_METHODS = {
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

export const getPaymentLabel = (selectedPayment: string | null, selectedSubPayment: string | null) => {
  if (!selectedPayment) return "";
  if (selectedPayment === "qr") return "QRIS";
  const method = PAYMENT_METHODS[selectedPayment as keyof typeof PAYMENT_METHODS];
  if (!method?.options || !selectedSubPayment) return "";
  const sub = method.options.find((o) => o.id === selectedSubPayment);
  return sub ? `${method.label} - ${sub.name}` : "";
};
