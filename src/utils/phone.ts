export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  // ======================
  // Input diawali 08 (fallback tampilan, jarang kepakai
  // karena parsePhoneInput sudah normalisasi begitu lengkap)
  // ======================
  if (digits.startsWith("08")) {
    if (digits.length < 12) {
      return digits;
    }
    const local = digits.slice(1);
    return `(+62) ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
  }

  // ======================
  // Input diawali 62
  // ======================
  if (digits.startsWith("62")) {
    if (digits.length < 13) {
      return digits;
    }
    const local = digits.slice(2);
    return `(+62) ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
  }

  return digits;
}

export function parsePhoneInput(raw: string, currentValue: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // ========= Awalan 0 / 08 =========
  if (digits.startsWith("0")) {
    if (digits.length === 1) {
      return digits; // "0"
    }

    if (digits[1] !== "8") {
      return currentValue;
    }

    const capped = digits.slice(0, 12); // "0" + 11 digit lokal

    // Belum lengkap → simpan mentah sesuai ketikan user (UX asli, no jump)
    if (capped.length < 12) {
      return capped;
    }

    // Sudah lengkap (12 digit) → normalisasi ke kanonik "62xxxxxxxxxxx"
    const local = capped.slice(1); // 11 digit lokal, tanpa "0"
    return "62" + local;
  }

  // ========= Awalan 6 / 62 =========
  if (digits.startsWith("6")) {
    if (digits.length === 1) {
      return digits;
    }

    if (digits[1] !== "2") {
      return currentValue;
    }

    // maksimal 13 digit (62 + 11 digit lokal)
    return digits.slice(0, 13);
  }

  return currentValue;
}
