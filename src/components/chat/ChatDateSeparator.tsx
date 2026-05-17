'use client';

interface ChatDateSeparatorProps {
  label: string;
}

export default function ChatDateSeparator({ label }: ChatDateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex-1 h-px bg-gray-200/70" />
      <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-200/70" />
    </div>
  );
}
