"use client";

import { useState, useRef, useEffect } from "react";
import { useReviewStore } from "@/store/useReviewStore";
import { useLastSeenStore } from "@/store/useLastSeenStore";
import { Product, Review } from "@/lib/types";
import LoadingScreen from "@/components/LoadingScreen";
import ProductDetailContent from "./components/ProductDetailContent";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { getReviewsForProduct, fetchReviews, refreshVersion } =
    useReviewStore();

  const [product, setProduct] = useState<
    (Product & { reviews?: Review[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const loaderStartTimeRef = useRef<number | null>(null);

  // Scroll to top saat slug berubah (pindah produk)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch product data
  useEffect(() => {
    fetchReviews();
    loaderStartTimeRef.current = Date.now();
    const MIN_DISPLAY_TIME = 300;

    fetch(`/api/public/products/${slug}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        const elapsed = Date.now() - (loaderStartTimeRef.current || Date.now());
        if (elapsed < MIN_DISPLAY_TIME) {
          setTimeout(() => {
            setProduct(data);
            useLastSeenStore.getState().addLastSeen(data);
            setLoading(false);
          }, MIN_DISPLAY_TIME - elapsed);
        } else {
          setProduct(data);
          useLastSeenStore.getState().addLastSeen(data);
          setLoading(false);
        }
      })
      .catch(() => {
        const elapsed = Date.now() - (loaderStartTimeRef.current || Date.now());
        if (elapsed < MIN_DISPLAY_TIME) {
          setTimeout(() => setLoading(false), MIN_DISPLAY_TIME - elapsed);
        } else {
          setLoading(false);
        }
      });
  }, [slug, refreshVersion]);

  // Fetch reviews setelah product loaded
  useEffect(() => {
    if (product?.id) fetchReviews(product.id);
  }, [product?.id, fetchReviews]);

  // ── Computed values ──────────────────────────────────────────────────────

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
    specificReviews.length > 0
      ? Number(
          (
            specificReviews.reduce((acc, r) => acc + r.rating, 0) /
            specificReviews.length
          ).toFixed(1),
        )
      : serverRating;

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

  // ── Render ───────────────────────────────────────────────────────────────

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
              onClick={() => window.history.back()}
              className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : product ? (
        <ProductDetailContent
          product={product}
          allReviews={allReviews}
          liveRating={liveRating}
          productImages={productImages}
          sellerId={product.sellerId}
        />
      ) : null}
    </div>
  );
}
