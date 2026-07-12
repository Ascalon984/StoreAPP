import { useRef } from "react";
import { MoveRight } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { formatRupiah } from "@/lib/utils";
import { OrderItem } from "@/lib/types";
import { products, mockHighlightProducts } from "@/lib/data";
import { MOCK_SELLERS } from "@/lib/mockSellers";

export function MultiProductCarousel({
  items,
  active,
  setActive,
}: {
  items: OrderItem[];
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}) {
  const totalSlides = items.length + 1;
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffY) > Math.abs(diffX)) return;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) setActive((p) => Math.min(p + 1, totalSlides - 1));
      else setActive((p) => Math.max(p - 1, 0));
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
          <div className="w-full flex-shrink-0 flex items-center gap-3 px-4 py-1.5">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="flex items-center">
                {items.slice(0, 3).map((item, i) => (
                  <div
                    key={item.productId}
                    className="w-16 h-16 rounded-lg border border-white/80 ring-1 ring-black/[0.04] shadow-sm overflow-hidden bg-gray-50 flex-shrink-0"
                    style={{
                      marginLeft: i === 0 ? 0 : -22,
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
                    className="w-15 h-15 rounded-lg border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center flex-shrink-0 -ml-4"
                    style={{ zIndex: 0 }}
                  >
                    <span className="text-[10px] font-semibold text-gray-500">
                      +{items.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-[12px] font-medium text-gray-600 leading-[1.3] line-clamp-2 break-words">
                  {`${items[0].name.split(" ").slice(0, 4).join(" ")} & ${items.length - 1} lainnya`}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">
                  {items.length} produk
                </p>
              </div>

              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                <MoveRight
                  size={13}
                  strokeWidth={2.2}
                  className="text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* ── Slide 1..N — Detail per produk ── */}
          {items.map((item, idx) => {
            const allProducts = [...products, ...mockHighlightProducts];
            const p = allProducts.find((pp) => pp.id === item.productId);
            const sId = p?.sellerId || "s1";
            const sellerName =
              MOCK_SELLERS.find((s) => s.id === sId)?.name || sId;

            return (
              <div
                key={item.productId}
                className="w-full flex-shrink-0 flex items-center gap-3 px-4 py-2"
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                    <ProductImage
                      category={item.category}
                      name={item.name}
                      src={item.image ?? undefined}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-gray-600 leading-[1.3] line-clamp-2 break-words">
                    {item.name}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    {item.quantity}{" "}
                    <span className="inline-block translate-y-[0.2px]">×</span>{" "}
                    {formatRupiah(item.price)}
                  </p>

                  <div className="mt-1 flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-[8px] text-emerald-700 font-bold">
                        {sellerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-500">{sellerName}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex flex-col items-end justify-between h-16">
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {idx + 1}/{items.length}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
