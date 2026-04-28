'use client';

import { useState, useEffect } from 'react';
import { timeAgo } from '@/lib/utils';

interface TimeAgoProps {
  date: string;
  className?: string;
}

export default function TimeAgo({ date, className = '' }: TimeAgoProps) {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    // Set initial value
    setDisplayTime(timeAgo(date));

    // Update lebih sering untuk akurasi yang lebih baik
    // Update setiap 10 detik untuk memastikan waktu selalu akurat
    const interval = setInterval(() => {
      setDisplayTime(timeAgo(date));
    }, 10000); // Update setiap 10 detik

    return () => clearInterval(interval);
  }, [date]);

  if (!displayTime) {
    return null;
  }

  return <span className={className}>{displayTime}</span>;
}
