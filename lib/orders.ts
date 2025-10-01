import { Order, OrderStatus, Product } from '../types';
import { getDb } from './db';
import { mapDbRowToProduct } from './products';
import { createNotification } from './notifications';
import { sendBrandNewOrder } from './email';
import type { Prisma } from '@prisma/client';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: true;
    variant: { include: { product: { include: { vendor: true, category: true } } } };
  };
}>;

interface OrderItemInput {
  id?: string | number;
  uuid?: string;
  qty?: number;
}

interface AddOrderParams {
  userEmail: string;
  items: OrderItemInput[];
  total: number;
  status?: Order['status'];
  paymentMethod?: string;
  paymentReference?: string;
  paymentProof?: string;
}

export function mapDbRowToOrder(row: OrderWithRelations): Order {
  return {
    id: row.id,
    uuid: row.uuid,
    userId: row.userId,
    variantId: row.variantId,
    quantity: row.quantity,
    total: row.total,
    status: row.status as Order['status'],
    paymentMethod: row.paymentMethod ?? null,
    paymentReference: row.paymentReference ?? null,
    paymentProof: row.paymentProof ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function addOrder({
  userEmail,
  items,
  total,
  status = OrderStatus.PROCESSING,
  paymentMethod,
  paymentReference,
  paymentProof,
}: AddOrderParams): Promise<Order[]> {
  const db = getDb();
  const user = await db.user.findUnique({ where: { email: userEmail } });
  if (!user) throw new Error('user not found');

  const createdOrders: OrderWithRelations[] = await Promise.all(
    items.map((item) =>
      db.order.create({
        data: {
          user: { connect: { id: user.id } },
          variant: { connect: { uuid: String(item.uuid ?? item.id) } },
          quantity: item.qty ?? 1,
          total,
          status,
          paymentMethod,
          paymentReference,
          paymentProof,
        },
        include: {
          user: true,
          variant: { include: { product: { include: { vendor: true, category: true } } } },
        },
      })
    )
  );

  await Promise.all(
    createdOrders.map((o) =>
      createNotification({
        userId: o.variant.product.vendor.id,
        orderId: o.id,
        message: `New order for ${o.variant.product.title}`,
      })
    )
  );

  await Promise.all(
    createdOrders.map((o) =>
      sendBrandNewOrder(o.variant.product.vendor.email, { id: o.id })
    )
  );

  return createdOrders.map((o) => mapDbRowToOrder(o));
}

export async function getOrdersForUser(email: string): Promise<Order[]> {
  const db = getDb();
  const rows: OrderWithRelations[] = await db.order.findMany({
    where: { user: { email } },
    include: {
      user: true,
      variant: { include: { product: { include: { vendor: true, category: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapDbRowToOrder);
}

export async function getAllOrders(): Promise<Order[]> {
  const db = getDb();
  const rows: OrderWithRelations[] = await db.order.findMany({
    include: {
      user: true,
      variant: { include: { product: { include: { vendor: true, category: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapDbRowToOrder);
}

export async function getAllOrdersFiltered(params: {
  status?: string;
  search?: string;
}): Promise<Order[]> {
  const db = getDb();
  const { status, search } = params;
  const rows: OrderWithRelations[] = await db.order.findMany({
    where: {
      AND: [
        status ? { status } : {},
        search
          ? {
              OR: [
                { user: { email: { contains: search, mode: 'insensitive' } } },
                {
                  variant: {
                    product: {
                      title: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {},
      ],
    },
    include: {
      user: true,
      variant: { include: { product: { include: { vendor: true, category: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapDbRowToOrder);
}

export async function getOrdersForVendor(vendor: string): Promise<Order[]> {
  const db = getDb();
  const rows: OrderWithRelations[] = await db.order.findMany({
    where: { variant: { product: { vendor: { brandName: vendor } } } },
    include: {
      user: true,
      variant: { include: { product: { include: { vendor: true, category: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapDbRowToOrder);
}

export async function getOrdersForVendorId(vendorId: number): Promise<Order[]> {
  const db = getDb();
  const rows: OrderWithRelations[] = await db.order.findMany({
    where: { variant: { product: { vendorId } } },
    include: {
      user: true,
      variant: { include: { product: { include: { vendor: true, category: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapDbRowToOrder);
}

export async function hasOrdersForProduct(
  productUuid: string
): Promise<boolean> {
  const db = getDb();
  const product = await db.product.findUnique({
    where: { uuid: productUuid },
    select: { id: true },
  });
  if (!product) return false;
  const variants = await db.variant.findMany({ where: { productId: product.id }, select: { id: true } });
  if (!variants.length) return false;
  const count = await db.order.count({ where: { variantId: { in: variants.map(v => v.id) } } });
  return count > 0;
}

export async function getOrderByUuid(
  uuid: string
): Promise<(Order & { userEmail: string }) | null> {
  const db = getDb();
  const row: OrderWithRelations | null = await db.order.findUnique({
    where: { uuid },
    include: {
      user: true,
      variant: { include: { product: { include: { vendor: true, category: true } } } },
    },
  });
  if (!row) return null;
  const order = mapDbRowToOrder(row);
  return { ...order, userEmail: row.user.email };
}

export async function updateOrderStatus(
  uuid: string,
  status: string
): Promise<void> {
  const db = getDb();
  const existing = await db.order.findUnique({
    where: { uuid },
    include: { variant: { include: { product: true } } },
  });
  if (!existing) return;
  if (
    status === 'shipped' &&
    !['shipped', 'delivered', 'completed'].includes(existing.status)
  ) {
    if (existing.variant && existing.variant.productId) {
      await db.product.update({
        where: { id: existing.variant.productId },
        data: { quantity: { decrement: existing.quantity } },
      });
    }
  }
  await db.order.update({ where: { uuid }, data: { status } });
}

export async function getBestSellingProducts(limit = 8): Promise<Product[]> {
  const db = getDb();
  const grouped = await db.order.groupBy({
    by: ['variantId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });
  const variantIds = grouped.map((g: { variantId: number }) => g.variantId);
  const variants = await db.variant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { include: { category: true, vendor: true } } },
  });
  return variants.map((v) => mapDbRowToProduct(v.product));
}
