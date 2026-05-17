import { Message } from '@/lib/chat/types';

interface ChatOrderSnippetProps {
  snippet: NonNullable<Message['orderSnippet']>;
}

export default function ChatOrderSnippet({ snippet }: ChatOrderSnippetProps) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 w-56 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-800">{snippet.orderId}</span>
        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Order</span>
      </div>
      
      {snippet.imageUrls && snippet.imageUrls.length > 0 && (
        <div className="flex gap-1.5 overflow-hidden">
          {snippet.imageUrls.slice(0, 3).map((img, i) => (
            <div key={i} className="w-10 h-10 rounded bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="Product" className="w-full h-full object-cover" />
            </div>
          ))}
          {snippet.imageUrls.length > 3 && (
            <div className="w-10 h-10 rounded bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-500 font-medium">
              +{snippet.imageUrls.length - 3}
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-800 font-medium">
        Total: Rp{snippet.total.toLocaleString('id-ID')}
      </div>
    </div>
  );
}
