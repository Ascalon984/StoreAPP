"use client";

import { useEffect, useState, useRef } from "react";
import { useToastStore } from "@/store/useToastStore";

export default function Toast() {
  const {
    message,
    isVisible,
    hideToast,
    type = "success",
  } = useToastStore() as any;
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState("animate-toast-in");
  const [dragX, setDragX] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [isSwiped, setIsSwiped] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setAnimationClass("animate-toast-in");
      setDragX(0);
      setOpacity(1);
      setIsSwiped(false);
    } else if (shouldRender) {
      if (isSwiped) {
        setShouldRender(false);
      } else {
        setAnimationClass("animate-toast-out");
        const timer = setTimeout(() => setShouldRender(false), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, isSwiped, shouldRender]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    setAnimationClass("");
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.touches[0].clientX - startX.current;
    setDragX(deltaX);
    setOpacity(Math.max(0, 1 - Math.abs(deltaX) / 150));
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (Math.abs(dragX) > 80) {
      setIsSwiped(true);
      hideToast();
    } else {
      setDragX(0);
      setOpacity(1);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] w-auto max-w-[80%] touch-none select-none ${animationClass}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translate(calc(-50% + ${dragX}px), 0)`,
        opacity,
        transition: isDragging.current
          ? "none"
          : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className={`
        px-4 py-2.5 rounded-2xl shadow-md cursor-grab active:cursor-grabbing
        ${type === "error" ? "bg-red-500" : "bg-gray-700"}
      `}
      >
        <p className="text-[12px] font-medium text-white text-center leading-snug break-words line-clamp-2">
          {message}
        </p>
      </div>
    </div>
  );
}
