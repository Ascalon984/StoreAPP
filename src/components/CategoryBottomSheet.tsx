"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { useFilterStore } from "@/store/useFilterStore";
import { useCategoryBottomSheetStore } from "@/store/useCategoryBottomSheetStore";
import { Category } from "@/lib/types";
import { GridColorIcon } from "./GridColorIcon";

const iconPathMap: Record<string, string> = {
  snack: "/icons/snack.png",
  minuman: "/icons/minuman.png",
  pulsa: "/icons/pulsa.png",
  listrik: "/icons/listrik.png",
};

interface CategoryBottomSheetProps {
  allCategories: Category[];
}

export default function CategoryBottomSheet({
  allCategories,
}: CategoryBottomSheetProps) {
  const { isOpen, closeSheet } = useCategoryBottomSheetStore();
  const { category, setCategory } = useFilterStore();
  const [isClosing, setIsClosing] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const dragVelocity = useRef(0);

  const DRAG_CLOSE_THRESHOLD = 100;
  const VELOCITY_CLOSE_THRESHOLD = 0.4;

  // ── Close modal ──
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeSheet();
      setIsClosing(false);
      setDragDelta(0);
    }, 300);
  };

  // ── Handle overlay click ──
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  // ── Drag to close ──
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    lastY.current = e.touches[0].clientY;
    lastTime.current = Date.now();
    isDragging.current = true;
    dragVelocity.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const currentY = e.touches[0].clientY;
    const delta = currentY - dragStartY.current;

    if (delta > 0) {
      setDragDelta(delta);

      // ── Calculate velocity ──
      const now = Date.now();
      const timeDelta = Math.max(now - lastTime.current, 1);
      dragVelocity.current = (currentY - lastY.current) / timeDelta;

      lastY.current = currentY;
      lastTime.current = now;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;

    if (
      dragDelta > DRAG_CLOSE_THRESHOLD ||
      dragVelocity.current > VELOCITY_CLOSE_THRESHOLD
    ) {
      handleClose();
    } else {
      setDragDelta(0);
    }
  };

  // ── Handle category click ──
  const handleCategoryClick = (catId: string) => {
    setCategory(catId);
    handleClose();

    // Scroll ke product area
    const productAreaElement = document.getElementById("product-area");
    if (productAreaElement) {
      const rect = productAreaElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const productAreaTop = scrollY + rect.top;
      const targetScroll = Math.max(productAreaTop - 60, 0);
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-[9999] bg-black/40 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`
          absolute bottom-0 left-0 right-0
          bg-white rounded-t-2xl
          max-h-[80vh] flex flex-col
          transition-all duration-300 ease-out
          ${isClosing ? "translate-y-full" : "translate-y-0"}
        `}
        style={{
          transform: isDragging.current
            ? `translateY(${dragDelta}px)`
            : isClosing
              ? "translateY(100%)"
              : "translateY(0)",
        }}
      >
        {/* ── Drag Handle ── */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-12 bg-gray-300 rounded-full" />
        </div>

        {/* ── Header ── */}
        <div className="px-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Semua Kategori
          </h2>
        </div>

        {/* ── Categories Grid ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4 pb-6">
            {/* "Semua" button */}
            <button
              onClick={() => handleCategoryClick("all")}
              className={`
                flex flex-col items-center gap-3 p-3 rounded-xl
                transition-all duration-200
                ${
                  category === "all"
                    ? "bg-amber-100 border-2 border-amber-500"
                    : "bg-gray-50 border-2 border-gray-200"
                }
              `}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
                <GridColorIcon size={32} />
              </div>
              <span
                className={`text-xs font-semibold text-center ${
                  category === "all" ? "text-amber-700" : "text-gray-700"
                }`}
              >
                Semua
              </span>
            </button>

            {/* Other categories */}
            {allCategories
              .filter((c) => c.id !== "all")
              .map((cat) => {
                const iconPath = iconPathMap[cat.id] || "";
                const isActive = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`
                      flex flex-col items-center gap-3 p-3 rounded-xl
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-amber-100 border-2 border-amber-500"
                          : "bg-gray-50 border-2 border-gray-200"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
                      {iconPath ? (
                        <Image
                          src={iconPath}
                          alt={cat.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold text-center line-clamp-2 ${
                        isActive ? "text-amber-700" : "text-gray-700"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}

            {/* 5 Placeholder items untuk review */}
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={`placeholder-${idx}`}
                className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
