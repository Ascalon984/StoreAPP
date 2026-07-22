"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Loader2, MapPin, Phone } from "lucide-react";
import type { LatLngExpression } from "leaflet";
import AddressMap from "./AddressMap";
import AddressWizard, { SelectedRegion, toTitleCase } from "./AddressWizard";

interface AddressPageProps {
  onClose: () => void;
}

const DEFAULT_COORDS: LatLngExpression = { lat: -6.2088, lng: 106.8456 };

import { formatPhoneNumber, parsePhoneInput } from "@/utils/phone";

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
    /^62\d{9,12}$/.test(form.noHp) &&
    addressLabel,
  );

  function openWizard() {
    setWizardOpen(true);
  }

  function closeWizard() {
    setWizardOpen(false);
  }

  function handleApplyWizard(selected: SelectedRegion) {
    setForm((f) => ({
      ...f,
      provinsi: toTitleCase(selected.provinsi),
      kota: toTitleCase(selected.kota),
      kecamatan: toTitleCase(selected.kecamatan),
    }));

    setIds({
      provinsiId: selected.provinsiId,
      kotaId: selected.kotaId,
      kecamatanId: selected.kecamatanId,
    });

    setWizardOpen(false);
  }

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

  function handlePhoneChange(raw: string) {
    const newValue = parsePhoneInput(raw, form.noHp);
    setForm((f) => ({ ...f, noHp: newValue }));
  }

  const wilayahSummaryPrimary = form.kecamatan;

  const wilayahSummarySecondary =
    form.kota && form.provinsi ? `${form.kota}, ${form.provinsi}` : "";

  const initialRegionValues: SelectedRegion = {
    provinsiId: ids.provinsiId,
    provinsi: form.provinsi,
    kotaId: ids.kotaId,
    kota: form.kota,
    kecamatanId: ids.kecamatanId,
    kecamatan: form.kecamatan,
  };

  /* ===================== render ===================== */
  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-0.5 shadow-sm z-30 sticky top-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors -translate-x-[5px]"
        >
          <ArrowLeft size={22} className="text-gray-700" />
        </button>

        <h1 className="text-[15px] font-bold text-gray-700 -translate-x-[2px]">
          Tambah Alamat
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="py-4 space-y-3">
          {/* ─── Layer 1: Form Card ─── */}
          <div className="bg-white overflow-hidden">
            <div className="px-4 py-4">
              <div className="space-y-4">
                {/* Nama Lengkap */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-700">
                    Nama Lengkap
                  </label>

                  <div className="flex items-center border-b border-gray-100 pb-1.5">
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
                  <label className="text-[11px] font-semibold text-gray-700">
                    Nomor HP
                  </label>

                  <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
                    <Phone size={14} className="shrink-0 text-gray-400" />

                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="081-2345-6789"
                      value={formatPhoneNumber(form.noHp)}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Wilayah */}
                <button
                  type="button"
                  onClick={openWizard}
                  className="w-full flex items-center justify-between py-1.5 border-b border-gray-100 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-700">
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
                    <label className="text-[11px] font-semibold text-gray-700">
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
                    <label className="text-[11px] font-semibold text-gray-700">
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

          {/* ─── Layer 2: Map Card ─── */}
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

              {/* Map container */}
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
                  {(["rumah", "kantor", "lainnya"] as const).map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setAddressLabel(label)}
                      className={`min-w-[68px] h-7 rounded-lg border px-3 text-[11px] font-medium transition-colors ${
                        addressLabel === label
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 active:bg-gray-50"
                      }`}
                    >
                      {label === "lainnya"
                        ? "Lainnya"
                        : label.charAt(0).toUpperCase() + label.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <button
          disabled={!isFormComplete}
          className={`w-full py-3.5 rounded-lg text-[13.5px] font-bold transition-all ${
            isFormComplete
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Simpan Alamat
        </button>
      </div>

      {/* ===================== Full-Page Wizard ===================== */}
      {wizardOpen && (
        <AddressWizard
          initialValues={initialRegionValues}
          onApply={handleApplyWizard}
          onClose={closeWizard}
        />
      )}
    </div>
  );
}
