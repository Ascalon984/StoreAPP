"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  X,
  Check,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";
import type { LatLngExpression } from "leaflet";
import AddressMap from "./AddressMap";

interface AddressPageProps {
  onClose: () => void;
}

interface RegionItem {
  id: string;
  name: string;
}

type WizardStep = 0 | 1 | 2; // 0 = provinsi, 1 = kota, 2 = kecamatan

const WILAYAH_BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";
const DEFAULT_COORDS: LatLngExpression = { lat: -6.2088, lng: 106.8456 };
const STEP_LABELS = ["Provinsi", "Kota / Kabupaten", "Kecamatan"];

function toTitleCase(text: string) {
  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bDki\b/g, "DKI")
    .replace(/\bDi\b/g, "DI");
}

export default function AddressPage({ onClose }: AddressPageProps) {
  const [form, setForm] = useState({
    namaLengkap: "",
    noHp: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    alamat: "",
    rt: "",
    rw: "",
  });

  const [ids, setIds] = useState({
    provinsiId: "",
    kotaId: "",
    kecamatanId: "",
  });

  /* ---------- wizard wilayah (full-page) ---------- */
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(0);
  const [staged, setStaged] = useState({
    provinsiId: "",
    provinsi: "",
    kotaId: "",
    kota: "",
    kecamatanId: "",
    kecamatan: "",
  });

  const [options, setOptions] = useState<RegionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* ---------- peta ---------- */
  const [coords, setCoords] = useState<LatLngExpression>(DEFAULT_COORDS);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [locating, setLocating] = useState(false);

  const [addressLabel, setAddressLabel] = useState<
    "rumah" | "kantor" | "lainnya" | null
  >(null);

  const showMap = Boolean(form.provinsi && form.kota && form.kecamatan);
  const canInputAddress = Boolean(form.kecamatan);

  const isFormComplete = Boolean(
    form.namaLengkap.trim().length >= 3 &&
    showMap &&
    form.alamat.trim().length >= 5 &&
    /^\d{1,3}$/.test(form.rt) &&
    /^\d{1,3}$/.test(form.rw) &&
    /^\d{8,15}$/.test(form.noHp) &&
    addressLabel,
  );

  /* ===================== buka / tutup wizard ===================== */
  function openWizard() {
    setStaged({
      provinsiId: ids.provinsiId,
      provinsi: form.provinsi,
      kotaId: ids.kotaId,
      kota: form.kota,
      kecamatanId: ids.kecamatanId,
      kecamatan: form.kecamatan,
    });

    if (!ids.provinsiId) {
      setWizardStep(0);
    } else if (!ids.kotaId) {
      setWizardStep(1);
    } else {
      setWizardStep(2);
    }

    setSearch("");
    setError("");
    setWizardOpen(true);
  }

  function closeWizard() {
    setWizardOpen(false);
  }

  /* ===================== fetch wilayah sesuai step wizard ===================== */
  useEffect(() => {
    if (!wizardOpen) return;

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
  }, [wizardOpen, wizardStep, staged.provinsiId, staged.kotaId]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((o) =>
      o.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [options, search]);

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
    } else if (wizardStep === 1) {
      setStaged((s) => ({
        ...s,
        kotaId: item.id,
        kota: item.name,
        kecamatanId: "",
        kecamatan: "",
      }));
    } else {
      setStaged((s) => ({
        ...s,
        kecamatanId: item.id,
        kecamatan: item.name,
      }));
    }
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

    setForm((f) => ({
      ...f,
      provinsi: toTitleCase(staged.provinsi),
      kota: toTitleCase(staged.kota),
      kecamatan: toTitleCase(staged.kecamatan),
    }));

    setIds({
      provinsiId: staged.provinsiId,
      kotaId: staged.kotaId,
      kecamatanId: staged.kecamatanId,
    });

    setWizardOpen(false);
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

  /* ===================== geocoding ===================== */
  useEffect(() => {
    if (!showMap) return;

    const query = `${form.kecamatan}, ${form.kota}, ${form.provinsi}, Indonesia`;
    setGeocoding(true);
    setGeocodeError("");

    const controller = new AbortController();

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { signal: controller.signal, headers: { Accept: "application/json" } },
    )
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mencari lokasi");
        return res.json();
      })
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoords({ lat, lng: lon });
        } else {
          setGeocodeError("Lokasi tidak ditemukan, silakan geser peta manual.");
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setGeocodeError("Gagal memuat peta lokasi.");
        }
      })
      .finally(() => setGeocoding(false));

    return () => controller.abort();
  }, [form.provinsi, form.kota, form.kecamatan, showMap]);

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Perangkat tidak mendukung GPS.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords: gps }) => {
        setCoords({ lat: gps.latitude, lng: gps.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Silakan aktifkan izin lokasi untuk menggunakan fitur ini.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const wilayahSummaryPrimary = form.kecamatan;

  const wilayahSummarySecondary =
    form.kota && form.provinsi ? `${form.kota}, ${form.provinsi}` : "";

  /* ===================== render ===================== */
  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10 sticky top-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>

        <h1 className="text-[15px] font-bold text-gray-800">Tambah Alamat</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="py-4 space-y-3">
          {/* ─── Layer 1: Form Card ─── */}
          <div className="bg-white overflow-hidden">
            <div className="px-4 py-4">
              <div className="space-y-3">
                {/* Nama Lengkap */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500">
                    Nama Lengkap
                  </label>

                  <div className="flex items-center border-b border-gray-100 pb-3">
                    <input
                      type="text"
                      maxLength={50}
                      placeholder="Masukkan nama lengkap"
                      value={form.namaLengkap}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          namaLengkap: e.target.value.slice(0, 50),
                        })
                      }
                      className="w-full bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Nomor HP */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500">
                    Nomor HP
                  </label>

                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Phone size={14} className="shrink-0 text-gray-400" />

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={15}
                      placeholder="08xxxxxxxxxx"
                      value={form.noHp}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          noHp: e.target.value.replace(/\D/g, "").slice(0, 15),
                        })
                      }
                      className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Wilayah */}
                <button
                  type="button"
                  onClick={openWizard}
                  className="w-full flex items-center justify-between py-2 border-b border-gray-100 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-500">
                      Wilayah
                    </p>

                    {wilayahSummaryPrimary ? (
                      <>
                        <p className="mt-1 truncate text-[13px] font-medium text-gray-800">
                          Kecamatan {wilayahSummaryPrimary}
                        </p>

                        <p className="truncate text-[11px] text-gray-500">
                          {wilayahSummarySecondary}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-[13px] text-gray-400">
                        Pilih Provinsi, Kota/Kabupaten, Kecamatan
                      </p>
                    )}
                  </div>

                  <ChevronRight
                    size={18}
                    className="ml-2 shrink-0 text-gray-300 self-end mb-0.5"
                  />
                </button>

                {/* Nama Jalan + RT RW */}
                <div className="grid grid-cols-[1fr_90px] gap-3">
                  {/* Nama Jalan */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500">
                      Nama Jalan & No. Rumah
                    </label>

                    <div
                      className={`border-b pb-2 transition-colors ${
                        canInputAddress
                          ? "border-gray-100"
                          : "border-gray-100 bg-gray-50 rounded-md px-2"
                      }`}
                    >
                      <input
                        disabled={!canInputAddress}
                        type="text"
                        maxLength={30}
                        placeholder={
                          canInputAddress
                            ? "Contoh: Jl. Melati No.15"
                            : "Isi wilayah terlebih dahulu"
                        }
                        value={form.alamat}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            alamat: e.target.value.slice(0, 30),
                          })
                        }
                        className={`w-full bg-transparent text-[13px] outline-none placeholder:text-gray-400 ${
                          canInputAddress
                            ? "text-gray-800"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>

                  {/* RT / RW */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500">
                      RT / RW
                    </label>

                    <div
                      className={`flex items-center border-b pb-2 transition-colors ${
                        canInputAddress
                          ? "border-gray-100"
                          : "border-gray-100 bg-gray-50 rounded-md px-1"
                      }`}
                    >
                      <input
                        disabled={!canInputAddress}
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder="001"
                        value={form.rt}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            rt: e.target.value.replace(/\D/g, "").slice(0, 3),
                          })
                        }
                        className={`w-8 translate-y-[1.5px] bg-transparent text-center text-[12px] outline-none placeholder:text-gray-400 ${
                          canInputAddress
                            ? "text-gray-800"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      />

                      <span className="mx-1 text-gray-300 translate-y-[1.5px]">
                        /
                      </span>

                      <input
                        disabled={!canInputAddress}
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder="001"
                        value={form.rw}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            rw: e.target.value.replace(/\D/g, "").slice(0, 3),
                          })
                        }
                        className={`w-8 translate-y-[1px] bg-transparent text-center text-[13px] outline-none placeholder:text-gray-400 ${
                          canInputAddress
                            ? "text-gray-800"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Layer 2: Map Card (terpisah) ─── */}
          {showMap && (
            <div className="bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-400">
              {/* Map header */}
              <div className="px-4 pt-3 flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-gray-800">
                  Titik Alamat
                </h3>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1 px-1.5 py-1 text-[11px] font-semibold text-emerald-700 disabled:text-gray-400 disabled:cursor-default active:opacity-70 transition-colors"
                >
                  {locating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Mencari Lokasi...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={13} strokeWidth={2.2} />
                      <span>Lokasi Saat Ini</span>
                    </>
                  )}
                </button>
              </div>

              {/* Map container — isolation layer, tidak terpengaruh overflow parent */}
              <div className="px-2 pb-2">
                <AddressMap
                  coords={coords}
                  geocoding={geocoding}
                  geocodeError={geocodeError}
                />
              </div>

              <div className="px-4 pb-3">
                <p className="mb-2 text-[11px] font-semibold text-gray-500">
                  Tandai sebagai <span className="text-red-500">*</span>
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddressLabel("rumah")}
                    className={`min-w-[68px] h-7 rounded-lg border px-3 text-[11px] font-medium transition-colors ${
                      addressLabel === "rumah"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 active:bg-gray-50"
                    }`}
                  >
                    Rumah
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddressLabel("kantor")}
                    className={`min-w-[68px] h-7 rounded-lg border px-3 text-[11px] font-medium transition-colors ${
                      addressLabel === "kantor"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 active:bg-gray-50"
                    }`}
                  >
                    Kantor
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddressLabel("lainnya")}
                    className={`min-w-[68px] h-7 rounded-lg border px-3 text-[11px] font-medium transition-colors ${
                      addressLabel === "lainnya"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 active:bg-gray-50"
                    }`}
                  >
                    Lainnya
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <button
          disabled={!isFormComplete}
          className={`w-full py-3 rounded-lg text-[13px] font-bold transition-all ${
            isFormComplete
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Simpan Alamat
        </button>
      </div>

      {/* ===================== Full-Page Wizard: Provinsi -> Kota -> Kecamatan ===================== */}
      {wizardOpen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          {/* Wizard header */}
          <div className="px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 bg-white z-10">
            <button
              onClick={wizardStep === 0 ? closeWizard : handleBack}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
            >
              {wizardStep === 0 ? (
                <X size={18} className="text-gray-700" />
              ) : (
                <ArrowLeft size={18} className="text-gray-700" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[14px] font-bold text-gray-800">
                {currentStepLabel}
              </h1>
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

            {!loading && !error && filteredOptions.length === 0 && (
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
                    className={`w-full flex items-center justify-between px-4 py-3 text-[13px] border-b border-gray-50 transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <span>{item.name}</span>
                    {isSelected && (
                      <Check size={16} className="text-emerald-600" />
                    )}
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
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
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
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Terapkan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
