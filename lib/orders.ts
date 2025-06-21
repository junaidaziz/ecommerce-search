import { OrderRow, Order, Product } from '../types';
import { getDb } from './db';
import { mapDbRowToProduct } from './products';
import type { Prisma } from '@prisma/client';

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
  shippingName?: string | null;
  shippingAddress?: string | null;
}

function mapOrderRow(row: OrderRow): Order {
  return {
    id: row.id,
    uuid: row.uuid,
    userId: row.userId,
    productId: row.productId,
    quantity: row.quantity,
    total: row.total,
    status: row.status as Order['status'],
    user: row.user,
    product: mapDbRowToProduct({
      id: row.product.id,
      slug: row.product.slug,
      title: row.product.title,
      vendor: row.product.vendor?.brandName ?? String(row.product.vendorId),
      description: row.product.description,
      product_type: row.product.productType,
      tags: row.product.tags,
      category: row.product.category?.name,
      images: row.product.images,
      quantity: row.product.quantity,
      min_price: row.product.minPrice,
      max_price: row.product.maxPrice,
      currency: row.product.currency,
    }),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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

  const createdOrders = await Promise.all(
    items.map((item) =>
      db.order.create({
        data: {
          user: { connect: { id: user.id } },
          product: { connect: { uuid: String(item.uuid ?? item.id) } },
          quantity: item.qty ?? 1,
          total,
          status,
        },
        include: { user: true, product: { include: { vendor: true, category: true } } },
      })
    )
  );

  return createdOrders.map((o) => mapOrderRow(o as unknown as OrderRow));
}

export async function getOrdersForUser(email: string): Promise<Order[]> {
  const db = getDb();
  const rows = await db.order.findMany({
    where: { user: { email } },
    include: { user: true, product: { include: { vendor: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapOrderRow);
}

export async function getAllOrders(): Promise<Order[]> {
  const db = getDb();
  const rows = await db.order.findMany({
    include: { user: true, product: { include: { vendor: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapOrderRow);
}

export async function getOrdersForVendor(vendor: string): Promise<Order[]> {
  const db = getDb();
  const rows = await db.order.findMany({
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
  const row = await db.order.findUnique({
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

  return products.map((p) =>
    mapDbRowToProduct({
      id: p.id,
      slug: p.slug,
      title: p.title,
      vendor: p.vendor?.brandName ?? String(p.vendorId),
      description: p.description,
      product_type: p.productType,
      tags: p.tags,
      category: p.category?.name,
      images: p.images,
      quantity: p.quantity,
      min_price: p.minPrice,
      max_price: p.maxPrice,
      currency: p.currency,
    })
  );
}
