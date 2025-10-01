import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendor, getAllOrders } from '@lib/orders';
import { withRole, type AuthedNextApiRequest } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { Order, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED, VENDOR_REQUIRED } from '@/constants/messages';
import { USER_ROLES } from '@/types';

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<Order[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const vendor = getQueryParam(req.query.vendor);
    if (!vendor) {
      if (req.user?.role === USER_ROLES.SUPER_ADMIN) {
        const orders = await getAllOrders();
        return res.status(200).json(orders);
      }
      return res.status(400).json({ message: VENDOR_REQUIRED });
    }
    const orders = await getOrdersForVendor(vendor);
    return res.status(200).json(orders);
  } catch (error) {
    return handleApiError(res, error, 'Failed to get orders');
  }
}

export default withRole(['BRAND', USER_ROLES.SUPER_ADMIN])(handler);
