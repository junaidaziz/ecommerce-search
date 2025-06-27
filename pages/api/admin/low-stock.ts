import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage, LowStockProduct } from '../../../types';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@lib/config';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ products: LowStockProduct[] } | ApiMessage>
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    const db = getDb();
    const param = parseInt(String(req.query.threshold || ''), 10);
    const threshold = Number.isNaN(param) ? DEFAULT_LOW_STOCK_THRESHOLD : param;
    const rows = await db.product.findMany({
      select: { id: true, title: true, quantity: true, lowStockThreshold: true },
    });
    const products = rows
      .filter((p) => p.quantity < (p.lowStockThreshold ?? threshold))
      .map((p) => ({
        id: String(p.id),
        title: p.title,
        quantity: p.quantity,
      }));
    res.status(200).json({ products });
  } catch (error) {
    handleApiError(res, error, 'Failed to load low stock products');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
