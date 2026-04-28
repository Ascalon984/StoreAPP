'use client';

import { useState, useEffect, useRef } from 'react';
import { timeAgo } from '@/lib/utils';

interface TimeAgoProps {
  date: string;
  className?: string;
}

// Global timer untuk semua component TimeAgo
let globalUpdateCount = 0;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  setInterval(() => {
    globalUpdateCount++;
    listeners.forEach(listener => listener());
  }, 5000);
}

export default function TimeAgo({ date, className = '' }: TimeAgoProps) {
  const [, setForceUpdate] = useState(0);
  const initialTimeRef = useRef<string | null>(null);

  useEffect(() => {
    // Set waktu awal saat component mount
    initialTimeRef.current = timeAgo(date);

    // Subscribe ke global timer untuk update
    const listener = () => {
      setForceUpdate(prev => prev + 1);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, [date]);

  return <span className={className}>{timeAgo(date)}</span>;
}

