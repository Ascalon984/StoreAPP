"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";

function ChatPageInner() {
  const router = useRouter();
  const [selectedSeller, setSelectedSeller] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleBack = useCallback(() => {
    if (selectedSeller) {
      setSelectedSeller(null);
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/profile");
    }
  }, [router, selectedSeller]);

  if (!selectedSeller) {
    return (
      <ChatList
        onSelectSeller={setSelectedSeller}
        onBack={handleBack}
      />
    );
  }

  return (
    <ChatWindow
      seller={selectedSeller}
      onBack={handleBack}
    />
  );
}

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
