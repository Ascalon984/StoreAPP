import { create } from 'zustand';
import { Review } from '@/lib/types';
import { defaultReviews } from '@/lib/data';

interface ReviewStore {
  reviews: Review[];
  addReview: (review: Review) => void;
  getReviewsForProduct: (productId: string) => Review[];
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: defaultReviews,
  addReview: (review) => set({ reviews: [review, ...get().reviews] }),
  getReviewsForProduct: (productId) => {
    const reviews = get().reviews;
    const specific = reviews.filter((r) => r.productId === productId);
    const generic = reviews.filter((r) => r.productId === 'all');
    return [...specific, ...generic];
  },
}));
