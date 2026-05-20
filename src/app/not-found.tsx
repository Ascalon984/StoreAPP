import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="
    h-[100dvh]
    bg-white
    flex flex-col items-center justify-center
    px-6
    overflow-hidden
  "
    >
      <img
        src="/illustrations/404 Page not found.svg"
        alt="Halaman tidak ditemukan"
        className="
          w-64 h-64 object-contain
          -translate-x-1
        "
      />

      <div className="-mt-3 flex flex-col items-center text-center">
        <h1 className="text-[22px] font-extrabold text-gray-800 leading-tight">
          Halaman tidak ditemukan
        </h1>

        <p className="mt-2 text-[13px] leading-snug text-gray-400 font-medium max-w-[260px]">
          Halaman yang kamu cari mungkin sudah dipindahkan atau tidak tersedia.
        </p>

        <Link
          href="/"
          className="
            mt-5
            h-11 px-5
            inline-flex items-center justify-center
            rounded-xl
            bg-emerald-600
            text-white text-[13px] font-bold
            active:scale-[0.98]
            transition-transform
          "
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
