"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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

interface CategoryGridProps {
  initialCategories?: Category[];
}

function CategorySkeleton() {
  return (
    <section className="px-4 pt-3 pb-3.5">
      <div className="h-4 w-20 skeleton rounded-md mb-3" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center flex-shrink-0 w-[68px] gap-2"
          >
            <div className="w-12 h-12 skeleton rounded-full" />
            <div className="h-2.5 w-11 skeleton rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryItem({
  label,
  isActive,
  icon,
  onClick,
}: {
  label: string;
  isActive: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        flex flex-col items-center
        justify-start
        flex-1
        min-w-0
        pt-1 pb-1
        gap-1
        transition-all
        active:scale-95
      "
    >
      <div
        className={`
          transition-all duration-200
          ${isActive ? "scale-105 opacity-100" : "opacity-75"}
        `}
      >
        {icon}
      </div>

      <span
        className={`
          text-[10px]
          truncate
          transition-colors
          ${
            isActive
              ? "text-emerald-600 font-semibold"
              : "text-gray-500 font-medium"
          }
        `}
      >
        {label}
      </span>
    </button>
  );
}

export default function CategoryGrid({
  initialCategories = [],
}: CategoryGridProps) {
  const { category, setCategory } = useFilterStore();
  const { openSheet } = useCategoryBottomSheetStore();
  const [isLoading, setIsLoading] = useState(initialCategories.length === 0);
  const [categories, setCategories] = useState<Category[]>(() =>
    initialCategories.filter((c) => c.id !== "all").slice(0, 4),
  );

  useEffect(() => {
    if (initialCategories.length > 0) return;
    fetch("/api/public/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = [...data].sort(
            (a, b) => (a.priority || 0) - (b.priority || 0),
          );
          setCategories(sorted.filter((c) => c.id !== "all").slice(0, 4));
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err))
      .finally(() => setIsLoading(false));
  }, [initialCategories.length]);

  const handleClick = (catId: string) => {
    setCategory(catId);
    const el = document.getElementById("product-area");
    if (el) {
      const top = window.scrollY + el.getBoundingClientRect().top;
      window.scrollTo({ top: Math.max(top - 60, 0), behavior: "smooth" });
    }
  };

  if (isLoading) return <CategorySkeleton />;

  return (
    <section className="px-4 pt-2 pb-2.5">
      <div className="flex items-start justify-between"></div>

      <div
        className="flex gap-1 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* 4 categories from DB */}
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            label={cat.name}
            isActive={category === cat.id}
            onClick={() => handleClick(cat.id)}
            icon={
              <Image
                src={iconPathMap[cat.id] || "/icons/default.png"}
                alt={cat.name}
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            }
          />
        ))}

        {/* "Semua" — always last */}
        <CategoryItem
          label="Semua"
          isActive={category === "all"}
          onClick={openSheet}
          icon={<GridColorIcon size={32} />}
        />
      </div>
    </section>
  );
}
