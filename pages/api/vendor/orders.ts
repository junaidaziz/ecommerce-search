import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendor } from '@lib/orders';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { Order, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED, VENDOR_REQUIRED } from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const vendor = getQueryParam(req.query.vendor);
    if (!vendor) {
      return res.status(400).json({ message: VENDOR_REQUIRED });
    }
    const orders = await getOrdersForVendor(vendor);
    return res.status(200).json(orders);
  } catch (error) {
    return handleApiError(res, error, 'Failed to get orders');
  }
}

export default withRole(['BRAND'])(handler);
