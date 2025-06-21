export interface Coupon {
  id?: string | number;
  code: string;
  discountType: 'percent' | 'amount';
  value: number;
  expiresAt?: string;
  minOrderAmount?: number;
  usageLimit?: number;
  createdAt?: string;
}
