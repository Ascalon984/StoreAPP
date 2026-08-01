import React from "react";
import { ChevronRight } from "lucide-react";
import { Toggle } from "@/components/ProfileComponents";

export interface NavRow {
  key: string;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  page: string;
  iconSize?: number;
}

interface NavRowButtonProps extends NavRow {
  onClick: (page: string, title: string) => void;
}

export function NavRowButton({
  icon: Icon,
  title,
  subtitle,
  page,
  iconSize = 15,
  onClick,
}: NavRowButtonProps) {
  return (
    <button
      onClick={() => onClick(page, title)}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
        <Icon size={iconSize} className="text-gray-500" strokeWidth={2.5} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 leading-none">
          {title}
        </p>
        {subtitle && (
          <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      <ChevronRight size={20} className="text-gray-400 shrink-0" />
    </button>
  );
}

export function ToggleRow({
  title,
  desc,
  on,
  onToggle,
}: {
  title: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 leading-none">
          {title}
        </p>
        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{desc}</p>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

export function ChevronRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  badge,
  badgeColor,
  onClick,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: "green" | "orange" | "gray";
  onClick: () => void;
}) {
  const badgeStyles: Record<string, string> = {
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    gray: "text-gray-400 bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3.5 flex items-center gap-3 active:bg-gray-50 transition-colors"
    >
      <div
        className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
      >
        <Icon size={15} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[13px] font-semibold text-gray-800">{title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      {badge && (
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
            badgeStyles[badgeColor ?? "gray"]
          }`}
        >
          {badge}
        </span>
      )}
      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </button>
  );
}
