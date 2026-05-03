'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, X, Plus, Minus, MessageCircle, Trash2, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useReviewModalStore } from '@/store/useReviewModalStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { useToastStore } from '@/store/useToastStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useReviewStore } from '@/store/useReviewStore';
import { formatRupiah, generateWAMessage, getWALink } from '@/lib/utils';
import ProductImage from './ProductImage';
import CheckoutModal from './CheckoutModal';

export default function MiniCart() {
  const router = useRouter();
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const { openModal } = useReviewModalStore();
  const { deliveryInfo } = useDeliveryStore();
  const { showToast } = useToastStore();
  const { waNumber, fetchSettings } = useSettingsStore();
  const { triggerRefresh } = useReviewStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logic untuk Swipe to Close
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;

    // Hanya izinkan geser ke kanan (untuk menutup)
    if (deltaX > 0) setDragX(deltaX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragX > 100) { // Threshold 100px untuk menutup
      closeCart();
      setTimeout(() => setDragX(0), 300);
    } else {
      setDragX(0); // Kembali ke posisi awal jika tidak melewati threshold
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const total = items.reduce((sum, item) => {
    try {
      return sum + (item.product?.price || 0) * (item.quantity || 0);
    } catch {
      return sum;
    }
  }, 0);

  const totalSavings = items.reduce((sum, item) => {
    try {
      const orig = item.product?.originalPrice;
      const price = item.product?.price;
      const qty = item.quantity || 0;
      if (orig && price && orig > price) {
        return sum + (orig - price) * qty;
      }
      return sum;
    } catch {
      return sum;
    }
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutConfirm = async () => {
    if (items.length === 0) return;
    try {
      setIsSubmitting(true);
      // ✅ STEP 1: POST order ke admin untuk update stok
      const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';

      // Paralelkan semua request agar jauh lebih cepat
      const orderPromises = items.map(item =>
        fetch(`${adminApiUrl}/api/admin/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
            customerName: deliveryInfo.name,
            phone: deliveryInfo.phone,
            address: deliveryInfo.address,
            lat: deliveryInfo.lat,
            lng: deliveryInfo.lng,
          }),
        })
      );

      await Promise.all(orderPromises);

      // ✅ STEP 2: Buka WhatsApp segera (Critical Path)
      const message = generateWAMessage(items, deliveryInfo);
      window.open(getWALink(message, waNumber), '_blank');

      // ✅ STEP 3: Refresh UI & Modal (Background Path)
      if (items.length === 1) {
        openModal(items[0].product.slug);
      } else {
        openModal();
      }

      setIsCheckoutModalOpen(false);
      closeCart();
      triggerRefresh();
      router.refresh();
    } catch (error) {
      console.error('[Checkout Error]', error);
      showToast('Terjadi kesalahan saat memproses pesanan.');
      setIsCheckoutModalOpen(false);
      closeCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuantityChange = (productId: string, newQty: number, currentStock: number) => {
    const safeQty = Math.max(0, newQty);
    if (safeQty > currentStock) return;

    if (safeQty === 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, safeQty);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm animate-backdrop-in"
        onClick={closeCart}
        style={{
          opacity: isOpen ? Math.max(0, 1 - dragX / 300) : 0,
          transition: isDragging ? 'none' : 'opacity 0.3s ease'
        }}
      />

      {/* ===== DRAWER CONTAINER ===== */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[88%] max-w-[400px] bg-gray-50 z-[70] shadow-2xl flex flex-col rounded-l-[1.5rem] overflow-hidden border-l border-white/20"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', // Easing yang lebih 'luks'
          opacity: Math.max(0.7, 1 - dragX / 1000) // Sedikit pudar saat ditarik
        }}
      >
        {/* Area Handle Swipe (Dibuat full height agar mudah ditarik dari sisi mana pun) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 z-[80] cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Garis Visual (Indikator tetap berada di tengah secara vertikal) */}
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-14 bg-gray-300 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.02)]" />
        </div>

        {/* HEADER: Diberi kemampuan swipe juga */}
        <div
          className="bg-white px-5 py-3.5 border-b border-gray-100 rounded-tl-[2rem] touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                <ShoppingBag size={18} strokeWidth={2.5} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Keranjang Saya</h3>
                <p className="text-[10px] text-gray-400">{totalItems} produk • {items.length} item</p>
              </div>
            </div>

            {/* Tombol X tetap dipertahankan sebagai cadangan */}
            <button onClick={closeCart} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 hide-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <ShoppingCart size={40} strokeWidth={1} className="text-gray-300" />
              </div>
              <p className="text-gray-800 font-semibold text-sm mb-1">Keranjang Masih Kosong</p>
              <p className="text-xs text-gray-400 text-center leading-relaxed mb-6">
                Yuk mulai belanja dan temukan produk favorit kamu di Palugada!
              </p>
              <button
                onClick={closeCart}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Mulai Belanja
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const product = item.product;
                const qty = item.quantity || 0;
                const stock = product?.stock ?? 0;
                const price = product?.price ?? 0;
                const originalPrice = product?.originalPrice;
                const subtotal = price * qty;
                const isNearStockLimit = stock - qty <= 2 && stock - qty > 0;
                const isAtStockLimit = qty >= stock;
                const hasDiscount = originalPrice && originalPrice > price;

                const rawImages = product.images || (product as any).image;
                let cartImg: string | undefined;

                if (Array.isArray(rawImages)) {
                  // Jika array, cek apakah setiap elemen adalah pipe-separated
                  const flatImages = rawImages.flatMap(img => {
                    if (!img || typeof img !== 'string') return [];
                    if (img.startsWith('data:image') || img.startsWith('http')) {
                      return [img];
                    }
                    return img.split('|').filter(i => i?.trim()?.startsWith('data:image') || i?.trim()?.startsWith('http'));
                  });
                  cartImg = flatImages[0];
                } else if (typeof rawImages === 'string') {
                  const imgs = rawImages
                    .split('|')
                    .map(img => img?.trim())
                    .filter(img => img && (img.startsWith('data:image') || img.startsWith('http')));
                  cartImg = imgs[0];
                }

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
                  >
                    <div className="flex gap-3 p-3">
                      {/* Image — tanpa qty badge */}
                      <ProductImage
                        category={product.category}
                        name={product.name}
                        src={cartImg}
                        className="w-[72px] h-[72px] rounded-xl flex-shrink-0"
                      />

                      {/* Informasi */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-primary font-bold text-sm">
                              {formatRupiah(price)}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] text-gray-400 line-through">
                                {formatRupiah(originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subtotal + Actions row */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-semibold text-gray-500">
                            Subtotal: <span className="text-gray-700">{formatRupiah(subtotal)}</span>
                          </span>

                          <button
                            onClick={() => removeItem(product.id)}
                            className="text-gray-300 hover:text-red-400 p-1 -mr-1 transition-colors active:scale-90"
                            aria-label="Hapus produk"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls bar */}
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50/80 border-t border-gray-50">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleQuantityChange(product.id, qty - 1, stock)}
                          disabled={qty <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-90"
                        >
                          <Minus size={14} strokeWidth={2} />
                        </button>

                        <span className="w-10 text-center text-sm font-bold text-gray-800 tabular-nums">
                          {qty}
                        </span>

                        <button
                          onClick={() => handleQuantityChange(product.id, qty + 1, stock)}
                          disabled={isAtStockLimit}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-90"
                        >
                          <Plus size={14} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Stock indicator */}
                      <div className="text-right">
                        {isAtStockLimit ? (
                          <span className="text-[10px] font-semibold text-red-500">
                            Maks. stok
                          </span>
                        ) : isNearStockLimit ? (
                          <span className="text-[10px] font-medium text-amber-500">
                            Sisa {stock - qty} lagi
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">
                            Stok: {stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        {items.length > 0 && (
          <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            {totalSavings > 0 && (
              <div className="flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-3">
                <Sparkles size={14} className="text-emerald-500" strokeWidth={2} />
                <span className="text-xs font-semibold text-emerald-700">
                  Kamu hemat {formatRupiah(totalSavings)}!
                </span>
              </div>
            )}

            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Total Pembayaran</p>
                <p className="text-2xl font-extrabold text-gray-800 tracking-tight">
                  {formatRupiah(total)}
                </p>
              </div>
              <div className="text-right">
                {totalSavings > 0 && (
                  <p className="text-[10px] text-emerald-500 font-medium line-through">
                    {formatRupiah(total + totalSavings)}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle size={20} strokeWidth={2} />
              Checkout via WhatsApp
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-2.5">
              Pesanan akan dikonfirmasi melalui WhatsApp
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <CheckoutModal
        open={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleCheckoutConfirm}
        loading={isSubmitting}
      />
    </>
  );
}