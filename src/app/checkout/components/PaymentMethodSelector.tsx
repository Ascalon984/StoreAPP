import React from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PAYMENT_METHODS } from "../utils";

interface PaymentMethodSelectorProps {
  selectedPayment: string | null;
  selectedSubPayment: string | null;
  expandedAccordion: string | null;
  toggleAccordion: (id: string) => void;
  handleSubPaymentSelect: (parentId: string, subId: string) => void;
  paymentSectionRef: React.RefObject<HTMLDivElement>;
}

export default function PaymentMethodSelector({
  selectedPayment,
  selectedSubPayment,
  expandedAccordion,
  toggleAccordion,
  handleSubPaymentSelect,
  paymentSectionRef,
}: PaymentMethodSelectorProps) {
  return (
    <>
      <div ref={paymentSectionRef} className="px-4 pt-4 pb-2">
        <h2 className="text-[15px] font-bold text-gray-900">
          Metode Pembayaran
        </h2>
      </div>

      <div className="bg-white border-y border-gray-100">
        <div className="divide-y divide-gray-100/60">
          {Object.values(PAYMENT_METHODS).map((method) => {
            const Icon = method.icon;
            const isExpanded = expandedAccordion === method.id;
            const isSelected = selectedPayment === method.id;

            return (
              <div key={method.id}>
                <button
                  onClick={() => toggleAccordion(method.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    isSelected ? "bg-emerald-50/50" : "hover:bg-gray-50/50"
                  }`}
                >
                  {/* LEFT CONTENT */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? "bg-emerald-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={
                          isSelected ? "text-emerald-700" : "text-gray-500"
                        }
                        strokeWidth={2}
                      />
                    </div>

                    <div className="text-left">
                      <p
                        className={`text-[12px] font-semibold leading-none ${
                          isSelected ? "text-emerald-800" : "text-gray-800"
                        }`}
                      >
                        {method.label}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium mt-1 leading-none">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT CHEVRON */}
                  {method.options && (
                    <div className="ml-auto">
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-600" />
                      )}
                    </div>
                  )}
                </button>

                {method.options && (
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: isExpanded ? "400px" : "0px",
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    <div
                      className={`px-4 pt-2 pb-4 ${
                        method.id === "ewallet"
                          ? "grid grid-cols-3 gap-2"
                          : method.id === "va"
                            ? "grid grid-cols-2 gap-2"
                            : "space-y-1.5"
                      }`}
                    >
                      {method.options.map((opt) => {
                        const isSubSelected =
                          selectedPayment === method.id &&
                          selectedSubPayment === opt.id;

                        if (method.id === "ewallet") {
                          return (
                            <button
                              key={opt.id}
                              onClick={() =>
                                handleSubPaymentSelect(method.id, opt.id)
                              }
                              className={`flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all shadow-layer-xs ${
                                isSubSelected
                                  ? "bg-emerald-50 border-emerald-500 shadow-sm"
                                  : "bg-white border-gray-50"
                              }`}
                            >
                              <div className="w-9 h-9 flex-shrink-0 relative">
                                <Image
                                  src={`/icons/${(opt as any).image}`}
                                  alt={opt.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span
                                className={`text-[11px] font-bold text-center leading-none ${
                                  isSubSelected
                                    ? "text-emerald-800"
                                    : "text-gray-600"
                                }`}
                              >
                                {opt.name}
                              </span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() =>
                              handleSubPaymentSelect(method.id, opt.id)
                            }
                            className={`flex items-center justify-center h-12 rounded-xl transition-all shadow-layer-xs ${
                              isSubSelected
                                ? "bg-emerald-50 border-emerald-500 shadow-sm"
                                : "bg-white border-gray-50"
                            }`}
                          >
                            <div className="relative w-24 h-7">
                              <Image
                                src={`/icons/${(opt as any).image}`}
                                alt={opt.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-3 bg-gradient-to-b from-white to-gray-50/30" />
    </>
  );
}
