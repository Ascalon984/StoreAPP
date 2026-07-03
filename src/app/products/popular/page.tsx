"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

function CardSkeleton({ isTall }: { isTall?: boolean } = {}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div
        className={`w-full ${isTall ? "aspect-[4/5]" : "aspect-[3/2]"} bg-gray-100 animate-pulse`}
      />
      <div className="p-3 pt-0 flex flex-col flex-1 gap-1.5">
        <div className="mt-2.5 min-h-[2.4rem] flex flex-col justify-center gap-1.5">
          <div className="h-3 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-100 rounded-md animate-pulse" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <div className="h-4 w-24 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-3 w-10 bg-gray-100 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100/80">
          <div className="h-2.5 w-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-2.5 w-10 bg-gray-100 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function PopularProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/public/products")
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d) ? d : [];
        // Sort by most sold
        arr.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        setProducts(arr);
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faf8]">
      {/* ── Sticky Header ── */}
      <div
        className="sticky top-0 z-50 bg-white transition-shadow duration-300"
        style={{
          boxShadow: isScrolled
            ? "0 2px 10px rgba(0,0,0,0.06)"
            : "0 1px 0 rgba(0,0,0,0.06)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 text-gray-700 active:scale-90 transition-all duration-150 flex-shrink-0"
            aria-label="Kembali"
          >
            <ChevronLeft size={23} strokeWidth={2.5} />
          </button>

          <div className="flex-1 min-w-0 -ml-1">
            <h1 className="text-[15px] font-bold text-gray-800 tracking-tight capitalize truncate">
              Produk Terlaris
            </h1>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="px-2 pt-3 pb-28">
        {isLoading ? (
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={`left-${i}`} isTall={i === 1} />
              ))}
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={`right-${i}`} />
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh] px-6 text-center">
            <h4 className="mt-3 text-gray-800 font-bold text-sm">
              Belum Ada Produk
            </h4>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            {/* Kolom Kiri */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {products
                .filter((_, i) => i % 2 === 0)
                .map((product, idx) => {
                  const globalIndex = idx * 2;
                  const isTall = globalIndex === 2;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={globalIndex}
                      isTall={isTall}
                    />
                  );
                })}
            </div>

            {/* Kolom Kanan */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {products
                .filter((_, i) => i % 2 === 1)
                .map((product, idx) => {
                  const globalIndex = idx * 2 + 1;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={globalIndex}
                      isTall={false}
                    />
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
