import type { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { createCoupon, listCoupons, updateCoupon } from '@lib/coupons';
import type { Coupon, ApiMessage } from '@/types';
import { USER_ROLES } from '@/types';
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
        discountValue,
        minOrderValue,
        expiresAt,
        usageLimit,
      } = req.body as Partial<Coupon>;
      if (!code || !discountType || discountValue === undefined) {
        res
          .status(400)
          .json({ message: 'code, discountType and discountValue required' });
        return;
      }
      await createCoupon({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minOrderValue: minOrderValue ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
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
        expiresAt: rest.expiresAt ? new Date(rest.expiresAt) : undefined,
      });
      res.status(200).json({ message: 'coupon updated' });
      return;
    }

    res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    handleApiError(res, error, 'Failed to manage coupons');
  }
}

export default withRole([USER_ROLES.SUPER_ADMIN])(handler);
