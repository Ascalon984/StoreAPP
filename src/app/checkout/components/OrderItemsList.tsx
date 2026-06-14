import React from "react";
import { Trash2 } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { formatRupiah } from "@/lib/utils";
import {
  getEffectiveTargetType,
  isTargetValid,
  getTargetPlaceholder,
  formatTargetInput,
  getCartImage,
} from "../utils";

interface OrderItemsListProps {
  displayItems: any[];
  targetIds: Record<string, string>;
  setTargetIds: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  hasAttemptedSubmit: boolean;
  touchedTargets: Record<string, boolean>;
  handleTargetBlur: (productId: string) => void;
  handleRemoveItem: (productId: string) => void;
}

export default function OrderItemsList({
  displayItems,
  targetIds,
  setTargetIds,
  hasAttemptedSubmit,
  touchedTargets,
  handleTargetBlur,
  handleRemoveItem,
}: OrderItemsListProps) {
  return (
    <>
      <div className="bg-white mt-3">
        <div className="px-3 py-1 divide-y divide-gray-50">
          {displayItems.map((item) => {
            const product = item.product;
            const qty = item.quantity || 0;
            const price = product?.price ?? 0;
            const originalPrice = product?.originalPrice;
            const subtotalItem = price * qty;
            const hasDiscount = originalPrice && originalPrice > price;
            const cartImg = getCartImage(product);

            return (
              <div key={product.id} className="py-2.5">
                <div className="flex gap-3 items-start">
                  {/* IMAGE */}
                  <ProductImage
                    category={product.category}
                    name={product.name}
                    src={cartImg}
                    className="w-16 h-16 rounded-xl flex-shrink-0 border border-gray-100/50 object-cover bg-white mt-1"
                  />

                  {/* RIGHT CONTENT */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {/* TOP ROW */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-semibold text-gray-800 leading-snug">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-emerald-600 font-bold text-[12px]">
                            {formatRupiah(price)}
                          </span>
                          {product.variant && (
                            <>
                              <div className="w-[1px] h-3 bg-gray-200" />
                              <span className="text-[11px] text-gray-400 font-medium truncate">
                                {product.variant}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(product.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-amber-500 active:scale-90 transition -mr-1"
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </div>

                    {/* INPUT ROW */}
                    {(() => {
                      const effectiveType = getEffectiveTargetType(
                        product.category,
                        product.targetType,
                      );
                      if (effectiveType === "none") return null;

                      const val = targetIds[product.id] ?? "";
                      const isValid = isTargetValid(val, effectiveType);
                      const showError =
                        (hasAttemptedSubmit || touchedTargets[product.id]) &&
                        !isValid;

                      return (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={getTargetPlaceholder(effectiveType)}
                            value={targetIds[product.id] || ""}
                            onChange={(e) =>
                              setTargetIds((prev) => ({
                                ...prev,
                                [product.id]: formatTargetInput(
                                  e.target.value,
                                  effectiveType,
                                ),
                              }))
                            }
                            onBlur={() => handleTargetBlur(product.id)}
                            className={`w-full h-8 px-2.5 pr-14 text-[12px] text-gray-800 bg-gray-50 border rounded-lg placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 ${
                              showError
                                ? "border-red-400"
                                : "border-gray-200/60"
                            }`}
                          />

                          {!targetIds[product.id] && !showError && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-amber-500/80">
                              wajib
                            </span>
                          )}

                          {showError && (
                            <p className="text-[10px] text-red-500 mt-1 pl-0.5">
                              {effectiveType === "phone"
                                ? "Nomor HP tidak valid"
                                : effectiveType === "email"
                                  ? "Email tidak valid"
                                  : effectiveType === "pln"
                                    ? "Nomor PLN tidak valid"
                                    : effectiveType === "number"
                                      ? "Minimal 6 angka"
                                      : "Data tidak valid"}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
