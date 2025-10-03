import type { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { createCoupon, updateCoupon } from '@lib/coupons';
import type { Coupon, ApiMessage } from '@/types';
import { USER_ROLES } from '@/types';
import { METHOD_NOT_ALLOWED, ID_REQUIRED } from '@/constants/messages';
import { getDb } from '@lib/db';

const prisma = getDb();

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Coupon[] | ApiMessage>,
  userId: number
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const rows = await prisma.coupon.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(rows as unknown as Coupon[]);
      return;
    }

    if (req.method === 'POST') {
      const {
        code,
        description,
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
        description: description ?? null,
        discountType,
        discountValue,
        minOrderValue: minOrderValue ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        usageLimit: usageLimit ?? null,
        user: { connect: { id: userId } },
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
      // Verify the coupon belongs to this brand
      const existing = await prisma.coupon.findFirst({
        where: { id: Number(id), userId },
      });
      if (!existing) {
        res.status(404).json({ message: 'Coupon not found' });
        return;
      }
      await updateCoupon(Number(id), {
        ...rest,
        code: rest.code?.toUpperCase(),
        description: rest.description ?? null,
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

export default withRole([USER_ROLES.BRAND, USER_ROLES.SUPER_ADMIN])(handler);
