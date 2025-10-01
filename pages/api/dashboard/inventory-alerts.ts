import type { NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { withRole, type AuthedNextApiRequest } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { UserRole, type ApiMessage, type Product, USER_ROLES } from '@/types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';
import { Prisma } from '@prisma/client';

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<
    { products: Pick<Product, 'id' | 'title' | 'quantity'>[] } | ApiMessage
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
      (user?.role === USER_ROLES.SUPER_ADMIN ? queryBrandId : undefined);
    if (!user?.brandId && user?.role !== USER_ROLES.SUPER_ADMIN) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }
    const threshold = parseInt(getQueryParam(req.query.threshold) || '10', 10);
    const where: Prisma.ProductWhereInput = { quantity: { lt: threshold } };
    if (vendorId) where.vendorId = vendorId;
    const products = await db.product.findMany({
      where,
      select: { id: true, title: true, quantity: true },
    });
    const result = products.map(
      (p: Pick<Product, 'id' | 'title' | 'quantity'>) => ({
        id: String(p.id),
        title: p.title,
        quantity: p.quantity,
      })
    );
    return res.status(200).json({ products: result });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load inventory alerts');
  }
}

export default withRole([USER_ROLES.BRAND, USER_ROLES.SUPER_ADMIN])(handler);
