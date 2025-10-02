import type { Role } from '@prisma/client';

// Admin user interface
export interface AdminUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  brandName?: string;
  gender?: string;
  role: Role;
  disabled: boolean;
  verified: boolean;
  active: boolean;
  createdAt: Date;
}

// User role update request interface
export interface UserRoleUpdateRequest {
  email: string;
  role: Role;
}

// User disabled update request interface
export interface UserDisabledUpdateRequest {
  email: string;
  disabled: boolean;
}

// Create user request interface
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  brandName?: string;
  gender: string;
  role?: Role;
}

// API message interface
export interface ApiMessage {
  message: string;
  success?: boolean;
}

// Pending product interface
export interface PendingProduct {
  id: number;
  title: string;
  status: string;
  createdAt: Date;
}

// Search count interface
export interface SearchCount {
  query: string;
  count: number;
  noResults?: boolean;
}

// Search analytics response interface
export interface SearchAnalyticsResponse {
  topSearches: SearchCount[];
  failedSearches: SearchCount[];
  totalSearches: number;
}

// Analytics data interface
export interface AdminAnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  topProducts: { id: number; qty: number; title: string }[];
  revenueGrowth?: number;
  orderGrowth?: number;
}

// Low stock product interface
export interface LowStockProduct {
  id: number;
  title: string;
  quantity: number;
  threshold?: number;
}

// Admin dashboard metrics interface
export interface AdminDashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  lowStockProducts: LowStockProduct[];
  recentOrders: Array<{
    id: number;
    total: number;
    status: string;
    createdAt: Date;
  }>;
}
