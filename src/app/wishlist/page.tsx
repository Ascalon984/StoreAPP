"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Heart, Store } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/lib/types";
import { useToastStore } from "@/store/useToastStore";

// ─────────────────────────────────────────
//  EMPTY STATE (on green bg)
// ─────────────────────────────────────────
function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 pt-12 pb-16 text-center">
      <div className="w-28 h-28 mb-6 rounded-full bg-white/10 flex items-center justify-center">
        <Heart size={44} strokeWidth={1.5} className="text-white/50" />
      </div>
      <h2 className="text-[18px] font-extrabold text-white tracking-tight mb-2">
        Belum ada produk favorit
      </h2>
      <p className="text-[13px] text-white/45 font-normal leading-relaxed mb-8 max-w-[230px]">
        Tambahkan produk yang kamu suka untuk disimpan di sini
      </p>
      <button
        onClick={onExplore}
        className="flex items-center gap-2 px-7 py-3.5 bg-white text-emerald-700 rounded-full
          text-[13px] font-bold shadow-[0_4px_16px_rgba(0,0,0,0.12)]
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
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  return (
    <div className="w-full overflow-hidden rounded-t-2xl rounded-b-lg border border-gray-100 bg-white shadow-sm">
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[1/0.9] bg-gray-50 block"
      >
        <ProductImage
          category={product.category}
          name={product.name}
          variant={index}
          src={product.images?.[0]}
          className="w-full h-full object-contain p-3"
        />

        {/* Glass name */}
        <div
          className="absolute inset-x-0 bottom-0
      bg-black/20 backdrop-blur-sm
      px-3 py-1.5"
        >
          <p className="truncate text-[10.5px] font-medium text-white tracking-[0.002em]">
            {product.name}
          </p>
        </div>

        {discount > 0 && (
          <div className="absolute top-0 left-0 px-2 py-1 rounded-br-xl bg-rose-500 text-[10px] font-bold text-white">
            -{discount}%
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between px-4 h-10 border-t">
        <button
          onClick={() => onRemoveFromWishlist(product.id)}
          className="text-rose-500 active:scale-90 transition-transform"
        >
          <Heart size={18} fill="currentColor" />
        </button>

        <button
          onClick={() => onAddToCart(product)}
          className="text-emerald-700 active:scale-90 transition-transform"
        >
          <ShoppingBag size={18} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  SKELETON (inside bottom sheet)
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

// ─────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────
export default function WishlistPage() {
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

  const [activeTab, setActiveTab] = useState<"produk" | "toko">("produk");

  // ── Render ──
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] relative overflow-hidden">
      {/* ── HEADER BACKGROUND LAYER ── */}
      <div
        className="absolute inset-x-0 top-0 h-[120px] bg-emerald-700"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex flex-col items-center justify-center h-12 translate-y-[15px]">
          <h1 className="text-[17px] font-bold text-white">Favorit Saya</h1>

          <p className="mt-0.5 text-[11px] text-white/65">
            Produk dan toko yang kamu simpan
          </p>
        </div>
      </div>

      {/* ── CONTENT LAYER ── */}
      <div className="relative z-10 flex-1 mt-[85px] rounded-t-[24px] bg-[#F7F8FA] shadow-[0_-4px_18px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* TAB HEADER */}
        <div className="flex h-12 border-b border-gray-100 bg-[#F7F8FA]">
          <button
            onClick={() => setActiveTab("produk")}
            className="relative flex-1 h-12 flex items-center justify-center text-[13px] font-bold text-gray-700 tracking-[0.002em]"
          >
            Produk Favorit
            {activeTab === "produk" && (
              <span
                className="absolute bottom-2 left-1/2 -translate-x-1/2 
      w-28 h-[3px] rounded-full bg-emerald-600"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("toko")}
            className="relative flex-1 h-12 flex items-center justify-center text-[13px] font-bold text-gray-700 tracking-[0.002em]"
          >
            Toko di Ikuti
            {activeTab === "toko" && (
              <span
                className="absolute bottom-2 left-1/2 -translate-x-1/2 
      w-28 h-[3px] rounded-full bg-emerald-600"
              />
            )}
          </button>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto">
          {activeTab === "produk" ? (
            !mounted ? (
              <SkeletonContent />
            ) : items.length === 0 ? (
              <EmptyState onExplore={() => router.push("/")} />
            ) : (
              <div className="grid grid-cols-2 gap-4 p-4 pb-20">
                {items.map((product, i) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    index={i}
                    onAddToCart={handleAddToCart}
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">
              Belum ada toko favorit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
