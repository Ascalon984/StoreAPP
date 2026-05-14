'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart, ShoppingCart, Trash2,
  Check, ArrowRight, Bookmark,
  ChevronDown, FolderOpen, Folder,
  SquarePen,
} from 'lucide-react';
import ProductImage from '@/components/ProductImage';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { formatRupiah } from '@/lib/utils';
import { Product } from '@/lib/types';

// ─────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────
const CATEGORIES = ['Snack', 'Minuman', 'Kebutuhan', 'Alat Tulis'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<string, { bg: string; accent: string; light: string; dot: string; front: string }> = {
  'Snack': { bg: 'bg-amber-50', accent: 'text-amber-700', light: 'bg-amber-100', dot: 'bg-amber-400', front: 'from-amber-50/80' },
  'Minuman': { bg: 'bg-sky-50', accent: 'text-sky-700', light: 'bg-sky-100', dot: 'bg-sky-400', front: 'from-sky-50/80' },
  'Kebutuhan': { bg: 'bg-violet-50', accent: 'text-violet-700', light: 'bg-violet-100', dot: 'bg-violet-400', front: 'from-violet-50/80' },
  'Alat Tulis': { bg: 'bg-rose-50', accent: 'text-rose-700', light: 'bg-rose-100', dot: 'bg-rose-400', front: 'from-rose-50/80' },
};

// ─────────────────────────────────────────
//  MINI TOAST
// ─────────────────────────────────────────
function MiniToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
      <div className="flex items-center gap-2 bg-gray-900 text-white text-[12px] font-semibold px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap">
        <Check size={12} strokeWidth={3} className="text-emerald-400 flex-shrink-0" />
        {message}
      </div>
    </div>
  );
}

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
//  HORIZONTAL PRODUCT CARD — Improved spacing
// ─────────────────────────────────────────
function HorizontalCard({
  product,
  index,
  isEditMode,
  isSelected,
  onToggleSelect,
  onUnfavorite,
  onAddToCart,
}: {
  product: Product;
  index: number;
  isEditMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onUnfavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div
      onClick={() => isEditMode && onToggleSelect(product.id)}
      className={`
        relative flex items-center gap-3.5 w-full 
        py-3 px-1                          // ← TAMBAH padding vertikal
        transition-all duration-200
        ${isSelected
          ? 'rounded-xl bg-emerald-50/60 ring-1 ring-emerald-500/30 -mx-1 px-2' // ← Extend saat selected
          : ''
        }
        ${isEditMode ? 'cursor-pointer' : 'active:scale-[0.99]'}
      `}
    >
      {/* Divider — full width */}
      {index !== 0 && !isSelected && (
        <div className="absolute -top-[1px] left-0 right-0 h-px bg-gray-100/80" />
      )}

      {/* Checkbox */}
      {isEditMode && (
        <div className={`flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all duration-200 
          ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-400 bg-white'}`}>
          {isSelected && <Check size={9} strokeWidth={2.5} className="text-white" />}
        </div>
      )}

      {/* Image — LEBIH BESAR */}
      <div className="relative flex-shrink-0 w-14 h-14 rounded-xl bg-white overflow-hidden flex items-center justify-center shadow-sm border border-gray-100/80">
        {!isEditMode ? (
          <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center p-1.5">
            <ProductImage
              category={product.category}
              name={product.name}
              variant={index}
              src={product.images?.[0]}
              className="w-full h-full object-contain"
            />
          </Link>
        ) : (
          <ProductImage
            category={product.category}
            name={product.name}
            variant={index}
            src={product.images?.[0]}
            className="w-full h-full object-contain p-1.5"
          />
        )}
        {discount > 0 && (
          <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-br-lg z-10">
            -{discount}%
          </div>
        )}
      </div>

      {/* Info — MORE BREATHING ROOM */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {!isEditMode ? (
          <Link href={`/product/${product.slug}`}>
            <p className="text-[13px] font-bold text-gray-800 truncate leading-tight tracking-tight hover:text-emerald-700 transition-colors">
              {product.name}
            </p>
          </Link>
        ) : (
          <p className="text-[13px] font-bold text-gray-800 truncate leading-tight tracking-tight">
            {product.name}
          </p>
        )}
        <div className="flex items-baseline gap-2 mt-1.5">
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

      {/* Button — MORE SPACED */}
      {!isEditMode && (
        <div className="flex-shrink-0 ml-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 text-white rounded-xl
              text-[11px] font-bold active:scale-[0.96] transition-all hover:bg-emerald-700
              shadow-[0_2px_8px_rgba(6,95,70,0.2)] whitespace-nowrap"
          >
            <ShoppingCart size={12} strokeWidth={2.5} />
            Keranjang
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
//  CATEGORY FOLDER — Arsip 3D Animation
// ─────────────────────────────────────────
function CategoryFolder({
  category,
  products,
  isOpen,
  onToggle,
  isEditMode,
  selectedIds,
  onToggleSelect,
  onUnfavorite,
  onAddToCart,
  onSelectAll,
}: {
  category: string;
  products: Product[];
  isOpen: boolean;
  onToggle: () => void;
  isEditMode: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onUnfavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectAll: (ids: string[]) => void;
}) {
  const selectedInFolder = products.filter(p => selectedIds.includes(p.id)).length;
  const allInFolderSelected = products.length > 0 && selectedInFolder === products.length;

  const getImageStyle = (i: number, total: number) => {
    const spread = 22;
    const baseLeft = 22;
    const yOffset = 3;
    const rotationBase = -5;
    const rotationStep = 5;
    return {
      left: `${baseLeft + i * spread}px`,
      top: `${i * yOffset}px`,
      transform: `rotate(${rotationBase + i * rotationStep}deg)`,
      zIndex: total - i,
    };
  };

  // ═══════════════════════════════════════
  //  3D ANIMATION STYLES
  // ═══════════════════════════════════════

  const imageStackStyle: React.CSSProperties = {
    maxHeight: isOpen ? '0px' : '72px',
    opacity: isOpen ? 0 : 1,
    transformOrigin: 'bottom center',
    transform: isOpen
      ? 'perspective(800px) rotateX(-65deg) translateY(-6px)'
      : 'perspective(800px) rotateX(0deg) translateY(0)',
    transition: 'all 550ms cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    filter: isOpen ? 'brightness(0.7)' : 'brightness(1)',
  };

  const folderContainerStyle: React.CSSProperties = {
    marginTop: isOpen ? '0px' : '-20px',
    transformOrigin: 'top center',
    transform: isOpen
      ? 'perspective(1000px) rotateX(0deg)'
      : 'perspective(1000px) rotateX(-1.5deg)',
    transition: 'all 550ms cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: isOpen ? '80ms' : '0ms',
  };

  const folderBodyStyle: React.CSSProperties = {
    borderRadius: isOpen
      ? '12px 0 12px 12px'
      : '12px 0 12px 12px',
    border: '1px solid #f3f4f6',
    backgroundColor: 'white',
    overflow: 'visible',
    boxShadow: isOpen
      ? '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
      : '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: isOpen ? '150ms' : '0ms',
    position: 'relative', // ← DITAMBAHKAN
  };

  const contentStyle: React.CSSProperties = {
    maxHeight: isOpen ? '2000px' : '0px',
    opacity: isOpen ? 1 : 0,
    transformOrigin: 'top center',
    transform: isOpen
      ? 'perspective(600px) rotateX(0deg) translateY(0)'
      : 'perspective(600px) rotateX(-25deg) translateY(-12px)',
    transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: isOpen ? '200ms' : '0ms',
    overflow: 'hidden',
  };

  const getItemStyle = (index: number): React.CSSProperties => {
    const isFirst = index === 0;
    return {
      opacity: isOpen ? 1 : 0,
      transform: isOpen
        ? 'translateY(0) scale(1) rotateX(0deg)'
        : 'translateY(-28px) scale(0.94) rotateX(-12deg)',
      filter: isOpen
        ? 'blur(0px) brightness(1)'
        : 'blur(2px) brightness(0.85)',
      transformOrigin: 'top center',
      transition: `all ${isFirst ? 520 : 440}ms cubic-bezier(${isFirst ? '0.22, 1.2, 0.36, 1' : '0.22, 1, 0.36, 1'})`,
      transitionDelay: isOpen ? `${300 + index * 75}ms` : '0ms',
    };
  };

  // Style untuk tab jumlah produk
  const tabStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-17.5px',
    right: '-1px',
    zIndex: 30,

    backgroundColor: '#ff8c34ff',

    borderRadius: '14px 0 0 0',
    borderBottom: 'none',

    padding: '2px 12px 3px',

    opacity: isOpen ? 0 : 1,

    transform: isOpen
      ? 'translateY(6px) scale(0.92)'
      : 'translateY(0px) scale(1)',

    pointerEvents: isOpen ? 'none' : 'auto',

    transition: `
    opacity 260ms ease,
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1)
  `,
  };

  return (
    <div className="relative" style={{ perspective: '1200px' }}>

      {/* ═══════════════════════════════════════
          IMAGE STACK — 3D Fold Into Folder
          ═══════════════════════════════════════ */}
      <div style={imageStackStyle}>
        <div className="relative h-[62px]">

          {/* Backing — SAMPAI EDGE, radius cocok dengan body */}
          <div
            className="absolute z-0 top-3 bottom-[-1px]"
            style={{
              left: '0px',
              right: '0px',
              backgroundColor: '#f8f9fa',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02), 0 -2px 6px rgba(0, 0, 0, 0.02)',
              borderTop: '1px solid #e5e7eb',
              borderRadius: '14px 14px 0 0',
            }}
          />

          {/* Preview images dengan stagger animation */}
          <div className="relative z-10 pl-6 pt-1">
            {products.slice(0, 3).map((product, i) => {
              const style = getImageStyle(i, Math.min(products.length, 3));
              return (
                <div
                  key={product.id}
                  className="absolute rounded-[8px] overflow-hidden bg-white"
                  style={{
                    width: '56px',
                    height: '70px',
                    ...style,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.04)',
                    border: '1.5px solid white',
                    transform: isOpen
                      ? `${style.transform} translateY(18px) scale(0.82)`
                      : style.transform,
                    opacity: isOpen ? 0 : 1,
                    transition: `all 450ms cubic-bezier(0.4, 0, 0.2, 1)`,
                    transitionDelay: isOpen ? `${i * 40}ms` : `${(2 - i) * 30}ms`,
                  }}
                >
                  <ProductImage
                    category={product.category}
                    name={product.name}
                    variant={i}
                    src={product.images?.[0]}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* ═══════════════════════════════════════
          FOLDER CONTAINER — Naik & Buka
          ═══════════════════════════════════════ */}
      <div className="relative z-10" style={folderContainerStyle}>
        <div style={folderBodyStyle}>

          {/* ═══════════════════════════════════
              TAB JUMLAH PRODUK — Atas Kanan
              ═══════════════════════════════════ */}
          <div style={tabStyle}>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-black text-white leading-none">
                {products.length}
              </span>
              <span className="text-[11px] font-black text-white leading-none">
                produk
              </span>
            </div>
          </div>

          {/* ── FOLDER BODY (clickable header) ── */}
          <button
            onClick={onToggle}
            className="w-full text-left transition-all duration-200 active:bg-gray-50 bg-white relative"
            style={{
              borderRadius: isOpen
                ? '16px 16px 0 0'
                : '16px',
            }}
          >
            <div className="flex items-center gap-3 px-4 py-4 relative z-[1]">
              {/* Edit mode checkbox */}
              {isEditMode && (
                <div
                  onClick={(e) => { e.stopPropagation(); onSelectAll(products.map(p => p.id)); }}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 
                    ${allInFolderSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}
                >
                  {allInFolderSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                </div>
              )}

              {/* Folder icon */}
              <div
                className="w-8 h-8 flex items-center justify-center flex-shrink-0"
              >
                {isOpen ? (
                  <FolderOpen
                    size={21}
                    className="text-gray-700"
                    strokeWidth={1.9}
                  />
                ) : (
                  <Folder
                    size={21}
                    className="text-gray-500"
                    strokeWidth={1.9}
                  />
                )}
              </div>

              {/* Category info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-600 tracking-tight leading-none">
                  {category}
                </p>
              </div>

              {/* Chevron dengan rotasi 3D */}
              <div style={{ perspective: '200px' }}>
                <ChevronDown
                  size={20}
                  strokeWidth={2.7}
                  className="text-gray-500 flex-shrink-0"
                  style={{
                    transform: isOpen
                      ? 'rotateX(180deg)'
                      : 'rotateX(0deg)',
                    transformOrigin: 'center center',
                    transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </button>

          {/* ── CONTENT — 3D Reveal dari atas ── */}
          <div style={contentStyle}>
            <div className="mx-4 h-px bg-gray-100" />
            <div className="px-3 py-2 space-y-0.5">  {/* ← Kurangi px dari 4→3, py dari 3→2 */}
              {products.map((product, i) => (
                <div key={product.id} style={getItemStyle(i)}>
                  <HorizontalCard
                    product={product}
                    index={i}
                    isEditMode={isEditMode}
                    isSelected={selectedIds.includes(product.id)}
                    onToggleSelect={onToggleSelect}
                    onUnfavorite={onUnfavorite}
                    onAddToCart={onAddToCart}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  DELETE BOTTOM SHEET
// ─────────────────────────────────────────
function DeleteSheet({ count, onConfirm, onCancel }: { count: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full bg-white rounded-t-3xl shadow-2xl p-5 pb-10">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <Trash2 size={22} className="text-red-500" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[17px] font-black text-gray-900 tracking-tight">Hapus {count} Produk?</h3>
            <p className="text-[12px] text-gray-500 font-medium mt-1.5 leading-relaxed">
              Produk akan dihapus permanen dari daftar favorit kamu
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] font-bold text-gray-700 active:scale-[0.97] transition-all">
            Batal
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3.5 rounded-xl bg-red-500 text-white text-[13px] font-bold active:scale-[0.97] transition-all shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:bg-red-600">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────
function SkeletonFolder() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="h-[52px]" />
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-11 h-11 rounded-xl skeleton" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 rounded skeleton w-24" />
          <div className="h-2.5 rounded skeleton w-16" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────
export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItem, removeItems } = useWishlistStore();
  const { addItem } = useCartStore();

  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Group items by category ──
  const grouped = CATEGORIES.reduce<Record<string, Product[]>>((acc, cat) => {
    const inCat = items.filter(p => p.category === cat);
    if (inCat.length > 0) acc[cat] = inCat;
    return acc;
  }, {});

  const knownCategories = new Set(CATEGORIES as readonly string[]);
  const others = items.filter(p => !knownCategories.has(p.category));
  if (others.length > 0) grouped['Lainnya'] = others;

  const activeCategories = Object.keys(grouped);

  // Auto-open if only 1 category
  useEffect(() => {
    if (activeCategories.length === 1) {
      setOpenFolders(new Set([activeCategories[0]]));
    }
  }, [activeCategories.length]);

  // ── Toast ──
  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500);
  }, []);

  // ── Handlers ──
  const handleToggleFolder = (cat: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const handleUnfavorite = (product: Product) => {
    removeItem(product.id);
    const short = product.name.length > 22 ? product.name.slice(0, 22) + '…' : product.name;
    showToast(`${short} dihapus dari favorit`);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    showToast('Ditambahkan ke keranjang 🛒');
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleFolderSelectAll = (ids: string[]) => {
    const allSelected = ids.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleConfirmDelete = () => {
    const count = selectedIds.length;
    removeItems(selectedIds);
    setShowDeleteSheet(false);
    setSelectedIds([]);
    setIsEditMode(false);
    showToast(`${count} produk dihapus dari favorit`);
  };

  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F7F5] pb-10">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-50 bg-[#0B6B52] border-b border-white/10 shadow-md">
        <div className="flex items-center justify-between px-4 h-12">

          {/* Left */}
          {isEditMode ? (
            <button
              onClick={() => {
                setIsEditMode(false);
                setSelectedIds([]);
              }}
              className="text-[13px] font-bold text-white/85 active:opacity-60"
            >
              Batal
            </button>
          ) : (
            <div className="text-[15px] font-black text-white tracking-[-0.02em] leading-none">
              Favorit Saya
            </div>
          )}

          {/* Right */}
          {!isEditMode ? (
            <button
              onClick={() => {
                setIsEditMode(true);
                setSelectedIds([]);
              }}
              disabled={items.length === 0}
              className={`text-[13px] font-bold ${items.length > 0
                ? 'text-white/90 active:opacity-60'
                : 'text-white/30 cursor-not-allowed'
                }`}
            >
              Edit
            </button>
          ) : (
            <button
              onClick={() =>
                selectedIds.length > 0 && setShowDeleteSheet(true)
              }
              disabled={selectedIds.length === 0}
              className={`
    flex items-center justify-center
    transition-opacity
    ${selectedIds.length > 0
                  ? 'text-red-400'
                  : 'text-white/80 cursor-not-allowed'
                }
  `}
            >
              <Trash2
                size={18}
                strokeWidth={1.9}
              />
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-3 pt-4 space-y-3">
        {!mounted ? (
          <>
            <SkeletonFolder />
            <SkeletonFolder />
            <SkeletonFolder />
          </>
        ) : items.length === 0 ? (
          <EmptyState onExplore={() => router.push('/')} />
        ) : (
          activeCategories.map(cat => (
            <CategoryFolder
              key={cat}
              category={cat}
              products={grouped[cat]}
              isOpen={openFolders.has(cat)}
              onToggle={() => handleToggleFolder(cat)}
              isEditMode={isEditMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onUnfavorite={handleUnfavorite}
              onAddToCart={handleAddToCart}
              onSelectAll={handleFolderSelectAll}
            />
          ))
        )}

        {/* Footer */}
        {!isEditMode && items.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4 mb-2">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <Bookmark size={10} strokeWidth={2} className="text-gray-700" />
              <span className="text-[10px] font-semibold text-gray-700 tracking-wide">{items.length} produk tersimpan</span>
              <Bookmark size={10} strokeWidth={2} className="text-gray-700" />
            </div>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
        )}
      </div>

      {/* ── DELETE SHEET ── */}
      {showDeleteSheet && (
        <DeleteSheet
          count={selectedIds.length}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteSheet(false)}
        />
      )}

      {/* ── TOAST ── */}
      <MiniToast message={toastMsg} visible={toastVisible} />

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
      `}</style>
    </div>
  );
}