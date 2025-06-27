import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendorId } from '@lib/orders';
import { handleApiError } from '@utils/handleApiError';
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
    const brandId =
      typeof session?.user?.brandId === 'number'
        ? session.user.brandId
        : undefined;
    if (!session?.user || session.user.role !== 'BRAND' || !brandId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const orders = await getOrdersForVendorId(brandId);
    const totalEarned = orders.reduce((s, o) => s + (o.total || 0), 0);
    const pending = orders
      .filter((o) => o.status !== 'delivered')
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
