'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Send, Sparkles, MessageSquareText, ChevronRight, ShoppingBag } from 'lucide-react';
import { useReviewModalStore } from '@/store/useReviewModalStore';
import { useReviewStore } from '@/store/useReviewStore';
import { useToastStore } from '@/store/useToastStore';
import { useCartStore } from '@/store/useCartStore';
import { products } from '@/lib/data';
import ProductImage from '@/components/ProductImage';

const RATING_CONFIG = {
  1: { label: 'Sangat Buruk', emoji: '😞', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
  2: { label: 'Buruk', emoji: '😕', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  3: { label: 'Cukup', emoji: '😐', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  4: { label: 'Bagus', emoji: '🙂', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  5: { label: 'Sangat Bagus!', emoji: '😍', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
} as const;

const MAX_CHARS = 300;
const DRAG_CLOSE_THRESHOLD = 100;
const VELOCITY_CLOSE_THRESHOLD = 0.4;

type CartProduct = (typeof products)[number] & { qty: number };

export default function ReviewModal() {
  const { isOpen, closeModal, productSlug } = useReviewModalStore();
  const { addReview } = useReviewStore();
  const { showToast } = useToastStore();
  const { items: cartItems } = useCartStore();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number>(0); // ✅ Langsung simpan height
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);     // ✅ Flag sederhana

  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const dragVelocity = useRef(0);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // --- Resolve products to display ---
  const singleProduct = productSlug ? products.find((p) => p.slug === productSlug) : null;

  const displayProducts: CartProduct[] = singleProduct
    ? [{ ...singleProduct, qty: 1 }]
    : cartItems.reduce<CartProduct[]>((acc, item) => {
        if (item.product) acc.push({ ...item.product, qty: item.quantity });
        return acc;
      }, []);

  const isFromCart = !singleProduct && cartItems.length > 0;

  const displayRating = hoveredStar || rating;
  const charCount = comment.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = rating > 0 && !isSubmitting && !isOverLimit;

  // ── Reset saat modal buka ──
  const resetState = useCallback(() => {
    setRating(0);
    setComment('');
    setHoveredStar(0);
    setDragDelta(0);
    dragVelocity.current = 0;
    // ✅ Set initial viewport height
    const viewport = window.visualViewport;
    if (viewport) {
      setViewportHeight(viewport.height);
    }
  }, []);

  // ── Kunci scroll body + Handle keyboard via Visual Viewport API ──
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const body = document.body;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';

    const viewport = window.visualViewport;

    // ✅ Simpan initial height untuk deteksi keyboard
    let initialHeight = viewport?.height ?? window.innerHeight;

    const handleViewportChange = () => {
      if (!viewport) return;

      const currentHeight = viewport.height;

      // ✅ Update viewport height langsung - ini sudah area yang tersedia
      setViewportHeight(currentHeight);

      // ✅ Deteksi apakah keyboard terbuka
      const heightDiff = initialHeight - currentHeight;
      setIsKeyboardOpen(heightDiff > 100);
    };

    if (viewport) {
      // Set initial height setelah delay untuk nilai stabil
      const timeoutId = setTimeout(() => {
        initialHeight = viewport.height;
        setViewportHeight(viewport.height);
      }, 100);

      viewport.addEventListener('resize', handleViewportChange);
      viewport.addEventListener('scroll', handleViewportChange);

      return () => {
        clearTimeout(timeoutId);
        viewport.removeEventListener('resize', handleViewportChange);
        viewport.removeEventListener('scroll', handleViewportChange);
      };
    }

    return () => {
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.overflow = '';
      setViewportHeight(0);
      setIsKeyboardOpen(false);
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (dragDelta === 0 && !isClosing) {
      setIsClosing(true);
      setDragDelta(0);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setTimeout(() => {
        setIsClosing(false);
        resetState();
        closeModal();
      }, 280);
    }
  }, [dragDelta, isClosing, closeModal, resetState]);

  const triggerClose = useCallback(() => {
    setIsClosing(true);
    setDragDelta(0);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setTimeout(() => {
      setIsClosing(false);
      resetState();
      closeModal();
    }, 280);
  }, [closeModal, resetState]);

  // --- Drag to close with velocity ---
  const handleDragStart = (e: React.TouchEvent) => {
    if (isKeyboardOpen) return; // ✅ Gunakan flag sederhana
    if ((e.target as HTMLElement).closest('textarea, input, button')) return;
    dragStartY.current = e.touches[0].clientY;
    lastY.current = dragStartY.current;
    lastTime.current = Date.now();
    dragVelocity.current = 0;
    isDragging.current = true;
  };

  const handleDragMove = (e: React.TouchEvent) => {
    if (!isDragging.current || isClosing || isKeyboardOpen) return;
    const y = e.touches[0].clientY;
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      dragVelocity.current = (y - lastY.current) / dt;
    }
    lastY.current = y;
    lastTime.current = now;
    const delta = Math.max(0, y - dragStartY.current);
    setDragDelta(delta);
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragDelta > DRAG_CLOSE_THRESHOLD || dragVelocity.current > VELOCITY_CLOSE_THRESHOLD) {
      triggerClose();
    } else {
      setDragDelta(0);
    }
    dragVelocity.current = 0;
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('Mohon pilih rating bintang terlebih dahulu');
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const reviewBase = {
      name: 'Pembeli',
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      isVerified: true,
    };

    if (displayProducts.length > 0) {
      displayProducts.forEach((p, i) => {
        addReview({
          ...reviewBase,
          id: `r-${Date.now()}-${i}`,
          productId: p.id,
        });
      });
    } else {
      addReview({
        ...reviewBase,
        id: `r-${Date.now()}`,
        productId: 'all',
      });
    }

    setIsSubmitting(false);
    showToast('Terima kasih, Ulasan berhasil dikirim');
    handleClose();
  };

  if (!isOpen) return null;

  const config = rating > 0 ? RATING_CONFIG[rating as keyof typeof RATING_CONFIG] : null;
  const backdropOpacity = isClosing ? 0 : dragDelta > 0 ? Math.max(0, 1 - dragDelta / 300) : 1;

  // ✅ FIX: Gunakan viewportHeight langsung sebagai maxHeight
  const panelMaxHeight = viewportHeight > 0 
    ? `${viewportHeight}px` 
    : '92vh';

  const panelTransition = isClosing
    ? 'transform 0.3s ease-out, opacity 0.3s ease-out'
    : dragDelta > 0
      ? 'none'
      : 'max-height 0.15s ease-out, transform 0.3s ease-out';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0 pointer-events-none' : ''
        }`}
        style={{
          touchAction: 'none' as const,
          ...(dragDelta > 0 && !isClosing ? { opacity: backdropOpacity } : {}),
        }}
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center pointer-events-none">
        <div
          ref={panelRef}
          className={`pointer-events-auto bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col ${
            isClosing ? 'translate-y-full sm:translate-y-8 sm:scale-95 sm:opacity-0' : ''
          }`}
          style={{
            // ✅ FIX: Selalu bottom: 0, TANPA offset
            bottom: 0,
            left: 0,
            right: 0,
            // ✅ FIX: maxHeight langsung dari visualViewport.height
            maxHeight: panelMaxHeight,
            transition: panelTransition,
            ...(dragDelta > 0 && !isClosing ? { transform: `translateY(${dragDelta}px)` } : {}),
            // ✅ Selalu fixed position
            position: 'fixed' as const,
          }}
        >
          {/* Drag Trigger Zone */}
          <div
            className="touch-none select-none cursor-grab active:cursor-grabbing flex-shrink-0"
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="px-4 pb-3 pt-0.5 flex items-center border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquareText size={16} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 leading-tight">Beri Ulasan</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Bantu pembeli lain dengan ulasanmu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            ref={scrollContentRef}
            className="overflow-y-auto flex-1"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="p-4 space-y-3">
              {/* Product List */}
              {displayProducts.length > 0 && (
                <div className="overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      {isFromCart && <ShoppingBag size={10} strokeWidth={1.5} />}
                      {isFromCart ? 'Pesanan Kamu' : 'Produk'}
                      <span className="text-gray-300 font-normal normal-case">({displayProducts.length})</span>
                    </p>
                    {displayProducts.length > 3 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                        Geser <ChevronRight size={10} />
                      </span>
                    )}
                  </div>

                  <div className="product-scroll-container">
                    <div className="product-scroll">
                      {displayProducts.slice(0, 10).map((p) => (
                        <div
                          key={p.id}
                          className={`product-card flex items-center gap-2.5 py-2.5 px-3 bg-gray-50 rounded-xl border border-gray-100 ${
                            displayProducts.length === 1 ? 'w-full' : 'min-w-[150px] sm:min-w-[170px]'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-100 shadow-sm">
                            <ProductImage
                              category={p.category}
                              name={p.name}
                              variant={0}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-gray-800 truncate leading-snug">
                              {p.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-[10px] text-primary font-bold">
                                {p.price.toLocaleString('id-ID')}
                              </p>
                              {p.qty > 1 && (
                                <span className="text-[9px] text-gray-400 bg-gray-200/60 px-1 py-px rounded">
                                  ×{p.qty}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isFromCart && displayProducts.length > 1 && (
                    <p className="text-[10px] text-gray-400 mt-1.5 pl-0.5">
                      Ulasan akan diterapkan ke semua produk
                    </p>
                  )}
                </div>
              )}

              {/* Rating Section */}
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center mb-2.5">
                  {rating > 0 && (
                    <div
                      className={`absolute inset-0 blur-xl rounded-full transition-all duration-500 ${
                        rating >= 4
                          ? 'bg-yellow-300/30'
                          : rating >= 3
                            ? 'bg-yellow-300/20'
                            : 'bg-orange-300/20'
                      }`}
                      style={{ padding: '14px 22px' }}
                    />
                  )}
                  <div className="relative flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= displayRating;
                      const isFilled = star <= rating;
                      const isHoverFill = star <= hoveredStar;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            setRating(star);
                            setHoveredStar(0);
                          }}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="relative p-0.5 transition-all duration-200 touch-manipulation"
                        >
                          <Star
                            size={34}
                            strokeWidth={1}
                            className={`transition-all duration-200 ${
                              isActive
                                ? isFilled || isHoverFill
                                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                  : 'text-gray-300'
                                : 'text-gray-200'
                            } ${isActive ? 'scale-100' : 'scale-90'}`}
                          />
                          {isFilled && (
                            <Sparkles
                              size={9}
                              className="absolute -top-0.5 -right-0.5 text-yellow-400 opacity-0 animate-star-sparkle"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-7 flex items-center justify-center">
                  {config ? (
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bg} border ${config.border} animate-badge-pop`}
                    >
                      <span>{config.emoji}</span>
                      <span>{config.label}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Tap bintang untuk memberi rating</p>
                  )}
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="review-comment" className="text-xs font-semibold text-gray-700">
                    Ulasan
                  </label>
                  <span
                    className={`text-[10px] font-medium tabular-nums transition-colors ${
                      isOverLimit
                        ? 'text-red-500'
                        : charCount > MAX_CHARS * 0.8
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                    }`}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
                <textarea
                  id="review-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalamanmu belanja di sini..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm leading-relaxed outline-none transition-all resize-none placeholder:text-gray-300 ${
                    isOverLimit
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                  }`}
                />
                {isOverLimit && (
                  <p className="text-[11px] text-red-500 font-medium -mt-0.5">
                    Ulasan terlalu panjang, mohon kurangi.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit && !isSubmitting}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                    canSubmit
                      ? 'bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send size={15} strokeWidth={2} />
                      Kirim Ulasan
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-full text-gray-400 hover:text-gray-600 font-medium text-xs py-1.5 transition-colors disabled:opacity-50"
                >
                  Lewati untuk sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-scroll-container {
          overflow: hidden;
          border-radius: 12px;
        }

        .product-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          padding-bottom: 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .product-scroll::-webkit-scrollbar {
          display: none;
        }

        .product-card {
          scroll-snap-align: start;
          flex-shrink: 0;
        }

        @keyframes starSparkle {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-45deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) rotate(45deg) translateY(-4px);
          }
        }

        @keyframes badgePop {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(4px);
          }
          60% {
            transform: scale(1.05) translateY(-1px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-star-sparkle {
          animation: starSparkle 0.6s ease-out forwards;
        }

        .animate-badge-pop {
          animation: badgePop 0.35s ease-out forwards;
        }
      `}</style>
    </>
  );
}