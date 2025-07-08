import type { NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { withRole, AuthedNextApiRequest } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { UserRole, type ApiMessage, USER_ROLES } from '@/types';
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
    let where = {};
    if (user?.role === USER_ROLES.BRAND) {
      where = { vendorId: user.brandId };
    } else if (user?.role === USER_ROLES.SUPER_ADMIN && queryBrandId) {
      where = { vendorId: queryBrandId };
    }
    const count = await db.product.count({ where });
    return res.status(200).json({ count });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load total products');
  }
}

export default withRole([USER_ROLES.BRAND, USER_ROLES.SUPER_ADMIN])(handler);
