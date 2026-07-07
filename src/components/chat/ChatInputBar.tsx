"use client";

import { Plus, SendHorizontal } from "lucide-react";

interface ChatInputBarProps {
  inputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onPickAttachment: () => void;
  attachmentPreview: string | null;
  onClearAttachment: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
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
      {/* ── Input Row ── */}
      <div className="flex items-end gap-1.5 px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        {/* Plus */}
        <button
          onClick={onPickAttachment}
          className="
  p-2.5
  text-gray-500
  hover:text-gray-700
  transition-colors
  flex-shrink-0
  self-end
  mb-[2px]
"
        >
          <Plus size={20} strokeWidth={2} />
        </button>

        {/* Composer */}
        <div
          className={`flex-1 flex bg-gray-50 rounded-2xl border border-gray-200 px-3 py-1.5 transition-colors focus-within:border-gray-300 min-h-[38px] ${
            inputText.includes("\n") ? "items-end" : "items-center"
          }`}
        >
          {/* Textarea */}
          <div className="flex-1 flex">
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
          leading-snug
          max-h-[96px]
        "
              style={{ minHeight: "20px" }}
            />
          </div>

          {/* Send Button */}
          <div className="ml-2 flex items-end self-end pb-[2px]">
            <button
              onClick={onSend}
              disabled={!canSend}
              className={`
          w-8 h-8
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          ${
            canSend
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-90 shadow-sm"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
            >
              <SendHorizontal
                size={16}
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
