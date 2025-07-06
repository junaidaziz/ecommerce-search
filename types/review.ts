export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ReviewInput {
  productId: number;
  rating: number;
  comment: string;
}

export interface ReviewUpdate {
  rating?: number;
  comment?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  totalPages: number;
  currentPage: number;
}

export interface ReviewAddedResponse {
  message: string;
  review: Review;
  averageRating: number;
  reviewCount: number;
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export interface ReviewFilter {
  rating?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  page?: number;
  limit?: number;
}
