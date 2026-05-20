"use client";

export default function ChatEmptyState() {
  return (
    <div
      className="
        flex flex-col items-center justify-center
        h-full
        px-6
        overflow-hidden
      "
    >
      <img
        src="/illustrations/CS sevice.svg"
        alt="Customer Service"
        className="
          w-56 h-56 object-contain
          -translate-x-1
        "
      />

      <div className="-mt-2 text-center">
        <h3 className="text-[17px] font-extrabold text-gray-800 leading-tight">
          Ada yang bisa kami bantu?
        </h3>

        <p className="mt-2 text-[13px] leading-snug text-gray-400 font-medium max-w-[240px]">
          Mulai percakapan dengan Customer Service untuk bantuan pesanan atau
          akunmu.
        </p>
      </div>
    </div>
  );
}
