import type { NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { getSalesMetrics } from '@lib/analytics';
import { withRole, AuthedNextApiRequest } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { UserRole, type ApiMessage, USER_ROLES } from '@/types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<{ count: number; revenue: number } | ApiMessage>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const user = req.user;
    const param = parseInt(getQueryParam(req.query.brandId) || '', 10);
    const queryBrandId = Number.isNaN(param) ? undefined : param;
    const vendorId =
      user?.brandId ??
      (user?.role === USER_ROLES.SUPER_ADMIN ? queryBrandId : undefined);
    if (!user?.brandId && user?.role !== USER_ROLES.SUPER_ADMIN) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const start = dayjs().subtract(7, 'day').startOf('day').toDate();
    const { count, revenue } = await getSalesMetrics({ start, vendorId });
    return res.status(200).json({ count, revenue });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load weekly summary');
  }
}

export default withRole([USER_ROLES.BRAND, USER_ROLES.SUPER_ADMIN])(handler);
