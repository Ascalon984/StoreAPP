'use client';

import { useEffect } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';

export default function ScrollToBottomSheet() {
  const { isReturningFromDetail, setIsReturningFromDetail } = useNavigationStore();

  useEffect(() => {
    if (isReturningFromDetail) {
      // Delay untuk memastikan DOM sudah siap dan rendering selesai
      const timer = setTimeout(() => {
        const bottomSheetElement = document.getElementById('bottom-sheet');
        
        if (bottomSheetElement) {
          // Dapatkan posisi top dari bottom sheet relative ke window
          const rect = bottomSheetElement.getBoundingClientRect();
          const scrollY = window.scrollY;
          const bottomSheetTop = scrollY + rect.top;
          
          // Scroll ke posisi di atas bottom sheet agar sheet indicator dan header terlihat jelas
          // Gunakan buffer lebih besar (120px) untuk memastikan bottom sheet fully expanded
          const targetScroll = Math.max(bottomSheetTop - 120, 0);
          
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
        
        setIsReturningFromDetail(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isReturningFromDetail, setIsReturningFromDetail]);

  return null;
}
