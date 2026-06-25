"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCategoryBottomSheetStore } from "@/store/useCategoryBottomSheetStore";
import { Category } from "@/lib/types";
import { GridColorIcon } from "./GridColorIcon";

// Icon mapping - 2.5D icons library
// Urutan: Pulsa, Paket Data, Listrik, E-Wallet, Voucher, Game, Hiburan, Produktivitas
const iconPathMap: Record<string, string> = {
  elektronik: "/icons/elektronik.png",
  fashion: "/icons/fashion.png",
  rumah: "/icons/rumah.png",
  kecantikan: "/icons/kecantikan.png",
  makanan: "/icons/makanan.png",
  hobi: "/icons/hobi.png",
  otomotif: "/icons/otomotif.png",
  olahraga: "/icons/olah raga.png",
};

const iconClassMap: Record<string, string> = {
  elektronik: "scale-100",
  fashion: "scale-100",
  rumah: "scale-100",
  kecantikan: "scale-90",
  makanan: "scale-100",
  hobi: "scale-95",
  otomotif: "scale-100",
  olahraga: "scale-100",
};

interface CategoryGridProps {
  initialCategories?: Category[];
}

function CategorySkeleton() {
  return (
    <section className="px-4 pt-3 pb-3.5">
      <div className="grid grid-cols-4 place-items-center gap-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-start pt-1.5 pb-1 gap-1.5"
          >
            <div className="w-12 h-12 skeleton rounded-lg" />
            <div className="h-2.5 w-10 skeleton rounded-md" />
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
    w-[64px]
    pt-1.5 pb-1
    active:scale-95
    transition-transform
  "
    >
      {/* ICON AREA */}
      <div className="w-7 h-7 flex items-center justify-center">
        <div
          className={`
        transition-all duration-200
        ${isActive ? "scale-105 opacity-100" : "opacity-90"}
      `}
        >
          {icon}
        </div>
      </div>

      {/* LABEL AREA */}
      <div className="mt-1.5 flex items-start justify-center">
        <span
          className={`
        text-center
        leading-[1.1]
        max-w-[72px]
        break-words
        ${label.length > 14 ? "text-[10px]" : "text-[11px]"}
        ${isActive ? "text-emerald-600 font-semibold" : "text-gray-600 font-medium"}
      `}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

export default function CategoryGrid({
  initialCategories = [],
}: CategoryGridProps) {
  const router = useRouter();
  const { openSheet } = useCategoryBottomSheetStore();
  const [isLoading, setIsLoading] = useState(initialCategories.length === 0);
  const [categories, setCategories] = useState<Category[]>(() =>
    initialCategories.filter((c) => c.id !== "all").slice(0, 8),
  );
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    if (categories.length === 0) return;

    setImagesReady(false);
    let cancelled = false;

    const urls = categories.map(
      (cat) => iconPathMap[cat.name.toLowerCase()] || "/icons/default.png",
    );

    let loaded = 0;

    urls.forEach((url) => {
      const img = new window.Image();
      img.src = url;

      img.onload = img.onerror = () => {
        if (cancelled) return;

        loaded += 1;
        if (loaded === urls.length) {
          setImagesReady(true);
        }
      };
    });

    return () => {
      cancelled = true;
    };
  }, [categories]);

  useEffect(() => {
    if (initialCategories.length > 0) return;
    fetch("/api/public/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = [...data].sort(
            (a, b) => (a.priority || 0) - (b.priority || 0),
          );
          setCategories(sorted.filter((c) => c.id !== "all").slice(0, 8));
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err))
      .finally(() => setIsLoading(false));
  }, [initialCategories.length]);

  const handleClick = (catId: string) => {
    router.push(`/category/${catId}`);
  };

  if (!categories.length || !imagesReady) {
    return <CategorySkeleton />;
  }

  return (
    <section className="px-4 pt-3 pb-3.5">
      <div className="grid grid-cols-4 place-items-center gap-y-4">
        {/* 8 categories: 2 rows x 4 columns */}
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            label={cat.name}
            isActive={false}
            onClick={() => handleClick(cat.id)}
            icon={
              <Image
                src={
                  iconPathMap[cat.name.toLowerCase()] || "/icons/default.png"
                }
                alt={cat.name}
                width={32}
                height={32}
                className={`
                  w-7 h-7 object-contain transition-transform
                  ${iconClassMap[cat.name.toLowerCase()] || "scale-100"}
                `}
                priority={false}
              />
            }
          />
        ))}

        {/* "Semua" — always last (row 2, col 1) */}
        {categories.length < 8 && (
          <CategoryItem
            label="Semua"
            isActive={false}
            onClick={openSheet}
            icon={
              <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center text-[9px] text-gray-500">
                ※
              </div>
            }
          />
        )}
      </div>
    </section>
  );
}
