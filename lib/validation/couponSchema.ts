import { z } from 'zod';

/*
  Coupon Validation Schema
  - code: required, uppercase letters/numbers only, length 3-32
  - discountType: enum
  - discountValue: required unless bogo; if percent 1-100; if amount > 0
  - minOrderValue: optional positive number
  - expiresAt: optional ISO date string (yyyy-mm-dd) in the future (>= today)
  - usageLimit: optional positive int
*/

export const couponSchema = z.object({
  code: z
    .string({ required_error: 'Code is required' })
    .min(3, 'Code must be at least 3 characters')
    .max(32, 'Code must be at most 32 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must use only letters and numbers')
    .transform((v) => v.toUpperCase()),
  discountType: z.enum(['percent', 'amount', 'bogo'], {
    required_error: 'Discount type is required',
  }),
  discountValue: z
    .number({ invalid_type_error: 'Discount value must be a number' })
    .nonnegative('Discount must be >= 0')
    .refine((v) => v > 0, 'Discount must be greater than zero'),
  minOrderValue: z
    .number({ invalid_type_error: 'Minimum order must be a number' })
    .positive('Minimum order must be positive')
    .optional(),
  expiresAt: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid date')
    .refine((v) => {
      const d = new Date(v);
      const today = new Date();
      // normalize to date-only comparison
      d.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      return d >= today;
    }, 'Expiry must be today or a future date')
    .optional(),
  usageLimit: z
    .number({ invalid_type_error: 'Usage limit must be a number' })
    .int('Usage limit must be an integer')
    .positive('Usage limit must be positive')
    .optional(),
  description: z.string().max(200, 'Description must be at most 200 chars').optional(),
});

export type CouponFormInput = z.infer<typeof couponSchema>;

// Custom refinement for conditional discountValue rules
export const validateCoupon = (data: any) => {
  // Preprocess numeric string inputs coming from form
  const preprocessed = { ...data };
  ['discountValue', 'minOrderValue', 'usageLimit'].forEach((k) => {
    if (preprocessed[k] === '' || preprocessed[k] === undefined) return;
    if (typeof preprocessed[k] === 'string') {
      const parsed = k === 'usageLimit' ? parseInt(preprocessed[k], 10) : parseFloat(preprocessed[k]);
      preprocessed[k] = isNaN(parsed) ? undefined : parsed;
    }
  });

  // discountValue optional when bogo
  if (preprocessed.discountType === 'bogo') {
    preprocessed.discountValue = 1; // sentinel > 0 to satisfy base schema
  }

  const base = couponSchema.safeParse(preprocessed);
  if (!base.success) return base;

  const issues: { path: (string | number)[]; message: string }[] = [];

  if (preprocessed.discountType === 'percent') {
    if (preprocessed.discountValue <= 0 || preprocessed.discountValue > 100) {
      issues.push({ path: ['discountValue'], message: 'Percent must be between 1 and 100' });
    }
  }

  if (preprocessed.discountType === 'amount') {
    if (preprocessed.discountValue <= 0) {
      issues.push({ path: ['discountValue'], message: 'Amount must be greater than 0' });
    }
  }

  if (preprocessed.discountType === 'bogo') {
    // No discountValue required; ignore
  }

  if (issues.length) {
    return {
      success: false as const,
      error: {
        issues: issues.map((i) => ({
          code: 'custom',
          path: i.path,
          message: i.message,
        })),
      },
    };
  }

  return { success: true as const, data: { ...base.data, ...preprocessed } };
};
