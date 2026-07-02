"use client";

import Link from "next/link";
import { Message } from "@/lib/chat/types";
import { formatRupiah } from "@/lib/utils";

interface ChatProductSnippetProps {
  snippet: NonNullable<Message["productSnippet"]>;
}

export default function ChatProductSnippet({
  snippet,
}: ChatProductSnippetProps) {
  return (
    <Link
      href={`/product/${snippet.slug}`}
      className="flex items-center gap-3 p-1.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
    >
      <div className="w-16 h-16 rounded-lg bg-emerald-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
        {snippet.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={snippet.image}
            alt={snippet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-emerald-400 text-[10px] font-bold text-center px-1 leading-tight">
            {snippet.name.slice(0, 8)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-gray-700 truncate">
          {snippet.name}
        </p>
        <p className="text-[12px] font-semibold text-gray-700 mt-1">
          {formatRupiah(snippet.price)}
        </p>
        <p className="text-[11px] text-emerald-600 mt-0.5">Lihat Produk →</p>
      </div>
    </Link>
  );
}
