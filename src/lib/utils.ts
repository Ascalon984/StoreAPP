import { CartItem } from './types';
import { WA_NUMBER, SITE_URL } from './constants';

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} minggu lalu`;
  return `${Math.floor(seconds / 2592000)} bulan lalu`;
}

export function maskName(name: string): string {
  if (name.length <= 2) return name[0] + '***';
  return name.slice(0, Math.ceil(name.length / 2)) + '**';
}

function getMapPin(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

/**
 * Generate WhatsApp message for cart items (multiple products)
 */
export function generateWAMessage(
  items: CartItem[],
  deliveryInfo?: DeliveryInfo
): string {
  // Empty cart protection
  if (!items.length) {
    return encodeURIComponent('Halo kak, saya ingin bertanya produk.');
  }

  const itemLines = items
    .map((item, i) => {
      const subtotal = item.product.price * item.quantity;
      return `${i + 1}. ${item.product.name} (${item.quantity}x)\n   ${formatRupiah(subtotal)}`;
    })
    .join('\n');

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let deliverySection = '';
  if (deliveryInfo) {
    const pinLine =
      deliveryInfo.lat != null && deliveryInfo.lng != null
        ? `\n📍 Pin Lokasi:\n${getMapPin(deliveryInfo.lat, deliveryInfo.lng)}`
        : '';

    deliverySection = `

📍 *Informasi Pengiriman*
Nama   : ${deliveryInfo.name}
No. HP : ${deliveryInfo.phone}
Alamat : ${deliveryInfo.address}${pinLine}`;
  }

  const message = `Halo kak 👋

Saya ingin memesan:

${itemLines}

*Total: ${formatRupiah(total)}*${deliverySection}`;

  return encodeURIComponent(message);
}

/**
 * Generate WhatsApp message for single product
 */
export function generateSingleWAMessage(
  productName: string,
  productSlug: string,
  deliveryInfo?: DeliveryInfo
): string {
  const subtotal = formatRupiah(0); // Price not available in this function
  // Note: You might want to pass price as parameter for single product
  
  const itemLines = `1. ${productName} (1x)\n   ${subtotal}`;

  let deliverySection = '';
  if (deliveryInfo) {
    const pinLine =
      deliveryInfo.lat != null && deliveryInfo.lng != null
        ? `\n📍 Pin Lokasi:\n${getMapPin(deliveryInfo.lat, deliveryInfo.lng)}`
        : '';

    deliverySection = `

📍 *Informasi Pengiriman*
Nama   : ${deliveryInfo.name}
No. HP : ${deliveryInfo.phone}
Alamat : ${deliveryInfo.address}${pinLine}`;
  }

  const message = `Halo kak 👋

Saya ingin memesan:

${itemLines}${deliverySection}`;

  return encodeURIComponent(message);
}

/**
 * Get WhatsApp link with pre-filled message
 */
export function getWALink(message: string, waNumber?: string): string {
  return `https://wa.me/${waNumber || WA_NUMBER}?text=${message}`;
}

/**
 * Utility function for conditional className merging
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}