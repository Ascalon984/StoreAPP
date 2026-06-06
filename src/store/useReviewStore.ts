import { create } from 'zustand';
import { Review } from '@/lib/types';

interface ReviewStore {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  fetchReviews: (productId?: string) => Promise<void>;
  addReview: (review: Review) => void;
  getReviewsForProduct: (productId: string) => Review[];
  refreshVersion: number;
  triggerRefresh: () => void;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  isLoading: false,
  error: null,
  refreshVersion: 0,
  triggerRefresh: () => set((state) => ({ refreshVersion: state.refreshVersion + 1 })),

  fetchReviews: async (productId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const query = productId ? `?productId=${encodeURIComponent(productId)}` : '';
      const res = await fetch(`/api/public/reviews${query}`);
      if (!res.ok) {
        set({ reviews: [], isLoading: false, error: 'API error' });
        return;
      }

      const data = await res.json();

      let reviewsArray: any[] = [];
      if (Array.isArray(data)) {
        reviewsArray = data;
      } else if (data && Array.isArray(data.reviews)) {
        reviewsArray = data.reviews;
      }

      const reviews: Review[] = reviewsArray.map((r: any) => ({
        id: r.id || `review-${Math.random()}`,
        productId: r.productId || r.product_id || 'all',
        name: r.user_name || r.name || r.userName,
        rating: Number(r.rating) || 5,
        comment: r.comment || '',
        createdAt: r.created_at || r.createdAt || r.timestamp || r.created_on || new Date().toISOString(),
        isVerified: r.is_active !== false,
        likes: r.likes || 0,
        dislikes: r.dislikes || 0,
        reply: r.reply,
      }));

      set({ reviews, isLoading: false });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      set({
        reviews: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
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
