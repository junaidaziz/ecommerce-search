import type { Coupon as PrismaCoupon } from '@prisma/client';
import type { User } from './user';

// Base Coupon type matching Prisma schema
export type Coupon = PrismaCoupon;

// Coupon with relations (for app use)
export type CouponWithRelations = Coupon & {
  user?: User;
  usages?: any[]; // Replace with CouponUsage[] if you have that type
};

// Input type for creating coupons (matches Prisma fields)
export type CouponInput = Pick<
  PrismaCoupon,
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
export type CouponResponse = CouponWithRelations;

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
