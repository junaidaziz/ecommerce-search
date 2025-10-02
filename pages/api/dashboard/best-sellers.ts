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
    const where: Prisma.OrderWhereInput = {};
    if (vendorId) {
      where.variant = {
        product: {
          vendorId
        }
      };
    }
    const grouped = await db.order.groupBy({
      by: ['variantId'],
      where,
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    const variantIds = grouped.map((g: { variantId: number }) => g.variantId);
    const variants = await db.variant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { id: true, title: true } } }
    });
    const productMap = new Map();
    variants.forEach(variant => {
      const productId = variant.product.id;
      const quantity = grouped.find(g => g.variantId === variant.id)?._sum.quantity || 0;
      if (productMap.has(productId)) {
        productMap.set(productId, {
          ...productMap.get(productId),
          quantity: productMap.get(productId).quantity + quantity
        });
      } else {
        productMap.set(productId, {
          id: String(productId),
          title: variant.product.title,
          quantity
        });
      }
    });
    const result = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return res.status(200).json({ products: result });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load best sellers');
  }
}

export default withRole([USER_ROLES.BRAND, USER_ROLES.SUPER_ADMIN])(handler);
