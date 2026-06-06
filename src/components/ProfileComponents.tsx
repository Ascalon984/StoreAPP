"use client";

import { Check, Pencil } from "lucide-react";
import Image from "next/image";

// ── AvatarCircle ──
export function AvatarCircle({
  name,
  src,
  size = 56,
}: {
  name: string;
  src: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full border-2 border-white shadow-lg overflow-hidden flex-shrink-0 bg-gray-100"
      >
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full border-2 border-white shadow-lg overflow-hidden flex-shrink-0 bg-gray-100"
    >
      <img
        src="/icons/avatar.png"
        alt="avatar"
        className="w-full h-full object-cover opacity-70"
      />
    </div>
  );
}

// ── SectionLabel ──
export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mx-4 mt-5 mb-2">
      <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
        {label}
      </h2>
    </div>
  );
}

// ── Toggle ──
export function Toggle({
  on,
  onToggle,
  ariaLabel = "Toggle",
}: {
  on: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${on ? "bg-emerald-500" : "bg-gray-200"}`}
      aria-checked={on}
      role="switch"
      aria-label={ariaLabel}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${on ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

// ── FieldRow ──
export function FieldRow({
  label,
  value,
  icon,
  editingField,
  fieldKey,
  onEditStart,
  onEditCancel,
  onEditSave,
  editValue,
  setEditValue,
  inputType = "text",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  editingField: string | null;
  fieldKey: string;
  onEditStart: (key: string, val: string) => void;
  onEditCancel: () => void;
  onEditSave: (key: string) => void;
  editValue: string;
  setEditValue: (v: string) => void;
  inputType?: string;
}) {
  const isEditing = editingField === fieldKey;
  const isDisabled = editingField !== null && !isEditing;

  return (
    <div
      className={`px-4 py-3 transition-colors ${isDisabled ? "opacity-60" : ""}`}
    >
      <div
        className={`flex ${isEditing ? "items-stretch" : "items-start"} gap-3`}
      >
        {!isEditing && (
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 leading-none mb-1">
            {label}
          </p>
          {isEditing ? (
            <input
              type={inputType}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={onEditCancel}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditSave(fieldKey);
                if (e.key === "Escape") onEditCancel();
              }}
              autoFocus
              className="w-full text-[13px] font-medium text-gray-800 bg-gray-50 rounded-lg px-2.5 py-1.5 outline-none border border-emerald-600/50 focus:border-emerald-600 transition-colors duration-150"
            />
          ) : (
            <p className="text-[13px] font-medium text-gray-800 truncate">
              {value || "—"}
            </p>
          )}
        </div>
        {isEditing ? (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onEditSave(fieldKey)}
            className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 active:scale-90 transition-all flex-shrink-0 self-end"
            aria-label="Save"
          >
            <Check size={15} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={() => !isDisabled && onEditStart(fieldKey, value)}
            disabled={isDisabled}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 active:scale-90 transition-all flex-shrink-0 mt-0.5"
            aria-label={`Edit ${label}`}
          >
            <Pencil size={15} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
