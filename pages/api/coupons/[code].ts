import type { NextApiRequest, NextApiResponse } from 'next';
import { getQueryParam } from '@utils/getQueryParam';
import { handleApiError } from '@utils/handleApiError';
import { findCouponByCode } from '@lib/coupons';
import type { Coupon, ApiMessage } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Coupon | ApiMessage>
): Promise<void> {
  try {
    const code = getQueryParam(req.query.code);
    if (!code) {
      res.status(400).json({ message: 'code required' });
      return;
    }
    const coupon = await findCouponByCode(String(code));
    if (!coupon || !coupon.isActive) {
      res.status(404).json({ message: 'Invalid code' });
      return;
    }
    const now = new Date();
    if (coupon.expirationDate && new Date(coupon.expirationDate) < now) {
      res.status(400).json({ message: 'Coupon expired' });
      return;
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ message: 'Coupon usage limit reached' });
      return;
    }
    res.status(200).json(coupon as unknown as Coupon);
  } catch (error) {
    handleApiError(res, error, 'Failed to validate coupon');
  }
}
