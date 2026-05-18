'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Check,
  ArrowRight,
  Bookmark,
  Heart,
  Package,
} from 'lucide-react';
import ProductImage from '@/components/ProductImage';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { formatRupiah } from '@/lib/utils';
import { Product } from '@/lib/types';
import { useToastStore } from '@/store/useToastStore';

const ALL_CHIP = 'Semua';
// ─────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────
function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 pt-20 pb-8 text-center">
      <div className="w-32 h-32 mb-6">
        <svg viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="72" cy="72" r="64" fill="#F0FDF4" />
          <circle cx="72" cy="72" r="52" stroke="#D1FAE5" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="30" cy="44" r="5" fill="#A7F3D0" opacity="0.7" />
          <circle cx="114" cy="44" r="5" fill="#A7F3D0" opacity="0.7" />
          <path d="M72 100 C72 100 38 76 38 52 C38 40 47.5 31 59 31 C65 31 70 34 72 38.5 C74 34 79 31 85 31 C96.5 31 106 40 106 52 C106 76 72 100 72 100 Z"
            fill="#ECFDF5" stroke="#065F46" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M72 92 C72 92 46 74 46 56 C46 47 52.5 40 61 40 C65.5 40 69 42.5 72 46 C75 42.5 78.5 40 83 40 C91.5 40 98 47 98 56 C98 74 72 92 72 92 Z"
            fill="#BBF7D0" opacity="0.45" />
        </svg>
      </div>
      <h2 className="text-[18px] font-black text-gray-900 tracking-tight mb-2">Belum ada produk favorit</h2>
      <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-8 max-w-[230px]">
        Tambahkan produk yang kamu suka untuk disimpan di sini
      </p>
      <button
        onClick={onExplore}
        className="flex items-center gap-2 px-7 py-3.5 bg-emerald-700 text-white rounded-full
          text-[13px] font-bold shadow-[0_4px_14px_rgba(6,95,70,0.3)]
          active:scale-[0.96] transition-all duration-200 hover:bg-emerald-600"
      >
        Jelajahi Produk
        <ArrowRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
//  EMPTY FILTER STATE
// ─────────────────────────────────────────
function EmptyFilter({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
        <Bookmark size={20} strokeWidth={1.8} className="text-gray-400" />
      </div>
      <p className="text-[13px] font-bold text-gray-700 mb-1">
        Tidak ada produk di "{category}"
      </p>
      <p className="text-[12px] text-gray-400 font-medium">
        Coba pilih kategori lain
      </p>
    </div>
  );
}





// ─────────────────────────────────────────
//  CHIP FILTER
// ─────────────────────────────────────────
function ChipFilter({
  chips,
  active,
  onSelect,
  tabRefs,
  indicatorStyle,
}: {
  chips: string[];
  active: string;
  onSelect: (chip: string) => void;
  tabRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  indicatorStyle: { width: number; left: number };
}) {
  return (
    <div className="sticky top-12 z-40 bg-white">
      <div className="relative flex gap-6 px-6 overflow-x-auto hide-scrollbar border-b border-gray-100" style={{ height: 40 }}>
        <span
          className="absolute bottom-0 left-0 h-[3.5px] rounded-full bg-[#D89B2B] transition-all duration-300 ease-out"
          style={{
            width: indicatorStyle.width,
            transform: `translateX(${indicatorStyle.left}px)`,
          }}
        />
        {chips.map((chip) => (
          <button
            key={chip}
            ref={(el) => { tabRefs.current[chip] = el; }}
            onClick={() => onSelect(chip)}
            className={`
              relative flex-shrink-0 flex items-center h-full px-1
              text-[13px] font-bold transition-colors duration-200 active:scale-95
              ${chip === active ? 'text-[#D89B2B]' : 'text-gray-500 hover:text-gray-600'}
            `}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────
function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-5 pb-2">
      <span className="text-[12px] font-bold text-gray-500 tracking-widest leading-none">
        {title}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[11px] font-bold text-gray-400">{count}</span>
    </div>
  );
}

// ─────────────────────────────────────────
//  PRODUCT ROW — dengan tombol Hapus Favorit individual
// ─────────────────────────────────────────
function ProductRow({
  product,
  index,
  isFirst,
  onAddToCart,
  onRemoveFromWishlist,
}: {
  product: Product;
  index: number;
  isFirst: boolean;
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (id: string) => void;
}) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <>
      {!isFirst && <div className="h-px bg-gray-100 mx-4" />}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white active:bg-gray-50/80 transition-colors duration-150">
        <div className="relative flex-shrink-0 w-[52px] h-[52px] rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
          <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center p-1.5">
            <ProductImage
              category={product.category}
              name={product.name}
              variant={index}
              src={product.images?.[0]}
              className="w-full h-full object-contain"
            />
          </Link>
          {discount > 0 && (
            <div className="absolute top-0 left-0 px-1 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-br-lg z-10">
              -{discount}%
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link href={`/product/${product.slug}`}>
            <p className="text-[13px] font-bold text-gray-800 truncate leading-tight tracking-tight hover:text-emerald-700 transition-colors">
              {product.name}
            </p>
          </Link>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-[14px] font-black text-emerald-700 tracking-tight leading-none">
              {formatRupiah(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-gray-400 line-through font-medium leading-none">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromWishlist(product.id);
            }}
            className="
      w-8 h-8
      flex items-center justify-center
      text-red-400
      active:scale-90
      transition-all
    "
            aria-label="Hapus dari favorit"
          >
            <Heart size={17} strokeWidth={2} fill="currentColor" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="
      h-7 px-3
      flex items-center gap-1.5
      bg-emerald-600
      text-white
      rounded-xl
      text-[10px]
      font-bold
      active:scale-95
      transition-all
      shadow-sm
    "
            aria-label="Tambah ke keranjang"
          >
            <ShoppingCart size={12} strokeWidth={2.4} />
            Keranjang
          </button>

        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────
//  PRODUCT GROUP
// ─────────────────────────────────────────
function ProductGroup({
  title,
  products,
  showHeader,
  onAddToCart,
  onRemoveFromWishlist,
}: {
  title: string;
  products: Product[];
  showHeader: boolean;
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (id: string) => void;
}) {
  return (
    <div className="mb-5">
      {showHeader && <SectionHeader title={title} count={products.length} />}
      <div className="mx-3 bg-white rounded-2xl ring-1 ring-slate-900/[0.04] shadow-layer-xs overflow-hidden">
        {products.map((product, i) => (
          <ProductRow
            key={product.id}
            product={product}
            index={i}
            isFirst={i === 0}
            onAddToCart={onAddToCart}
            onRemoveFromWishlist={onRemoveFromWishlist}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  SKELETON — disesuaikan dengan 2 tombol aksi
// ─────────────────────────────────────────
function SkeletonList() {
  return (
    <div className="space-y-6 pt-4">
      {[0, 1].map((group) => (
        <div key={group} className="mx-3 bg-white rounded-2xl ring-1 ring-slate-900/[0.04] shadow-layer-xs overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              {i !== 0 && <div className="h-px bg-gray-100 mx-4" />}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-[52px] h-[52px] rounded-xl skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded skeleton w-36" />
                  <div className="h-3.5 rounded skeleton w-24" />
                </div>
                <div className="flex gap-1.5">
                  <div className="w-9 h-9 rounded-xl skeleton flex-shrink-0" />
                  <div className="w-9 h-9 rounded-xl skeleton flex-shrink-0" />
                </div>
              </div>
            </div>
          ))}
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
  const [activeChip, setActiveChip] = useState<string>(ALL_CHIP);
  const [mounted, setMounted] = useState(false);

  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const dynamicCategories = Array.from(new Set(items.map(p => p.category))).sort();
  const chips = [ALL_CHIP, ...dynamicCategories];

  const grouped = dynamicCategories.reduce<Record<string, Product[]>>((acc, cat) => {
    const inCat = items.filter(p => p.category === cat);
    if (inCat.length > 0) acc[cat] = inCat;
    return acc;
  }, {});

  const filteredItems = activeChip === ALL_CHIP
    ? items
    : items.filter(p => p.category === activeChip);

  // Otomatis kembali ke tab "Semua" jika kategori yang aktif kosong (habis dihapus)
  useEffect(() => {
    if (activeChip !== ALL_CHIP && !dynamicCategories.includes(activeChip)) {
      setActiveChip(ALL_CHIP);
    }
  }, [items, dynamicCategories, activeChip]);

  // Update underline indicator
  useEffect(() => {
    if (!mounted) return;
    const el = tabRefs.current[activeChip];
    if (el) setIndicatorStyle({ width: el.offsetWidth, left: el.offsetLeft });
  }, [activeChip, mounted, chips.length]);

  const handleAddToCart = (product: Product) => {
    addCartItem(product);
    showToast('Ditambahkan ke keranjang 🛒', 'success');
  };

  // TODO: Implement individual item removal from wishlist
  const handleRemoveFromWishlist = useCallback((id: string) => {
    const product = items.find(p => p.id === id);
    removeItems([id]);
    if (product) {
      showToast(`"${product.name}" dihapus`);
    }
  }, [items, removeItems, showToast]);

  const handleChipSelect = (chip: string) => {
    setActiveChip(chip);
  };

  const renderContent = () => {
    if (items.length === 0) return <EmptyState onExplore={() => router.push('/')} />; // Global empty state

    if (activeChip !== ALL_CHIP) {
      return filteredItems.length === 0 ? null : (
        <ProductGroup
          title={activeChip}
          products={filteredItems}
          showHeader={false}
          onAddToCart={handleAddToCart}
          onRemoveFromWishlist={handleRemoveFromWishlist}
        />
        // TODO: Add EmptyFilter for specific category if filteredItems.length === 0
      );
    }

    return (
      <div>
        {Object.entries(grouped).map(([cat, products]) => (
          <ProductGroup
            key={cat}
            title={cat}
            products={products}
            showHeader={true}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7F5] pb-10">

      {/* STICKY HEADER — Sekarang lebih bersih tanpa tombol Edit */}
      <div className="sticky top-0 z-50 bg-[#048750] shadow-md">
        {/* Menggunakan justify-center agar teks berada tepat di tengah horizontal */}
        <div className="flex items-center justify-center px-4 h-12">
          <span
            style={{ wordSpacing: '4px' }}
            className="text-[15px] font-black text-white tracking-normal"
          >
            Favorit Saya
          </span>
        </div>
      </div>

      {/* CHIP FILTER */}
      {mounted && items.length > 0 && (
        <ChipFilter
          chips={chips}
          active={activeChip}
          onSelect={handleChipSelect}
          tabRefs={tabRefs}
          indicatorStyle={indicatorStyle}
        />
      )}

      {/* CONTENT */}
      <div className="pt-2 pb-6">
        {!mounted ? (
          <SkeletonList />
        ) : filteredItems.length === 0 && activeChip !== ALL_CHIP ? (
          <EmptyFilter category={activeChip} />
        ) : renderContent()}

        {mounted && items.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-6 px-4">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <Bookmark size={10} strokeWidth={2} className="text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-500 tracking-wide">
                {items.length} produk tersimpan
              </span>
              <Bookmark size={10} strokeWidth={2} className="text-gray-400" />
            </div>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}
      </div>

      <style jsx>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}