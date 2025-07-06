import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersForVendorId } from '@lib/orders';
import { handleApiError } from '@utils/handleApiError';
import type { AnalyticsData, ApiMessage } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';
import { UserRole, USER_ROLES } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsData | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }
    const session = await getServerSession(req, res, authOptions);
    const brandId =
      typeof session?.user?.brandId === 'number'
        ? session.user.brandId
        : undefined;
    if (
      !session?.user ||
      (session.user.role !== 'BRAND' && session.user.role !== USER_ROLES.SUPER_ADMIN) ||
      !brandId
    ) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const orders = await getOrdersForVendorId(brandId);
    const summary: AnalyticsData = {
      totalOrders: orders.length,
      totalRevenue: 0,
      topProducts: [],
    };
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      summary.totalRevenue += o.total || 0;
      counts[o.product.id] = (counts[o.product.id] || 0) + o.quantity;
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
