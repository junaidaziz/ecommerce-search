export interface Coupon {
  id?: string | number;
  code: string;
  description?: string;
  discountType: 'percent' | 'amount' | 'bogo';
  discountValue: number;
  minOrderValue?: number;
  expiresAt?: string;
  usageLimit?: number;
  usedCount?: number;
  userId?: string | number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
