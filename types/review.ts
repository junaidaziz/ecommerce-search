export interface Review {
  productId: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export interface ReviewAddedResponse {
  message: string;
  averageRating: number;
  reviewCount: number;
}
