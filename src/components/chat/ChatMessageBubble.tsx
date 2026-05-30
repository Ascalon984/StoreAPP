"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Message } from "@/lib/chat/types";
import ChatProductSnippet from "./ChatProductSnippet";
import ChatOrderSnippet from "./ChatOrderSnippet";

interface ChatMessageBubbleProps {
  msg: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function ChatMessageBubble({ msg }: ChatMessageBubbleProps) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  /* ── Product bubble ── */
  if (msg.type === "product" && msg.productSnippet) {
    return (
      <div
        className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1`}
      >
        <div className="max-w-[85%]">
          <ChatProductSnippet snippet={msg.productSnippet} />
          <span
            className={`text-[10px] text-gray-400 mt-1 block ${isUser ? "mr-1 text-right" : "ml-1"}`}
          >
            {formatTime(msg.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  /* ── Order bubble ── */
  if (msg.type === "order" && msg.orderSnippet) {
    return (
      <div
        className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1`}
      >
        <div className="max-w-[85%]">
          <ChatOrderSnippet snippet={msg.orderSnippet} />
          <span
            className={`text-[10px] text-gray-400 mt-1 block ${isUser ? "mr-1 text-right" : "ml-1"}`}
          >
            {formatTime(msg.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  /* ── Image bubble ── */
  if (msg.type === "image" && msg.imageUrl) {
    return (
      <div
        className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1`}
      >
        <div
          className={`max-w-[70%] flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={msg.imageUrl}
            alt="Lampiran"
            className={`rounded-2xl object-cover w-48 h-48 ${isUser ? "opacity-" + (msg.status === "sending" ? "70" : "100") : ""}`}
          />
          <span
            className={`text-[10px] text-gray-400 mt-1 flex items-center gap-0.5 ${isUser ? "mr-1" : "ml-1"}`}
          >
            {formatTime(msg.timestamp)}
            {isUser && msg.status === "sent" && (
              <svg
                width="14"
                height="10"
                viewBox="0 0 16 11"
                className="text-gray-400"
              >
                <path
                  d="M1 5.5L5 9.5L15 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </div>
      </div>
    );
  }

  /* ── Text bubble ── */
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1`}
    >
      <div
        className={`max-w-[85%] flex flex-col ${isUser ? "items-end" : "items-start"} relative group`}
      >
        {/* Bubble */}
        {isUser ? (
          <div
            className={`bg-[#065F46] text-white px-3.5 py-2.5 rounded-2xl rounded-br-sm text-[14px] leading-relaxed break-words [overflow-wrap:anywhere] ${
              msg.status === "sending" ? "opacity-70" : "opacity-100"
            }`}
          >
            {msg.status === "sending" && (
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5 align-middle" />
            )}
            {msg.text}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 shadow-xs px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-[14px] leading-relaxed text-gray-800 break-words [overflow-wrap:anywhere]">
            {msg.text}
          </div>
        )}

        {/* footer row (timestamp + copy) */}
        <div
          className={`mt-1 flex items-center gap-2 text-[10px] text-gray-400 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
            {formatTime(msg.timestamp)}
          </span>

          {/* COPY BUTTON */}
          <button
            onClick={() => handleCopy(msg.text ?? "")}
            className={`
    absolute bottom-1
    opacity-100
    text-gray-400 hover:text-gray-600
    transition
    ${isUser ? "left-1" : "right-1"}
  `}
          >
            {copied ? (
              <Check size={13} className="text-green-500" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
