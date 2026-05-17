'use client';

import { QuickReply } from '@/lib/chat/types';

interface ChatQuickRepliesProps {
  replies: QuickReply[];
  showFull: boolean;
  showCollapsed: boolean;
  onSelect: (text: string) => void;
}

export default function ChatQuickReplies({ replies, showFull, showCollapsed, onSelect }: ChatQuickRepliesProps) {
  if (!showFull && !showCollapsed) return null;

  if (showFull) {
    return (
      <div className="flex gap-2 overflow-x-auto hide-scrollbar px-1 py-2">
        {replies.map(qr => (
          <button
            key={qr.id}
            onClick={() => onSelect(qr.text)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 text-[12px] font-medium bg-emerald-50/50 hover:bg-emerald-100 active:scale-95 transition-all whitespace-nowrap"
          >
            {qr.text}
          </button>
        ))}
      </div>
    );
  }

  // collapsed — 1 row, reduced opacity
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar px-1 py-1.5 opacity-60">
      {replies.slice(0, 3).map(qr => (
        <button
          key={qr.id}
          onClick={() => onSelect(qr.text)}
          className="flex-shrink-0 px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 text-[11px] font-medium bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all whitespace-nowrap"
        >
          {qr.text}
        </button>
      ))}
    </div>
  );
}
