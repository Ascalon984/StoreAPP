"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Message } from "@/lib/chat/types";
import { getQuickReplies } from "@/lib/chat/quickReplies";
import { getGreetingMessage } from "@/lib/chat/mockMessages";
import { generateAgentReply } from "@/lib/chat/generateAgentReply";
import { products } from "@/lib/data";

import ChatHeader from "@/components/chat/ChatHeader";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatDateSeparator from "@/components/chat/ChatDateSeparator";
import ChatTypingIndicator from "@/components/chat/ChatTypingIndicator";
import ChatQuickReplies from "@/components/chat/ChatQuickReplies";
import ChatInputBar from "@/components/chat/ChatInputBar";

const REPLY_DELAY_MIN = 800;
const REPLY_DELAY_MAX = 2200;

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

// ── Inner component that uses useSearchParams ──
function ChatPageInner() {
  const router = useRouter();
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

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showQuickReplies = userMessageCount === 0;
  const showCollapsedQuick = userMessageCount === 1 || userMessageCount === 2;

  // Read optional orderStatus / total / images passed via query params
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

  /* ── Back handler with fallback ── */
  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/profile");
    }
  }, [router]);

  /* ── Scroll to bottom with threshold ── */
  const scrollToBottom = useCallback((force = false) => {
    if (!scrollContainerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } =
      scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    if (isNearBottom || force) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, []);

  /* ── Load greeting on mount ── */
  useEffect(() => {
    if (greetingShownRef.current) return;
    greetingShownRef.current = true;

    const mockUser = {
      username: "aditya99",
      displayName: "Aditya",
    };

    const displayName = mockUser.displayName?.trim() || `@${mockUser.username}`;

    if (source === "product" && productSlug) {
      const product = products.find((p) => p.slug === productSlug);
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

    if (source === "order" && orderId) {
      const snippet: Message["orderSnippet"] = {
        orderId,
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

  /* ── Auto-scroll on new messages / typing ── */
  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping, scrollToBottom]);

  /* ── Textarea auto-resize ── */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  };

  /* ── Attachment handling ── */
  const handlePickAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }
    setAttachmentFile(file);
    setAttachmentPreview(URL.createObjectURL(file));
    // reset so same file can be picked again
    e.target.value = "";
  };

  const clearAttachment = () => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachmentFile(null);
    setAttachmentPreview(null);
  };

  /* ── Send message ── */
  const handleSend = () => {
    if (!inputText.trim() && !attachmentPreview) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      type: attachmentPreview ? "image" : "text",
      text: inputText || undefined,
      imageUrl: attachmentPreview || undefined,
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    clearAttachment();

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Mark as sent after 300ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: "sent" } : m)),
      );
    }, 300);

    // Show typing indicator then agent reply
    const delay = getRandomDelay();
    setIsAgentTyping(true);

    setTimeout(() => {
      setIsAgentTyping(false);
      const agentReply = generateAgentReply(userMsg.text ?? "", userMsg.type);
      setMessages((prev) => [...prev, agentReply]);
      scrollToBottom(true);
    }, delay);
  };

  /* ── Quick reply selection ── */
  const handleQuickReplySelect = (text: string) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50/70 z-50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── STICKY HEADER ── */}
      <ChatHeader onBack={handleBack} isOnline />

      {/* ── MESSAGE LIST ── */}
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

            {/* Bottom spacer so last bubble isn't hidden behind composer */}
            <div className="h-4" />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── BOTTOM COMPOSER ── */}
      <div className="flex-shrink-0 bg-white">
        <ChatQuickReplies
          replies={dynamicQuickReplies}
          showFull={showQuickReplies}
          showCollapsed={showCollapsedQuick}
          onSelect={handleQuickReplySelect}
        />
        <ChatInputBar
          inputText={inputText}
          onInputChange={handleInputChange}
          onSend={handleSend}
          onPickAttachment={handlePickAttachment}
          attachmentPreview={attachmentPreview}
          onClearAttachment={clearAttachment}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}

// ── Exported page with Suspense boundary (required for useSearchParams) ──
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  );
}
