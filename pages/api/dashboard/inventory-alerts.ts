import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { ApiMessage } from '../../../types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { products: { id: string; title: string; quantity: number }[] } | ApiMessage
  >
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const db = getDb();
    const user = (req as any).user as { brandName?: string } | undefined;
    const brand = user?.brandName || getQueryParam(req.query.brand);
    const threshold = parseInt(getQueryParam(req.query.threshold) || '10', 10);
    const where: any = { quantity: { lt: threshold } };
    if (brand) where.vendor = { brandName: brand };
    const products = await db.product.findMany({
      where,
      select: { id: true, title: true, quantity: true },
    });
    const result = products.map((p) => ({
      id: String(p.id),
      title: p.title,
      quantity: p.quantity,
    }));
    return res.status(200).json({ products: result });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load inventory alerts');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
