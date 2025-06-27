export interface AdminUser {
  email: string;
  firstName?: string;
  lastName?: string;
  brandName?: string;
  gender?: string;
  role: string;
  disabled: boolean;
}

export interface UserRoleUpdateRequest {
  email: string;
  role: string;
}

export interface UserDisabledUpdateRequest {
  email: string;
  disabled: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  brandName?: string;
  gender: string;
  role?: string;
}

export interface ApiMessage {
  message: string;
}

export interface PendingProduct {
  id: string;
  title: string;
}

export interface SearchCount {
  query: string;
  count: number;
}

export interface SearchAnalyticsResponse {
  topSearches: SearchCount[];
  failedSearches: SearchCount[];
}

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  topProducts: { id: string; qty: number }[];
}

export interface LowStockProduct {
  id: string;
  title: string;
  quantity: number;
}
