'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, AlertCircle, CheckCircle, Loader2, X, ArrowLeft } from 'lucide-react';
import { useReviewStore } from '@/store/useReviewStore';
import { useToastStore } from '@/store/useToastStore';
import { Product } from '@/lib/types';

// ==================== MODAL COMPONENT ====================
type ModalVariant = 'confirm' | 'success' | 'error';

interface ModalProps {
  open: boolean;
  variant: ModalVariant;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

function Modal({
  open,
  variant,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  onClose,
}: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  const handleClose = () => {
    onClose?.();
    onCancel?.();
  };

  const iconMap = {
    confirm: (
      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4 mx-auto">
        <Star className="w-7 h-7 text-amber-500" />
      </div>
    ),
    success: (
      <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4 mx-auto">
        <CheckCircle className="w-7 h-7 text-emerald-500" />
      </div>
    ),
    error: (
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
    ),
  };

  const btnConfirmClass = {
    confirm: 'bg-primary hover:bg-primary-dark text-white',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    error: 'bg-red-500 hover:bg-red-600 text-white',
  }[variant];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300 ${animating ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className={`relative w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden transition-transform duration-300 ease-out ${animating
          ? 'translate-y-0 sm:scale-100 sm:translate-y-0'
          : 'translate-y-full sm:scale-95 sm:translate-y-4'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {variant !== 'success' && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}

        <div className="p-6 pt-2 sm:pt-6 text-center">
          {iconMap[variant]}

          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-6 whitespace-pre-line">
            {message}
          </p>

          <div className="flex gap-3">
            {variant !== 'success' && (
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-[0.97] transition-all"
              >
                {cancelLabel}
              </button>
            )}
            {variant !== 'error' && onConfirm && (
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all ${btnConfirmClass}`}
              >
                {confirmLabel}
              </button>
            )}
            {variant === 'error' && (
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm active:scale-[0.97] transition-all"
              >
                Mengerti
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ERROR FALLBACK COMPONENT ====================
function ErrorFallback({
  title = 'Terjadi Kesalahan',
  message = 'Halaman ulasan tidak dapat dimuat. Silakan coba lagi.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="max-w-md mx-auto p-4 py-8 min-h-[100dvh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm active:scale-[0.97] transition-all"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
interface ReviewPageProps {
  searchParams: { product?: string };
}

export default function ReviewPage({ searchParams }: ReviewPageProps) {
  const router = useRouter();
  const { showToast } = useToastStore();

  // ---- Safe store access ----
  const [storeError, setStoreError] = useState<string | null>(null);

  let addReview: ReturnType<typeof useReviewStore.getState>['addReview'] | null = null;

  try {
    const reviewStore = useReviewStore.getState();
    addReview = reviewStore.addReview;
  } catch {
    setStoreError(
      'Gagal memuat data toko. Pastikan koneksi internet Anda stabil.'
    );
  }

  // ---- State ----
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    variant: ModalVariant;
    title: string;
    message: string;
    confirmLabel?: string;
  }>({
    open: false,
    variant: 'confirm',
    title: '',
    message: '',
  });

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, open: false }));
  }, []);

  // ---- Product resolution ----
  const productCode = (searchParams?.product as string) || 'all';
  const [product, setProduct] = useState<Product | null>(null);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    if (productCode !== 'all') {
      fetch(`/api/public/products/${productCode}`)
        .then(res => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then(setProduct)
        .catch(() => setProductError(`Produk "${productCode}" tidak ditemukan di katalog kami.`));
    }
  }, [productCode]);

  // ---- Submit handler ----
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (rating === 0) {
        setModal({
          open: true,
          variant: 'error',
          title: 'Rating Belum Dipilih',
          message:
            'Mohon pilih rating bintang terlebih dahulu sebelum mengirim ulasan.',
          confirmLabel: 'Mengerti',
        });
        return;
      }

      if (comment.length > 1000) {
        setModal({
          open: true,
          variant: 'error',
          title: 'Ulasan Terlalu Panjang',
          message:
            'Ulasan maksimal 1000 karakter. Saat ini Anda menulis ' +
            comment.length +
            ' karakter.',
          confirmLabel: 'Mengerti',
        });
        return;
      }

      if (!addReview) {
        setModal({
          open: true,
          variant: 'error',
          title: 'Gagal Mengirim',
          message:
            'Layanan ulasan sedang tidak tersedia. Silakan coba beberapa saat lagi.',
          confirmLabel: 'Mengerti',
        });
        return;
      }

      setModal({
        open: true,
        variant: 'confirm',
        title: 'Kirim Ulasan?',
        message: `Anda memberikan rating ${rating}/5 bintang${comment ? ' dengan ulasan tertulis' : ''}.\n\nUlasan yang sudah dikirim tidak dapat diubah.`,
        confirmLabel: 'Ya, Kirim',
      });

      window.__reviewConfirmAction = () => executeSubmit();
    },
    [rating, comment, addReview]
  );

  const executeSubmit = useCallback(async () => {
    setIsSubmitting(true);
    closeModal();

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const reviewData = {
        id: `r-${Date.now()}`,
        productId: product?.id || 'all',
        sellerId: product?.sellerId || 'CS',
        name: 'User',
        rating,
        comment,
        createdAt: new Date().toISOString(),
        isVerified: true,
      };

      // ✅ STEP 1: POST review ke admin untuk sync & update rating
      try {
        const adminResponse = await fetch('/api/public/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product?.id || 'all',
            name: 'User',
            rating,
            comment,
          }),
        });

        if (adminResponse.ok) {
          console.log('[Review] Successfully submitted to admin');
        } else {
          console.warn('[Review] Failed to submit to admin:', adminResponse.statusText);
        }
      } catch (adminError) {
        console.warn('[Review] Error connecting to admin:', adminError);
      }

      // ✅ STEP 2: Update local store
      addReview!(reviewData);
      useReviewStore.getState().triggerRefresh();

      // ✅ STEP 2.5: Refetch product data untuk sync rating & reviews
      try {
        console.log('[Review] Revalidating product cache...');
        if (product?.slug) {
          await fetch(`/api/public/products/${product.slug}`);
        }
        router.refresh();
        console.log('[Review] Product cache invalidated');
      } catch (refreshError) {
        console.warn('[Review] Cache refresh failed:', refreshError);
      }

      // Toast selaras dengan ProductDetailPage
      showToast('Ulasan berhasil dikirim');

      // Modal sukses
      setModal({
        open: true,
        variant: 'success',
        title: 'Ulasan Berhasil Dikirim! 🙌',
        message:
          'Terima kasih atas masukan Anda. Ulasan sangat membantu kami dan pembeli lain.',
        confirmLabel: 'Kembali',
      });

      setTimeout(() => {
        try {
          if (product?.slug) {
            router.push(`/product/${product.slug}`);
          } else {
            router.push('/');
          }
        } catch {
          window.location.href = '/';
        }
      }, 1800);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan.';

      // Picu toast merah juga agar feedback instan terasa
      showToast(errorMessage, 'error');

      setModal({
        open: true,
        variant: 'error',
        title: 'Gagal Mengirim Ulasan',
        message: errorMessage + '\n\nSilakan coba lagi dalam beberapa saat.',
        confirmLabel: 'Mengerti',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [addReview, closeModal, product, router, showToast, rating, comment]);

  // ---- Render error fallback ----
  if (storeError) {
    return (
      <ErrorFallback
        title="Gagal Memuat Halaman"
        message={storeError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto p-4 py-8 relative min-h-[100dvh]">
        <div className="absolute inset-x-0 top-0 h-40 bg-primary-light -z-10" />

        {/* Back button */}
        <button
          onClick={() => {
            try {
              if (product?.slug) {
                router.push(`/product/${product.slug}`);
              } else {
                router.push('/');
              }
            } catch {
              window.location.href = '/';
            }
          }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors active:scale-[0.97]"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Beri Ulasan
            </h1>
            <p className="text-sm text-gray-500">
              {product
                ? `Bagaimana pengalaman Anda membeli ${product.name}?`
                : 'Bagaimana pengalaman Anda berbelanja di Palugada?'}
            </p>
          </div>

          {productError && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Produk Tidak Ditemukan
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {productError} Ulasan tetap dapat dikirim untuk toko secara
                  umum.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star rating */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    disabled={isSubmitting}
                    className="p-1 lg:p-2 transition-transform hover:scale-110 active:scale-95 touch-manipulation disabled:opacity-50 disabled:pointer-events-none"
                    aria-label={`Rating ${star} bintang`}
                  >
                    <Star
                      size={40}
                      strokeWidth={1}
                      className={`transition-colors ${star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500 h-5">
                {rating === 1 && 'Sangat Buruk 😞'}
                {rating === 2 && 'Buruk 😕'}
                {rating === 3 && 'Cukup 😐'}
                {rating === 4 && 'Bagus 🙂'}
                {rating === 5 && 'Sangat Bagus! 😍'}
              </p>
            </div>

            {/* Comment textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ceritakan pengalaman Anda{' '}
                  <span className="text-gray-500 font-normal">(opsional)</span>
                </label>
                <span
                  className={`text-xs tabular-nums transition-colors ${comment.length > 1000
                    ? 'text-red-500 font-semibold'
                    : comment.length > 800
                      ? 'text-amber-500'
                      : 'text-gray-500'
                    }`}
                >
                  {comment.length}/1000
                </span>
              </div>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 1000) {
                    setComment(val);
                  }
                }}
                placeholder="Contoh: Prosesnya cepat banget, adminnya juga ramah..."
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm disabled:bg-gray-50 disabled:opacity-60"
              />
              {comment.length > 800 && comment.length <= 1000 && (
                <p className="text-xs text-amber-500">
                  Sisa {1000 - comment.length} karakter lagi.
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl py-4 font-bold transition-all duration-200 block text-center active:scale-[0.98] mt-8 shadow-md shadow-emerald-700/20"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </span>
              ) : (
                'Kirim Ulasan'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modal.open}
        variant={modal.variant}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        onConfirm={() => {
          if (typeof window.__reviewConfirmAction === 'function') {
            window.__reviewConfirmAction();
            window.__reviewConfirmAction = null;
          }
        }}
        onCancel={closeModal}
        onClose={closeModal}
      />
    </>
  );
}

declare global {
  interface Window {
    __reviewConfirmAction: (() => void) | null;
  }
}