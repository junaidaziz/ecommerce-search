import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { getDb } from '../../../lib/db';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { ApiMessage } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ count: number; revenue: number } | ApiMessage>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const db = getDb();
    const user = (req as any).user as {
      id?: string | number;
      brandName?: string;
    } | undefined;
    const brandId = parseInt(getQueryParam(req.query.brandId) || '', 10);
    const vendorId = Number(user?.id) || brandId || undefined;
    const start = dayjs().subtract(7, 'day').startOf('day').toDate();
    const where: any = { createdAt: { gte: start }, status: 'completed' };
    if (vendorId) where.product = { vendorId };
    const count = await db.order.count({ where });
    const result = await db.order.aggregate({ where, _sum: { total: true } });
    return res.status(200).json({ count, revenue: result._sum.total ?? 0 });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load weekly summary');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
