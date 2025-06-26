import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendor } from '../../../lib/orders';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { EarningsData, ApiMessage } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EarningsData | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const vendor = getQueryParam(req.query.vendor);
    if (!vendor) {
      return res.status(400).json({ message: 'vendor required' });
    }
    const orders = await getOrdersForVendor(vendor);
    const totalEarned = orders.reduce((s, o) => s + (o.total || 0), 0);
    const pending = orders
      .filter((o) => o.status !== 'completed')
      .reduce((s, o) => s + (o.total || 0), 0);
    const data: EarningsData = {
      totalEarned,
      pending,
      orders,
    };
    return res.status(200).json(data);
  } catch (error) {
    return handleApiError(res, error, 'Failed to get earnings');
  }
}
