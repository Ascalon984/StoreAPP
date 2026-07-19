"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowRight,
  Heart,
  MoreHorizontal,
  ArrowDownAZ,
  ArrowUpZA,
} from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/lib/types";
import { useToastStore } from "@/store/useToastStore";

// ─────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────
function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 pt-12 pb-16 text-center">
      <div className="w-28 h-28 mb-6 rounded-full bg-emerald-600/10 flex items-center justify-center">
        <Heart size={44} strokeWidth={1.5} className="text-emerald-600/50" />
      </div>
      <h2 className="text-[18px] font-extrabold text-gray-800 tracking-tight mb-2">
        Belum ada produk favorit
      </h2>
      <p className="text-[13px] text-gray-500 font-normal leading-relaxed mb-8 max-w-[230px]">
        Tambahkan produk yang kamu suka untuk disimpan di sini
      </p>
      <button
        onClick={onExplore}
        className="flex items-center gap-2 px-7 py-3.5 bg-emerald-600 text-white rounded-full
          text-[13px] font-bold shadow-[0_4px_16px_rgba(16,185,129,0.2)]
          active:scale-[0.96] transition-all duration-200"
      >
        Jelajahi Produk
        <ArrowRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
//  PRODUCT ROW
// ─────────────────────────────────────────
function ProductRow({
  product,
  index,
  onAddToCart,
  onRemoveFromWishlist,
}: {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;
  return (
    <div className="w-full rounded-xl border border-gray-100 bg-white shadow-sm relative overflow-visible">
      {/* IMAGE */}
      <div className="relative aspect-[1/0.9] rounded-t-xl overflow-visible">
        {/* Layer gambar */}
        <div className="absolute inset-0 rounded-t-xl overflow-hidden bg-gray-50">
          <Link
            href={`/product/${product.slug}`}
            className="block w-full h-full"
          >
            <ProductImage
              category={product.category}
              name={product.name}
              variant={index}
              src={product.images?.[0]}
              className="w-full h-full object-contain p-3"
            />
          </Link>

          {/* Overlay */}
          <div
            className={`
              absolute inset-0
              bg-black
              transition-opacity duration-200
              pointer-events-none
              ${menuOpen ? "opacity-15" : "opacity-0"}
            `}
          />

          {discount > 0 && (
            <div className="absolute top-0 left-0 px-2 py-1 rounded-br-xl bg-rose-500 text-[10px] font-bold text-white">
              -{discount}%
            </div>
          )}
        </div>

        {/* Tombol 3-dot */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="absolute left-0 bottom-0 z-30
          w-10 h-5
          bg-white/95 backdrop-blur-sm
          rounded-tr-xl
          border-t border-r border-gray-100
          shadow-sm
          flex items-center justify-center"
        >
          <MoreHorizontal size={17} className="text-gray-600" />
        </button>

        {/* Overlay */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Dropdown */}
        <div
          className={`
            absolute
            left-0
            top-full
            z-50
            min-w-[168px]
            overflow-hidden
            rounded-lg
            border border-gray-100
            bg-white
            shadow-sm

            transition-all
            duration-180
            ease-out

            ${
              menuOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-1 pointer-events-none"
            }
          `}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              onRemoveFromWishlist(product.id);
            }}
            className="w-full px-4 py-1.5 text-left text-[12.5px] text-rose-600 active:bg-rose-50"
          >
            Hapus dari Favorit
          </button>

          <div className="h-px bg-gray-100" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
            className="w-full px-4 py-1.5 text-left text-[12.5px] text-gray-700 active:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative overflow-hidden rounded-b-lg px-3 pt-2.5 pb-2.5">
        <p className="truncate text-[12px] font-medium text-gray-700 mb-1">
          {product.name}
        </p>

        <p className="text-[14px] font-semibold text-gray-700 pr-12">
          {formatRupiah(product.price)}
        </p>

        <button
          onClick={() => onAddToCart(product)}
          className="
            absolute
            -right-5
            -bottom-5
            w-14 h-14
            rounded-full
            bg-emerald-600
            border border-emerald-600
            shadow-md
            flex
            items-start
            justify-start
            pt-3
            pl-3
            text-white
            active:scale-95
            transition-all
            duration-200
          "
        >
          <ShoppingBag
            size={16}
            strokeWidth={2.2}
            className="-translate-x-0.3"
          />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────
function SkeletonContent() {
  return (
    <div className="px-4 pt-5 pb-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          {i !== 0 && <div className="h-px bg-gray-100 my-1" />}
          <div className="flex items-center gap-3 py-3">
            <div className="w-[72px] h-[72px] rounded-xl skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3 rounded skeleton w-3/4" />
              <div className="h-3 rounded skeleton w-1/2" />
              <div className="h-4 rounded skeleton w-1/3" />
            </div>
            <div className="flex flex-col items-end gap-2.5">
              <div className="w-7 h-7 rounded-full skeleton" />
              <div className="w-7 h-7 rounded-full skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FavoriteProduct({
  filterOpen,
}: {
  filterOpen: boolean;
}) {
  const router = useRouter();
  const { items, removeItems } = useWishlistStore();
  const { addItem: addCartItem } = useCartStore();
  const { showToast } = useToastStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (product: Product) => {
    addCartItem(product);
    showToast("Ditambahkan ke keranjang 🛒", "success");
  };

  const handleRemoveFromWishlist = useCallback(
    (id: string) => {
      const product = items.find((p) => p.id === id);
      removeItems([id]);
      if (product) {
        showToast(`"${product.name}" dihapus`);
      }
    },
    [items, removeItems, showToast],
  );

  type FilterType = "all" | "available" | "outOfStock" | "discount";
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortAsc, setSortAsc] = useState(true);

  const getDiscount = (product: Product) =>
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const filteredItems = items.filter((product) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "available") return product.stock > 0;
    if (activeFilter === "outOfStock") return product.stock === 0;
    if (activeFilter === "discount") return getDiscount(product) > 0;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
  );

  return (
    <>
      {filterOpen && (
        <div className="sticky top-12 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`h-7 px-3 rounded-lg border text-[12px] font-medium ${
                    activeFilter === "all"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveFilter("available")}
                  className={`h-7 px-3 rounded-lg border text-[12px] font-medium ${
                    activeFilter === "available"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  Tersedia
                </button>
                <button
                  onClick={() => setActiveFilter("outOfStock")}
                  className={`h-7 px-3 rounded-lg border text-[12px] font-medium ${
                    activeFilter === "outOfStock"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  Habis
                </button>
                <button
                  onClick={() => setActiveFilter("discount")}
                  className={`h-7 px-3 rounded-lg border text-[12px] font-medium ${
                    activeFilter === "discount"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  Diskon
                </button>
              </div>

              <button
                onClick={() => setSortAsc((v) => !v)}
                className="flex items-center gap-1 text-[12px] font-medium text-emerald-700"
              >
                <span>{sortAsc ? "A–Z" : "Z–A"}</span>

                {sortAsc ? (
                  <ArrowDownAZ size={15} strokeWidth={2} />
                ) : (
                  <ArrowUpZA size={15} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`relative w-full z-20 ${
          filterOpen ? "pointer-events-none" : ""
        }`}
      >
        {!mounted ? (
          <SkeletonContent />
        ) : items.length === 0 ? (
          <EmptyState onExplore={() => router.push("/")} />
        ) : sortedItems.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            Tidak ada produk yang cocok dengan filter ini
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-3 pt-3 pb-20">
            {sortedItems.map((product, i) => (
              <ProductRow
                key={product.id}
                product={product}
                index={i}
                onAddToCart={handleAddToCart}
                onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
