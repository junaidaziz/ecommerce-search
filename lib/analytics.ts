import { getDb } from './db';

export const ORDER_SUCCESS_STATUSES = ['shipped', 'delivered', 'completed'] as const;

export interface SalesMetricsParams {
  start?: Date;
  end?: Date;
  vendorId?: number;
}

export async function getSalesMetrics({ start, end, vendorId }: SalesMetricsParams = {}) {
  const db = getDb();
  const where: any = { status: { in: ORDER_SUCCESS_STATUSES } };
  if (start || end) {
    where.createdAt = {};
    if (start) where.createdAt.gte = start;
    if (end) where.createdAt.lte = end;
  }
  if (vendorId) {
    where.product = { vendorId };
  }
  const count = await db.order.count({ where });
  const agg = await db.order.aggregate({ where, _sum: { total: true } });
  return { count, revenue: agg._sum.total ?? 0 };
}
