import { CartItem } from "./types";
import { WA_NUMBER, SITE_URL } from "./constants";

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSold(count: number): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  return String(count);
}

// lib/utils.ts
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}jt`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}rb`;
  }
  return num.toString();
};

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Baru saja";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} minggu lalu`;
  return `${Math.floor(seconds / 2592000)} bulan lalu`;
}

export function maskName(name: string): string {
  if (name.length <= 2) return name[0] + "***";
  return name.slice(0, Math.ceil(name.length / 2)) + "**";
}

function getMapPin(lat: number, lng: number): string {
  return `<https://www.google.com/maps/search/?api=1&query=${lat},${lng}>`;
}

/**
 * Normalize phone number to national format (08x)
 * Fixes scientific notation issue (e.g., 628e... -> 081234567890)
 * More robust validation to prevent invalid numbers
 */
function normalizePhoneToNational(phone: string | number): string {
  let p = String(phone).replace(/\D/g, "");

  // If already has 62 prefix, convert to 0
  if (p.startsWith("62")) {
    return "0" + p.slice(2);
  }

  // If already has 0 prefix, return as is
  if (p.startsWith("0")) {
    return p;
  }

  // Fallback: assume it's a valid Indonesian number without prefix
  // Only add 0 prefix if the number seems reasonable (minimal 8 digits)
  if (p.length >= 8) {
    return "0" + p;
  }

  // If number is too short, return as is (but this shouldn't happen with valid input)
  console.warn("Invalid phone number format:", phone);
  return p;
}

/**
 * Normalize phone number to international format (62xxx)
 * For WhatsApp link
 */
function normalizePhoneToInternational(phone: string | number): string {
  const p = String(phone).replace(/\D/g, "");

  // If already has 62 prefix
  if (p.startsWith("62")) {
    return p;
  }

  // If has 0 prefix, convert to 62
  if (p.startsWith("0")) {
    return "62" + p.slice(1);
  }

  // Fallback: assume it's a valid number without prefix
  if (p.length >= 8) {
    return "62" + p;
  }

  console.warn("Invalid phone number format for WA link:", phone);
  return p;
}

/**
 * Generate WhatsApp message for cart items (multiple products)
 */
export function generateWAMessage(
  items: CartItem[],
  deliveryInfo?: DeliveryInfo,
): string {
  // Empty cart protection
  if (!items.length) {
    return encodeURIComponent("Halo kak, saya ingin bertanya produk.");
  }

  const divider = "──────────────";
  const itemCount = items.length;
  const orderLabel = itemCount > 1 ? `(${itemCount} item)` : "";

  const itemLines = items
    .map((item, i) => {
      const subtotal = item.product.price * item.quantity;
      // Multi item: tampilkan breakdown harga
      return `${i + 1}. *${item.product.name}*\n   ${item.quantity}x ${formatRupiah(item.product.price)} = ${formatRupiah(subtotal)}`;
    })
    .join("\n\n");

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const deliverySection = deliveryInfo
    ? `
${divider}
📍 *Pengiriman*
Nama   : ${deliveryInfo.name}
No. HP : ${normalizePhoneToNational(deliveryInfo.phone)}
Alamat : ${deliveryInfo.address}${
        deliveryInfo.lat && deliveryInfo.lng
          ? `\n\n📍 Lokasi:\n${getMapPin(deliveryInfo.lat, deliveryInfo.lng)}`
          : ""
      }`
    : "";

  const message = `Halo kak 👋
*ORDER BARU ${orderLabel}*

🛒 *Pesanan:*
${itemLines}

💰 *Total: ${formatRupiah(total)}*${deliverySection}

Mohon segera diproses ya kak, terima kasih! 🙏`;

  return encodeURIComponent(message);
}

/**
 * Generate WhatsApp message for single product
 */
export function generateSingleWAMessage(
  productName: string,
  productSlug: string,
  price: number,
  deliveryInfo?: DeliveryInfo,
): string {
  const divider = "──────────────";

  // Single item: format lebih clean tanpa redundancy
  const itemLines = `1. *${productName}*\n   1x ${formatRupiah(price)}`;

  const deliverySection = deliveryInfo
    ? `
${divider}
📍 *Pengiriman*
Nama   : ${deliveryInfo.name}
No. HP : ${normalizePhoneToNational(deliveryInfo.phone)}
Alamat : ${deliveryInfo.address}${
        deliveryInfo.lat && deliveryInfo.lng
          ? `\n\n📍 Lokasi:\n${getMapPin(deliveryInfo.lat, deliveryInfo.lng)}`
          : ""
      }`
    : "";

  const message = `Halo kak 👋
*ORDER BARU*

🛒 *Pesanan:*
${itemLines}

💰 *Total: ${formatRupiah(price)}*${deliverySection}

Mohon segera diproses ya kak, terima kasih! 🙏`;

  return encodeURIComponent(message);
}

/**
 * Get WhatsApp link with pre-filled message
 */
export function getWALink(message: string, waNumber?: string): string {
  // Use international format for WhatsApp link
  const normalizedNumber = waNumber
    ? normalizePhoneToInternational(waNumber)
    : normalizePhoneToInternational(WA_NUMBER);
  return `https://wa.me/${normalizedNumber}?text=${message}`;
}

/**
 * Utility function for conditional className merging
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
