import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendor } from '../../../lib/orders';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { AnalyticsData, ApiMessage } from '../../../types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsData | ApiMessage>
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
    const summary: AnalyticsData = {
      totalOrders: orders.length,
      totalRevenue: 0,
      topProducts: [],
    };
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      summary.totalRevenue += o.total || 0;
      if (o.product.vendor.brandName === vendor) {
        counts[o.product.id] = (counts[o.product.id] || 0) + o.quantity;
      }
    });
    summary.topProducts = Object.entries(counts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([id, qty]) => ({ id, qty }));
    return res.status(200).json(summary);
  } catch (error) {
    return handleApiError(res, error, 'Failed to load analytics');
  }
}
