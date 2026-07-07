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
        <h3 className="text-[16px] font-semibold text-gray-700 leading-tight">
          Ada yang bisa kami bantu?
        </h3>

        <p className="mt-2 text-[12.5px] leading-snug text-gray-400 font-normal max-w-[240px]">
          Mulai percakapan untuk bantuan terkait pesananmu
        </p>
      </div>
    </div>
  );
}
