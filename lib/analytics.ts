import { getDb } from './db';
import type { Prisma } from '@prisma/client';

export const ORDER_SUCCESS_STATUSES = ['shipped', 'delivered', 'completed'] as const;

export interface SalesMetricsParams {
  start?: Date;
  end?: Date;
  vendorId?: number;
}

export async function getSalesMetrics(
  { start, end, vendorId }: SalesMetricsParams = {}
): Promise<{ count: number; revenue: number }> {
  const db = getDb();
  const where: Prisma.OrderWhereInput = {
    status: { in: ORDER_SUCCESS_STATUSES },
  };
  if (start || end) {
    where.createdAt = {};
    if (start) (where.createdAt as Prisma.DateTimeFilter).gte = start;
    if (end) (where.createdAt as Prisma.DateTimeFilter).lte = end;
  }
  if (vendorId) {
    where.variant = {
      product: {
        vendorId
      }
    };
  }
  const count = await db.order.count({ where });
  const agg = await db.order.aggregate({ where, _sum: { total: true } });
  return { count, revenue: agg._sum.total ?? 0 };
}
