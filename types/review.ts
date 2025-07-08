import type { Review as PrismaReview } from '@prisma/client';
import type { User } from './user';
import type { Product } from './product';

// Base Review type matching Prisma schema
export type Review = PrismaReview;

// Review with relations (for app use)
export type ReviewWithRelations = Review & {
  user: User;
  product: Product;
};

// Input type for creating reviews (matches Prisma fields)
export type ReviewInput = Pick<
  PrismaReview,
  'productId' | 'userId' | 'rating' | 'comment'
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
