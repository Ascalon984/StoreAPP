'use client';

import { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, MessageCircle, Trash2, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useReviewModalStore } from '@/store/useReviewModalStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { formatRupiah, generateWAMessage, getWALink } from '@/lib/utils';
import ProductImage from './ProductImage';
import CheckoutModal from './CheckoutModal';

export default function MiniCart() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const { openModal } = useReviewModalStore();
  const { deliveryInfo } = useDeliveryStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

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

  const handleCheckoutConfirm = () => {
    if (items.length === 0) return;
    try {
      const message = generateWAMessage(items, deliveryInfo);
      window.open(getWALink(message), '_blank');

      if (items.length === 1) {
        openModal(items[0].product.slug);
      } else {
        openModal();
      }

      setIsCheckoutModalOpen(false);
      closeCart();
    } catch {
      window.open('https://wa.me/', '_blank');
      setIsCheckoutModalOpen(false);
      closeCart();
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
        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      <div className="fixed top-0 right-0 bottom-0 w-[92%] max-w-[420px] bg-gray-50 z-[70] shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* ===== HEADER ===== */}
        <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag size={20} strokeWidth={1.5} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 leading-tight">Keranjang Saya</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {items.length === 0
                    ? 'Belum ada produk'
                    : `${items.length} produk · ${totalItems} item`}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <X size={20} strokeWidth={1.5} className="text-gray-500" />
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
                        className="w-[72px] h-[72px] rounded-xl flex-shrink-0"
                      />

                      {/* Info */}
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
      />
    </>
  );
}