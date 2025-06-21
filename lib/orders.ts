import { Order, Product } from '../types';
import { getDb } from './db';
import { mapDbRowToProduct } from './products';
import type { Prisma } from '@prisma/client';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: true;
    product: { include: { vendor: true; category: true } };
  };
}>;

interface OrderItemInput {
  id?: string | number;
  uuid?: string;
  qty?: number;
}

export interface AddOrderParams {
  userEmail: string;
  items: OrderItemInput[];
  total: number;
  status?: Order['status'];
}

function mapOrderRow(row: OrderWithRelations): Order {
  return {
    id: row.id,
    uuid: row.uuid,
    userId: row.userId,
    productId: row.productId,
    quantity: row.quantity,
    total: row.total,
    status: row.status as Order['status'],
    user: row.user,
    product: mapDbRowToProduct(row.product),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function addOrder({
  userEmail,
  items,
  total,
  status = 'pending',
}: AddOrderParams): Promise<Order[]> {
  const db = getDb();
  const user = await db.user.findUnique({ where: { email: userEmail } });
  if (!user) throw new Error('user not found');

  const createdOrders: OrderWithRelations[] = await Promise.all(
    items.map((item) =>
      db.order.create({
        data: {
          user: { connect: { id: user.id } },
          product: { connect: { uuid: String(item.uuid ?? item.id) } },
          quantity: item.qty ?? 1,
          total,
          status,
        },
        include: {
          user: true,
          product: { include: { vendor: true, category: true } },
        },
      })
    )
  );

  return createdOrders.map((o) => mapOrderRow(o));
}

export async function getOrdersForUser(email: string): Promise<Order[]> {
  const db = getDb();
  const rows: OrderWithRelations[] = await db.order.findMany({
    where: { user: { email } },
    include: { user: true, product: { include: { vendor: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapOrderRow);
}

export async function getAllOrders(): Promise<Order[]> {
  const db = getDb();
  const rows: OrderWithRelations[] = await db.order.findMany({
    include: { user: true, product: { include: { vendor: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapOrderRow);
}

export async function getOrdersForVendor(vendor: string): Promise<Order[]> {
  const db = getDb();
  const rows: OrderWithRelations[] = await db.order.findMany({
    where: { product: { vendor: { brandName: vendor } } },
    include: { user: true, product: { include: { vendor: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapOrderRow);
}

export async function hasOrdersForProduct(productUuid: string): Promise<boolean> {
  const db = getDb();
  const count = await db.order.count({ where: { product: { uuid: productUuid } } });
  return count > 0;
}

export async function getOrderByUuid(uuid: string): Promise<(Order & { userEmail: string }) | null> {
  const db = getDb();
  const row: OrderWithRelations | null = await db.order.findUnique({
    where: { uuid },
    include: { user: true, product: { include: { vendor: true, category: true } } },
  });
  if (!row) return null;
  const order = mapOrderRow(row);
  return { ...order, userEmail: row.user.email };
}

export async function updateOrderStatus(uuid: string, status: string): Promise<void> {
  const db = getDb();
  await db.order.update({ where: { uuid }, data: { status } });
}

export async function getBestSellingProducts(limit = 8): Promise<Product[]> {
  const db = getDb();
  const grouped = await db.order.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });
  const ids = grouped.map((g: { productId: number }) => g.productId);
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    include: { category: true, vendor: true },
  });

  return products.map((p: Prisma.ProductGetPayload<{ include: { category: true; vendor: true } }>) =>
    mapDbRowToProduct(p)
  );
}
