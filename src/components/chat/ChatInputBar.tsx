"use client";

import { Paperclip, SendHorizontal } from "lucide-react";

interface ChatInputBarProps {
  inputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onPickAttachment: () => void;
  attachmentPreview: string | null;
  onClearAttachment: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function ChatInputBar({
  inputText,
  onInputChange,
  onSend,
  onPickAttachment,
  attachmentPreview,
  onClearAttachment,
  inputRef,
}: ChatInputBarProps) {
  const canSend = inputText.trim() || attachmentPreview;

  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-100">
      {/* ── Attachment Preview ── */}
      {attachmentPreview && (
        <div className="px-3 pt-2 pl-[44px]">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachmentPreview}
              alt="Preview"
              className="
                w-12 h-12
                rounded-lg
                object-cover
                border border-gray-200
              "
            />

            <button
              onClick={onClearAttachment}
              aria-label="Hapus lampiran"
              className="
                absolute -top-1.5 -right-1.5
                w-4.5 h-4.5
                rounded-full
                bg-red-500
                text-white
                text-[9px]
                flex items-center justify-center
                shadow-sm
              "
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Input Row ── */}
      <div className="flex items-end gap-1.5 px-3 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        {/* Attachment Button */}
        <button
          onClick={onPickAttachment}
          aria-label="Lampirkan gambar"
          className="
            p-2
            text-gray-500
            hover:text-gray-700
            transition-colors
            flex-shrink-0
            mb-[2px]
          "
        >
          <Paperclip size={20} strokeWidth={2} />
        </button>

        {/* ── Composer ── */}
        <div
          className="
            flex-1
            flex items-end
            bg-gray-50
            rounded-2xl
            border border-gray-200
            overflow-hidden
            transition-colors
            focus-within:border-gray-300
          "
        >
          {/* Textarea Area */}
          <div className="flex-1 px-3 py-1.5">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={onInputChange}
              placeholder="Ketik pesan..."
              rows={1}
              className="
  w-full
  resize-none
  bg-transparent
  text-[14px]
  text-gray-800
  placeholder:text-gray-400
  outline-none
  leading-relaxed
  max-h-[96px]
"
              style={{
                minHeight: "26px",
              }}
            />
          </div>

          {/* Send Area */}
          <div className="flex items-end px-2 pb-1">
            <button
              onClick={onSend}
              disabled={!canSend}
              aria-label="Kirim pesan"
              className={`
      w-8 h-8
      rounded-full
      flex items-center justify-center
      flex-shrink-0
      mb-[2px]
      transition-all duration-200
      ${
        canSend
          ? "bg-[#D89B2B] text-white active:scale-90"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
      }
    `}
            >
              <SendHorizontal
                size={18}
                strokeWidth={1.8}
                className="-rotate-12"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
