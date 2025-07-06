// Base Coupon type matching Prisma schema
export interface Coupon {
  id: number;
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue?: number | null;
  expiresAt?: Date | null;
  usageLimit?: number | null;
  usedCount: number;
  userId?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Input type for creating coupons
export type CouponInput = Pick<
  Coupon,
  | 'code'
  | 'description'
  | 'discountType'
  | 'discountValue'
  | 'minOrderValue'
  | 'expiresAt'
  | 'usageLimit'
  | 'userId'
  | 'isActive'
> & {
  id?: number;
};

// Update type for coupons
export type CouponUpdate = Partial<Omit<CouponInput, 'code'>>;

// Coupon response type
export type CouponResponse = Coupon;

// Coupon with minimal fields for lists
export type CouponSummary = Pick<
  Coupon,
  | 'id'
  | 'code'
  | 'description'
  | 'discountType'
  | 'discountValue'
  | 'isActive'
  | 'usedCount'
  | 'usageLimit'
  | 'expiresAt'
  | 'createdAt'
>;
