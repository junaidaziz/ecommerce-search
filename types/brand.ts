import type { User } from './user';
import type { Order } from './order';

// Brand interface (extends User with brand-specific fields)
export type Brand = User & {
  brandName: string;
  businessDescription?: string;
  website?: string;
  logo?: string;
  taxId?: string;
  stripeAccountId?: string;
};

// Brand summary for lists
export type BrandSummary = Pick<
  Brand,
  'id' | 'uuid' | 'brandName' | 'email' | 'verified' | 'active' | 'createdAt'
> & {
  totalProducts?: number;
  totalRevenue?: number;
};

// Brand input for creating brands
export type BrandInput = Pick<
  Brand,
  | 'email'
  | 'password'
  | 'firstName'
  | 'lastName'
  | 'brandName'
  | 'gender'
  | 'businessDescription'
  | 'website'
  | 'logo'
  | 'taxId'
  | 'stripeAccountId'
>;

// Brand update interface
export type BrandUpdate = Partial<Omit<BrandInput, 'email' | 'password'>>;

// Earnings data interface
export interface EarningsData {
  totalEarned: number;
  pending: number;
  completed: number;
  orders: Order[];
  period: {
    start: Date;
    end: Date;
  };
}

// Brand analytics interface
export interface BrandAnalytics {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: number;
    title: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Order[];
}
