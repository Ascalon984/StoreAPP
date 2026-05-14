'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw, ShoppingBag, ArrowRight, Package, CheckCircle, XCircle,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import ProductImage from '@/components/ProductImage';

// ── Types ──
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

type OrderItem = {
  productId: string;
  name: string;
  category: string;
  image: string | null;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  orderId: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  customerName: string;
  phone: string;
  address: string;
};

type FilterTab = 'all' | 'processing' | 'completed' | 'cancelled';

// ── Mock data ──
const MOCK_ORDERS: Order[] = [

  // ── Hari Ini ──
  {
    id: '1',
    orderId: 'ORD-2026-001',
    createdAt: '2026-05-11T10:30:00Z',
    status: 'completed',
    items: [
      { productId: 'p1', name: 'Chitato Beef Barbeque 68g', category: 'snack', image: null, price: 12000, quantity: 2 },
      { productId: 'p2', name: 'Aqua 600ml', category: 'minuman', image: null, price: 4000, quantity: 1 },
    ],
    total: 28000,
    paymentMethod: 'COD',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Telang Indah, Kamal',
  },

  {
    id: '2',
    orderId: 'ORD-2026-002',
    createdAt: '2026-05-11T08:10:00Z',
    status: 'processing',
    items: [
      { productId: 'p3', name: 'Mie Sedaap Korean Spicy', category: 'makanan', image: null, price: 4000, quantity: 3 },
      { productId: 'p4', name: 'Teh Pucuk Harum 350ml', category: 'minuman', image: null, price: 5000, quantity: 2 },
    ],
    total: 22000,
    paymentMethod: 'GoPay',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Telang Indah, Kamal',
  },

  // ── 7 Hari Terakhir ──
  {
    id: '3',
    orderId: 'ORD-2026-003',
    createdAt: '2026-05-08T14:15:00Z',
    status: 'processing',
    items: [
      { productId: 'p5', name: 'Indomie Goreng Original', category: 'makanan', image: null, price: 3500, quantity: 5 },
      { productId: 'p6', name: 'Teh Botol Sosro 450ml', category: 'minuman', image: null, price: 6000, quantity: 2 },
      { productId: 'p7', name: 'Permen Kopiko Brown Coffee', category: 'snack', image: null, price: 2000, quantity: 4 },
    ],
    total: 41500,
    paymentMethod: 'OVO',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Telang Indah, Kamal',
  },

  {
    id: '4',
    orderId: 'ORD-2026-004',
    createdAt: '2026-05-05T19:40:00Z',
    status: 'completed',
    items: [
      { productId: 'p8', name: 'SilverQueen Almond 65g', category: 'snack', image: null, price: 18000, quantity: 1 },
      { productId: 'p9', name: 'Coca Cola 390ml', category: 'minuman', image: null, price: 7000, quantity: 2 },
    ],
    total: 32000,
    paymentMethod: 'DANA',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Telang Indah, Kamal',
  },

  {
    id: '5',
    orderId: 'ORD-2026-005',
    createdAt: '2026-05-03T11:00:00Z',
    status: 'cancelled',
    items: [
      { productId: 'p10', name: 'Roti Bakar Coklat Keju', category: 'makanan', image: null, price: 15000, quantity: 1 },
    ],
    total: 15000,
    paymentMethod: 'COD',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Telang Indah, Kamal',
  },

  // ── April 2026 ──
  {
    id: '6',
    orderId: 'ORD-2026-006',
    createdAt: '2026-04-20T16:00:00Z',
    status: 'cancelled',
    items: [
      { productId: 'p11', name: 'Roti Tawar Sari Roti', category: 'makanan', image: null, price: 15000, quantity: 1 },
    ],
    total: 15000,
    paymentMethod: 'DANA',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Telang Indah, Kamal',
  },

  {
    id: '7',
    orderId: 'ORD-2026-007',
    createdAt: '2026-04-11T09:25:00Z',
    status: 'completed',
    items: [
      { productId: 'p12', name: 'Good Day Cappuccino', category: 'minuman', image: null, price: 2500, quantity: 6 },
      { productId: 'p13', name: 'Roma Kelapa', category: 'snack', image: null, price: 9000, quantity: 1 },
    ],
    total: 24000,
    paymentMethod: 'ShopeePay',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Telang Indah, Kamal',
  },

  // ── Maret 2026 ──
  {
    id: '8',
    orderId: 'ORD-2026-008',
    createdAt: '2026-03-15T11:20:00Z',
    status: 'pending',
    items: [
      { productId: 'p14', name: 'Oreo Original 137g', category: 'snack', image: null, price: 14000, quantity: 1 },
      { productId: 'p15', name: 'Susu Ultra Milk 250ml', category: 'minuman', image: null, price: 5500, quantity: 2 },
    ],
    total: 25000,
    paymentMethod: 'BCA VA',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Telang Indah, Kamal',
  },

  {
    id: '9',
    orderId: 'ORD-2026-009',
    createdAt: '2026-03-02T13:50:00Z',
    status: 'completed',
    items: [
      { productId: 'p16', name: 'Qtela Singkong Balado', category: 'snack', image: null, price: 11000, quantity: 2 },
      { productId: 'p17', name: 'Le Minerale 600ml', category: 'minuman', image: null, price: 4000, quantity: 2 },
    ],
    total: 30000,
    paymentMethod: 'COD',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Telang Indah, Kamal',
  },
];

function getOrderGroupLabel(dateStr: string): string {
  const now = new Date(); // Asumsikan hari ini untuk perbandingan
  const date = new Date(dateStr);

  // Normalisasi waktu ke jam 00:00 untuk menghitung selisih hari dengan akurat
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const orderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari Ini';
  if (diffDays > 0 && diffDays <= 7) return '7 Hari Terakhir';

  // Format otomatis menjadi "NamaBulan Tahun" (contoh: Juni 2026)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// ── Helpers ──
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ── Status config ──
const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu',
    className: 'text-gray-400',
  },
  processing: {
    label: 'Diproses',
    className: 'text-gray-500',
  },
  completed: {
    label: 'Selesai',
    className: 'text-gray-800',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'text-gray-300',
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'processing', label: 'Diproses' },
  { key: 'completed', label: 'Selesai' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

// ── Carousel Product Preview ──
function ProductCarousel({ items }: { items: OrderItem[] }) {
  const [active, setActive] = useState(0);
  const totalSlides = items.length + 1;
  const touchStartX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActive(p => Math.min(p + 1, totalSlides - 1));
      else setActive(p => Math.max(p - 1, 0));
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="select-none"
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >

          {/* ── Slide 0 — Overview ── */}
          <div className="w-full flex-shrink-0 flex items-center gap-3 px-4 py-3">

            {/* Product Stack + Indicator */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="flex items-center">
                {items.slice(0, 3).map((item, i) => (
                  <div
                    key={item.productId}
                    className="w-12 h-12 rounded-xl border-2 border-white shadow-sm
                    overflow-hidden bg-gray-50 flex-shrink-0"
                    style={{
                      marginLeft: i === 0 ? 0 : -14,
                      zIndex: 3 - i,
                    }}
                  >
                    <ProductImage
                      category={item.category}
                      name={item.name}
                      src={item.image ?? undefined}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {items.length > 3 && (
                  <div
                    className="w-12 h-12 rounded-xl border-2 border-white shadow-sm
                    bg-gray-100 flex items-center justify-center
                    flex-shrink-0 -ml-3.5"
                    style={{ zIndex: 0 }}
                  >
                    <span className="text-[10px] font-black text-gray-500">
                      +{items.length - 3}
                    </span>
                  </div>
                )}
              </div>

              {/* Indicator */}
              {totalSlides > 1 && (
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(i);
                      }}
                      className={`rounded-full transition-all duration-200
                      ${i === active
                          ? 'w-3 h-1 bg-gray-400'
                          : 'w-1 h-1 bg-gray-200'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[11px] font-semibold text-gray-700
                leading-[1.25] line-clamp-2 break-words"
              >
                {items.length === 1
                  ? items[0].name
                  : `${items[0].name
                    .split(' ')
                    .slice(0, 4)
                    .join(' ')} & ${items.length - 1} lainnya`}
              </p>

              <p
                className={`text-[10px] text-gray-400 font-medium leading-none ${items[0].name.length > 28 ? 'mt-0.5' : 'mt-1'
                  }`}
              >
                {items.length} produk
              </p>
            </div>
          </div>

          {/* ── Slide 1..N — Detail per produk ── */}
          {items.map((item, idx) => (
            <div
              key={item.productId}
              className="w-full flex-shrink-0 flex items-center gap-3 px-4 py-3"
            >

              {/* Product Image + Indicator */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                  <ProductImage
                    category={item.category}
                    name={item.name}
                    src={item.image ?? undefined}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Indicator */}
                {totalSlides > 1 && (
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActive(i);
                        }}
                        className={`rounded-full transition-all duration-200
                        ${i === active
                            ? 'w-3 h-1 bg-gray-400'
                            : 'w-1 h-1 bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] font-semibold text-gray-800
                  leading-[1.25] line-clamp-2 break-words"
                >
                  {item.name}
                </p>

                <p
                  className={`text-[10px] text-gray-400 font-medium leading-none ${item.name.length > 28 ? 'mt-0.5' : 'mt-1'
                    }`}
                >
                  {item.quantity}× · {formatRupiah(item.price)}
                </p>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="text-[12px] font-black text-gray-900">
                  {formatRupiah(item.price * item.quantity)}
                </p>

                <p className="text-[9px] text-gray-400 mt-0.5">
                  {idx + 1}/{items.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Order Card ──
function OrderCard({ order, activeFilter }: { order: Order, activeFilter: string }) {
  const router = useRouter();
  const { label, className } = STATUS_CONFIG[order.status];

  return (
    <div className="bg-white rounded-lg ring-1 ring-slate-900/[0.04] shadow-layer-xs overflow-hidden">

      {/* Header */}
      <div className="px-4 pt-2.5 pb-2 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-600 tracking-tight leading-none">
            #{order.orderId}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {activeFilter === 'all' && (
            <>
              <span
                className={`text-[10px] font-bold leading-none ${className}`}
              >
                {label}
              </span>

              <span className="w-1 h-1 rounded-full bg-gray-300" />
            </>
          )}

          <p className="text-[10px] text-gray-500 font-medium leading-none whitespace-nowrap">
            {formatDateTime(order.createdAt)}
          </p>

        </div>
      </div>

      <div className="border-t border-gray-100/70 mx-4" />

      {/* Carousel */}
      <ProductCarousel items={order.items} />

      <div className="border-t border-gray-100/70 mx-4" />

      {/* Footer */}
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] text-gray-400 font-medium leading-none">
            Total Pembayaran
          </p>

          <p className="text-[13px] font-bold text-gray-700 leading-tight mt-0.5">
            {formatRupiah(order.total)}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">

          {/* ── COMPLETED ── */}
          {order.status === 'completed' && (
            <>
              <button
                className="px-3 py-1 rounded-md
        border border-gray-200
        bg-white
        text-[11px] font-semibold text-gray-600
        hover:border-gray-300 hover:bg-gray-50
        active:scale-95
        transition-all"
              >
                Ulasan
              </button>

              <button
                onClick={() => router.push('/')}
                className="px-3 py-1 rounded-md
        bg-emerald-700
        border border-emerald-700
        text-white text-[11px] font-bold
        hover:bg-emerald-800
        active:scale-95
        transition-all"
              >
                Beli Lagi
              </button>
            </>
          )}

          {/* ── PROCESSING ── */}
          {order.status === 'processing' && (
            <button
              onClick={() => router.push('/chat')}
              className="px-3 py-1 rounded-md
      border border-amber-600
      bg-white
      text-[11px] font-semibold text-amber-600
      hover:border-amber-500 hover:bg-amber-50
      active:scale-95
      transition-all"
            >
              Hubungi Penjual
            </button>
          )}

          {/* ── PENDING ── */}
          {order.status === 'pending' && (
            <>
              <button
                className="text-[11px] font-semibold text-gray-300
        hover:text-gray-500
        transition-colors
        active:scale-95"
              >
                Batalkan
              </button>

              <button
                onClick={() => router.push('/chat')}
                className="px-3 py-1 rounded-md
        border border-amber-600
        bg-white
        text-[11px] font-semibold text-amber-600
        hover:border-amber-500 hover:bg-amber-50
        active:scale-95
        transition-all"
              >
                Hubungi Penjual
              </button>
            </>
          )}

          {/* ── CANCELLED ── */}
          {order.status === 'cancelled' && (
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1 rounded-md
      bg-emerald-700
      border border-emerald-700
      text-white text-[11px] font-bold
      hover:bg-emerald-800
      active:scale-95
      transition-all"
            >
              Beli Lagi
            </button>
          )}

        </div>
      </div>

    </div>
  );
}

// ── Skeleton ──
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg ring-1 ring-slate-900/[0.04] shadow-layer-xs overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex justify-between">
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 bg-gray-100 rounded" />
          <div className="h-2.5 w-40 bg-gray-100 rounded" />
        </div>
        <div className="h-3 w-14 bg-gray-100 rounded" />
      </div>
      <div className="border-t border-gray-100/70 mx-4" />
      <div className="px-4 py-2.5 flex items-center gap-3">
        <div className="flex">
          {[0, 1].map(i => (
            <div key={i} className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0"
              style={{ marginLeft: i === 0 ? 0 : -10 }} />
          ))}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded w-2/5" />
        </div>
      </div>
      <div className="border-t border-gray-100/70 mx-4" />
      <div className="px-4 py-2 flex justify-between items-center">
        <div className="space-y-1">
          <div className="h-2 w-16 bg-gray-100 rounded" />
          <div className="h-3.5 w-20 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

// ── Empty State ──
function EmptyState({ filter }: { filter: FilterTab }) {
  const router = useRouter();
  const map: Record<FilterTab, { Icon: any; title: string; sub: string }> = {
    all: { Icon: Package, title: 'Belum ada pesanan', sub: 'Yuk mulai belanja produk favoritmu!' },
    processing: { Icon: RefreshCw, title: 'Tidak ada pesanan diproses', sub: 'Pesanan aktif akan tampil di sini.' },
    completed: { Icon: CheckCircle, title: 'Belum ada pesanan selesai', sub: 'Pesanan selesai akan tampil di sini.' },
    cancelled: { Icon: XCircle, title: 'Tidak ada pesanan dibatalkan', sub: 'Pesanan dibatalkan akan tampil di sini.' },
  };
  const { Icon, title, sub } = map[filter];
  return (
    <div className="flex flex-col items-center py-16 px-6">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-[15px] font-bold text-gray-800 text-center">{title}</h3>
      <p className="text-[12px] text-gray-400 font-medium text-center mt-1.5 leading-relaxed">{sub}</p>
      {filter === 'all' && (
        <button onClick={() => router.push('/')}
          className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-700 text-white
            text-[13px] font-bold hover:bg-emerald-800 active:scale-95
            transition-all shadow-md shadow-emerald-700/20">
          Mulai Belanja
        </button>
      )}
    </div>
  );
}

// ── Grouped order structure ──
type OrderGroup = {
  label: string;
  orders: Order[];
};

function groupOrders(orders: Order[]): OrderGroup[] {
  // Pastikan data terurut dari yang paling baru
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups: OrderGroup[] = [];
  let lastLabel = '';

  for (const order of sorted) {
    const label = getOrderGroupLabel(order.createdAt);
    if (label !== lastLabel) {
      groups.push({ label, orders: [order] });
      lastLabel = label;
    } else {
      groups[groups.length - 1].orders.push(order);
    }
  }

  return groups;
}

// ── Main Page ──
export default function OrdersPage() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // NEW
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
  });

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setOrders(MOCK_ORDERS);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // NEW
  useEffect(() => {
    const currentTab = tabRefs.current[activeFilter];

    if (currentTab) {
      setIndicatorStyle({
        width: currentTab.offsetWidth,
        left: currentTab.offsetLeft,
      });
    }
  }, [activeFilter]);

  const filtered = orders.filter(o => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'processing')
      return o.status === 'pending' || o.status === 'processing';

    return o.status === activeFilter;
  });

  const groups = groupOrders(filtered);

  const HEADER_H = 48;
  const FILTER_H = 40;

  return (
    <div className="min-h-screen bg-gray-50/80 pb-[88px]">

      {/* Header */}
      <div
        className="sticky top-0 z-50 bg-[#0B6B52]
  border-b border-white/10 shadow-md"
        style={{ height: HEADER_H }}
      >
        <div className="flex items-center h-full px-4">
        <div className="text-[14px] font-bold text-white tracking-tight leading-none">
          Riwayat Pesanan
        </div>
      </div>
      </div>

      {/* Filter tabs */}
      <div
        className="sticky z-30 bg-white border-b border-gray-100"
        style={{ top: HEADER_H }}
      >
        <div
          className="relative flex gap-8 px-6 overflow-x-auto hide-scrollbar"
          style={{ height: FILTER_H }}
        >

          {/* Sliding Line */}
          <span
            className="absolute bottom-0 left-0 h-0.5 rounded-full bg-emerald-700
            transition-all duration-300 ease-out"
            style={{
              width: indicatorStyle.width,
              transform: `translateX(${indicatorStyle.left}px)`,
            }}
          />

          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              ref={(el) => {
                tabRefs.current[tab.key] = el;
              }}
              onClick={() => setActiveFilter(tab.key)}
              className={`relative flex-shrink-0 h-full px-1 text-[13px] font-bold
              transition-colors duration-200 active:scale-95
              ${activeFilter === tab.key
                  ? 'text-emerald-700'
                  : 'text-gray-400'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="pt-3">
        {isLoading ? (
          <div className="px-4 space-y-1">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : groups.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="space-y-5">
            {groups.map(group => (
              <div key={group.label}>
                {/* Group label */}
                <div className="pl-5 pr-4 pb-1.5">
                  <h2 className="text-[12px] font-semibold text-gray-600 tracking-tight">
                    {group.label}
                  </h2>
                </div>

                {/* Cards — tight gap within group */}
                <div className="px-4 space-y-1">
                  {group.orders.map(order => (
                    <OrderCard key={order.id} order={order} activeFilter={activeFilter} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}