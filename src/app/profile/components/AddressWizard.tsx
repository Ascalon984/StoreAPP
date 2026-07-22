"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Search, X, Check, Loader2 } from "lucide-react";

export interface SelectedRegion {
  provinsiId: string;
  provinsi: string;
  kotaId: string;
  kota: string;
  kecamatanId: string;
  kecamatan: string;
}

interface RegionItem {
  id: string;
  name: string;
}

type WizardStep = 0 | 1 | 2; // 0 = provinsi, 1 = kota, 2 = kecamatan

const WILAYAH_BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";
const STEP_LABELS = ["Provinsi", "Kota / Kabupaten", "Kecamatan"];

export function toTitleCase(text: string) {
  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bDki\b/g, "DKI")
    .replace(/\bDi\b/g, "DI");
}

interface AddressWizardProps {
  initialValues: SelectedRegion;
  onApply: (selected: SelectedRegion) => void;
  onClose: () => void;
}

export default function AddressWizard({
  initialValues,
  onApply,
  onClose,
}: AddressWizardProps) {
  const [staged, setStaged] = useState<SelectedRegion>(initialValues);
  const [wizardStep, setWizardStep] = useState<WizardStep>(() => {
    if (!initialValues.provinsiId) return 0;
    if (!initialValues.kotaId) return 1;
    return 2;
  });

  const [options, setOptions] = useState<RegionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* ===================== fetch wilayah sesuai step wizard ===================== */
  useEffect(() => {
    let url = "";
    if (wizardStep === 0) {
      url = `${WILAYAH_BASE}/provinces.json`;
    } else if (wizardStep === 1) {
      if (!staged.provinsiId) return;
      url = `${WILAYAH_BASE}/regencies/${staged.provinsiId}.json`;
    } else if (wizardStep === 2) {
      if (!staged.kotaId) return;
      url = `${WILAYAH_BASE}/districts/${staged.kotaId}.json`;
    }

    setLoading(true);
    setError("");
    setSearch("");

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data wilayah");
        return res.json();
      })
      .then((data: any[]) => {
        setOptions(data.map((d) => ({ id: d.id, name: d.name })));
      })
      .catch(() => {
        setError("Gagal memuat data. Periksa koneksi internet lalu coba lagi.");
        setOptions([]);
      })
      .finally(() => setLoading(false));
  }, [wizardStep, staged.provinsiId, staged.kotaId]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    if (search.trim().length < 2) return options;
    return options.filter((o) =>
      o.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [options, search]);

  const isSearchTooShort = search.trim().length > 0 && search.trim().length < 2;

  function handleSelectStaged(item: RegionItem) {
    if (wizardStep === 0) {
      setStaged((s) => ({
        ...s,
        provinsiId: item.id,
        provinsi: item.name,
        kotaId: "",
        kota: "",
        kecamatanId: "",
        kecamatan: "",
      }));

      setWizardStep(1);
      return;
    }

    if (wizardStep === 1) {
      setStaged((s) => ({
        ...s,
        kotaId: item.id,
        kota: item.name,
        kecamatanId: "",
        kecamatan: "",
      }));

      setWizardStep(2);
      return;
    }

    setStaged((s) => ({
      ...s,
      kecamatanId: item.id,
      kecamatan: item.name,
    }));
  }

  function handleNext() {
    if (wizardStep === 0 && !staged.provinsiId) return;
    if (wizardStep === 1 && !staged.kotaId) return;
    setWizardStep((s) => (s + 1) as WizardStep);
  }

  function handleBack() {
    setWizardStep((s) => (s - 1) as WizardStep);
  }

  function handleApply() {
    if (!staged.kecamatanId) return;
    onApply(staged);
  }

  const currentStepLabel = STEP_LABELS[wizardStep];

  function isSelectedInStep(item: RegionItem) {
    if (wizardStep === 0) return staged.provinsiId === item.id;
    if (wizardStep === 1) return staged.kotaId === item.id;
    return staged.kecamatanId === item.id;
  }

  const canGoNext =
    (wizardStep === 0 && !!staged.provinsiId) ||
    (wizardStep === 1 && !!staged.kotaId);
  const canApply = wizardStep === 2 && !!staged.kecamatanId;

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-right duration-300">
      {/* Wizard header */}
      <div className="px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 bg-white z-10">
        <button
          onClick={wizardStep === 0 ? onClose : handleBack}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
        >
          {wizardStep === 0 ? (
            <X size={18} className="text-gray-700" />
          ) : (
            <ArrowLeft size={18} className="text-gray-700" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h1 className="text-[14px] font-bold text-gray-800">
              {currentStepLabel}
            </h1>

            <span className="text-[11px] font-semibold text-gray-400">
              {wizardStep + 1}/3
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= wizardStep ? "bg-emerald-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari ${currentStepLabel.toLowerCase()}...`}
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Options list */}
      <div className="flex-1 overflow-y-auto pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-400 py-16">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-[12px]">Memuat data...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 text-center py-16">
            <span className="text-[12px] text-red-500">{error}</span>
            <button
              onClick={() => setWizardStep(wizardStep)}
              className="text-[12px] font-semibold text-emerald-600"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          !isSearchTooShort &&
          filteredOptions.length === 0 && (
            <div className="flex items-center justify-center text-[12px] text-gray-400 py-16">
              Tidak ditemukan.
            </div>
          )}

        {!loading &&
          !error &&
          filteredOptions.map((item) => {
            const isSelected = isSelectedInStep(item);
            return (
              <button
                key={item.id}
                onClick={() => handleSelectStaged(item)}
                className={`mx-3 my-1 w-[calc(100%-24px)] flex items-center justify-between px-3 py-3 rounded-lg text-[13px] border transition-all ${
                  isSelected
                    ? "border-emerald-500 text-emerald-700 bg-white"
                    : "border-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                <span>{item.name}</span>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-opacity ${
                    isSelected ? "bg-emerald-600 opacity-100" : "opacity-0"
                  }`}
                >
                  <Check size={12} strokeWidth={3} className="text-white" />
                </span>
              </button>
            );
          })}
      </div>

      {/* Wizard footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <div className="flex gap-2">
          {wizardStep > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-lg text-[13px] font-bold border border-gray-200 text-gray-700 active:bg-gray-50 transition-colors"
            >
              Kembali
            </button>
          )}

          {wizardStep < 2 ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`flex-1 py-3 rounded-lg text-[13px] font-bold transition-all ${
                canGoNext
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 active:opacity-90"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Selanjutnya
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={!canApply}
              className={`flex-1 py-3 rounded-lg text-[13px] font-bold transition-all ${
                canApply
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 active:opacity-90"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Terapkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
