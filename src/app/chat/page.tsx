"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Message } from "@/lib/chat/types";
import { getQuickReplies } from "@/lib/chat/quickReplies";
import { getGreetingMessage } from "@/lib/chat/mockMessages";
import { generateAgentReply } from "@/lib/chat/generateAgentReply";
import { products } from "@/lib/data";

import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
  X,
  Headset,
  Store,
} from "lucide-react";

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

const MOCK_SELLERS = [
  {
    id: "s1",
    name: "Astro Store",
    avatar: null,
    lastMessage: "Pesanan Anda sedang diproses ya kak.",
    time: "10:30",
    unread: 2,
    isOnline: true,
  },
  {
    id: "s2",
    name: "Tech Gadget",
    avatar: null,
    lastMessage: "Terima kasih telah berbelanja.",
    time: "Kemarin",
    unread: 0,
    isOnline: false,
  },
  {
    id: "s3",
    name: "Fashion Hub",
    avatar: null,
    lastMessage: "Warna hitam ready kak.",
    time: "Kemarin",
    unread: 0,
    isOnline: true,
  },
  {
    id: "s4",
    name: "Home Living",
    avatar: null,
    lastMessage: "Apakah barang ini masih ada?",
    time: "Selasa",
    unread: 0,
    isOnline: false,
  },
];

const CHAT_CHIPS = ["Semua", "Pesanan", "Belum dibaca"];

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

  const [selectedSeller, setSelectedSeller] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [activeChip, setActiveChip] = useState("Semua");
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

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

  const isCSChat = selectedSeller?.id === "cs";
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showQuickReplies = isCSChat && userMessageCount === 0;
  const showCollapsedQuick =
    isCSChat && (userMessageCount === 1 || userMessageCount === 2);

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

  /* ── Scroll listener for sticky header shadow ── */
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handleScroll = () => {
      setIsScrolled(el.scrollTop > 10);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ── Back handler with fallback ── */
  const handleBack = useCallback(() => {
    if (selectedSeller) {
      setSelectedSeller(null);
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/profile");
    }
  }, [router, selectedSeller]);

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

  // If no seller selected, render Chat List
  if (!selectedSeller) {
    const displaySellers = MOCK_SELLERS.filter((s) => {
      if (activeChip === "Belum dibaca" && s.unread === 0) return false;
      if (
        searchQuery &&
        !s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });

    return (
      <div className="min-h-screen bg-white">
        {/* ── Sticky Header (Like CategorySlug) ── */}
        <div
          className="sticky top-0 z-50 bg-[#048750] transition-shadow duration-300"
          style={{
            boxShadow: isScrolled
              ? "0 2px 10px rgba(0,0,0,0.06)"
              : "0 1px 0 rgba(0,0,0,0.06)",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          {/* Back row */}
          <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5">
            <button
              onClick={handleBack}
              className="
              -ml-1.5
              flex items-center justify-center
              w-8 h-8
              text-white/90
              active:scale-90
              transition-all duration-150
              flex-shrink-0
            "
              aria-label="Kembali"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>

            <div className="flex-1 min-w-0 -ml-2">
              <h1 className="text-[15px] font-semibold text-white tracking-tight capitalize truncate">
                Percakapan
              </h1>
            </div>

            <button
              onClick={() =>
                setSelectedSeller({
                  id: "cs",
                  name: "Customer Service",
                })
              }
              className="
                flex items-center justify-center
                w-8 h-8
                text-white/80
hover:text-white
hover:bg-white/10
                active:scale-90
                transition-all duration-150
                flex-shrink-0
              "
              aria-label="Customer Service"
            >
              <Headset size={19} strokeWidth={2} />
            </button>
          </div>

          {/* Search + Sort Dropdown */}
          <div className="px-4 mt-1 pb-2.5">
            <div className="flex items-center gap-2">
              {/* Search Box */}
              <div className="flex-1 relative group">
                <Search
                  size={16}
                  strokeWidth={2.2}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 pointer-events-none transition-all duration-300 group-focus-within:opacity-0 group-focus-within:scale-75 group-focus-within:-translate-x-2 ${
                    searchQuery
                      ? "opacity-0 scale-75 -translate-x-2"
                      : "opacity-100 scale-100"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Cari nama toko atau pesan"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    w-full h-9
                    pr-8
                    rounded-lg
                    bg-gray-50
                    border border-gray-200
                    text-gray-800
                    placeholder:text-gray-400
                    focus:placeholder-transparent
                    text-[12px]
                    font-medium
                    outline-none
                    transition-all duration-300
                    focus:bg-white
                    focus:border-gray-300
                    ${searchQuery ? "pl-3" : "pl-9 group-focus-within:pl-3"}
                  `}
                />
              </div>

              {/* Filter Dropdown Button */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`
          h-9 w-9
          rounded-lg
          flex items-center justify-center
          border
          transition-colors duration-200
          ${
            filterOpen || activeChip !== "Semua"
              ? "bg-gray-100 border-gray-300 text-gray-700"
              : "bg-gray-50 border-gray-200 text-gray-600"
          }
        `}
                >
                  <SlidersHorizontal size={16} strokeWidth={2.2} />
                </button>

                {/* Dropdown */}
                {filterOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-lg border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden z-50">
                    {CHAT_CHIPS.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setActiveChip(option);
                          setFilterOpen(false);
                        }}
                        className={`
                w-full px-4 py-2.5 text-left text-[13px] font-semibold transition-colors
                ${
                  option === activeChip
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-gray-700 hover:bg-gray-50"
                }
              `}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Seller List ── */}
        <div className="py-2 pb-20">
          <div className="overflow-hidden bg-white">
            {displaySellers.map((seller, index) => (
              <div key={seller.id}>
                <div
                  onClick={() =>
                    setSelectedSeller({ id: seller.id, name: seller.name })
                  }
                  className="
                    relative
                    flex items-center gap-2.5
                    px-4 py-2
                    cursor-pointer
                    transition-colors
                    active:bg-gray-50
                  "
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="
      w-9 h-9 rounded-full
      bg-gray-200
      flex items-center justify-center
      border border-gray-100
      overflow-hidden
    "
                    >
                      {seller.avatar ? (
                        <span className="text-emerald-700 font-semibold text-[12px]">
                          {seller.avatar}
                        </span>
                      ) : (
                        <Store
                          size={19}
                          strokeWidth={1.8}
                          className="text-gray-500"
                        />
                      )}
                    </div>

                    {seller.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="relative flex-1 min-w-0 pr-9">
                    {/* Timestamp */}
                    <span
                      className="
                        absolute
                        top-0 right-0
                        text-[10px]
                        font-medium
                        text-gray-500
                      "
                    >
                      {seller.time}
                    </span>

                    {/* Seller Name */}
                    <h3 className="truncate pr-10 text-[13px] font-semibold leading-4.5 text-gray-600">
                      {seller.name}
                    </h3>

                    {/* Last Message */}
                    <p
                      className="
                      mt-0.5
                      truncate
                      pr-1
                      text-[11px]
                      font-normal
                      leading-4
                      text-gray-500
                    "
                    >
                      {seller.lastMessage}
                    </p>

                    {/* Unread Badge */}
                    {seller.unread > 0 && (
                      <div className="absolute right-0 bottom-0.5">
                        <div className="flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-rose-600 px-1 text-[8.5px] font-semibold text-white">
                          {seller.unread}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                {index !== displaySellers.length - 1 ? (
                  <div className="ml-[76px] h-px bg-gray-200/80" />
                ) : (
                  <div className="h-px bg-gray-200/80" />
                )}
              </div>
            ))}

            {/* Empty State */}
            {displaySellers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Search size={24} className="text-gray-400" />
                </div>

                <p className="text-sm font-medium text-gray-500">
                  Tidak ada chat.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
      <ChatHeader
        onBack={handleBack}
        isOnline={true}
        name={selectedSeller.name}
        isOfficial={selectedSeller.id === "cs"}
      />

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
