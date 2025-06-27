import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendor } from '../../../lib/orders';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { EarningsData, ApiMessage } from '../../../types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EarningsData | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const session = await getServerSession(req, res, authOptions);
    const vendor = session?.user?.brandName || getQueryParam(req.query.vendor);
    if (!session?.user || session.user.role !== 'BRAND' || !vendor) {
      return res.status(401).json({ message: 'Unauthorized' });
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
