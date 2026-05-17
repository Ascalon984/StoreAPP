import { QuickReply } from './types';

export function getQuickReplies(source: 'profile' | 'product' | 'order', orderStatus?: 'pending' | 'processing' | 'completed'): QuickReply[] {
  if (source === 'profile') {
    return [
      { id: 'qr-p-1', text: 'Jam operasional toko', context: 'profile' },
      { id: 'qr-p-2', text: 'Metode pembayaran', context: 'profile' },
      { id: 'qr-p-3', text: 'Cara membatalkan pesanan', context: 'profile' },
      { id: 'qr-p-4', text: 'Hubungi admin', context: 'profile' },
    ] as QuickReply[];
  }
  
  if (source === 'product') {
    return [
      { id: 'qr-pr-1', text: 'Stok masih ada?', context: 'product' },
      { id: 'qr-pr-2', text: 'Expired kapan?', context: 'product' },
      { id: 'qr-pr-3', text: 'Bisa kirim hari ini?', context: 'product' },
      { id: 'qr-pr-4', text: 'Ada varian lain?', context: 'product' },
      { id: 'qr-pr-5', text: 'Produk original?', context: 'product' },
      { id: 'qr-pr-6', text: 'Bisa COD?', context: 'product' },
    ] as QuickReply[];
  }

  if (source === 'order') {
    if (orderStatus === 'completed') {
      return [
        { id: 'qr-o-c1', text: 'Produk tidak sesuai', context: 'order' },
        { id: 'qr-o-c2', text: 'Ajukan pengembalian', context: 'order' },
        { id: 'qr-o-c3', text: 'Produk rusak', context: 'order' },
        { id: 'qr-o-c4', text: 'Barang kurang', context: 'order' },
      ] as QuickReply[];
    }
    if (orderStatus === 'processing') {
      return [
        { id: 'qr-o-pr1', text: 'Pesanan saya dimana?', context: 'order' },
        { id: 'qr-o-pr2', text: 'Kapan pesanan diproses?', context: 'order' },
        { id: 'qr-o-pr3', text: 'Bisa ubah alamat?', context: 'order' },
        { id: 'qr-o-pr4', text: 'Pesanan belum sampai', context: 'order' },
      ] as QuickReply[];
    }
    // Default to pending
    return [
      { id: 'qr-o-p1', text: 'Konfirmasi pembayaran', context: 'order' },
      { id: 'qr-o-p2', text: 'Pembayaran gagal', context: 'order' },
      { id: 'qr-o-p3', text: 'Batas pembayaran', context: 'order' },
      { id: 'qr-o-p4', text: 'Batalkan pesanan', context: 'order' },
    ] as QuickReply[];
  }

  return [];
}
