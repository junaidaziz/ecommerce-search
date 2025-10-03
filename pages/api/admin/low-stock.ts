import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage, LowStockProduct } from '@/types';
import { USER_ROLES } from '@/types';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@lib/config';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ products: LowStockProduct[] } | ApiMessage>
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
    return;
  }
  try {
    const db = getDb();
    const param = parseInt(String(req.query.threshold || ''), 10);
    const threshold = Number.isNaN(param) ? DEFAULT_LOW_STOCK_THRESHOLD : param;
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '20'), 10);
    const offset = (page - 1) * limit;
    const rows: Array<{
      id: string | number;
      title: string;
      quantity: number;
      lowStockThreshold?: number | null;
    }> = await db.product.findMany({
      select: {
        id: true,
        title: true,
        quantity: true,
        lowStockThreshold: true,
      },
    });
    const products = rows
      .filter((p) => p.quantity < (p.lowStockThreshold ?? threshold))
      .sort((a, b) => a.quantity - b.quantity);
    const total = products.length;
    const paginated = products.slice(offset, offset + limit);
    res.status(200).json({
      products: paginated,
      total,
      page,
      limit
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to load low stock products');
  }
}

export default withRole([USER_ROLES.SUPER_ADMIN])(handler);
