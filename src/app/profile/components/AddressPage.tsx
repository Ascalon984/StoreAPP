import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft,
  MapPin,
  ChevronDown,
  Search,
  X,
  Check,
  Loader2,
  Plus,
  Minus,
  LocateFixed,
} from "lucide-react";
import type { Map as LeafletMap, Marker, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface AddressPageProps {
  onClose: () => void;
}

interface RegionItem {
  id: string;
  name: string;
}

type PickerLevel = "provinsi" | "kota" | "kecamatan" | null;

const WILAYAH_BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";
const DEFAULT_COORDS: LatLngExpression = { lat: -6.2088, lng: 106.8456 };
const DEFAULT_ZOOM = 15;

export default function AddressPage({ onClose }: AddressPageProps) {
  const [form, setForm] = useState({
    provinsi: "",
    kota: "",
    kecamatan: "",

    alamat: "", // jalan + nomor rumah
    rt: "",
    rw: "",
  });

  const [ids, setIds] = useState({
    provinsiId: "",
    kotaId: "",
    kecamatanId: "",
  });

  const [activePicker, setActivePicker] = useState<PickerLevel>(null);
  const [options, setOptions] = useState<RegionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* ---------- peta ---------- */
  const [coords, setCoords] = useState<LatLngExpression>(DEFAULT_COORDS);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");

  const homeCoordsRef = useRef<LatLngExpression>(DEFAULT_COORDS);
  const [locating, setLocating] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const showMap = Boolean(form.provinsi && form.kota && form.kecamatan);
  const canInputAddress = Boolean(form.kecamatan);

  const isFormComplete = Boolean(
    showMap &&
    form.alamat.trim().length >= 5 &&
    /^\d{1,3}$/.test(form.rt) &&
    /^\d{1,3}$/.test(form.rw),
  );

  /* ===================== fetch wilayah ===================== */
  useEffect(() => {
    if (!activePicker) return;

    let url = "";
    if (activePicker === "provinsi") {
      url = `${WILAYAH_BASE}/provinces.json`;
    } else if (activePicker === "kota") {
      url = `${WILAYAH_BASE}/regencies/${ids.provinsiId}.json`;
    } else if (activePicker === "kecamatan") {
      url = `${WILAYAH_BASE}/districts/${ids.kotaId}.json`;
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
  }, [activePicker, ids.provinsiId, ids.kotaId]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((o) =>
      o.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [options, search]);

  function handleSelect(item: RegionItem) {
    if (activePicker === "provinsi") {
      setForm((f) => ({ ...f, provinsi: item.name, kota: "", kecamatan: "" }));
      setIds({ provinsiId: item.id, kotaId: "", kecamatanId: "" });
    } else if (activePicker === "kota") {
      setForm((f) => ({ ...f, kota: item.name, kecamatan: "" }));
      setIds((prev) => ({ ...prev, kotaId: item.id, kecamatanId: "" }));
    } else if (activePicker === "kecamatan") {
      setForm((f) => ({ ...f, kecamatan: item.name }));
      setIds((prev) => ({ ...prev, kecamatanId: item.id }));
    }
    setActivePicker(null);
  }

  const pickerTitle =
    activePicker === "provinsi"
      ? "Pilih Provinsi"
      : activePicker === "kota"
        ? "Pilih Kota / Kabupaten"
        : activePicker === "kecamatan"
          ? "Pilih Kecamatan"
          : "";

  /* ===================== geocoding (Trigger: showMap) ===================== */
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
          const newCoords: LatLngExpression = { lat, lng: lon };
          setCoords(newCoords);
          homeCoordsRef.current = newCoords;
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
  }, [form.provinsi, form.kota, form.kecamatan]);

  /* ===================== init peta (sekali) ===================== */
  useEffect(() => {
    if (!showMap) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    let isMounted = true;

    import("leaflet").then((leaflet) => {
      if (!isMounted) return;
      const L = leaflet.default || leaflet;

      const markerIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const map = L.map(mapContainerRef.current!, {
        center: coords,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: false,
        keyboard: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(coords, {
        icon: markerIcon,
        draggable: false,
      }).addTo(map);

      mapRef.current = map;
      markerRef.current = marker;

      setTimeout(() => map.invalidateSize(), 200);
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap]);

  /* ===================== update posisi peta ===================== */
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView(coords, mapRef.current.getZoom());
      markerRef.current.setLatLng(coords);
    }
  }, [coords]);

  /* ===================== handler tombol locate ===================== */
  function handleLocate() {
    if (!mapRef.current) return;
    setLocating(true);
    mapRef.current.flyTo(homeCoordsRef.current, DEFAULT_ZOOM, {
      duration: 0.6,
    });
    setTimeout(() => setLocating(false), 600);
  }

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

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-2 py-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-2 pt-3 pb-3">
              <h2 className="text-[13px] font-bold text-gray-800 mb-4">
                Detail Alamat
              </h2>

              <div className="space-y-4">
                {/* Provinsi */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-500">
                    Provinsi
                  </label>
                  <button
                    type="button"
                    onClick={() => setActivePicker("provinsi")}
                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-[13px] transition-colors hover:border-gray-300 active:bg-gray-50 focus:outline-none focus:border-emerald-500"
                  >
                    <span
                      className={
                        form.provinsi ? "text-gray-800" : "text-gray-400"
                      }
                    >
                      {form.provinsi || "-- Pilih Provinsi --"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${activePicker === "provinsi" ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* Kota / Kabupaten */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-500">
                    Kota / Kabupaten
                  </label>
                  <button
                    type="button"
                    disabled={!form.provinsi}
                    onClick={() => setActivePicker("kota")}
                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-[13px] transition-colors hover:border-gray-300 active:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed focus:outline-none focus:border-emerald-500"
                  >
                    <span
                      className={form.kota ? "text-gray-800" : "text-gray-400"}
                    >
                      {form.kota || "-- Pilih Kota / Kabupaten --"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${activePicker === "kota" ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* Kecamatan */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-500">
                    Kecamatan
                  </label>
                  <button
                    type="button"
                    disabled={!form.kota}
                    onClick={() => setActivePicker("kecamatan")}
                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-[13px] transition-colors hover:border-gray-300 active:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed focus:outline-none focus:border-emerald-500"
                  >
                    <span
                      className={
                        form.kecamatan ? "text-gray-800" : "text-gray-400"
                      }
                    >
                      {form.kecamatan || "-- Pilih Kecamatan --"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${activePicker === "kecamatan" ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* No. Rumah & RT/RW */}
                <div className="grid grid-cols-[2.4fr_1fr] gap-3">
                  {/* No. Rumah */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500">
                      Nama Jalan & No. Rumah
                    </label>

                    <input
                      type="text"
                      disabled={!canInputAddress}
                      maxLength={30}
                      placeholder="Contoh: Jl. Melati No.15"
                      value={form.alamat}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          alamat: e.target.value.slice(0, 30),
                        })
                      }
                      className={`
                        w-full h-9 px-3 text-[12.5px]
                        rounded-lg border outline-none transition-colors
                        ${
                          canInputAddress
                            ? "bg-white border-gray-200 text-gray-800 focus:border-emerald-500"
                            : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                        }
                        placeholder:text-gray-400
                      `}
                    />
                  </div>

                  {/* RT / RW */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500">
                      RT / RW
                    </label>

                    <div
                      className={`
                        flex items-center h-9 rounded-lg border px-2 transition-colors
                        ${
                          canInputAddress
                            ? "bg-white border-gray-200 focus-within:border-emerald-500"
                            : "bg-gray-50 border-gray-200"
                        }
                      `}
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
                        className="
                          w-10 bg-transparent text-center text-[12.5px]
                          outline-none
                          placeholder:text-gray-400
                          disabled:text-gray-400
                          disabled:cursor-not-allowed
                        "
                      />

                      <span className="mx-1 text-gray-400 select-none">/</span>

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
                        className="
                          w-10 bg-transparent text-center text-[12.5px]
                          outline-none
                          placeholder:text-gray-400
                          disabled:text-gray-400
                          disabled:cursor-not-allowed
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================== PETA ===================== */}
            {showMap && (
              <div className="mt-4 px-1 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-full h-[220px] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden relative">
                  <div ref={mapContainerRef} className="absolute inset-0 z-0" />

                  {geocoding && (
                    <div className="absolute inset-0 z-10 bg-white/70 flex flex-col items-center justify-center gap-2">
                      <Loader2
                        size={20}
                        className="animate-spin text-emerald-600"
                      />
                      <span className="text-[11px] text-gray-500">
                        Mencari lokasi...
                      </span>
                    </div>
                  )}

                  {geocodeError && !geocoding && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 px-6 text-center">
                      <MapPin size={18} className="text-amber-500" />
                      <span className="text-[11px] text-amber-600 font-medium">
                        {geocodeError}
                      </span>
                    </div>
                  )}

                  {/* Tombol kontrol peta */}
                  <div className="absolute bottom-2 right-2 z-20 flex flex-col items-center overflow-hidden rounded-[8px] bg-white shadow-md border border-gray-200">
                    <button
                      type="button"
                      onClick={() => mapRef.current?.zoomIn()}
                      className="flex h-8 w-8 items-center justify-center active:bg-gray-100 transition-colors"
                      aria-label="Zoom in"
                    >
                      <Plus size={14} strokeWidth={2.6} />
                    </button>
                    <div className="w-full h-px bg-gray-200" />
                    <button
                      type="button"
                      onClick={() => mapRef.current?.zoomOut()}
                      className="flex h-8 w-8 items-center justify-center active:bg-gray-100 transition-colors"
                      aria-label="Zoom out"
                    >
                      <Minus size={14} strokeWidth={2.6} />
                    </button>
                    <div className="w-full h-px bg-gray-200" />
                    <button
                      type="button"
                      onClick={handleLocate}
                      className={`flex h-8 w-8 items-center justify-center transition-colors ${
                        locating
                          ? "bg-emerald-50 text-emerald-600"
                          : "active:bg-gray-100"
                      }`}
                      aria-label="Kembali ke lokasi alamat"
                    >
                      {locating ? (
                        <Loader2
                          size={14}
                          strokeWidth={2.6}
                          className="animate-spin"
                        />
                      ) : (
                        <LocateFixed size={14} strokeWidth={2.6} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        <button
          disabled={!isFormComplete}
          className={`w-full py-3 rounded-xl text-[13px] font-bold transition-all ${
            isFormComplete
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Simpan Alamat
        </button>
      </div>

      {/* ===================== Bottom Sheet Picker ===================== */}
      {activePicker && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={() => setActivePicker(null)}
          />
          <div className="relative h-[80vh] bg-white rounded-t-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="pt-2 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="sticky top-0 z-10 bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-[14px] font-bold text-gray-800">
                  {pickerTitle}
                </h3>
                <button
                  onClick={() => setActivePicker(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="px-4 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <Search size={14} className="text-gray-400" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Cari ${pickerTitle.toLowerCase()}...`}
                    className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-2 pb-4">
              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-[12px]">Memuat data...</span>
                </div>
              )}

              {!loading && error && (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
                  <span className="text-[12px] text-red-500">{error}</span>
                  <button
                    onClick={() => setActivePicker(activePicker)}
                    className="text-[12px] font-semibold text-emerald-600"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {!loading && !error && filteredOptions.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-[12px] text-gray-400">
                  Tidak ditemukan.
                </div>
              )}

              {!loading &&
                !error &&
                filteredOptions.map((item) => {
                  const isSelected =
                    (activePicker === "provinsi" &&
                      form.provinsi === item.name) ||
                    (activePicker === "kota" && form.kota === item.name) ||
                    (activePicker === "kecamatan" &&
                      form.kecamatan === item.name);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
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
          </div>
        </div>
      )}
    </div>
  );
}
