import type { Product } from './product';
import type { User } from './user';
import type { Category } from './category';
import type { Vendor } from './vendor';
import type { Coupon } from './coupon';

// Search results interface
export interface SearchResults {
  results: Product[];
}

// Suggestions response interface
export interface SuggestionsResponse {
  suggestions: string[];
}

// Search API response interface
export interface SearchApiResponse {
  results: Product[];
  total: number;
  page: number;
  totalPages: number;
  brands: string[];
  categories: string[];
  fallback: Product[];
}

// Trending response interface
export interface TrendingResponse {
  keywords: string[];
}

// Checkout session response interface
export interface CheckoutSessionResponse {
  url: string;
  message?: string;
  id?: string;
}

// Order ID response interface
export interface OrderIdResponse {
  id: string;
}

// Order placed response interface
export interface OrderPlacedResponse extends OrderIdResponse {
  message: string;
}

// Login response interface
export interface LoginResponse {
  message: string;
  user?: User;
}

// Signup response interface
export interface SignupResponse {
  message: string;
  user: User;
  token: string;
}

// Signup token response interface
export interface SignupTokenResponse {
  token: string;
  autoConfirmed?: boolean;
}

// Reset token response interface
export interface ResetTokenResponse {
  message: string;
  token: string;
}

// Email change tokens response interface
export interface EmailChangeTokensResponse {
  message: string;
  oldToken: string;
  newToken: string;
}

// Coupon response type
export type CouponResponse = Coupon;

// Categories response interface
export interface CategoriesResponse {
  categories: Category[];
}

// Tags response interface
export interface TagsResponse {
  tags: string[];
}

// Users response interface
export interface UsersResponse {
  users: (User & { disabled?: boolean })[];
}

// Category response interface
export interface CategoryResponse {
  category: Category;
}

// Vendors response interface
export interface VendorsResponse {
  vendors: Vendor[];
}

// Category check response interface
export interface CategoryCheckResponse {
  exists: boolean;
  category?: Category;
}

// Category check or create response interface
export interface CategoryCheckOrCreateResponse {
  exists?: boolean;
  success?: boolean;
  name?: string;
  category?: Category;
}
