import type { NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { withRole, type AuthedNextApiRequest } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { ApiMessage } from '../../../types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<
    { products: { id: string; title: string; quantity: number }[] } | ApiMessage
  >
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
      (user?.role === 'SUPER_ADMIN' ? queryBrandId : undefined);
    if (!user?.brandId && user?.role !== 'SUPER_ADMIN') {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const where: any = {};
    if (vendorId) where.product = { vendorId };
    const grouped = await db.order.groupBy({
      by: ['productId'],
      where,
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    const ids = grouped.map((g) => g.productId);
    const products = await db.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true },
    });
    const map = new Map(products.map((p) => [p.id, p.title]));
    const result = grouped.map((g) => ({
      id: String(g.productId),
      title: map.get(g.productId) || '',
      quantity: g._sum.quantity || 0,
    }));
    return res.status(200).json({ products: result });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load best sellers');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
