"use client";

import Link from "next/link";
import { Message } from "@/lib/chat/types";
import { formatRupiah } from "@/lib/utils";

interface ChatOrderSnippetProps {
  snippet: NonNullable<Message["orderSnippet"]>;
}

export default function ChatOrderSnippet({ snippet }: ChatOrderSnippetProps) {
  return (
    <Link
      href={`/orders/${snippet.orderId}`}
      className="flex items-center gap-1 p-1 bg-white rounded-xl shadow-sm"
    >
      <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
        {snippet.imageUrls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={snippet.imageUrls[0]}
            alt={`Order ${snippet.orderId}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-gray-400">
            Order
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[9.5px] text-gray-400 truncate">{snippet.orderId}</p>
        <p className="mt-1.5 text-[11px] font-medium text-gray-600 tracking-[0.015em] truncate">
          {snippet.name}
        </p>

        <p className="mt-1.5 text-[10.5px] font-semibold text-gray-600 tracking-[0.015em]">
          {formatRupiah(snippet.total)}
        </p>
      </div>
    </Link>
  );
}
