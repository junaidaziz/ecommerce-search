import type { NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { getDb } from '../../../lib/db';
import { withRole, AuthedNextApiRequest } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
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
    const brandId = parseInt(getQueryParam(req.query.brandId) || '', 10);
    const vendorId = Number(user?.id) || brandId || undefined;
    const monthOffset = parseInt(getQueryParam(req.query.monthOffset) || '0', 10);
    const start = dayjs()
      .startOf('month')
      .subtract(monthOffset, 'month')
      .toDate();
    const end = dayjs(start).endOf('month').toDate();
    const where: any = {
      createdAt: { gte: start, lte: end },
      status: 'completed',
    };
    if (vendorId) where.product = { vendorId };
    const count = await db.order.count({ where });
    const result = await db.order.aggregate({ where, _sum: { total: true } });
    return res.status(200).json({ count, revenue: result._sum.total ?? 0 });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load orders');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
