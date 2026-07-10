"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Heart,
  Minus,
  Plus,
  MapPin,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { MOCK_SELLERS } from "@/lib/mockSellers";
import { CartItem } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import ProductImage from "@/components/ProductImage";
import { getCartImage } from "./utils";

// ──────────────────────────────────────────────
// Helper: group cart items by sellerId
// ──────────────────────────────────────────────
function groupBySeller(items: CartItem[]) {
  const map = new Map<string, CartItem[]>();
  for (const item of items) {
    const sid = item.product.sellerId ?? "unknown";
    if (!map.has(sid)) map.set(sid, []);
    map.get(sid)!.push(item);
  }
  return map;
}

// ──────────────────────────────────────────────
// Sub-component: Checkbox
// ──────────────────────────────────────────────
function Checkbox({
  checked,
  onToggle,
  ariaLabel,
}: {
  checked: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={ariaLabel}
      className={`w-[19px] h-[19px] rounded-[5px] flex items-center justify-center border transition-colors active:scale-90 ${
        checked
          ? "bg-emerald-500 border-emerald-500"
          : "bg-white border-gray-300"
      }`}
    >
      {checked && <Check size={12} strokeWidth={3} className="text-white" />}
    </button>
  );
}

// ──────────────────────────────────────────────
// Sub-component: SellerCard
// ──────────────────────────────────────────────
interface SellerCardProps {
  sellerId: string;
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  wishlistIds: Set<string>;
  onToggleWishlist: (productId: string) => void;
  isEditing: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (productId: string) => void;
  onToggleSelectAll: (productIds: string[]) => void;
}

function SellerCard({
  sellerId,
  items,
  onUpdateQty,
  wishlistIds,
  onToggleWishlist,
  isEditing,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: SellerCardProps) {
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  const sellerName = seller?.name ?? "Toko";
  const location = seller
    ? `${seller.kabupaten}, ${seller.provinsi}`
    : "Lokasi tidak diketahui";

  // seller avatar initials
  const initials = sellerName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const productIds = items.map((i) => i.product.id);
  const allSelected =
    productIds.length > 0 && productIds.every((id) => selectedIds.has(id));

  return (
    <div className="bg-white rounded-lg shadow-layer-xs border border-gray-100/60 overflow-hidden">
      {/* ── Seller header row ── */}
      <div className="flex items-center justify-between px-2 pt-2 pb-2 border-b border-gray-50">
        <div className="flex items-start gap-2.5 min-w-0 translate-x-[5px]">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-emerald-700">
            {initials}
          </div>

          {/* Name + location */}
          <div className="min-w-0 pt-[1px]">
            <p className="text-[12px] font-medium text-gray-700 leading-tight truncate tracking-[0.005em]">
              {sellerName}
            </p>

            <p className="mt-[2px] text-[10px] text-gray-500 leading-tight truncate">
              {location}
            </p>
          </div>
        </div>

        {/* Wishlist heart (per seller / toko) */}
        <div className="flex items-center gap-1">
          {!isEditing && (
            <button
              onClick={() => onToggleWishlist(sellerId)}
              className="p-1.5 rounded-full active:scale-90"
              aria-label="Wishlist"
            >
              <Heart
                size={19}
                strokeWidth={2}
                className={
                  wishlistIds.has(sellerId)
                    ? "fill-rose-500 text-rose-500"
                    : "text-gray-400"
                }
              />
            </button>
          )}

          {isEditing && (
            <div className="flex items-center gap-1.5 pr-1">
              <Checkbox
                checked={allSelected}
                onToggle={() => onToggleSelectAll(productIds)}
                ariaLabel="Pilih semua produk toko ini"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Product rows ── */}
      <div className="divide-y divide-gray-50/80">
        {items.map((item) => {
          const product = item.product;
          const qty = item.quantity || 1;
          const price = product.price ?? 0;
          const originalPrice = product.originalPrice;
          const hasDiscount = originalPrice && originalPrice > price;
          const cartImg = getCartImage(product);
          const isSelected = selectedIds.has(product.id);

          return (
            <div key={product.id} className="px-3.5 py-2.5">
              <div className="flex gap-3 items-start">
                {/* Checkbox (edit mode) */}
                {isEditing && (
                  <div className="pt-[4px] flex-shrink-0">
                    <Checkbox
                      checked={isSelected}
                      onToggle={() => onToggleSelect(product.id)}
                      ariaLabel="Pilih produk"
                    />
                  </div>
                )}

                {/* Product image */}
                <ProductImage
                  category={product.category}
                  name={product.name}
                  src={cartImg}
                  className="w-[70px] h-[70px] rounded-lg flex-shrink-0 border border-gray-100/50 object-cover bg-gray-50"
                />

                {/* Right content */}
                <div className="flex-1 min-w-0 flex flex-col self-stretch">
                  {/* Product name */}
                  <p className="text-[11.5px] font-medium text-gray-600 leading-snug line-clamp-2 tracking-[0.006em]">
                    {product.name}
                  </p>

                  {/* Price */}
                  <div className="flex items-end gap-2 mt-1.5">
                    <p className="text-[12.5px] font-semibold text-gray-600 leading-none tracking-[0.006em]">
                      {formatRupiah(price)}
                    </p>

                    {hasDiscount && (
                      <p className="text-[10px] text-gray-400 line-through leading-none">
                        {formatRupiah(originalPrice!)}
                      </p>
                    )}
                  </div>

                  {/* Variant */}
                  {product.variant && (
                    <p className="mt-0.5 text-[10px] text-gray-500 truncate">
                      {product.variant}
                    </p>
                  )}
                  <p className="translate-y-[22px] text-[10px] text-gray-400">
                    Jumlah:{" "}
                    <span className="font-medium text-gray-500">{qty}</span>
                  </p>

                  {/* Actions */}
                  <div className="relative flex justify-end -translate-y-[5px]">
                    <div className="flex items-center overflow-hidden rounded-md border border-gray-200 shadow-[0_1px_1px_rgba(0,0,0,0.02)]">
                      <button
                        disabled={qty <= 1}
                        onClick={() => onUpdateQty(product.id, qty - 1)}
                        className="flex h-7 w-7 items-center justify-center bg-gray-50 disabled:opacity-35 disabled:cursor-not-allowed"
                      >
                        <Minus
                          size={11}
                          strokeWidth={2.5}
                          className="text-gray-500"
                        />
                      </button>

                      <span className="flex h-7 w-8 items-center justify-center border-x border-gray-200 bg-white text-[12px] font-medium text-gray-700">
                        {qty}
                      </span>

                      <button
                        onClick={() => onUpdateQty(product.id, qty + 1)}
                        className="flex h-7 w-7 items-center justify-center bg-gray-50"
                      >
                        <Plus
                          size={11}
                          strokeWidth={2.5}
                          className="text-gray-500"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Subtotal per seller ── */}
      <div className="flex items-center justify-between border-t border-dashed border-gray-200 bg-gray-50/40 px-3.5 py-2.5">
        <span className="text-[12px] font-medium text-gray-600">Sub total</span>
        <span className="text-[13.5px] font-semibold text-gray-700 tracking-[0.005em]">
          {formatRupiah(
            items.reduce(
              (s, i) => s + (i.product.price ?? 0) * (i.quantity || 1),
              0,
            ),
          )}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────
export default function MultiCheckout() {
  const router = useRouter();
  const { items, updateQuantity, removeItem } = useCartStore();
  const { showToast } = useToastStore();
  const navStore = useNavigationStore();

  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggleWishlist = (id: string) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelect = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const handleToggleSelectAll = (productIds: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = productIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        productIds.forEach((id) => next.delete(id));
      } else {
        productIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBack = useCallback(() => {
    navStore.setCheckoutSource(null);
    router.back();
  }, [navStore, router]);

  const handleHeaderAction = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (selectedIds.size > 0) {
      selectedIds.forEach((id) => removeItem(id));
      setSelectedIds(new Set());
      showToast("Produk terpilih dihapus dari keranjang");
      return;
    }

    setIsEditing(false);
  };

  const headerLabel = !isEditing
    ? "Edit"
    : selectedIds.size > 0
      ? "Hapus"
      : "Selesai";

  // Grouped by seller
  const grouped = groupBySeller(items);
  const grandTotal = items.reduce(
    (s, i) => s + (i.product.price ?? 0) * (i.quantity || 1),
    0,
  );

  const handleProceedCheckout = () => {
    if (items.length === 0) {
      showToast("Keranjang kamu masih kosong");
      return;
    }
    navStore.setCheckoutSource("cart-confirmed");
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#f3f5f4] flex flex-col">
      {/* ── HEADER (same style as empty state) ── */}
      <div
        className="sticky top-0 z-50 bg-[#048750] shadow-layer-xs"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between h-[48px] px-4">
          <button
            onClick={handleBack}
            aria-label="Kembali"
            className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
          >
            <ChevronLeft size={23} strokeWidth={2.7} className="text-white" />
            <h1 className="text-[14px] font-bold text-white -mt-[1px]">
              Keranjang
            </h1>
          </button>

          <button
            onClick={handleHeaderAction}
            className={`text-[12px] font-semibold ${
              headerLabel === "Hapus" ? "text-rose-200" : "text-white/95"
            }`}
          >
            {headerLabel}
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-3 py-3 space-y-3 pb-32">
          {Array.from(grouped.entries()).map(([sellerId, sellerItems]) => (
            <SellerCard
              key={sellerId}
              sellerId={sellerId}
              items={sellerItems}
              onUpdateQty={updateQuantity}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              isEditing={isEditing}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
            />
          ))}
        </div>
      </div>

      {/* ── STICKY FOOTER ── */}
      <div
        className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-2.5 pb-3"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 leading-none -translate-y-[3px]">
                Total Pembayaran
              </p>
              <p className="text-[18px] font-bold text-gray-700 tracking-tight leading-tight mt-1">
                {formatRupiah(grandTotal)}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleProceedCheckout}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white font-semibold text-[13px] px-8 py-3 rounded-lg transition-all duration-150 tracking-[0.005em]"
            >
              Lanjut Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
