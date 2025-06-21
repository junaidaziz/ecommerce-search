import type { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from '../../../lib/utils/handleApiError';
import type { Coupon, ApiMessage } from '../../../types';

const coupons: Record<string, Coupon> = {
  SAVE10: {
    id: '1',
    code: 'SAVE10',
    discountType: 'percent',
    value: 10,
    expiresAt: '2099-12-31T23:59:59Z',
    minOrderAmount: 0,
    usageLimit: 100,
    createdAt: '2023-01-01T00:00:00Z',
  },
  SAVE20: {
    id: '2',
    code: 'SAVE20',
    discountType: 'percent',
    value: 20,
    expiresAt: '2099-12-31T23:59:59Z',
    minOrderAmount: 0,
    usageLimit: 100,
    createdAt: '2023-01-01T00:00:00Z',
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Coupon | ApiMessage>
): void {
  try {
    const { code } = req.query;
    const coupon = coupons[code?.toUpperCase() as string];
    if (!coupon) return res.status(404).json({ message: 'Invalid code' });
    res.status(200).json(coupon);
  } catch (error) {
    return handleApiError(res, error, 'Failed to validate coupon');
  }
}
