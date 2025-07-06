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

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface SearchResults<T> {
  results: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isButton?: boolean;
  divider?: boolean;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  value: any;
}

export interface ProductGridProps {
  products: import('./product').Product[];
  className?: string;
}

export interface InfiniteLoaderProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  itemsLength?: number;
}
