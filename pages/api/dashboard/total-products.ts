import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { ApiMessage } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ count: number } | ApiMessage>
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
    const where = vendorId ? { vendorId } : {};
    const count = await db.product.count({ where });
    return res.status(200).json({ count });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load total products');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
