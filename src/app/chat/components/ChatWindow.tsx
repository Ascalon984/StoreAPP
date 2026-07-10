"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Message } from "@/lib/chat/types";
import { getQuickReplies } from "@/lib/chat/quickReplies";
import { getGreetingMessage } from "@/lib/chat/mockMessages";
import { generateAgentReply } from "@/lib/chat/generateAgentReply";
import { products, mockHighlightProducts } from "@/lib/data";

import ChatHeader from "@/components/chat/ChatHeader";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatDateSeparator from "@/components/chat/ChatDateSeparator";
import ChatTypingIndicator from "@/components/chat/ChatTypingIndicator";
import ChatQuickReplies from "@/components/chat/ChatQuickReplies";
import ChatInputBar from "@/components/chat/ChatInputBar";

const REPLY_DELAY_MIN = 800;
const REPLY_DELAY_MAX = 2200;

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getRandomDelay(): number {
  return (
    Math.floor(Math.random() * (REPLY_DELAY_MAX - REPLY_DELAY_MIN + 1)) +
    REPLY_DELAY_MIN
  );
}

function todayLabel(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface ChatWindowProps {
  seller: { id: string; name: string };
  onBack: () => void;
}

export default function ChatWindow({ seller, onBack }: ChatWindowProps) {
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get("source") as
    | "profile"
    | "product"
    | "order"
    | null;
  const source = sourceParam || "profile";
  const productSlug = searchParams.get("productSlug");
  const orderId = searchParams.get("orderId");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null,
  );

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const greetingShownRef = useRef(false);

  const isCSChat = seller.id === "cs";
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showQuickReplies = isCSChat && userMessageCount === 0;
  const showCollapsedQuick =
    isCSChat && (userMessageCount === 1 || userMessageCount === 2);

  const orderStatusParam =
    (searchParams.get("orderStatus") as
      | "pending"
      | "processing"
      | "completed"
      | null) || null;
  const totalParam = searchParams.get("total");
  const imagesParam = searchParams.get("images");
  const parsedImages = imagesParam
    ? decodeURIComponent(imagesParam).split(",").filter(Boolean)
    : [];
  const parsedTotal = totalParam ? Number(totalParam) : undefined;

  const dynamicQuickReplies = getQuickReplies(
    source,
    orderStatusParam ?? undefined,
  );

  const scrollToBottom = useCallback((force = false) => {
    if (!scrollContainerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } =
      scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    if (isNearBottom || force) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, []);

  /* Load greeting on mount */
  useEffect(() => {
    if (greetingShownRef.current) return;
    greetingShownRef.current = true;

    const mockUser = { username: "aditya99", displayName: "Aditya" };
    const displayName = mockUser.displayName?.trim() || `@${mockUser.username}`;

    if (source === "product" && productSlug) {
      const allProducts = [...products, ...mockHighlightProducts];
      const product = allProducts.find((p) => p.slug === productSlug);
      if (product) {
        const snippet: Message["productSnippet"] = {
          slug: product.slug,
          name: product.name,
          price: product.price,
        };
        setMessages(getGreetingMessage("product", displayName, snippet));
        return;
      }
    }

    const orderNameParam = searchParams.get("orderName"); // atau sumber lain

    if (source === "order" && orderId) {
      const snippet: Message["orderSnippet"] = {
        orderId,
        name: orderNameParam ? decodeURIComponent(orderNameParam) : "Pesanan",
        total: parsedTotal ?? 0,
        imageUrls:
          parsedImages.length > 0
            ? parsedImages
            : ["/products/s1.jpg", "/products/m2.jpg", "/products/k3.jpg"],
      };
      setMessages(getGreetingMessage("order", displayName, undefined, snippet));
      return;
    }

    setMessages(getGreetingMessage("profile", displayName));
  }, [source, productSlug, orderId]);

  /* Auto-scroll on new messages / typing */
  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping, scrollToBottom]);

  /* Textarea auto-resize */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  };

  /* Attachment handling */
  const handlePickAttachment = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentFile(file);
    setAttachmentPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
  };

  /* Send message */
  const handleSend = () => {
    if (isAttachmentTooLarge) return;
    if (!inputText.trim() && !attachmentPreview) return;

    const imageUrl = attachmentPreview ?? undefined;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      type: imageUrl ? "image" : "text",
      text: inputText || undefined,
      imageUrl,
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    clearAttachment();

    if (inputRef.current) inputRef.current.style.height = "auto";

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: "sent" } : m)),
      );
    }, 300);

    const delay = getRandomDelay();
    setIsAgentTyping(true);

    setTimeout(() => {
      setIsAgentTyping(false);
      const agentReply = generateAgentReply(userMsg.text ?? "", userMsg.type);
      setMessages((prev) => [...prev, agentReply]);
      scrollToBottom();
    }, delay);
  };

  /* Quick reply selection */
  const handleQuickReplySelect = (text: string) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const isAttachmentTooLarge =
    attachmentFile != null && attachmentFile.size > MAX_FILE_SIZE;

  return (
    <div
      className="fixed inset-0 flex flex-col z-50"
      style={{
        backgroundImage: `
      linear-gradient(
        to bottom,
        rgba(249,250,251,0.98) 0%,
        rgba(249,250,251,0.85) 20%,
        rgba(249,250,251,0.50) 50%,
        rgba(249,250,251,0.20) 80%,
        rgba(249,250,251,0.05) 100%
      ),
      url('/illustrations/seigaiha.png')
    `,
        backgroundRepeat: "repeat",
        backgroundAttachment: "fixed",
        backgroundSize: "650px",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <ChatHeader
        onBack={onBack}
        isOnline={true}
        name={seller.name}
        isOfficial={seller.id === "cs"}
      />

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <div className="pt-3">
            <ChatDateSeparator label={todayLabel()} />
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} msg={msg} />
            ))}
            {isAgentTyping && <ChatTypingIndicator />}
            <div className="h-4" />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 bg-white">
        {attachmentPreview && (
          <div className="flex items-center gap-3 px-3 pt-2 translate-x-[8px] -translate-y-[4px]">
            <div
              className="
                relative
                w-[88px] h-[88px]
                rounded-lg
                overflow-hidden
                border border-black/5
                shadow-sm
              "
            >
              <img
                src={attachmentPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />

              <button
                onClick={clearAttachment}
                className="
                  absolute top-0.5 right-0.5
                  w-4 h-4 rounded-full
                  bg-rose-600/90 text-white
                  text-[10px]
                  flex items-center justify-center
                  shadow-sm
                "
              >
                ✕
              </button>
            </div>

            <div className="min-w-0 flex-1 pr-[15px] pt-0.5">
              <p className="truncate text-[13px] font-medium text-gray-700">
                {attachmentFile?.name}
              </p>

              <div className="mt-2">
                <div className="flex justify-between">
                  <p className="text-[11px] text-gray-500">Ukuran</p>
                  <p className="text-[11px] text-gray-500">Maks. Ukuran</p>
                </div>

                <div className="mt-1 h-px bg-gray-200 w-full" />

                <div className="mt-1 flex justify-between">
                  <div className="flex items-center gap-1">
                    <p
                      className={`text-[12px] font-medium ${
                        isAttachmentTooLarge
                          ? "text-amber-600"
                          : "text-gray-600"
                      }`}
                    >
                      {attachmentFile && formatFileSize(attachmentFile.size)}
                    </p>

                    {isAttachmentTooLarge && (
                      <AlertTriangle
                        size={13}
                        strokeWidth={2}
                        className="text-amber-600"
                      />
                    )}
                  </div>

                  <p className="text-[12px] font-medium text-gray-600">5 MB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCSChat && (
          <ChatQuickReplies
            replies={dynamicQuickReplies}
            showFull={showQuickReplies}
            showCollapsed={showCollapsedQuick}
            onSelect={handleQuickReplySelect}
          />
        )}

        <ChatInputBar
          inputText={inputText}
          onInputChange={handleInputChange}
          onSend={handleSend}
          onPickAttachment={handlePickAttachment}
          attachmentPreview={attachmentPreview}
          onClearAttachment={clearAttachment}
          inputRef={inputRef}
          isAttachmentTooLarge={isAttachmentTooLarge}
        />
      </div>
    </div>
  );
}
