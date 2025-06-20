import { OrderRow } from '../types';
import { getDb } from './db';
import { mapDbRowToProduct } from './products';

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
        product: { connect: { id: Number(item.ID) } },
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
  return rows.map((row) => ({
    id: row.id,
    user_email: email,
    items: [
      {
        ...mapDbRowToProduct({
          id: row.product.id,
          slug: row.product.slug,
          title: row.product.title,
          vendor: row.product.vendor?.brandName ?? String(row.product.vendorId),
          description: row.product.description,
          product_type: row.product.productType,
          tags: Array.isArray(row.product.tags)
            ? row.product.tags
            : typeof row.product.tags === 'string'
            ? row.product.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
          category: row.product.category?.name,
          images: row.product.images,
          quantity: row.product.quantity,
          min_price: row.product.minPrice,
          max_price: row.product.maxPrice,
          currency: row.product.currency,
        }),
        qty: row.quantity,
      },
    ],
    total: row.total,
    status: row.status,
    shipping_name: null,
    shipping_address: null,
    created_at: row.createdAt,
  }));
}

export async function getAllOrders() {
  const db = getDb();
  const rows = await db.order.findMany({
    include: { user: true, product: { include: { vendor: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((row) => ({
    id: row.id,
    user_email: row.user.email,
    items: [
      {
        ...mapDbRowToProduct({
          id: row.product.id,
          slug: row.product.slug,
          title: row.product.title,
          vendor: row.product.vendor?.brandName ?? String(row.product.vendorId),
          description: row.product.description,
          product_type: row.product.productType,
          tags: Array.isArray(row.product.tags)
            ? row.product.tags
            : typeof row.product.tags === 'string'
            ? row.product.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
          category: row.product.category?.name,
          images: row.product.images,
          quantity: row.product.quantity,
          min_price: row.product.minPrice,
          max_price: row.product.maxPrice,
          currency: row.product.currency,
        }),
        qty: row.quantity,
      },
    ],
    total: row.total,
    status: row.status,
    shipping_name: null,
    shipping_address: null,
    created_at: row.createdAt,
  }));
}

export async function getOrdersForVendor(vendor: string) {
  const db = getDb();
  const rows = await db.order.findMany({
    include: { product: { include: { vendor: true, category: true } }, user: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows
    .filter((row) => row.product.vendor?.brandName === vendor)
    .map((row) => ({
      id: row.id,
      user_email: row.user.email,
      items: [
        {
          ...mapDbRowToProduct({
            id: row.product.id,
            slug: row.product.slug,
            title: row.product.title,
            vendor: row.product.vendor?.brandName ?? String(row.product.vendorId),
            description: row.product.description,
            product_type: row.product.productType,
            tags: Array.isArray(row.product.tags)
              ? row.product.tags
              : typeof row.product.tags === 'string'
              ? row.product.tags.split(',').map((t) => t.trim()).filter(Boolean)
              : [],
            category: row.product.category?.name,
            images: row.product.images,
            quantity: row.product.quantity,
            min_price: row.product.minPrice,
            max_price: row.product.maxPrice,
            currency: row.product.currency,
          }),
          qty: row.quantity,
        },
      ],
      total: row.total,
      status: row.status,
      shipping_name: null,
      shipping_address: null,
      created_at: row.createdAt,
    }));
}

export async function hasOrdersForProduct(productId: string | number) {
  const db = getDb();
  const count = await db.order.count({ where: { productId: Number(productId) } });
  return count > 0;
}

export async function getOrderById(id: string | number) {
  const db = getDb();
  const row = await db.order.findUnique({
    where: { id: Number(id) },
    include: { user: true, product: { include: { vendor: true, category: true } } },
  });
  if (!row) return null;
  return {
    id: row.id,
    user_email: row.user.email,
    items: [
      {
        ...mapDbRowToProduct({
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
        qty: row.quantity,
      },
    ],
    total: row.total,
    status: row.status,
    shipping_name: null,
    shipping_address: null,
    created_at: row.createdAt,
  };
}

export async function updateOrderStatus(id: string | number, status: string) {
  const db = getDb();
  await db.order.update({ where: { id: Number(id) }, data: { status } });
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
