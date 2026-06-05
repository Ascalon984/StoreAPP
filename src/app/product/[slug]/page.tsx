"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Share2,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronDown,
  Send,
  Search,
} from "lucide-react";

import { useCartStore } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useReviewStore } from "@/store/useReviewStore";
import { useToastStore } from "@/store/useToastStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { Product, Review } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import LoadingScreen from "@/components/LoadingScreen";
import ProductGallery from "./components/ProductGallery";
import ProductReviews from "./components/ProductReviews";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const router = useRouter();

  const { addItem, setBuyNowItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { getReviewsForProduct, fetchReviews, refreshVersion } =
    useReviewStore();
  const { showToast } = useToastStore();

  const [product, setProduct] = useState<
    (Product & { reviews?: Review[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const loaderStartTimeRef = useRef<number | null>(null);

  // State untuk Varian Produk
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isVariantOpen, setIsVariantOpen] = useState<boolean>(true);

  // UI State
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Scroll to top hanya saat slug berubah (pindah produk), bukan saat refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    fetchReviews();
    loaderStartTimeRef.current = Date.now();
    const MIN_DISPLAY_TIME = 300;

    fetch(`/api/public/products/${slug}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        const elapsed = Date.now() - (loaderStartTimeRef.current || Date.now());

        if (elapsed < MIN_DISPLAY_TIME) {
          setTimeout(() => {
            setProduct(data);
            if (data.variants?.length > 0)
              setSelectedVariant(data.variants[0].id);
            setLoading(false);
          }, MIN_DISPLAY_TIME - elapsed);
        } else {
          setProduct(data);
          if (data.variants?.length > 0)
            setSelectedVariant(data.variants[0].id);
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
      fetchReviews(product.id);
    }
  }, [product?.id, fetchReviews]);

  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollY = window.scrollY;
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight > 0 && scrollY >= scrollableHeight * 0.5) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      if (imageContainerRef.current) {
        const imageBottom =
          imageContainerRef.current.getBoundingClientRect().bottom;
        setShowHeader(imageBottom < 56);
      }
    };

    window.addEventListener("scroll", checkScrollPosition, { passive: true });
    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const { setIsReturningFromDetail } = useNavigationStore();

  const handleBack = () => {
    setIsReturningFromDetail(true);
    window.history.back();
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
        showToast("Link berhasil disalin");
      }
    } catch (error) {
      console.log("Error sharing", error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    const name =
      product.name.length > 35 ? product.name.slice(0, 35) + "…" : product.name;
    showToast(`${name} ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    const productToAdd = { ...product };
    if (selectedVariant && productToAdd.variants) {
      const variantData = productToAdd.variants.find(
        (v: any) => v.id === selectedVariant,
      );
      if (variantData) {
        productToAdd.variant = variantData.name;
      }
    }

    setBuyNowItem({ product: productToAdd, quantity: 1 });
    const { setCheckoutSource } = useNavigationStore.getState();
    setCheckoutSource("product");
    router.push("/checkout");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Computed values ────────────────────────────────────────────────────────

  const localReviews = product ? getReviewsForProduct(product.id) : [];
  const allReviews = [...localReviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const specificReviews = product
    ? localReviews.filter((r) => r.productId === product.id)
    : [];
  const serverCount = product?.reviewCount || 0;
  const serverRating = product?.rating || 0;
  const liveReviewCount = Math.max(serverCount, specificReviews.length);
  const liveRating =
    liveReviewCount > 0
      ? Number(
          (
            specificReviews.reduce((acc, r) => acc + r.rating, 0) /
            specificReviews.length
          ).toFixed(1),
        )
      : serverRating;

  const needsTruncation = (product?.description?.length || 0) > 300;

  // Ekstraksi gambar
  const rawImages = product?.images || (product as any)?.image;
  let productImages: string[] = [];

  if (product) {
    if (Array.isArray(rawImages)) {
      productImages = rawImages.flatMap((img) => {
        if (!img || typeof img !== "string") return [];
        if (img.startsWith("data:image") || img.startsWith("http"))
          return [img];
        return img
          .split("|")
          .filter(
            (i) =>
              i?.trim()?.startsWith("data:image") ||
              i?.trim()?.startsWith("http"),
          );
      });
    } else if (typeof rawImages === "string") {
      productImages = rawImages
        .split("|")
        .map((img) => img?.trim())
        .filter(
          (img) =>
            img && (img.startsWith("data:image") || img.startsWith("http")),
        );
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-50 pb-24 min-h-screen">
      <LoadingScreen isLoading={loading} />

      {!loading && !product ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
          <div className="flex flex-col items-center text-center">
            <img
              src="/illustrations/Search Not Found.svg"
              alt="Produk tidak ditemukan"
              className="w-56 h-56 object-contain -translate-x-1"
            />

            <h2 className="mt-2 text-lg font-semibold text-gray-800">
              Produk tidak ditemukan
            </h2>

            <p className="mt-1 text-sm text-gray-500 max-w-[280px] leading-relaxed">
              Produk mungkin sudah dihapus atau tautan yang Anda buka tidak
              tersedia.
            </p>

            <button
              onClick={handleBack}
              className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : product ? (
        <>
          {/* Scroll-aware Header */}
          <div
            className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300 ease-in-out ${
              showHeader
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-full pointer-events-none"
            }`}
          >
            <div className="max-w-[500px] mx-auto flex items-center gap-2 px-3 h-14">
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-all active:scale-90 flex-shrink-0"
                aria-label="Kembali"
              >
                <ChevronLeft
                  size={22}
                  strokeWidth={2.5}
                  className="text-gray-900"
                />
              </button>
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 h-9">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-400 truncate">
                  Cari di Atheris...
                </span>
              </div>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 transition-all active:scale-90 flex-shrink-0"
                aria-label="Bagikan"
              >
                <Share2 size={18} strokeWidth={2.2} className="text-gray-700" />
              </button>
              <button
                onClick={() => product && toggleFavorite(product.id)}
                className="p-2 rounded-full hover:bg-gray-100 transition-all active:scale-90 flex-shrink-0"
                aria-label="Favorit"
              >
                <Heart
                  size={18}
                  strokeWidth={2.2}
                  className={
                    product && isFavorite(product.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-700"
                  }
                />
              </button>
            </div>
          </div>

          {/* Gallery + Info Block */}
          <div className="relative bg-white">
            <ProductGallery
              product={product}
              productImages={productImages}
              isFavorite={isFavorite(product.id)}
              toggleFavorite={toggleFavorite}
              handleBack={handleBack}
              handleShare={handleShare}
              ref={imageContainerRef}
            />

            {/* Info Section */}
            <div className="px-3 pt-2 pb-1.5">
              <div className="flex justify-between items-start gap-3 mb-2">
                <h1 className="text-lg md:text-xl font-semibold text-gray-900 leading-snug flex-1">
                  {product.name}
                </h1>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame size={14} strokeWidth={1.5} />
                    <span className="font-semibold text-gray-800 text-sm">
                      {Math.max(product.sold, product.sold || 0)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">Terjual</p>
                </div>
              </div>

              <div className="flex items-end justify-between mb-1.5">
                <div>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-500 line-through mb-1">
                      {formatRupiah(product.originalPrice)}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-emerald-700 tracking-tight">
                    {formatRupiah(product.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Sisa Stok</p>
                  <p className="font-semibold text-gray-800">{product.stock}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Varian Produk */}
          {(product as any).variants?.length > 0 && (
            <div className="bg-white px-4 py-2.5 mt-1">
              <button
                onClick={() => setIsVariantOpen(!isVariantOpen)}
                className="w-full flex items-center justify-between py-1 group"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-800 tracking-tight">
                    Variasi Produk
                  </h2>
                  {selectedVariant && !isVariantOpen && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-white px-2 py-0.5 rounded-md">
                      {
                        (product as any).variants.find(
                          (v: any) => v.id === selectedVariant,
                        )?.name
                      }
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={18}
                  strokeWidth={2}
                  className={`text-gray-400 transition-transform duration-300 ${
                    isVariantOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isVariantOpen ? "200px" : "0px",
                  opacity: isVariantOpen ? 1 : 0,
                }}
              >
                <div className="flex flex-wrap gap-2 pt-3 pb-1">
                  {(product as any).variants.map((variant: any) => {
                    const isSelected = selectedVariant === variant.id;
                    const isOutOfStock = variant.stock === 0;

                    return (
                      <button
                        key={variant.id}
                        onClick={() =>
                          !isOutOfStock && setSelectedVariant(variant.id)
                        }
                        disabled={isOutOfStock}
                        className={`
                          px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-200
                          ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                              : "border-gray-300 text-gray-700 bg-white hover:border-gray-300"
                          }
                          ${
                            isOutOfStock
                              ? "opacity-40 cursor-not-allowed line-through border-gray-100 bg-gray-50 text-gray-400"
                              : "active:scale-95"
                          }
                        `}
                      >
                        {variant.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Deskripsi */}
          <div className="bg-white px-4 py-3 mt-1">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight mb-2">
              Deskripsi
            </h2>
            <div className="relative overflow-hidden">
              <div
                className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                  !isDescriptionExpanded ? "max-h-[64px]" : "max-h-[2000px]"
                }`}
              >
                <p
                  ref={descriptionRef}
                  className="text-[13px] text-gray-500 leading-relaxed whitespace-pre-wrap relative"
                >
                  {product.description}
                </p>
                <div
                  className={`transition-all duration-300 ${
                    isDescriptionExpanded ? "h-8" : "h-0"
                  }`}
                />
              </div>
              {needsTruncation && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className={`absolute bottom-0 transition-all duration-500 ease-in-out flex items-center h-7 z-10 ${
                    !isDescriptionExpanded
                      ? "left-full -translate-x-full pl-24 pr-0 read-more-fade"
                      : "left-0 translate-x-0"
                  }`}
                >
                  {!isDescriptionExpanded ? (
                    <span className="flex items-center text-emerald-700 font-bold text-[12px] whitespace-nowrap pr-0.5">
                      <span className="text-gray-500 font-normal mr-1.5">
                        ...
                      </span>
                      <span className="hover:underline">
                        Lihat selengkapnya
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-emerald-700 font-bold text-[12px] whitespace-nowrap">
                      Lihat lebih sedikit
                      <ChevronDown
                        size={14}
                        className="rotate-180 transition-transform duration-500"
                      />
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Hubungi Penjual */}
          <div className="bg-white px-4 py-2.5 mt-1 flex items-center justify-between">
            <p className="text-[12px] text-gray-500 font-medium">
              Ada pertanyaan?
            </p>
            <button
              onClick={() =>
                router.push(`/chat?source=product&productSlug=${product.slug}`)
              }
              className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 hover:text-emerald-800 active:scale-95 transition-all"
            >
              <MessageCircle size={13} strokeWidth={2.2} />
              Hubungi Penjual
            </button>
          </div>

          {/* Review Section */}
          <ProductReviews allReviews={allReviews} liveRating={liveRating} />

          {/* Sticky Bottom CTA */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 pt-1.5 pb-5 shadow-[0_-6px_20px_rgba(0,0,0,0.04)]">
            <div className="max-w-[500px] mx-auto flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-4 rounded-xl border border-emerald-600/40 text-emerald-700 font-bold hover:bg-emerald-50 transition-all active:scale-[0.96] text-sm whitespace-nowrap"
              >
                + Keranjang
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-[2] py-3.5 px-4 rounded-xl bg-[#048750] text-white font-bold hover:bg-emerald-800 transition-all active:scale-[0.96] shadow-[0_4px_12px_rgba(5,150,105,0.2)] flex items-center justify-center gap-2 text-sm"
              >
                <Send size={18} strokeWidth={2.5} className="rotate-[-10deg]" />
                Pesan Sekarang
              </button>
            </div>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
            className={`fixed bottom-24 right-6 z-50 w-11 h-11 rounded-full bg-emerald-500 text-white shadow-[0_8px_25px_rgba(16,185,129,0.3)] flex items-center justify-center transition-all duration-500 hover:bg-emerald-600 hover:scale-110 active:scale-90 ${
              showBackToTop
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-10 scale-50 pointer-events-none"
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>

          <style jsx>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </>
      ) : null}
    </div>
  );
}
