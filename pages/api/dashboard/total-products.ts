import type { NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { withRole, AuthedNextApiRequest } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { UserRole, type ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<{ count: number } | ApiMessage>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const db = getDb();
    const user = req.user;
    const param = parseInt(getQueryParam(req.query.brandId) || '', 10);
    const queryBrandId = Number.isNaN(param) ? undefined : param;
    const vendorId =
      user?.brandId ??
      (user?.role === UserRole.SUPER_ADMIN ? queryBrandId : undefined);
    if (!user?.brandId && user?.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const where = vendorId ? { vendorId } : {};
    const count = await db.product.count({ where });
    return res.status(200).json({ count });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load total products');
  }
}

export default withRole([UserRole.BRAND, UserRole.SUPER_ADMIN])(handler);
