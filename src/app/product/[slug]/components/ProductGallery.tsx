"use client";

import { useState, useRef, forwardRef } from "react";
import { ChevronLeft, Share2, Heart } from "lucide-react";
import ProductImage from "@/components/ProductImage";

interface ProductGalleryProps {
  product: any;
  productImages: string[];
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  handleBack: () => void;
  handleShare: () => void;
}

const ProductGallery = forwardRef<HTMLDivElement, ProductGalleryProps>(
  (
    {
      product,
      productImages,
      isFavorite,
      toggleFavorite,
      handleBack,
      handleShare,
    },
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const itemWidth = scrollContainerRef.current.clientWidth;
        const newIndex = itemWidth > 0 ? Math.round(scrollLeft / itemWidth) : 0;
        setCurrentIndex(newIndex);
      }
    };

    return (
      <>
        <div className="pt-0 pb-0">
          <button
            onClick={handleBack}
            className="absolute top-3 left-3 z-20 flex items-center justify-center w-[34px] h-[34px] rounded-full bg-white/65 backdrop-blur-md border border-gray-200/40 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:bg-white/80 transition-all duration-300 active:scale-90"
            aria-label="Kembali"
          >
            <ChevronLeft
              size={22}
              strokeWidth={2.5}
              className="text-gray-900"
            />
          </button>
          <div className="absolute top-3 right-3 z-20 flex items-center bg-white/40 backdrop-blur-lg border border-white/40 rounded-full px-1 h-[32px]">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-gray-50 transition-all active:scale-90"
              aria-label="Bagikan"
            >
              <Share2 size={17} strokeWidth={2.2} className="text-gray-700" />
            </button>
            <div className="w-px h-3.5 bg-black/30 mx-1" />
            <button
              onClick={() => toggleFavorite(product.id)}
              className="p-1.5 rounded-full hover:bg-white-20 transition-all active:scale-90"
              aria-label="Favorit"
            >
              <Heart
                size={17}
                strokeWidth={2.2}
                className={
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
                }
              />
            </button>
          </div>

          <div ref={ref}>
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              onClick={() => setLightboxOpen(true)}
              className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth cursor-zoom-in"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {productImages.length > 0 ? (
                productImages.map((src, i) => (
                  <div key={i} className="flex-shrink-0 w-full snap-start">
                    <ProductImage
                      category={product.category}
                      name={product.name}
                      variant={i}
                      src={src}
                      className="w-full aspect-[10/7] sm:aspect-video"
                    />
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 w-full snap-start">
                  <ProductImage
                    category={product.category}
                    name={product.name}
                    variant={0}
                    className="w-full aspect-[10/7] sm:aspect-video"
                  />
                </div>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center items-center">
                <div className="flex gap-1 px-2 py-1 bg-black/5 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
                  {productImages.map((_, i) => (
                    <div
                      key={i}
                      className={`transition-all duration-500 rounded-full ${
                        currentIndex === i
                          ? "w-5 h-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                          : "w-1 h-1 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox */}
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center cursor-zoom-out
            transition-[opacity,backdrop-filter] duration-300 ease-out
            ${lightboxOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={productImages[currentIndex] || ""}
            alt={`${product.name} - Preview`}
            className={`max-w-full max-h-full object-contain shadow-2xl
              transition-[opacity,transform] duration-300 ease-out
              ${lightboxOpen ? "opacity-100 scale-100" : "opacity-0 scale-[0.92]"}`}
            style={{ touchAction: "pinch-zoom" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </>
    );
  },
);

ProductGallery.displayName = "ProductGallery";
export default ProductGallery;
