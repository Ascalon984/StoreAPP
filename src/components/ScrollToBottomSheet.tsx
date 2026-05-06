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
          
          // Scroll ke posisi sedikit di atas bottom sheet agar sheet indicator terlihat jelas
          // dan tidak tertutup oleh navbar yang menyusut (52px)
          const targetScroll = Math.max(bottomSheetTop - 80, 0); // 80px buffer dari top
          
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
