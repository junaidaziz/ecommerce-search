import { OrderRow, Order } from '../types';
import { getDb } from './db';
import { mapDbRowToProduct } from './products';

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
    product: mapDbRowToProduct(row.product),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function addOrder({
  user_email,
  items,
  total,
  status = 'pending',
  shipping_name = null,
  shipping_address = null,
}: {
  user_email: string;
  items: any[];
  total: number;
  status?: string;
  shipping_name?: string | null;
  shipping_address?: string | null;
}) {
  const db = getDb();
  const user = await db.user.findUnique({ where: { email: user_email } });
  if (!user) throw new Error('user not found');
  let lastId: number | null = null;
  for (const item of items) {
    const created = await db.order.create({
      data: {
        user: { connect: { id: user.id } },
        product: { connect: { uuid: item.uuid || String(item.id) } },
        quantity: item.qty || 1,
        total,
        status,
      },
    });
    lastId = created.id;
  }
  return lastId;
}

export async function getOrdersForUser(email: string) {
  const db = getDb();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return [];
  const rows = await db.order.findMany({
    where: { userId: user.id },
    include: { product: { include: { vendor: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapOrderRow);
}

export async function getAllOrders() {
  const db = getDb();
  const rows = await db.order.findMany({
    include: { user: true, product: { include: { vendor: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapOrderRow);
}

export async function getOrdersForVendor(vendor: string) {
  const db = getDb();
  const rows = await db.order.findMany({
    include: { product: { include: { vendor: true, category: true } }, user: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows
    .filter((row) => row.product.vendor?.brandName === vendor)
    .map(mapOrderRow);
}

export async function hasOrdersForProduct(productUuid: string) {
  const db = getDb();
  const product = await db.product.findUnique({ where: { uuid: productUuid } });
  if (!product) return false;
  const count = await db.order.count({ where: { productId: product.id } });
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

export async function updateOrderStatus(uuid: string, status: string) {
  const db = getDb();
  await db.order.update({ where: { uuid }, data: { status } });
}

export async function getBestSellingProducts(limit = 8) {
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
  return products.map((p: any) =>
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
