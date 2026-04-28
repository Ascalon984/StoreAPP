import { create } from 'zustand';
import { Review } from '@/lib/types';

interface ReviewStore {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  fetchReviews: () => Promise<void>;
  addReview: (review: Review) => void;
  getReviewsForProduct: (productId: string) => Review[];
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  isLoading: false,
  error: null,
  
  fetchReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/public/reviews');
      if (!res.ok) {
        console.warn('Reviews API returned non-ok status:', res.status);
        set({ reviews: [], isLoading: false, error: 'API error' });
        return;
      }
      
      const data = await res.json();
      console.log('Reviews API response:', data);
      
      // Handle both array response and object with reviews key
      let reviewsArray = [];
      if (Array.isArray(data)) {
        reviewsArray = data;
      } else if (data && Array.isArray(data.reviews)) {
        reviewsArray = data.reviews;
      } else if (data && typeof data === 'object') {
        // If it's an object but not array, try to handle it gracefully
        console.warn('Unexpected reviews response format:', data);
        reviewsArray = [];
      }
      
      // Map database response to Review format
      const reviews = reviewsArray.map((r: any) => {
        // Debug: log seluruh response untuk lihat field apa saja yang dikirim
        console.log('Raw review from API:', JSON.stringify(r, null, 2));
        
        return {
          id: r.id || `review-${Math.random()}`,
          productId: r.product_id || 'all',
          // Ambil nama real dari database - jangan ada fallback
          name: r.user_name || r.name || r.userName,
          rating: Number(r.rating) || 5,
          comment: r.comment || '',
          // Cek berbagai kemungkinan nama field untuk timestamp
          createdAt: r.created_at || r.createdAt || r.timestamp || r.created_on || new Date().toISOString(),
          isVerified: r.is_active !== false,
        };
      });
      
      set({ reviews, isLoading: false });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      set({ 
        reviews: [], 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  },
  
  addReview: (review) => set({ reviews: [review, ...get().reviews] }),
  
  getReviewsForProduct: (productId) => {
    const reviews = get().reviews;
    const specific = reviews.filter((r) => r.productId === productId);
    const generic = reviews.filter((r) => r.productId === 'all');
    return [...specific, ...generic];
  },
}));
