import type { NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { getDb } from '@lib/db';
import { withRole, AuthedNextApiRequest } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { ApiMessage } from '../../../types';

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<{ count: number; revenue: number } | ApiMessage>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const db = getDb();
    const user = req.user;
    const param = parseInt(getQueryParam(req.query.brandId) || '', 10);
    const queryBrandId = Number.isNaN(param) ? undefined : param;
    const vendorId =
      user?.brandId ?? (user?.role === 'SUPER_ADMIN' ? queryBrandId : undefined);
    if (!user?.brandId && user?.role !== 'SUPER_ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const start = dayjs().subtract(7, 'day').startOf('day').toDate();
    const where: any = { createdAt: { gte: start }, status: 'delivered' };
    if (vendorId) where.product = { vendorId };
    const count = await db.order.count({ where });
    const result = await db.order.aggregate({ where, _sum: { total: true } });
    return res.status(200).json({ count, revenue: result._sum.total ?? 0 });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load weekly summary');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
