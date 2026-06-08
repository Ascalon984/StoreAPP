import { QuickReply } from "./types";

export function getQuickReplies(
  source: "profile" | "product" | "order",
  orderStatus?: "pending" | "processing" | "completed",
): QuickReply[] {
  if (source === "profile") {
    return [
      {
        id: "qr-p-1",
        text: "Jam layanan",
        context: "profile",
      },
      {
        id: "qr-p-2",
        text: "Metode pembayaran",
        context: "profile",
      },
      {
        id: "qr-p-3",
        text: "Hubungi admin",
        context: "profile",
      },
    ];
  }

  // Future: quick reply khusus halaman produk
  // if (source === "product") {
  //   return [
  //     { id: "qr-pr-1", text: "Cara aktivasi", context: "product" },
  //     { id: "qr-pr-2", text: "Produk original", context: "product" },
  //     { id: "qr-pr-3", text: "Estimasi proses", context: "product" },
  //   ];
  // }

  if (source === "order" && orderStatus === "processing") {
    return [
      {
        id: "qr-o-pr1",
        text: "Status transaksi",
        context: "order",
      },
      {
        id: "qr-o-pr2",
        text: "Belum diterima",
        context: "order",
      },
      {
        id: "qr-o-pr3",
        text: "Hubungi admin",
        context: "order",
      },
    ];
  }

  // Future: quick reply untuk order pending
  // if (source === "order" && orderStatus === "pending") {
  //   return [
  //     { id: "qr-o-p1", text: "Cara pembayaran", context: "order" },
  //     { id: "qr-o-p2", text: "Pembayaran gagal", context: "order" },
  //     { id: "qr-o-p3", text: "Batas pembayaran", context: "order" },
  //   ];
  // }

  // Future: quick reply untuk order completed
  // if (source === "order" && orderStatus === "completed") {
  //   return [
  //     { id: "qr-o-c1", text: "Kode tidak valid", context: "order" },
  //     { id: "qr-o-c2", text: "Produk belum diterima", context: "order" },
  //     { id: "qr-o-c3", text: "Ajukan komplain", context: "order" },
  //   ];
  // }

  return [];
}
