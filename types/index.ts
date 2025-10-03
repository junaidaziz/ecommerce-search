export * from './product';
export * from './order';
export * from './review';
export * from './brand';
export * from './cart';
export * from './vendor';
export * from './image';
export * from './price';
export * from './shipping';
export * from './forms';
export * from './payment';
export * from './policy';
export * from './support';
export * from './message';
export * from './context';
export * from './wishlist';
export * from './variant';
export * from './address';
// Export all types from coupon except CouponResponse (use API version instead)
export type { Coupon, CouponWithRelations, CouponInput, CouponUpdate, CouponSummary } from './coupon';
// Export all types from shared except SearchResults (use API version instead)
export type {
  FilterState,
  ActiveFilter,
  PaginationInfo,
  ApiResponse,
  ApiError,
  ValidationError,
  FileUploadResponse,
  BreadcrumbItem,
  DropdownItem,
  TableColumn,
  SortConfig,
  FilterConfig,
  ProductGridProps,
  InfiniteLoaderProps
} from './shared';

// Explicitly re-export only one version of each conflicting type
export type { Category, CategoryInput, CategoryUpdate, CategorySummary } from './category';
export type { Notification, NotificationPreference } from './notification';
export { NotificationType } from './notification';
export type { PaymentMethod } from './paymentMethod';
export type { 
  AnalyticsData, 
  AdminAnalyticsData, 
  DashboardMetrics, 
  DashboardProduct,
  OrdersThisMonth,
  ChartConfig
} from './dashboard';
export type { User, UserRole, UserInput } from './user';
export { USER_ROLES, getUserRoles } from './user';

// Export all admin types
export type { 
  ApiMessage, 
  AdminUser, 
  UserRoleUpdateRequest, 
  UserDisabledUpdateRequest,
  LowStockProduct,
  PendingProduct,
  SearchCount,
  SearchAnalyticsResponse,
  AdminDashboardMetrics,
  CreateUserRequest
} from './admin';

// Export all API response types (explicitly to avoid conflicts with shared types)
export type {
  // Products domain
  SearchResults,
  ProductsResponse,
  SuggestionsResponse,
  SearchApiResponse,
  TrendingResponse,
  TagsResponse,
  // Orders domain
  CheckoutSessionResponse,
  OrderIdResponse,
  OrderPlacedResponse,
  // Auth domain
  LoginResponse,
  SignupResponse,
  SignupTokenResponse,
  ResetTokenResponse,
  EmailChangeTokensResponse,
  // Users domain
  UsersResponse,
  // Categories domain
  CategoriesResponse,
  CategoryResponse,
  CategoryCheckResponse,
  CategoryCheckOrCreateResponse,
  // Vendors domain
  VendorsResponse,
  // Coupons domain
  CouponResponse,
} from './api';
