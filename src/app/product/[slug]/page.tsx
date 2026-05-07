'use client';

import { useState, useRef, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
  Star, Send, StarHalf, Flame, CheckCircle, Clock, Share2, Heart, MessageCircle, ChevronLeft, ChevronDown, Zap, Headphones, ThumbsUp, ThumbsDown
} from 'lucide-react';

import { useCartStore } from '@/store/useCartStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useReviewStore } from '@/store/useReviewStore';
import { useReviewModalStore } from '@/store/useReviewModalStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { useToastStore } from '@/store/useToastStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { Product, Review } from '@/lib/types';
import { formatRupiah, timeAgo, maskName, generateSingleWAMessage, getWALink } from '@/lib/utils';
import ProductImage from '@/components/ProductImage';
import CheckoutModal from '@/components/CheckoutModal';
import LoadingScreen from '@/components/LoadingScreen';
import TimeAgo from '@/components/TimeAgo';

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
    return <Star key={i} size={9} className="text-yellow-500 fill-yellow-500" />;
  }
  if (diff >= 0.25) {
    return <StarHalf key={i} size={9} className="text-yellow-500 fill-yellow-500" />;
  }
  return <Star key={i} size={9} className="text-gray-200" />;
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();

  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { getReviewsForProduct, reviews: zustandReviews, fetchReviews, refreshVersion, triggerRefresh } = useReviewStore();
  const { openModal } = useReviewModalStore();
  const { deliveryInfo } = useDeliveryStore();
  const { showToast } = useToastStore();
  const { waNumber, fetchSettings } = useSettingsStore();

  const [product, setProduct] = useState<(Product & { reviews?: Review[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loaderStartTimeRef = useRef<number | null>(null);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  // PERBAIKAN 1: votedType dengan nilai null untuk state tidak aktif
  const [votedType, setVotedType] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [thankYouIds, setThankYouIds] = useState<string[]>([]);

  useEffect(() => {
    // Scroll to top saat halaman dimuat
    window.scrollTo(0, 0);
    
    fetchSettings();
    fetchReviews();
    loaderStartTimeRef.current = Date.now();
    const MIN_DISPLAY_TIME = 300; // Dikurangi agar transisi lebih cepat

    // Gunakan revalidation atau cache default Next.js jika memungkinkan
    fetch(`/api/public/products/${slug}`, {
      cache: 'no-store'
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        const elapsed = Date.now() - (loaderStartTimeRef.current || Date.now());

        if (elapsed < MIN_DISPLAY_TIME) {
          setTimeout(() => {
            setProduct(data);
            setLoading(false);
          }, MIN_DISPLAY_TIME - elapsed);
        } else {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch(() => {
        const elapsed = Date.now() - (loaderStartTimeRef.current || Date.now());

        if (elapsed < MIN_DISPLAY_TIME) {
          setTimeout(() => {
            setLoading(false);
          }, MIN_DISPLAY_TIME - elapsed);
        } else {
          setLoading(false);
        }
      });
  }, [slug, refreshVersion]);

  useEffect(() => {
    if (product?.id) {
      console.log(`Fetching reviews for product: ${product.id}`);
      fetchReviews(product.id);
    }
  }, [product?.id, fetchReviews]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(5);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'Belum ada rating';
    if (rating >= 4.7) return 'Sangat Bagus';
    if (rating >= 4.0) return 'Bagus';
    if (rating >= 3.0) return 'Cukup';
    if (rating >= 2.0) return 'Kurang';
    return 'Buruk';
  };

  const getRatingColor = (rating: number) => {
    if (rating === 0) return 'text-gray-600';
    if (rating >= 4.7) return 'text-emerald-700';
    if (rating >= 4.0) return 'text-emerald-700';
    if (rating >= 3.0) return 'text-amber-700';
    if (rating >= 2.0) return 'text-orange-700';
    return 'text-rose-700';
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
      setIsSubmitting(true);
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
        showToast(`Error: ${orderData.error}`, 'error');
        return;
      }

      const message = generateSingleWAMessage(
        product.name,
        product.slug,
        product.price,
        deliveryInfo
      );
      window.open(getWALink(message, waNumber), '_blank');
      openModal(product.slug);
      setIsCheckoutModalOpen(false);
      showToast('Order berhasil! Pesan dikirim ke WhatsApp');
      router.refresh();
    } catch (error) {
      console.error('[CHECKOUT ERROR]', error);
      showToast('Gagal memproses order. Silakan coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
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

  // PERBAIKAN 1: Fungsi handleVote yang sudah diperbaiki
  const handleVote = async (reviewId: string, type: 'like' | 'dislike') => {
    if (votedIds.includes(reviewId)) return;

    // 1. Set state untuk tampilan aktif (fill & teks)
    setVotedIds(prev => [...prev, reviewId]);
    setVotedType(prev => ({ ...prev, [reviewId]: type }));
    setThankYouIds(prev => [...prev, reviewId]);

    try {
      const response = await fetch(`/api/public/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`Error: ${error.error || 'Gagal mengupdate vote'}`);
        // Rollback jika gagal
        setVotedIds(prev => prev.filter(id => id !== reviewId));
        setVotedType(prev => {
          const newState = { ...prev };
          delete newState[reviewId];
          return newState;
        });
        setThankYouIds(prev => prev.filter(id => id !== reviewId));
        return;
      }

      // Success - trigger refresh untuk update data dari database
      triggerRefresh();

      setTimeout(() => {
        setThankYouIds(prev => prev.filter(id => id !== reviewId));
      }, 2000);

    } catch (error) {
      console.error('Vote error:', error);
      // Rollback jika error
      setVotedIds(prev => prev.filter(id => id !== reviewId));
      setVotedType(prev => {
        const newState = { ...prev };
        delete newState[reviewId];
        return newState;
      });
      setThankYouIds(prev => prev.filter(id => id !== reviewId));
    }
  };

  const { setIsReturningFromDetail } = useNavigationStore();

  const handleBack = () => {
    setIsReturningFromDetail(true);
    window.history.back();
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const itemWidth = scrollContainerRef.current.clientWidth;
      const newIndex = itemWidth > 0 ? Math.round(scrollLeft / itemWidth) : 0;
      setCurrentIndex(newIndex);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollY = window.scrollY;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Tampilkan jika sudah scroll lebih dari 50% area yang bisa di-scroll
      if (scrollableHeight > 0 && scrollY >= scrollableHeight * 0.5) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    return () => window.removeEventListener('scroll', checkScrollPosition);
  }, []);

  // Data ulasan & metrics (diolah secara aman dengan pengecekan product)
  const localReviews = product ? getReviewsForProduct(product.id) : [];
  const allReviews = (() => {
    return localReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  })();

  const specificReviews = product ? localReviews.filter(r => r.productId === product.id) : [];
  const serverCount = product?.reviewCount || 0;
  const serverRating = product?.rating || 0;
  const liveReviewCount = Math.max(serverCount, specificReviews.length);
  const liveRating = liveReviewCount > 0
    ? Number((specificReviews.reduce((acc, r) => acc + r.rating, 0) / specificReviews.length).toFixed(1))
    : serverRating;

  const distribution = getRatingDistribution(allReviews);
  const displayedReviews = allReviews.slice(0, displayCount);

  const needsTruncation = (product?.description?.length || 0) > 300;
  const truncatedDescription = product ? (needsTruncation && !isDescriptionExpanded
    ? product.description.slice(0, 300) + '...'
    : product.description) : '';

  return (
    <div className="bg-gray-50 pb-24 min-h-screen">
      {/* Render LoadingScreen di sini agar bisa menangani animasi exit secara halus */}
      <LoadingScreen isLoading={loading} />

      {!loading && !product ? (
        <div className="p-8 text-center min-h-screen bg-gray-50 flex items-center justify-center">Product not found.</div>
      ) : product ? (
        <>
          {/* Gallery Header Nav */}
          <div className="relative bg-white pt-1 pb-0 mb-1">

            {/* Back Button - Shadow diperkuat & border dibuat lebih tajam */}
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 z-20 p-2 rounded-full bg-white backdrop-blur-md border border-gray-200/50 shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:bg-white transition-all duration-300 active:scale-90"
              aria-label="Kembali"
            >
              <ChevronLeft size={22} strokeWidth={2.5} className="text-gray-900" />
            </button>

            {/* Right Actions - Combined Pill Mode (ULTRA-ALIGNED) */}
            <div className="absolute top-4 right-4 z-20 flex items-center bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-[0_8px_24px_rgba(0,0,0,0.1)] rounded-full px-1.5 h-[38px]"> {/* Gunakan h-[38px] agar fix sama dengan tombol back */}

              {/* Tombol Share */}
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full hover:bg-gray-50 transition-all active:scale-90"
                aria-label="Bagikan"
              >
                <Share2 size={17} strokeWidth={2.2} className="text-gray-700" />
              </button>

              {/* Divider - mx tetap untuk efek lonjong */}
              <div className="w-[1px] h-3.5 bg-gray-200/80 mx-1" />

              {/* Tombol Favorit */}
              <button
                onClick={() => toggleFavorite(product.id)}
                className="p-1.5 rounded-full hover:bg-gray-50 transition-all active:scale-90"
                aria-label={isFavorite(product.id) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
              >
                <Heart
                  size={17}
                  strokeWidth={2.2}
                  className={isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-700"}
                />
              </button>
            </div>

            <div className="relative">
              {(() => {
                const rawImages = product.images || (product as any).image;
                let productImages: string[] = [];

                if (Array.isArray(rawImages)) {
                  productImages = rawImages.flatMap(img => {
                    if (!img || typeof img !== 'string') return [];
                    if (img.startsWith('data:image') || img.startsWith('http')) {
                      return [img];
                    }
                    return img.split('|').filter(i => i?.trim()?.startsWith('data:image') || i?.trim()?.startsWith('http'));
                  });
                } else if (typeof rawImages === 'string') {
                  productImages = rawImages
                    .split('|')
                    .map(img => img?.trim())
                    .filter(img => img && (img.startsWith('data:image') || img.startsWith('http')));
                }

                const slideCount = productImages.length > 0 ? productImages.length : 1;
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
                            src={productImages[i]}
                            className="w-full aspect-[3/2] sm:aspect-video"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Dots Indicator */}
                    {slideCount > 1 && (
                      <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center items-center">
                        <div className="flex gap-1 px-2 py-1 bg-black/5 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
                          {slides.map((i) => (
                            <div
                              key={i}
                              className={`transition-all duration-500 rounded-full ${currentIndex === i
                                ? "w-5 h-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                : "w-1 h-1 bg-white/40"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white p-3 mb-1">
            <div className="flex justify-between items-start gap-3 mb-2">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900 leading-snug flex-1">
                {product.name}
              </h1>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame size={14} strokeWidth={1.5} />
                  <span className="font-semibold text-gray-800 text-sm">{Math.max(product.sold, product.sold || 0)}+</span>
                </div>
                <p className="text-[10px] text-gray-500">Terjual</p>
              </div>
            </div>

            <div className="flex items-end justify-between mb-2.5">
              <div>
                {product.originalPrice && (
                  <p className="text-sm text-gray-500 line-through mb-1">
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

            <div className="border-t border-gray-200" />

            <div className="pt-3">
              <h2 className="text-sm font-bold text-gray-800 tracking-tight mb-2">Deskripsi Produk</h2>
              <div className="relative overflow-hidden">
                {/* Container Teks dengan animasi max-height yang smooth */}
                <div
                  className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${!isDescriptionExpanded ? 'max-h-[64px]' : 'max-h-[2000px]'
                    }`}
                >
                  <p
                    ref={descriptionRef}
                    className="text-[13px] text-gray-500 leading-relaxed whitespace-pre-wrap relative"
                  >
                    {product.description}
                  </p>
                  {/* Spacer agar tombol 'Lihat lebih sedikit' tidak menutupi baris terakhir teks */}
                  <div className={`transition-all duration-300 ${isDescriptionExpanded ? 'h-8' : 'h-0'}`} />
                </div>

                {needsTruncation && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className={`absolute bottom-0 transition-all duration-500 ease-in-out flex items-center h-7 z-10
                      ${!isDescriptionExpanded
                        ? 'left-full -translate-x-full pl-24 pr-0 read-more-fade'
                        : 'left-0 translate-x-0'
                      }`}
                  >
                    {!isDescriptionExpanded ? (
                      <span className="flex items-center text-emerald-700 font-bold text-[12px] whitespace-nowrap pr-0.5">
                        <span className="text-gray-500 font-normal mr-1.5">...</span>
                        <span className="hover:underline">Lihat selengkapnya</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-emerald-700 font-bold text-[12px] whitespace-nowrap">
                        Lihat lebih sedikit
                        <ChevronDown size={14} className="rotate-180 transition-transform duration-500" />
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Jaminan Palugada */}
          <div className="bg-white px-4 py-3 mb-1">
            <h2 className="font-bold text-gray-800 text-[12px] mb-2.5 tracking-tight">Alasan Pilih Kami</h2>

            <div className="flex items-center justify-between">
              {[
                { icon: <CheckCircle size={13} />, label: "Tersedia", text: "text-emerald-500" },
                { icon: <Zap size={13} />, label: "Fast Respon", text: "text-amber-500" },
                { icon: <Headphones size={13} />, label: "24 Jam", text: "text-blue-500" }
              ].map((item, index) => (
                <Fragment key={index}>
                  <div className="flex items-center gap-1.5 flex-1 justify-center">
                    <div className={item.text}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 tracking-tight whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>

                  {/* Divider Vertikal - Muncul kecuali setelah elemen terakhir */}
                  {index < 2 && (
                    <div className="h-4 w-[1px] bg-gray-200" />
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          {/* PERBAIKAN 2: Review Section dengan inline-flex */}
          <div className="bg-white px-4 py-3 mb-1">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              Ulasan Pembeli ({allReviews.length})
            </h2>

            <div className="bg-gray-50/50 rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-gray-200/60 pr-2.5">
                  <span className="text-3xl font-extrabold text-gray-800 leading-none">{liveRating.toFixed(1)}</span>
                  <div className="flex text-yellow-500 my-1 gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => renderStar(i, liveRating))}
                  </div>
                  <span className={`text-[10px] font-bold text-center leading-tight mt-1 ${getRatingColor(liveRating)}`}>
                    {getRatingLabel(liveRating)}
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map(star => {
                    const pct = distribution.percent[star as keyof typeof distribution.percent];
                    const count = distribution.raw[star as keyof typeof distribution.raw];
                    return (
                      <div key={star} className="flex items-center gap-1.5 group cursor-default">
                        <span className="w-3 text-[10px] font-semibold text-gray-600 text-center tabular-nums">{star}</span>
                        <Star size={8} className="text-gray-400 fill-gray-400 flex-shrink-0" strokeWidth={1.5} />

                        <div className="flex-1 h-2 bg-gray-200/50 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${RATING_COLORS[star]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <span className="text-[9px] text-gray-600 tabular-nums min-w-[20px] text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* DAFTAR ULASAN PEMBELI */}
            <div className="space-y-2.5 px-1">
              {displayedReviews.map((review: Review, index: number) => (
                <div key={review.id} className="py-2.5 border-b border-gray-100 last:border-0">
                  {/* HEADER ULASAN: Profil & Waktu */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar Bulat */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${getAvatarColor(review.name)} opacity-80 flex-shrink-0`}>
                        {review.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        {/* Nama Pembeli + Ikon Verified Sejajar */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-[13px] font-bold text-gray-800 tracking-tight leading-none truncate">
                            {maskName(review.name)}
                          </p>
                          {/* {review.isVerified && (
                            <CheckCircle
                              size={11}
                              strokeWidth={3.5}
                              className="text-emerald-500 flex-shrink-0"
                            />
                          )} */}
                        </div>

                        {/* Rating Bintang di bawah Nama */}
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map(star => renderStar(star, review.rating))}
                        </div>
                      </div>
                    </div>

                    {/* Info Waktu di Pojok Kanan Atas */}
                    <div className="flex items-center gap-1 text-gray-600 flex-shrink-0 mt-0.5">
                      <Clock size={10} strokeWidth={1.5} />
                      <span className="text-[11px] font-medium">
                        <TimeAgo date={review.createdAt} />
                      </span>
                    </div>
                  </div>

                  {/* BODY ULASAN: Komentar & Tombol Like/Dislike */}
                  <div className="pl-[48px] flex items-end justify-between gap-4">
                    {/* Teks Komentar */}
                    <p className="text-[13px] text-gray-600 leading-snug flex-1 break-words min-w-0">
                      {review.comment}
                    </p>

                    {/* Tombol Interaksi (Like/Dislike) */}
                    <div className="flex items-center gap-3 flex-shrink-0 mb-0.5">
                      {/* Button Like */}
                      <button
                        onClick={() => handleVote(review.id, 'like')}
                        className={`flex items-center gap-1.5 transition-all duration-300 ${votedType[review.id] === 'like' ? 'text-emerald-700 scale-110' : 'text-gray-500'
                          }`}
                      >
                        <ThumbsUp
                          size={13}
                          className={`${votedType[review.id] === 'like' ? 'fill-emerald-500/20' : 'fill-none'}`}
                          strokeWidth={votedType[review.id] === 'like' ? 2.5 : 1.8}
                        />
                        <span className={`text-[11px] font-bold ${votedType[review.id] === 'like' ? 'text-emerald-700' : 'text-gray-600'}`}>
                          {review.likes || 0}
                        </span>
                      </button>

                      {/* Button Dislike */}
                      <button
                        onClick={() => handleVote(review.id, 'dislike')}
                        className={`flex items-center gap-1 transition-all duration-300 ${votedType[review.id] === 'dislike' ? 'text-rose-700 scale-110' : 'text-gray-500'
                          }`}
                      >
                        <ThumbsDown
                          size={13}
                          className={`${votedType[review.id] === 'dislike' ? 'fill-rose-500/20' : 'fill-none'}`}
                          strokeWidth={votedType[review.id] === 'dislike' ? 2.5 : 1.5}
                        />
                        <span className={`text-[11px] font-bold ${votedType[review.id] === 'dislike' ? 'text-rose-700' : 'text-gray-600'}`}>
                          {review.dislikes || 0}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayCount < allReviews.length && (
              <button
                onClick={() => setDisplayCount(prev => prev + 5)}
                className="w-full py-2 mt-2 text-primary-dark font-bold text-sm border hover:bg-primary-light border-primary/30 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Lihat ulasan lainnya
                <ChevronDown size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Sticky Bottom CTA - Tombol & Font Tetap, Area Luar Dirampingkan */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 pt-1.5 pb-5 shadow-[0_-6px_20px_rgba(0,0,0,0.04)]">
            <div className="max-w-[500px] mx-auto flex gap-3">
              {/* Tombol Keranjang: py-3.5 dan text-sm tetap sesuai request */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-4 rounded-xl border border-emerald-600/40 text-emerald-700 font-bold hover:bg-emerald-50 transition-all active:scale-[0.96] text-sm whitespace-nowrap"
              >
                + Keranjang
              </button>

              {/* Tombol Pesan Sekarang: py-3.5 dan text-sm tetap sesuai request */}
              <button
                onClick={handleBuyNow}
                className="flex-[2] py-3.5 px-4 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all active:scale-[0.96] shadow-[0_4px_12px_rgba(5,150,105,0.2)] flex items-center justify-center gap-2 text-sm"
              >
                <Send size={18} strokeWidth={2.5} className="rotate-[-10deg]" />
                Pesan Sekarang
              </button>
            </div>
          </div>

          {/* Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
            className={`
          fixed bottom-24 right-6 z-50
          w-11 h-11 rounded-full
          bg-emerald-500 text-white
          shadow-[0_8px_25px_rgba(16,185,129,0.3)]
          flex items-center justify-center
          transition-all duration-500 cubic-bezier(0.34,1.56,0.64,1)
          hover:bg-emerald-600 hover:scale-110
          active:scale-90
          ${showBackToTop
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
              }
        `}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>

          <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

          <CheckoutModal
            open={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
            onConfirm={handleBuyNowConfirm}
            loading={isSubmitting}
          />
        </>
      ) : null}
    </div>
  );
}