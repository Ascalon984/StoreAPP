"use client";

import { useState, useEffect } from "react";
import { Copy, Check, X } from "lucide-react";
import { Message } from "@/lib/chat/types";
import ChatProductSnippet from "./ChatProductSnippet";
import ChatOrderSnippet from "./ChatOrderSnippet";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
  const [zoomOpen, setZoomOpen] = useState(false);

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
      <>
        <div
          className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1`}
        >
          <div
            className={`max-w-[70%] flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            {/* Bubble wrapper: image + caption inside one rounded container */}
            <div
              className={`
                rounded-2xl
                overflow-hidden
                p-1
                ${
                  isUser
                    ? `bg-[#065F46] ${
                        msg.status === "sending" ? "opacity-70" : "opacity-100"
                      }`
                    : "bg-white border border-gray-100 shadow-xs"
                }
              `}
            >
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="block w-fit max-w-[220px] overflow-hidden rounded-xl focus:outline-none"
                aria-label="Lihat gambar penuh"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={msg.imageUrl}
                  alt="Lampiran"
                  className="block w-auto h-auto max-w-[220px] max-h-[260px] object-contain"
                />
              </button>

              {/* Caption, only if there's text */}
              {msg.text && (
                <div
                  className={`
                    border-t
                    ${isUser ? "border-white/10" : "border-gray-100"}
                    px-2 py-1.5
                    text-[14px]
                    leading-relaxed
                    whitespace-pre-wrap
                    break-words
                    [overflow-wrap:anywhere]
                    ${isUser ? "text-white" : "text-gray-800"}
                  `}
                >
                  {msg.text}
                </div>
              )}
            </div>

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

        {/* ── Full-screen zoom lightbox ── */}
        {zoomOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/90"
            onClick={() => setZoomOpen(false)}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              aria-label="Tutup"
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X size={18} />
            </button>

            {/* Zoom Area */}
            <div
              className="w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                centerOnInit
                centerZoomedOut
                limitToBounds
                doubleClick={{
                  disabled: true,
                }}
                wheel={{
                  disabled: true,
                }}
                pinch={{
                  disabled: false,
                }}
                panning={{
                  disabled: false,
                }}
                velocityAnimation={{
                  disabled: false,
                }}
              >
                <TransformComponent
                  wrapperClass="!w-screen !h-screen"
                  contentClass="flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={msg.imageUrl}
                    alt="Lampiran"
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
        )}
      </>
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
            className={`bg-[#065F46] text-white px-2 py-1.5 rounded-2xl rounded-br-sm text-[14px] leading-relaxed break-words [overflow-wrap:anywhere] ${
              msg.status === "sending" ? "opacity-70" : "opacity-100"
            }`}
          >
            {msg.status === "sending" && (
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5 align-middle" />
            )}
            {msg.text}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 shadow-xs px-2 py-1.5 rounded-2xl rounded-bl-sm text-[14px] leading-relaxed text-gray-800 break-words [overflow-wrap:anywhere]">
            {msg.text}
          </div>
        )}

        {/* footer row (timestamp + copy) */}
        <div
          className={`mt-1 w-full flex items-center text-[10px] text-gray-400 ${
            isUser ? "justify-end" : "justify-between"
          }`}
        >
          <span>{formatTime(msg.timestamp)}</span>

          {!isUser && (
            <button
              onClick={() => handleCopy(msg.text ?? "")}
              aria-label="Salin pesan"
              className="text-gray-400 hover:text-gray-600 active:scale-90 transition"
            >
              {copied ? (
                <Check size={12} className="text-green-500" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
