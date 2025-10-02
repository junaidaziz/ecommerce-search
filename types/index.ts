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
export * from './coupon';
export * from './shared';

// Explicitly re-export only one version of each conflicting type
export type { Category } from './category';
export type { Notification } from './notification';
export type { PaymentMethod } from './paymentMethod';
export type { AnalyticsData } from './dashboard';
export type { User, UserRole } from './user';
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

// Export all API response types
export type {
  SearchResults,
  ProductsResponse,
  SuggestionsResponse,
  SearchApiResponse,
  TrendingResponse,
  CheckoutSessionResponse,
  OrderIdResponse,
  OrderPlacedResponse,
  LoginResponse,
  SignupResponse,
  SignupTokenResponse,
  ResetTokenResponse,
  EmailChangeTokensResponse,
  CouponResponse,
  CategoriesResponse,
  TagsResponse,
  UsersResponse,
  CategoryResponse,
  VendorsResponse,
  CategoryCheckResponse,
  CategoryCheckOrCreateResponse
} from './api';
