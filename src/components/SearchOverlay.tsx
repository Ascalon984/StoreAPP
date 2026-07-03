"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import ProductImage from "./ProductImage";
import { useSearchStore } from "@/store/useSearchStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SearchOverlay() {
  const {
    query,
    isOpen,
    recentSearches,
    setQuery,
    closeSearch,
    setRecentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const pathname = usePathname();
  const MIN_SEARCH_LENGTH = 2;

  const pendingCloseRef = useRef(false);

  useEffect(() => {
    if (pendingCloseRef.current) {
      closeSearch();
      pendingCloseRef.current = false;
    }
  }, [pathname, closeSearch]);

  useEffect(() => {
    if (isOpen && products.length === 0) {
      fetch(`/api/public/products?t=${Date.now()}`, {
        cache: "no-store",
      })
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);

          // Ambil 6 produk pertama sebagai popular/suggested
          setPopularProducts(data.slice(0, 6));
        });
    }
  }, [isOpen, products.length]);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");

    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, [setRecentSearches]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Lock body scroll saat overlay terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const normalizedQuery = debouncedQuery.trim().toLowerCase();

  const suggestions =
    normalizedQuery.length >= MIN_SEARCH_LENGTH
      ? products
          .filter((p) => {
            const name = p.name.toLowerCase();

            return (
              name.startsWith(normalizedQuery) ||
              name
                .split(" ")
                .some((word: string) => word.startsWith(normalizedQuery))
            );
          })
          .sort((a, b) => {
            const getScore = (name: string) => {
              const lower = name.toLowerCase();

              if (lower.startsWith(normalizedQuery)) return 3;

              if (
                lower
                  .split(" ")
                  .some((word: string) => word.startsWith(normalizedQuery))
              ) {
                return 2;
              }
              return 0;
            };

            return getScore(b.name) - getScore(a.name);
          })
          .slice(0, 6)
      : [];

  const handleSelect = (productName: string) => {
    addRecentSearch(productName);
    // close setelah route berubah
    pendingCloseRef.current = true;
  };
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      addRecentSearch(query.trim());

      closeSearch();
    }
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;

    const regex = new RegExp(
      `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );

    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={i} className="text-emerald-700 font-semibold">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  if (!isOpen) return null;

  const handleScrollContainer = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white animate-fade-in">
      <div className="max-w-container mx-auto px-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-3 py-3 border-b border-gray-100"
        >
          <Search
            size={20}
            strokeWidth={1.5}
            className="text-gray-500 flex-shrink-0"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk..."
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Tutup pencarian"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} strokeWidth={1.5} className="text-gray-500" />
          </button>
        </form>

        <div
          ref={scrollContainerRef}
          className="pt-4 pb-20 overflow-y-auto hide-scrollbar max-h-[calc(100vh-60px)] touch-action-pan-x"
          onScroll={handleScrollContainer}
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
        >
          {suggestions.length > 0 && (
            <div className="space-y-1">
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => handleSelect(product.name)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:shadow-layer-xs transition-all duration-200"
                >
                  <span className="text-sm flex-1">
                    {highlightMatch(product.name, debouncedQuery)}
                  </span>
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="text-gray-500"
                  />
                </Link>
              ))}
            </div>
          )}

          {normalizedQuery.length < MIN_SEARCH_LENGTH &&
            recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Pencarian Terakhir
                  </span>

                  <button
                    onClick={clearRecentSearches}
                    className="text-[11px] font-semibold text-rose-500"
                  >
                    Hapus
                  </button>
                </div>

                <div className="space-y-1">
                  {recentSearches.slice(0, 3).map((term, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(term)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:shadow-layer-xs transition-all duration-200 text-left"
                    >
                      <Clock
                        size={16}
                        strokeWidth={1.5}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          {normalizedQuery.length < MIN_SEARCH_LENGTH &&
            popularProducts.length > 0 && (
              <div
                className={`${
                  recentSearches.length > 0
                    ? "mt-5 pt-4 border-t border-gray-100"
                    : "mt-1"
                }`}
              >
                <span className="text-[12px] font-semibold text-gray-600 uppercase tracking-wider block mb-3 -mt-2">
                  Lagi Banyak Dicari
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {popularProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => handleSelect(product.name)}
                      className="flex flex-col gap-1 rounded-[11px] bg-white border border-gray-100 p-2 group active:scale-[0.98] transition-all duration-200"
                    >
                      <div className="aspect-square rounded-[11px] overflow-hidden bg-gray-100 relative">
                        <ProductImage
                          category={product.category}
                          name={product.name}
                          variant={0}
                          src={product.images?.[0] || product.image}
                          className="absolute inset-0 w-full h-full object-contain"
                          style={{} as React.CSSProperties}
                        />
                      </div>

                      {/* TITLE */}
                      <div className="h-[2.2rem] overflow-hidden">
                        <p className="text-[11px] leading-[1.1rem] text-gray-700 font-medium line-clamp-2">
                          {product.name}
                        </p>
                      </div>

                      {/* PRICE */}
                      <p className="text-[13px] font-semibold text-gray-700 tracking-tight">
                        Rp {product.price?.toLocaleString("id-ID")}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          {normalizedQuery.length >= MIN_SEARCH_LENGTH &&
            suggestions.length === 0 && (
              <div
                className="
      flex flex-col items-center justify-center
      px-5
      py-14
      text-center
    "
              >
                <img
                  src="/illustrations/Search Not Found.svg"
                  alt="Produk tidak ditemukan"
                  className="
        w-56 h-56
        object-contain
        -translate-x-1
      "
                />

                <div className="-mt-2">
                  <h3 className="text-[16px] font-extrabold text-gray-800 leading-tight">
                    Produk tidak ditemukan
                  </h3>

                  <p className="mt-2 text-[13px] leading-snug text-gray-400 font-normal max-w-[250px]">
                    Kami belum menemukan hasil untuk
                    <span className="font-semibold text-gray-600">
                      {" "}
                      "{debouncedQuery}"
                    </span>
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
