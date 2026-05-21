import { Message } from "./types";

export function generateAgentReply(
  userText: string,
  messageType: "text" | "image" | "product" | "order",
): Message {
  const lower = userText.toLowerCase();

  let text: string;

  if (messageType === "image") {
    text =
      "Terima kasih sudah mengirimkan gambar. Bisa jelaskan lebih detail keluhannya?";
  } else if (messageType === "product") {
    text =
      "Produk ini sangat bagus! Ada pertanyaan atau ingin lanjutkan transaksi?";
  } else if (messageType === "order") {
    text =
      "Pesanan Anda kami catat. Terima kasih telah berbelanja bersama kami!";
  } else if (
    lower.includes("pesanan") ||
    lower.includes("kirim") ||
    lower.includes("where")
  ) {
    text =
      "Pesanan Anda sedang dalam proses pengiriman. Estimasi tiba dalam 1–3 hari kerja. Saya cekkan resinya ya, tunggu sebentar 😊";
  } else if (
    lower.includes("stok") ||
    lower.includes("available") ||
    lower.includes("ada")
  ) {
    text =
      "Stok produk tersebut saat ini tersedia. Silakan langsung pesan sebelum kehabisan ya!";
  } else if (
    lower.includes("bayar") ||
    lower.includes("payment") ||
    lower.includes("transfer") ||
    lower.includes("konfirmasi")
  ) {
    text =
      "Pembayaran Anda sudah kami terima. Pesanan akan segera diproses. Terima kasih!";
  } else if (
    lower.includes("tidak sesuai") ||
    lower.includes("rusak") ||
    lower.includes("salah")
  ) {
    text =
      "Mohon maaf atas ketidaknyamanannya. Bisa kirimkan foto produk yang diterima? Kami akan bantu proses pengembalian atau penggantian.";
  } else {
    const defaults = [
      "Baik, noted ya. Ada yang bisa saya bantu lagi?",
      "Siap, akan saya sampaikan. Terima kasih sudah menghubungi kami 😊",
      "Terima kasih sudah menyampaikan. Mohon tunggu sebentar ya.",
    ];
    text = defaults[Math.floor(Math.random() * defaults.length)];
  }

  return {
    id: crypto.randomUUID(),
    role: "agent",
    type: "text",
    text,
    timestamp: new Date(),
  };
}
