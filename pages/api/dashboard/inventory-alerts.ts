import type { NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { withRole, type AuthedNextApiRequest } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { ApiMessage } from '../@/types';
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
    const threshold = parseInt(getQueryParam(req.query.threshold) || '10', 10);
    const where: any = { quantity: { lt: threshold } };
    if (vendorId) where.vendorId = vendorId;
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
