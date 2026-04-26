'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
  Star, StarHalf, Flame, CheckCircle, Clock, Share2, Heart, MessageCircle, ChevronLeft, ChevronDown, ChevronUp, Zap, Headphones
} from 'lucide-react';

import { useCartStore } from '@/store/useCartStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useReviewStore } from '@/store/useReviewStore';
import { useReviewModalStore } from '@/store/useReviewModalStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Product, Review } from '@/lib/types';
import { formatRupiah, timeAgo, maskName, generateSingleWAMessage, getWALink } from '@/lib/utils';
import ProductImage from '@/components/ProductImage';
import CheckoutModal from '@/components/CheckoutModal';
import LoadingScreen from '@/components/LoadingScreen';

// Helper: hitung distribusi rating dari data ulasan
function getRatingDistribution(reviews: { rating: number }[]) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (dist[r.rating as keyof typeof dist] !== undefined) {
      dist[r.rating as keyof typeof dist]++;
    }
  });
  const total = reviews.length || 1;
  return {
    raw: dist,
    percent: {
      5: Math.round((dist[5] / total) * 100),
      4: Math.round((dist[4] / total) * 100),
      3: Math.round((dist[3] / total) * 100),
      2: Math.round((dist[2] / total) * 100),
      1: Math.round((dist[1] / total) * 100),
    }
  };
}

const RATING_COLORS: Record<number, string> = {
  5: 'bg-emerald-500',
  4: 'bg-emerald-400',
  3: 'bg-yellow-400',
  2: 'bg-orange-400',
  1: 'bg-red-400',
};

const colors = [
  'bg-red-100 text-red-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-orange-100 text-orange-600',
  'bg-pink-100 text-pink-600',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function renderStar(i: number, rating: number) {
  const diff = rating - (i - 1);

  if (diff >= 0.75) {
    return <Star key={i} size={10} className="text-yellow-500 fill-yellow-500" />;
  }
  if (diff >= 0.25) {
    return <StarHalf key={i} size={10} className="text-yellow-500 fill-yellow-500" />;
  }
  return <Star key={i} size={10} className="text-gray-200" />;
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();

  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { getReviewsForProduct, reviews: zustandReviews } = useReviewStore();
  const { openModal } = useReviewModalStore();
  const { deliveryInfo } = useDeliveryStore();
  const { waNumber, fetchSettings } = useSettingsStore();

  const [product, setProduct] = useState<(Product & { reviews?: Review[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const loaderStartTimeRef = useRef<number | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [isToastExiting, setIsToastExiting] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
    // Track kapan loader dimulai
    loaderStartTimeRef.current = Date.now();
    const MIN_DISPLAY_TIME = 600; // ms - minimum 600ms agar tidak flicker

    fetch(`/api/public/products/${slug}?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        const elapsed = Date.now() - (loaderStartTimeRef.current || Date.now());

        // Kalau belum mencapai minimum display time, tunggu
        if (elapsed < MIN_DISPLAY_TIME) {
          setTimeout(() => {
            setProduct(data);
            setLoading(false);
          }, MIN_DISPLAY_TIME - elapsed);
        } else {
          // Langsung hide kalau sudah beyond minimum time
          setProduct(data);
          setLoading(false);
        }
      })
      .catch(() => {
        const elapsed = Date.now() - (loaderStartTimeRef.current || Date.now());

        // Ensure minimum display time bahkan saat error
        if (elapsed < MIN_DISPLAY_TIME) {
          setTimeout(() => {
            setLoading(false);
          }, MIN_DISPLAY_TIME - elapsed);
        } else {
          setLoading(false);
        }
      });
  }, [slug]);

  const showToast = (message: string) => {
    if (toast) {
      setIsToastExiting(true);
      setTimeout(() => {
        setToast(message);
        setIsToastExiting(false);
        setTimeout(() => {
          setIsToastExiting(true);
          setTimeout(() => {
            setToast(null);
            setIsToastExiting(false);
          }, 200);
        }, 2000);
      }, 200);
    } else {
      setToast(message);
      setTimeout(() => {
        setIsToastExiting(true);
        setTimeout(() => {
          setToast(null);
          setIsToastExiting(false);
        }, 200);
      }, 2000);
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(5);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Tentukan label berdasarkan rating angka
  const getRatingLabel = (rating: number) => {
    if (rating >= 4.8) return 'Sangat Bagus';
    if (rating >= 4.3) return 'Bagus';
    if (rating >= 3.5) return 'Cukup';
    if (rating >= 2.5) return 'Kurang';
    return 'Buruk';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.8) return 'text-emerald-600';
    if (rating >= 4.3) return 'text-emerald-500';
    if (rating >= 3.5) return 'text-yellow-500';
    if (rating >= 2.5) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    const name = product.name.length > 35 ? product.name.slice(0, 35) + '…' : product.name;
    showToast(`${name} ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    setIsCheckoutModalOpen(true);
  };

  const handleBuyNowConfirm = async () => {
    if (!product) return;

    try {
      // ─────── STEP 1: Call Admin API to update stock ───────
      const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';

      const orderResponse = await fetch(`${adminApiUrl}/api/admin/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          customerName: deliveryInfo.name,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          lat: deliveryInfo.lat,
          lng: deliveryInfo.lng,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        showToast(`Error: ${orderData.error}`);
        return;
      }

      // ─────── STEP 2: Success - proceed with WhatsApp ───────
      const message = generateSingleWAMessage(product.name, product.slug, deliveryInfo);
      window.open(getWALink(message, waNumber), '_blank');
      openModal(product.slug);
      setIsCheckoutModalOpen(false);
      showToast('Order berhasil! Pesan dikirim ke WhatsApp');
    } catch (error) {
      console.error('[CHECKOUT ERROR]', error);
      showToast('Gagal memproses order. Silakan coba lagi.');
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Beli ${product.name} di Palugada Store`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link berhasil disalin');
      }
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const itemWidth = scrollContainerRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const halfwayPoint = documentHeight * 0.5;
      setShowBackToTop(scrollY > halfwayPoint);
    };

    window.addEventListener('scroll', checkScrollPosition);
    return () => window.removeEventListener('scroll', checkScrollPosition);
  }, []);

  if (loading) return <LoadingScreen />;
  if (!product) return <div className="p-8 text-center min-h-screen bg-gray-50 flex items-center justify-center">Product not found.</div>;

  const localReviews = getReviewsForProduct(product.id);
  // Gabungkan ulasan dari API dan lokal
  const allReviews = (() => {
    const apiReviews = product.reviews || [];
    const merged = [...localReviews, ...apiReviews];
    // Hindari duplikasi berdasarkan nama dan komentar
    const unique = merged.filter((v, i, a) => a.findIndex(t => (t.id === v.id || (t.comment === v.comment && t.name === v.name))) === i);
    return unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  })();

  const distribution = getRatingDistribution(allReviews);
  const displayedReviews = allReviews.slice(0, displayCount);

  const needsTruncation = product.description.length > 300;
  const truncatedDescription = needsTruncation && !isDescriptionExpanded
    ? product.description.slice(0, 300) + '...'
    : product.description;

  return (
    <div className="bg-gray-50 pb-24 min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-3 left-0 right-0 z-[60] flex justify-center pointer-events-none transition-all duration-300 ${isToastExiting
            ? 'opacity-0 -translate-y-4 scale-95'
            : 'opacity-100 translate-y-0 scale-100'
            }`}
        >
          <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-medium px-3.5 py-2 rounded-2xl shadow-lg max-w-[280px]">
            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
            <span className="leading-snug break-words">{toast}</span>
          </div>
        </div>
      )}

      {/* Gallery */}
      <div className="relative bg-white pt-1 pb-0 mb-1">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-all duration-200"
          aria-label="Kembali"
        >
          <ChevronLeft size={20} strokeWidth={2} className="text-white" />
        </button>

        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-all duration-200"
            aria-label="Bagikan"
          >
            <Share2 size={18} strokeWidth={1.5} className="text-white" />
          </button>
          <button
            onClick={() => toggleFavorite(product.id)}
            className="p-2.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-all duration-200"
            aria-label="Favorit"
          >
            <Heart
              size={18}
              strokeWidth={1.5}
              className={isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-white"}
            />
          </button>
        </div>

        <div className="relative">
          {(() => {
            // Dynamic slide count: use images array length if available, else default 3, max 3
            const slideCount = product.images && product.images.length > 0
              ? Math.min(product.images.length, 3)
              : 3;
            const slides = Array.from({ length: slideCount }, (_, i) => i);

            return (
              <>
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {slides.map((i) => (
                    <div key={i} className="flex-shrink-0 w-full snap-start">
                      <ProductImage
                        category={product.category}
                        name={product.name}
                        variant={i}
                        src={product.images?.[i]}
                        className="w-full aspect-[4/3] sm:aspect-video"
                      />
                    </div>
                  ))}
                </div>

                {slideCount > 1 && (
                  <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center items-center gap-1.5">
                    {slides.map((i) => (
                      <div
                        key={i}
                        className={`transition-all duration-300 rounded-full ${currentIndex === i ? 'w-6 h-1 bg-white' : 'w-1.5 h-1 bg-white/50'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Info Section - Clean & No Redundancy */}
      <div className="bg-white p-3 mb-1">
        {/* Header with Product Name & Sold count */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 leading-snug flex-1">
            {product.name}
          </h1>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 text-orange-500">
              <Flame size={14} strokeWidth={1.5} />
              <span className="font-semibold text-gray-800 text-sm">{product.sold}+</span>
            </div>
            <p className="text-[10px] text-gray-400">Terjual</p>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="flex items-end justify-between mb-2.5">
          <div>
            {product.originalPrice && (
              <p className="text-sm text-gray-400 line-through mb-1">
                {formatRupiah(product.originalPrice)}
              </p>
            )}
            <p className="text-2xl font-bold text-primary tracking-tight">
              {formatRupiah(product.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Sisa Stok</p>
            <p className="font-semibold text-gray-800">{product.stock}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Description - dengan jarak lebih ke bawah */}
        <div className="mt-2">
          <h3 className="font-bold text-gray-800 mb-2">Deskripsi Produk</h3>
          <p ref={descriptionRef} className="text-sm text-gray-600 leading-relaxed max-w-none whitespace-pre-wrap">
            {truncatedDescription}
          </p>
          {needsTruncation && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 text-primary font-medium text-sm flex items-center gap-1 hover:text-primary-dark transition-colors"
            >
              {isDescriptionExpanded ? (
                <>
                  <ChevronUp size={16} strokeWidth={1.5} />
                  Lihat lebih sedikit
                </>
              ) : (
                <>
                  <ChevronDown size={16} strokeWidth={1.5} />
                  Lihat selengkapnya
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Jaminan Palugada */}
      <div className="bg-white px-4 py-2 mb-1">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">Alasan Pilih Kami</h3>

        <div className="flex gap-1.5">
          <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={12} strokeWidth={1.5} className="text-emerald-600" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 whitespace-nowrap truncate">
              Tersedia
            </span>
          </div>

          <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-yellow-50 rounded-lg border border-yellow-100 min-w-0">
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Zap size={12} strokeWidth={1.5} className="text-yellow-600" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold text-yellow-700 whitespace-nowrap truncate">
              Fast Respon
            </span>
          </div>

          <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 min-w-0">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Headphones size={12} strokeWidth={1.5} className="text-blue-600" />
            </div>
            <span className="text-[10px] font-semibold text-blue-700 whitespace-nowrap truncate">
              24 Jam
            </span>
          </div>
        </div>
      </div>

      {/* Review Section - Clean */}
      <div className="bg-white p-3 mb-1">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          Ulasan Pembeli ({allReviews.length})
        </h3>

        {/* Rating Summary Card */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-4 border border-gray-100">
          <div className="flex items-center gap-3">
            {/* Angka rating besar + label */}
            <div className="flex flex-col items-center justify-center min-w-[72px]">
              <span className="text-3xl font-extrabold text-gray-800 leading-none">{product.rating}</span>
              <div className="flex text-yellow-500 my-1 gap-0.5">
                {[1, 2, 3, 4, 5].map(i => renderStar(i, product.rating))}
              </div>
              <span className={`text-[10px] font-bold ${getRatingColor(product.rating)}`}>
                {getRatingLabel(product.rating)}
              </span>
            </div>

            {/* Bar distribusi */}
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(star => {
                const pct = distribution.percent[star as keyof typeof distribution.percent];
                const count = distribution.raw[star as keyof typeof distribution.raw];
                return (
                  <div key={star} className="flex items-center gap-1.5 group cursor-default">
                    <span className="w-3 text-[10px] font-semibold text-gray-500 text-right tabular-nums">{star}</span>
                    <Star size={8} className="text-gray-400 fill-gray-400 flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${RATING_COLORS[star]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 tabular-nums min-w-[22px] text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daftar Ulasan */}
        <div className="space-y-0 -mx-1">
          {displayedReviews.map((review: Review, index: number) => (
            <div
              key={review.id}
              className={`py-2.5 px-1 ${index < displayedReviews.length - 1 ? 'border-b border-gray-100' : ''
                }`}
            >
              {/* Baris atas */}
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarColor(review.name)}`}>
                    <span className="text-xs font-bold">
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {maskName(review.name)}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map(star => renderStar(star, review.rating))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                  {review.isVerified && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <CheckCircle size={10} strokeWidth={2} />
                      Verified
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} strokeWidth={1.5} />
                    {timeAgo(review.createdAt)}
                  </span>
                </div>
              </div>

              {/* Komentar */}
              <p className="text-sm text-gray-600 leading-relaxed pl-[42px]">
                &quot;{review.comment}&quot;
              </p>
            </div>
          ))}
        </div>

        {displayCount < allReviews.length && (
          <button
            onClick={() => setDisplayCount(prev => prev + 5)}
            className="w-full py-2 mt-2 text-primary font-medium text-sm border hover:bg-primary-light border-primary/20 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Lihat ulasan lainnya
            <ChevronDown size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-container mx-auto flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary-light transition-colors duration-200 tap-active text-center whitespace-nowrap text-sm"
          >
            + Keranjang
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-[2] py-3.5 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors duration-200 tap-active shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <MessageCircle size={18} strokeWidth={2} />
            Pesan Sekarang
          </button>
        </div>
      </div>

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={handleBackToTop}
          className="fixed bottom-24 right-4 z-40 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all duration-200 animate-fade-in-up"
          aria-label="Kembali ke atas"
        >
          <ChevronUp size={20} strokeWidth={2} />
        </button>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>

      <CheckoutModal
        open={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleBuyNowConfirm}
      />
    </div>
  );
}