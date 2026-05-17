'use client';

import { useRef } from 'react';
import { Paperclip, Send } from 'lucide-react';

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
      {/* Attachment preview */}
      {attachmentPreview && (
        <div className="px-3 pt-2">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachmentPreview}
              alt="Preview"
              className="w-14 h-14 rounded-lg object-cover border border-gray-200"
            />
            <button
              onClick={onClearAttachment}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm"
              aria-label="Hapus lampiran"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {/* Attachment button */}
        <button
          onClick={onPickAttachment}
          className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mb-0.5"
          aria-label="Lampirkan gambar"
        >
          <Paperclip size={20} strokeWidth={2} />
        </button>

        {/* Textarea */}
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={onInputChange}
          placeholder="Ketik pesan..."
          rows={1}
          className="flex-1 resize-none bg-gray-50 rounded-2xl px-4 py-2.5 text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-200 transition-shadow leading-relaxed max-h-[96px] overflow-y-auto"
          style={{ minHeight: '42px' }}
        />

        {/* Send button — amber */}
        <button
          onClick={onSend}
          disabled={!canSend}
          aria-label="Kirim pesan"
          className={`p-2.5 rounded-full flex-shrink-0 mb-0.5 transition-all duration-200 ${
            canSend
              ? 'bg-[#D89B2B] text-white hover:bg-[#C48A20] active:scale-90 shadow-sm'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Send size={18} strokeWidth={2.5} className="-rotate-12" />
        </button>
      </div>
    </div>
  );
}
