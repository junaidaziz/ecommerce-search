import type { Category } from '../category';

// Categories response interface
export interface CategoriesResponse {
  categories: Category[];
}

// Category response interface
export interface CategoryResponse {
  category: Category;
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
