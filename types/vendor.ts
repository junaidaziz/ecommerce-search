import type { User } from './user';
import type { PaymentMethod } from './paymentMethod';

// Vendor interface (extends User with vendor-specific fields)
export type Vendor = User & {
  brandName: string;
  businessDescription?: string;
  website?: string;
  logo?: string;
  taxId?: string;
  stripeAccountId?: string;
  paymentMethods?: PaymentMethod[];
};

// Vendor summary for lists
export type VendorSummary = Pick<
  Vendor,
  'id' | 'uuid' | 'brandName' | 'email' | 'verified' | 'active' | 'createdAt'
> & {
  totalProducts?: number;
  totalRevenue?: number;
};

// Vendor input for creating vendors
export type VendorInput = Pick<
  Vendor,
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

// Vendor update interface
export type VendorUpdate = Partial<Omit<VendorInput, 'email' | 'password'>>;

// Brand payment method interface
export interface BrandPaymentMethod {
  type: 'stripe' | 'jazzcash' | 'bank_transfer';
  details?: string | null;
  isDefault?: boolean;
}

// Vendor analytics interface
export interface VendorAnalytics {
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
}
