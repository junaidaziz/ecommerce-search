export interface SearchResults {
  results: import('./product').Product[];
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export interface SearchApiResponse {
  results: import('./product').Product[];
  total: number;
  page: number;
  totalPages: number;
  brands: string[];
  categories: string[];
  fallback: import('./product').Product[];
}

export interface TrendingResponse {
  keywords: string[];
}

export interface CheckoutSessionResponse {
  url: string;
  message?: string;
  id?: string;
}

export interface OrderIdResponse {
  id: string;
}

export interface OrderPlacedResponse extends OrderIdResponse {
  message: string;
}

export interface LoginResponse {
  message: string;
  user?: import('./user').User;
}

export interface SignupResponse {
  message: string;
  user: import('./user').User;
  token: string;
}

export interface SignupTokenResponse {
  token: string;
}

export interface ResetTokenResponse {
  message: string;
  token: string;
}

export type CouponResponse = import('./coupon').Coupon;

export interface CategoriesResponse {
  categories: import('./category').Category[];
}

export interface UsersResponse {
  users: (import('./user').User & { disabled?: boolean })[];
}
