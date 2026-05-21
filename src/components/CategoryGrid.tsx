"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useFilterStore } from "@/store/useFilterStore";
import { Category } from "@/lib/types";
import { GridColorIcon } from "./GridColorIcon";

const iconPathMap: Record<string, string> = {
  // Mapping category IDs to icon PNG files
  // 'all' uses custom SVG component, no path needed
  snack: "/icons/snack.png",
  minuman: "/icons/minuman.png",
  pulsa: "/icons/pulsa.png",
  listrik: "/icons/listrik.png",
};

const colorMap: Record<string, { active: string; bg: string; glow: string }> = {
  all: {
    active: "text-amber-600",
    bg: "bg-amber-50",
    glow: "bg-amber-400",
  },

  snack: {
    active: "text-amber-600",
    bg: "bg-amber-50",
    glow: "bg-amber-400",
  },

  minuman: {
    active: "text-amber-600",
    bg: "bg-amber-50",
    glow: "bg-amber-400",
  },

  pulsa: {
    active: "text-amber-600",
    bg: "bg-amber-50",
    glow: "bg-amber-400",
  },

  listrik: {
    active: "text-amber-600",
    bg: "bg-amber-50",
    glow: "bg-amber-400",
  },
};

interface CategoryGridProps {
  initialCategories?: Category[];
}

function CategorySkeleton() {
  return (
    <section className="px-4 pt-1 pb-3.5">
      <div className="mb-0.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="h-4 w-28 skeleton rounded-md" />
        </div>
      </div>

      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center flex-shrink-0 w-[68px] pt-3.5 pb-2.5 px-1"
          >
            {/* Circle skeleton */}
            <div className="w-12 h-12 skeleton rounded-full" />
            {/* Label skeleton */}
            <div className="h-2.5 w-11 skeleton rounded-md mt-2.5" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CategoryGrid({
  initialCategories = [],
}: CategoryGridProps) {
  const { category, setCategory } = useFilterStore();
  const [isLoading, setIsLoading] = useState(initialCategories.length === 0);

  const buildCategoryList = (raw: Category[]) => {
    // Filter out 'all' if it exists in DB to prevent duplication, limit to max 5
    const activeFromDb = raw.filter((c) => c.id !== "all").slice(0, 5);
    const list = [
      { id: "all", name: "Semua", icon: "LayoutGrid" },
      ...activeFromDb,
    ];

    // Pad to maintain symmetry (3 items for 1 row, 6 items for 2 rows)
    const targetLength = list.length <= 3 ? 3 : 6;
    while (list.length < targetLength) {
      list.push({
        id: `empty-slot-${list.length}`,
        name: "Segera Hadir",
        icon: "empty",
      });
    }

    return list;
  };

  const [categories, setCategories] = useState<Category[]>(
    initialCategories.length > 0
      ? buildCategoryList(initialCategories)
      : [{ id: "all", name: "Semua", icon: "LayoutGrid" }],
  );

  // Hanya fetch dari client jika tidak ada data SSR
  useEffect(() => {
    if (initialCategories.length > 0) return;

    fetch("/api/public/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort by priority before building the list
          const sorted = [...data].sort(
            (a, b) => (a.priority || 0) - (b.priority || 0),
          );
          setCategories(buildCategoryList(sorted));
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err))
      .finally(() => setIsLoading(false));
  }, [initialCategories.length]);

  const handleClick = (catId: string) => {
    setCategory(catId);
    const bottomSheetElement = document.getElementById("bottom-sheet");
    if (bottomSheetElement) {
      const rect = bottomSheetElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const bottomSheetTop = scrollY + rect.top;
      const targetScroll = Math.max(bottomSheetTop - 60, 0);
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) return <CategorySkeleton />;

  return (
    <section className="px-4 pt-1 pb-3.5">
      {/* Hapus dekorasi vertikal, perbesar label */}
      <div className="mb-0.5 px-0.5">
        <h2 className="text-[15px] font-bold text-gray-800 tracking-tight">
          Kategori
        </h2>
      </div>

      <div
        className="flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => {
          if (cat.id.startsWith("empty-slot-")) return null;

          const isAllCategory = cat.id === "all";
          const iconPath = isAllCategory ? "" : iconPathMap[cat.id] || ""; // Use cat.id as key, not cat.icon
          const isActive = category === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`
                group relative flex flex-col items-center flex-shrink-0
                w-[68px]      
                pt-3.5 pb-2.5   // ← pt-3 → pt-3.5
                px-1
                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                active:scale-95
              `}
            >
              {/* Icon + Ellipse Container — samakan ukuran */}
              <div className="relative flex items-center justify-center w-11 h-11">
                {/* Ellipse */}
                <div
                  className={`
    absolute left-1/2 top-[54%] -translate-x-1/2
    w-[42px] h-[22px]
    rounded-[100%] transition-all duration-300 z-0
    ${
      isActive
        ? "bg-amber-500 opacity-90 scale-110 shadow-[0_2px_8px_rgba(251,191,36,0.45)]"
        : "bg-emerald-600 opacity-75"
    }
  `}
                />

                {/* Icon */}
                {isAllCategory ? (
                  <div className="relative z-10">
                    <GridColorIcon size={40} />
                  </div>
                ) : (
                  <Image
                    src={iconPath}
                    alt={cat.name}
                    width={44}
                    height={44}
                    className={`
        w-11 h-11
        object-contain relative z-10
        transition-transform duration-300
        ${isActive ? "scale-110 -translate-y-[1px]" : "group-hover:scale-105"}
      `}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={`
    mt-2 text-[10.5px]       // ← 10px → 10.5px
    font-semibold tracking-tight text-center
    leading-tight w-full truncate relative z-10
    ${isActive ? "text-amber-600" : "text-gray-500"}
  `}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
