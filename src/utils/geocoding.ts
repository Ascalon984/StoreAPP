"use client";

// geocodeRegion: mencari koordinat dari gabungan teks kecamatan, kota, provinsi
export async function geocodeRegion(
  query: string,
  signal?: AbortSignal,
): Promise<{ lat: number; lng: number } | null> {
  // Fungsi geocode dengan Nominatim
  const geocodeWithNominatim = async () => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=id&countrycodes=id`,
      {
        signal,
        headers: { Accept: "application/json" },
      },
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  };

  // Fungsi geocode dengan Geoapify (fallback)
  const geocodeWithGeoapify = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!apiKey) return null;

    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${apiKey}&limit=1&lang=id&country=ID`,
      { signal, headers: { Accept: "application/json" } },
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (data?.features?.length > 0) {
      return {
        lat: data.features[0].properties.lat,
        lng: data.features[0].properties.lon,
      };
    }
    return null;
  };

  // Jalankan dengan cascade fallback
  const result = await geocodeWithNominatim();
  if (result) return result;

  return await geocodeWithGeoapify();
}

// geocodePrecise: mencari koordinat spesifik berdasarkan alamat lengkap (dengan viewbox)
export async function geocodePrecise(
  query: string,
  center: { lat: number; lng: number },
  signal?: AbortSignal,
): Promise<{ lat: number; lng: number } | null> {
  const delta = 0.15;
  const viewbox = [
    center.lng - delta, // left (lon min)
    center.lat + delta, // top (lat max)
    center.lng + delta, // right (lon max)
    center.lat - delta, // bottom (lat min)
  ].join(",");

  // 1. Coba Nominatim dulu, dibatasi area (bounded)
  const nomRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=id&countrycodes=id&viewbox=${viewbox}&bounded=1`,
    { signal, headers: { Accept: "application/json" } },
  );

  if (nomRes.ok) {
    const data = await nomRes.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  }

  // 2. Fallback Geoapify, dibatasi area yang sama (filter=rect)
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  if (!apiKey) return null;

  const rect = [
    center.lng - delta,
    center.lat - delta,
    center.lng + delta,
    center.lat + delta,
  ].join(",");

  const geoRes = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${apiKey}&limit=1&lang=id&country=ID&filter=rect:${rect}&bias=rect:${rect}`,
    { signal, headers: { Accept: "application/json" } },
  );

  if (!geoRes.ok) return null;
  const geoData = await geoRes.json();

  if (geoData?.features?.length > 0) {
    return {
      lat: geoData.features[0].properties.lat,
      lng: geoData.features[0].properties.lon,
    };
  }

  return null;
}

export interface ReverseGeocodeResult {
  provinsi: string | null;
  kota: string | null;
  kecamatan: string | null;
  street: string | null;
  houseNumber: string | null;
}

// reverseGeocode: Menerjemahkan koordinat GPS ke data wilayah dan jalan
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  // 1. Reverse Geocoding Nominatim (Primary)
  const nomRes = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=id`,
    {
      headers: { Accept: "application/json" },
    },
  );

  if (!nomRes.ok) {
    throw new Error("Gagal reverse geocoding");
  }

  const nomData = await nomRes.json();
  const addr = nomData.address ?? {};

  // Ekstraksi nama jalan yang lebih robust dari Nominatim
  let street =
    addr.road ??
    addr.street ??
    addr.pedestrian ??
    addr.residential ??
    addr.path ??
    null;

  let houseNumber = addr.house_number ?? null;

  // 2. Fallback Geoapify untuk nama jalan
  if (!street) {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
      if (apiKey) {
        const geoRes = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${apiKey}&lang=id`,
          {
            headers: { Accept: "application/json" },
          },
        );

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const props = geoData.features?.[0]?.properties ?? {};

          street =
            props.street ??
            props.road ??
            props.addr_street ??
            props.name ??
            street;

          houseNumber =
            props.housenumber ??
            props.house_number ??
            props.addr_housenumber ??
            houseNumber;
        } else {
          console.error(
            "Geoapify reverse failed:",
            geoRes.status,
            await geoRes.text(),
          );
        }
      }
    } catch (err) {
      console.error("Geoapify reverse fallback error:", err);
    }
  }

  return {
    provinsi: addr.state ?? null,
    kota: addr.city ?? addr.regency ?? addr.county ?? addr.town ?? null,
    kecamatan:
      addr.city_district ??
      addr.district ??
      addr.suburb ??
      addr.village ??
      addr.municipality ??
      null,
    street,
    houseNumber,
  };
}
