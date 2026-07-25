"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Plus, Minus, LocateFixed, Loader2 } from "lucide-react";
import type {
  LatLngExpression,
  Marker,
  Map as LeafletMap,
  DivIcon,
} from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─── Pin style injection ─── */
const PIN_STYLE_ID = "address-map-pin-style";
function ensurePinStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(PIN_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PIN_STYLE_ID;
  style.textContent = `
    .custom-emerald-pin {
      background: transparent !important;
      border: none !important;
    }
    .osm-enhanced {
      filter: saturate(1.12) contrast(1.03) brightness(1.005);
    }
    .osm-vignette::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      box-shadow:
        inset 0  1px 4px rgba(0,0,0,.06),
        inset 0 -1px 4px rgba(0,0,0,.04),
        inset 1px  0 3px rgba(0,0,0,.03),
        inset -1px 0 3px rgba(0,0,0,.03);
      border-radius: inherit;
    }
  `;
  document.head.appendChild(style);
}

interface AddressMapProps {
  coords: LatLngExpression;
  geocoding: boolean;
  geocodeError: string;
}

const DEFAULT_ZOOM = 16;
const LOCATE_FLY_DURATION_MS = 600;

export default function AddressMap({
  coords,
  geocoding,
  geocodeError,
}: AddressMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const markerIconRef = useRef<DivIcon | null>(null);
  const homeCoordsRef = useRef<LatLngExpression>(coords);
  const locateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [locating, setLocating] = useState(false);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    homeCoordsRef.current = coords;
  }, [coords]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;

    import("leaflet").then((leaflet) => {
      if (!isMounted || !mapContainerRef.current) return;
      const L = leaflet.default || leaflet;
      ensurePinStyles();

      const markerIcon = L.divIcon({
        className: "custom-emerald-pin",
        html: `
          <div style="width:26px;height:44px;display:flex;flex-direction:column;align-items:center;">
            <svg width="26" height="40" viewBox="0 0 24 38" xmlns="http://www.w3.org/2000/svg"
                 style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.22));">
              <defs>
                <linearGradient id="pinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" />
                  <stop offset="100%" stop-color="#059669" />
                </linearGradient>
              </defs>
              <path d="M12 0C5.4 0 0 5.4 0 12C0 21 12 38 12 38C12 38 24 21 24 12C24 5.4 18.6 0 12 0"
                    fill="url(#pinGrad)" />
              <circle cx="12" cy="12" r="4" fill="white" opacity=".95" />
            </svg>
            <div style="width:12px;height:3px;margin-top:-1px;border-radius:50%;
                        background:rgba(0,0,0,.22);filter:blur(1.2px);"></div>
          </div>
        `,
        iconSize: [26, 44],
        iconAnchor: [13, 42],
      });
      markerIconRef.current = markerIcon;

      const map = L.map(mapContainerRef.current, {
        center: homeCoordsRef.current,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: false,
        keyboard: false,
        preferCanvas: true,
        zoomAnimation: true,
        zoomAnimationThreshold: 4,
        fadeAnimation: true,
        markerZoomAnimation: true,
      });

      const tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          tileSize: 256,
        },
      );
      tileLayer.on("tileerror", () => {
        if (isMounted) setTileError(true);
      });
      tileLayer.addTo(map);

      const marker = L.marker(homeCoordsRef.current, {
        icon: markerIcon,
        draggable: false,
      }).addTo(map);

      mapRef.current = map;
      markerRef.current = marker;

      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    });

    return () => {
      isMounted = false;
      resizeObserver?.disconnect();
      if (locateTimeoutRef.current) {
        clearTimeout(locateTimeoutRef.current);
        locateTimeoutRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const next = coords as { lat: number; lng: number };

    const current = mapRef.current.getCenter();

    const moved =
      Math.abs(current.lat - next.lat) > 0.00001 ||
      Math.abs(current.lng - next.lng) > 0.00001;

    if (moved) {
      mapRef.current.setView(next, mapRef.current.getZoom(), {
        animate: false,
      });
    }

    markerRef.current.setLatLng(next);
  }, [coords]);

  const handleLocate = useCallback(() => {
    if (!mapRef.current) return;
    setLocating(true);
    mapRef.current.flyTo(homeCoordsRef.current, DEFAULT_ZOOM, {
      duration: LOCATE_FLY_DURATION_MS / 1000,
    });
    if (locateTimeoutRef.current) clearTimeout(locateTimeoutRef.current);
    locateTimeoutRef.current = setTimeout(() => {
      setLocating(false);
      locateTimeoutRef.current = null;
    }, LOCATE_FLY_DURATION_MS);
  }, []);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  return (
    <div className="mt-1 px-1 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full aspect-[16/9] min-h-[190px] rounded-lg border border-gray-200 overflow-hidden relative">
        {/* Map container — filter saja, tanpa will-change */}
        <div
          ref={mapContainerRef}
          className="absolute inset-0 z-0 osm-enhanced osm-vignette"
        />

        {geocoding && (
          <div className="absolute inset-0 z-10 bg-white/70 flex flex-col items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin text-emerald-600" />
            <span className="text-[11px] text-gray-500">Mencari lokasi...</span>
          </div>
        )}

        {geocodeError && !geocoding && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 px-6 text-center bg-white/60">
            <MapPin size={18} className="text-amber-500" />
            <span className="text-[11px] text-amber-600 font-medium">
              {geocodeError}
            </span>
          </div>
        )}

        {tileError && !geocoding && !geocodeError && (
          <div className="absolute top-2 left-2 z-10 bg-white/90 rounded-md px-2 py-1 shadow-sm">
            <span className="text-[10px] text-gray-500">
              Sebagian peta gagal dimuat
            </span>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute bottom-2.5 right-2.5 z-20 flex flex-col overflow-hidden rounded-[8px] bg-white/95 border border-gray-200/70">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            aria-label="Zoom in"
          >
            <Plus size={15} strokeWidth={2} />
          </button>
          <div className="h-px bg-gray-200/80" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            aria-label="Zoom out"
          >
            <Minus size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Locate + Attribution */}
        <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={handleLocate}
            className={`
              flex h-8 w-8 items-center justify-center
              rounded-[10px]
              bg-white/95
              border border-gray-200/70
              transition-all duration-200
              ${
                locating
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                  : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
              }
            `}
            aria-label="Kembali ke lokasi alamat"
          >
            {locating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <LocateFixed size={15} strokeWidth={2.5} />
            )}
          </button>

          <span className="text-[9px] font-medium text-gray-400 select-none translate-y-[7px]">
            © OpenStreetMap
          </span>
        </div>
      </div>
    </div>
  );
}
