export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  // ======================
  // Input diawali 08
  // ======================
  if (digits.startsWith("08")) {
    // Belum lengkap → tampilkan apa adanya
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
    // Belum lengkap → tampilkan apa adanya
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
    // ketik "0"
    if (digits.length === 1) {
      return digits;
    }

    // harus 08
    if (digits[1] !== "8") {
      return currentValue;
    }

    // maksimal 12 digit
    return digits.slice(0, 12);
  }

  // ========= Awalan 6 / 62 =========
  if (digits.startsWith("6")) {
    // ketik "6"
    if (digits.length === 1) {
      return digits;
    }

    // harus 62
    if (digits[1] !== "2") {
      return currentValue;
    }

    // maksimal 13 digit (62 + 11 digit lokal)
    return digits.slice(0, 13);
  }

  return currentValue;
}
