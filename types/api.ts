export interface SearchResults {
  results: import('./product').Product[];
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export interface TrendingResponse {
  keywords: string[];
}

export interface CheckoutSessionResponse {
  url: string;
  message?: string;
}

export type CouponResponse = import('./coupon').Coupon;

export interface CategoriesResponse {
  categories: import('./category').Category[];
}

export interface UsersResponse {
  users: (import('./user').User & { disabled?: boolean })[];
}
