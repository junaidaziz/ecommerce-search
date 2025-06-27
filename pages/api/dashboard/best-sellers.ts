import type { NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withRole, type AuthedNextApiRequest } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { ApiMessage } from '../../../types';

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<
    { products: { id: string; title: string; quantity: number }[] } | ApiMessage
  >
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const db = getDb();
    const user = req.user;
    const brandId = parseInt(getQueryParam(req.query.brandId) || '', 10);
    const vendorId = Number(user?.id) || brandId || undefined;
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
