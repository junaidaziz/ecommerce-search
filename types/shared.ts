export interface FilterState {
  keyword: string;
  selectedCategories: string[];
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

export interface ActiveFilter {
  label: string;
  clear: () => void;
}

export interface ProductGridProps {
  products: import('./product').Product[];
  loading: boolean;
}

export interface InfiniteLoaderProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  itemsLength?: number;
}
