import type { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { AnalyticsData, ApiMessage } from '@/types';
import { getDb } from '@lib/db';
import { getQueryParam } from '@utils/getQueryParam';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';
import { Prisma } from '@prisma/client';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsData | ApiMessage>
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
    return;
  }
  try {
    const db = getDb();
    const startParam = getQueryParam(req.query.start);
    const endParam = getQueryParam(req.query.end);
    const brandIdParam = getQueryParam(req.query.brandId);
    const categoryParam = getQueryParam(req.query.categoryId);
    const where: Prisma.OrderWhereInput = {};
    if (startParam || endParam) {
      const start = startParam ? new Date(startParam) : new Date(0);
      const end = endParam ? new Date(endParam) : new Date();
      where.createdAt = { gte: start, lte: end };
    }
    if (brandIdParam) {
      const id = parseInt(brandIdParam, 10);
      if (!isNaN(id))
        where.product = { ...(where.product || {}), vendorId: id };
    }
    if (categoryParam) {
      const cid = parseInt(categoryParam, 10);
      if (!isNaN(cid))
        where.product = { ...(where.product || {}), categoryId: cid };
    }

    const totalOrders = await db.order.count({ where });
    const revenueAgg = await db.order.aggregate({
      where,
      _sum: { total: true },
    });
    const grouped = await db.order.groupBy({
      by: ['productId'],
      where,
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    const ids = grouped.map((g: { productId: number; _sum: { quantity: number | null } }) => g.productId);
    const products = await db.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true },
    });
    const titles = new Map(products.map((p: { id: number; title: string }) => [p.id, p.title]));
    const summary: AnalyticsData = {
      totalOrders,
      totalRevenue: revenueAgg._sum.total ?? 0,
      topProducts: grouped.map((g: { productId: number; _sum: { quantity: number | null } }) => ({
        id: String(titles.get(g.productId) ?? g.productId),
        qty: g._sum.quantity || 0,
      })),
    };
    res.status(200).json(summary);
  } catch (error) {
    handleApiError(res, error, 'Failed to load analytics');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
