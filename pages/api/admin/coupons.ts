import type { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { createCoupon, listCoupons, updateCoupon } from '@lib/coupons';
import type { Coupon, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED, ID_REQUIRED } from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Coupon[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const rows = await listCoupons();
      res.status(200).json(rows as unknown as Coupon[]);
      return;
    }

    if (req.method === 'POST') {
      const {
        code,
        discountType,
        amount,
        minOrderValue,
        expirationDate,
        usageLimit,
      } = req.body as Partial<Coupon>;
      if (!code || !discountType || amount === undefined) {
        res
          .status(400)
          .json({ message: 'code, discountType and amount required' });
        return;
      }
      await createCoupon({
        code: code.toUpperCase(),
        discountType,
        amount,
        minOrderValue: minOrderValue ?? null,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        usageLimit: usageLimit ?? null,
      });
      res.status(201).json({ message: 'coupon created' });
      return;
    }

    if (req.method === 'PUT') {
      const { id, ...rest } = req.body as Coupon;
      if (!id) {
        res.status(400).json({ message: ID_REQUIRED });
        return;
      }
      await updateCoupon(Number(id), {
        ...rest,
        code: rest.code?.toUpperCase(),
        minOrderValue: rest.minOrderValue ?? null,
        expirationDate: rest.expirationDate
          ? new Date(rest.expirationDate)
          : undefined,
      });
      res.status(200).json({ message: 'coupon updated' });
      return;
    }

    res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    handleApiError(res, error, 'Failed to manage coupons');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
