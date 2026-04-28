'use client';

import { useState, useEffect, useMemo } from 'react';
import { timeAgo } from '@/lib/utils';

interface TimeAgoProps {
  date: string;
  className?: string;
}

export default function TimeAgo({ date, className = '' }: TimeAgoProps) {
  const [mounted, setMounted] = useState(false);
  const [, setUpdate] = useState({});

  // Hitung ulang setiap waktu komponendisimpan
  const displayTime = useMemo(() => timeAgo(date), [date]);

  useEffect(() => {
    setMounted(true);

    // Update setiap 5 detik untuk memastikan akurasi
    const interval = setInterval(() => {
      setUpdate({});
    }, 5000);

    return () => clearInterval(interval);
  }, [date]);

  // Jangan render apa-apa sampai component di-hydrate di client
  if (!mounted) {
    return null;
  }

  return <span className={className}>{timeAgo(date)}</span>;
}

