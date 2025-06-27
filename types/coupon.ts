export interface Coupon {
  id?: string | number;
  code: string;
  discountType: 'percent' | 'amount' | 'bogo';
  amount: number;
  minOrderValue?: number;
  expirationDate?: string;
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
