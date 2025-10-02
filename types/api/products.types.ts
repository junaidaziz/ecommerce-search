import type { Product } from '../product';

// Search results interface
export interface SearchResults {
  results: Product[];
}

// Products response interface
export interface ProductsResponse {
  products: Product[];
  total: number;
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

// Tags response interface
export interface TagsResponse {
  tags: string[];
}
