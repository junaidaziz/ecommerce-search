import type { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from '../../../lib/utils/handleApiError';
const coupons = {
  SAVE10: { percent: 10 },
  SAVE20: { percent: 20 },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.query;
    const coupon = coupons[code?.toUpperCase() as string];
    if (!coupon) return res.status(404).json({ message: 'Invalid code' });
    res.status(200).json(coupon);
  } catch (error) {
    return handleApiError(res, error, 'Failed to validate coupon');
  }
}
