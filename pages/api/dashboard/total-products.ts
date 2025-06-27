import type { NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withRole, AuthedNextApiRequest } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { ApiMessage } from '../../../types';

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<{ count: number } | ApiMessage>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const db = getDb();
    const user = req.user;
    const brandId = parseInt(getQueryParam(req.query.brandId) || '', 10);
    const vendorId = user?.brandId ?? brandId || undefined;
    const where = vendorId ? { vendorId } : {};
    const count = await db.product.count({ where });
    return res.status(200).json({ count });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load total products');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
