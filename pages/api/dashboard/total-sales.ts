import type { NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withRole, AuthedNextApiRequest } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { ApiMessage } from '../../../types';

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<{ total: number } | ApiMessage>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const db = getDb();
    const user = req.user;
    const brandId = parseInt(getQueryParam(req.query.brandId) || '', 10);
    const vendorId = Number(user?.id) || brandId || undefined;
    const monthOffset = getQueryParam(req.query.monthOffset);
    const where: any = { status: 'completed' };
    if (monthOffset !== null && monthOffset !== undefined && monthOffset !== '') {
      const m = parseInt(monthOffset, 10);
      const start = require('dayjs')()
        .startOf('month')
        .subtract(m, 'month')
        .toDate();
      const end = require('dayjs')(start).endOf('month').toDate();
      where.createdAt = { gte: start, lte: end };
    }
    if (vendorId) where.product = { vendorId };
    const result = await db.order.aggregate({ where, _sum: { total: true } });
    return res.status(200).json({ total: result._sum.total ?? 0 });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load total sales');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
