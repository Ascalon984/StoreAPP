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
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      
      // Map database response to Review format
      const reviews = (data.reviews || data || []).map((r: any) => ({
        id: r.id,
        productId: r.product_id || 'all',
        name: r.user_name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at || new Date().toISOString(),
        isVerified: r.is_active !== false,
      }));
      
      set({ reviews, isLoading: false });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
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
