import ProductImage from "@/components/ProductImage";
import { formatRupiah } from "@/lib/utils";
import { OrderItem } from "@/lib/types";
import { products, mockHighlightProducts } from "@/lib/data";
import { MOCK_SELLERS } from "@/lib/mockSellers";

export function SingleProductItem({ item }: { item: OrderItem }) {
  const allProducts = [...products, ...mockHighlightProducts];
  const p = allProducts.find((pp) => pp.id === item.productId);
  const sId = p?.sellerId || "s1";
  const sellerName = MOCK_SELLERS.find((s) => s.id === sId)?.name || sId;

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="w-16 h-16 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
        <ProductImage
          category={item.category}
          name={item.name}
          src={item.image ?? undefined}
          className="w-full h-full object-cover"
        />
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
    </div>
  );
}
