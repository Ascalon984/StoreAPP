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

export function generateWAMessage(items: CartItem[], deliveryInfo?: DeliveryInfo): string {
  const itemLines = items
    .map((item, i) => `${i + 1}. ${item.product.name} (${item.quantity}x) - ${formatRupiah(item.product.price * item.quantity)}`)
    .join('\n');

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let deliverySection = '';
  if (deliveryInfo) {
    const pinLine = (deliveryInfo.lat != null && deliveryInfo.lng != null)
      ? `\n📍 Pin Lokasi: ${getMapPin(deliveryInfo.lat, deliveryInfo.lng)}`
      : '';

    deliverySection = `\n\n📍 *Informasi Pengiriman:*\nNama: ${deliveryInfo.name}\nNo. HP: ${deliveryInfo.phone}\nAlamat: ${deliveryInfo.address}${pinLine}`;
  }

  // ⬇️ Sudah bersih, fokus hanya untuk dilihat admin
  return encodeURIComponent(
    `Halo kak 👋\n\nSaya ingin memesan:\n\n${itemLines}\n\nTotal: ${formatRupiah(total)}${deliverySection}`
  );
}

export function generateSingleWAMessage(productName: string, productSlug: string, deliveryInfo?: DeliveryInfo): string {
  let deliverySection = '';
  if (deliveryInfo) {
    const pinLine = (deliveryInfo.lat != null && deliveryInfo.lng != null)
      ? `\n📍 Pin Lokasi: ${getMapPin(deliveryInfo.lat, deliveryInfo.lng)}`
      : '';

    deliverySection = `\n\n📍 *Informasi Pengiriman:*\nNama: ${deliveryInfo.name}\nNo. HP: ${deliveryInfo.phone}\nAlamat: ${deliveryInfo.address}${pinLine}`;
  }

  // ⬇️ Sudah bersih, fokus hanya untuk dilihat admin
  return encodeURIComponent(
    `Halo kak 👋\n\nSaya ingin memesan: ${productName}${deliverySection}`
  );
}

export function getWALink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${message}`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}