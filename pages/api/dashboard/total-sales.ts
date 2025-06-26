import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { ApiMessage } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ total: number } | ApiMessage>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const db = getDb();
    const user = (req as any).user as { brandName?: string } | undefined;
    const brand = user?.brandName || getQueryParam(req.query.brand);
    const where: any = { status: 'completed' };
    if (brand) where.product = { vendor: { brandName: brand } };
    const result = await db.order.aggregate({ where, _sum: { total: true } });
    return res.status(200).json({ total: result._sum.total ?? 0 });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load total sales');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
