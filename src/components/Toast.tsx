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
      className={`fixed left-1/2 top-1/2 z-[999] w-[80%] max-w-sm touch-none select-none ${animationClass}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translate(calc(-50% + ${dragX}px), -50%)`,
        opacity,
        transition: isDragging.current
          ? "none"
          : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className={`
    px-5 py-2 rounded-xl shadow-md
    cursor-grab active:cursor-grabbing
    ${type === "error" ? "bg-rose-500/90" : "bg-gray-600/90"}
  `}
      >
        <p className="text-[12px] font-medium text-white text-left leading-5 break-words line-clamp-2">
          {message}
        </p>
      </div>
    </div>
  );
}
