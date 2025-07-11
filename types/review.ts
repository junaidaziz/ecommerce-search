// No Prisma import, since Review is not exported by @prisma/client
import type { User } from './user';
import type { Product } from './product';

// Custom Review type matching the Prisma model
export interface Review {
  id: number;
  entityType: string; // e.g., "PRODUCT", "BRAND", etc.
  entityId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review with relations (for app use)
export type ReviewWithRelations = Review & {
  user: User;
  product?: Product;
};

// Input type for creating reviews (matches Prisma fields)
export type ReviewInput = Pick<
  Review,
  'entityType' | 'entityId' | 'userId' | 'rating' | 'comment'
>;

// Update type for reviews
export type ReviewUpdate = Partial<Pick<Review, 'rating' | 'comment'>>;

// Reviews response type (app-specific)
export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  totalPages: number;
  currentPage: number;
}

// Review added response (app-specific)
export interface ReviewAddedResponse {
  message: string;
  review: Review;
  averageRating: number;
  reviewCount: number;
}

// Review summary (app-specific)
export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

// Review filter (app-specific)
export interface ReviewFilter {
  rating?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  page?: number;
  limit?: number;
}
