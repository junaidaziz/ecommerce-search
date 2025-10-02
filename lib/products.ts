import { JSDOM } from 'jsdom';
import { getDb } from './db';
import type { Product, ProductInput, Category } from '@/types';
import client from './typesenseClient';
import { Prisma } from '@prisma/client';
import { getBestSellingProducts } from './orders';
import { slugify } from './slugify';
import { ensureTypesenseProductCollection } from './initTypesense';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Simplified representation of a product row returned from the database.
 * Only the fields that are accessed in this module are included.
 */

const stripHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  try {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent || '';
  } catch {
    return html ?? '';
  }
};

type DbProductRow = Prisma.ProductGetPayload<{
  include: { category: true; vendor: true; variants: true };
}>;

function processProductRow(row: DbProductRow): Product {
  const processed: Record<string, unknown> = { ...row };
  const jsonFields = ['SEO', 'OPTIONS', 'VARIANTS', 'METAFIELDS'];
  jsonFields.forEach((field) => {
    if (processed[field]) {
      try {
        processed[field] =
          typeof processed[field] === 'string'
            ? JSON.parse(processed[field] as string)
            : processed[field];
      } catch {
        processed[field] = null;
      }
    }
  });
  processed.descriptionText = stripHtml(
    processed.description as string | null | undefined
  );
  processed.bodyHtmlText = stripHtml(
    processed.bodyHtml as string | null | undefined
  );
  processed.minPrice = Number(processed.minPrice) || 0;
  processed.maxPrice = Number(processed.maxPrice) || 0;
  processed.currency = processed.currency || 'GBP';
  const meta = processed.METAFIELDS as
    | {
        stoked_inventory_sold_count?: { value?: string };
        yotpo_reviews_count?: { value?: string };
        yotpo_reviews_average?: { value?: string };
      }
    | undefined;
  processed.soldCount = parseInt(
    meta?.stoked_inventory_sold_count?.value ?? '0',
    10
  );
  processed.reviewCount = parseInt(meta?.yotpo_reviews_count?.value ?? '0', 10);
  processed.averageRating = parseFloat(
    meta?.yotpo_reviews_average?.value ?? '0'
  );
  if (row.uuid) {
    processed.uuid = String(row.uuid);
  }
  if (processed.slug) {
    processed.slug = String(processed.slug);
  }
  // Always convert images to string[]
  if (typeof processed.images === 'string') {
    processed.images = processed.images.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(processed.images) && processed.images.length > 0) {
    processed.featuredImage = processed.images[0];
  }
  // Fix vendor.paymentMethods
  if (processed.vendor) {
    const vendor = processed.vendor as any;
    vendor.paymentMethods = Array.isArray(vendor.paymentMethods)
      ? vendor.paymentMethods
      : null;
  }
  return processed as Product;
}

async function loadProductsData(): Promise<Product[]> {
  const db = getDb();
  try {
    const rows = await db.product.findMany({
      where: { status: 'approved', vendor: { active: true } },
      include: { category: true, vendor: true, variants: true },
    });

    return rows.map(mapDbRowToProduct);
  } catch (error: unknown) {
    throw error;
  }
}

export function mapDbRowToProduct(row: DbProductRow): Product {
  const {
    images,
    quantity,
    minPrice,
    maxPrice,
    currency,
    discountType,
    discountValue,
    ...rest
  } = row;
  return processProductRow({
    ...rest,
    images: typeof images === 'string' ? images.split(',').map((s: string) => s.trim()).filter(Boolean) : images,
    totalInventory: quantity,
    variants: row.variants,
    minPrice,
    maxPrice,
    currency,
    discountType,
    discountValue,
    vendor: row.vendor
      ? {
          ...row.vendor,
          paymentMethods: Array.isArray(row.vendor.paymentMethods)
            ? row.vendor.paymentMethods
            : null,
        }
      : undefined,
    category: row.category,
  });
}

export async function indexProductsToTypesense(
  products: Product[]
): Promise<void> {
  if (products.length === 0) return;
  await ensureTypesenseProductCollection();
  const documents = products.map((p: Product) => ({
    id: String(p.id),
    title: p.title,
    name: p.title,
    slug: p.slug ?? slugify(p.title),
    description: p.description || '',
    price: p.minPrice,
    category: '', // No nested category object, so leave blank or use categoryId
    brand: '', // No nested vendor object, so leave blank or use vendorId
    sold_count: 0, // Not available on Product model
  }));

  try {
    await client
      .collections('products')
      .documents()
      .import(documents, { action: 'upsert' });
    const cats = Array.from(new Set(documents.map((d) => d.category))).join(
      ', '
    );
    console.log(`Indexed ${documents.length} products. Categories: ${cats}`);
  } catch (err: unknown) {
    console.error('Failed to index products to Typesense', err);
  }
}

export async function loadAndIndexProducts(): Promise<{ products: Product[] }> {
  const products = await loadProductsData();
  await indexProductsToTypesense(products);
  return { products };
}

export async function addProduct(product: ProductInput): Promise<void> {
  const db = getDb();
  if (!product.vendorId) {
    const err = new Error('vendorId is required') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }
  if (!product.categoryId) {
    const err = new Error('categoryId is required') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }
  const data = {
    uuid: product.uuid,
    slug: (product.slug ?? '').trim() || slugify(product.title || product.uuid || ''),
    sku: product.sku,
    title: product.title,
    description: product.description ?? '',
    productType: product.productType ?? '',
    tags: product.tags ?? '',
    quantity: product.quantity ?? 0,
    minPrice: product.minPrice ?? 0,
    maxPrice: product.maxPrice ?? 0,
    currency: product.currency ?? 'USD',
    discountType: product.discountType ?? null,
    discountValue: product.discountValue ?? null,
    status: product.status ?? 'approved',
    vendorId: product.vendorId,
    categoryId: product.categoryId,
    images: Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : []),
  };
  try {
    await db.product.create({ data });
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const err = new Error(
        'Product with the same name or slug already exists.'
      ) as Error & { code?: string };
      err.code = 'BAD_REQUEST';
      throw err;
    }
    throw error;
  }
}

export async function updateProduct(
  product: ProductInput & { id?: string | number }
): Promise<void> {
  const db = getDb();
  const existing = await db.product.findUnique({
    where: { uuid: product.uuid || String(product.id) },
  });
  if (!product.vendorId) {
    const err = new Error('vendorId is required') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }
  if (!product.categoryId) {
    const err = new Error('categoryId is required') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }
  await db.product.update({
    where: { uuid: product.uuid || String(product.id) },
    data: {
      sku: product.sku,
      title: product.title,
      description: product.description,
      productType: product.productType,
      tags: product.tags,
      quantity: product.quantity,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      currency: product.currency,
      discountType: product.discountType,
      discountValue: product.discountValue,
      vendorId: product.vendorId,
      categoryId: product.categoryId,
      images: Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : []),
    },
  });
  if (existing && existing.quantity <= 0 && (product.quantity ?? 0) > 0) {
    try {
      await import('./wishlist').then(({ notifyBackInStock }) =>
        notifyBackInStock(existing.id)
      );
    } catch {
      // ignore
    }
  }
}

export async function getPendingProducts(): Promise<Product[]> {
  const db = getDb();
  const rows = await db.product.findMany({
    where: { status: 'pending' },
    include: { category: true, vendor: true, variants: true },
  });
  return rows.map(mapDbRowToProduct);
}

export async function getProductsByCategorySlug(
  slug: string
): Promise<Product[]> {
  const db = getDb();
  const rows = await db.product.findMany({
    where: { status: 'approved', category: { slug }, vendor: { active: true } },
    include: { category: true, vendor: true, variants: true },
  });
  return rows.map(mapDbRowToProduct);
}

export async function getProductsByCategorySlugPaginated(
  slug: string,
  limit: number,
  offset = 0
): Promise<Product[]> {
  const db = getDb();
  const rows = await db.product.findMany({
    where: { status: 'approved', category: { slug }, vendor: { active: true } },
    include: { category: true, vendor: true, variants: true },
    take: limit,
    skip: offset,
    orderBy: { id: 'asc' },
  });
  return rows.map(mapDbRowToProduct);
}

export async function getApprovedProductsPaginated(
  limit: number,
  offset = 0
): Promise<Product[]> {
  const db = getDb();
  const rows = await db.product.findMany({
    where: { status: 'approved', vendor: { active: true } },
    include: { category: true, vendor: true, variants: true },
    take: limit,
    skip: offset,
    orderBy: { id: 'asc' },
  });
  return rows.map(mapDbRowToProduct);
}

export async function getProductsByVendorBrandName(
  brandName: string
): Promise<Product[]> {
  const db = getDb();
  const rows = await db.product.findMany({
    where: { status: 'approved', vendor: { brandName, active: true } },
    include: { category: true, vendor: true, variants: true },
    orderBy: { id: 'asc' },
  });
  return rows.map(mapDbRowToProduct);
}

export interface PaginatedOptions {
  limit: number;
  offset: number;
  categorySlugs?: string[];
  search?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'popularity' | 'newest';
}

export interface PaginatedResult {
  products: Product[];
  total: number;
}

export async function getProductsPaginated(
  options: PaginatedOptions
): Promise<PaginatedResult> {
  const db = getDb();
  const where: Prisma.ProductWhereInput = { status: 'approved', vendor: { active: true } };
  if (options.categorySlugs && options.categorySlugs.length > 0) {
    where.category = {
      slug: { in: options.categorySlugs },
    };
  }
  if (options.inStock) {
    where.quantity = { gt: 0 };
  }
  if (options.search) {
    const term = options.search.trim();
    if (term) {
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }
  }
  if (typeof options.minPrice === 'number') {
    where.maxPrice = { gte: options.minPrice };
  }
  if (typeof options.maxPrice === 'number') {
    const current = typeof where.minPrice === 'object' ? where.minPrice : {};
    where.minPrice = { ...current, lte: options.maxPrice };
  }
  const orderBy = (() => {
    switch (options.sort) {
      case 'price_asc':
        return { minPrice: 'asc' as const };
      case 'price_desc':
        return { minPrice: 'desc' as const };
      case 'newest':
        return { createdAt: 'desc' as const };
      default:
        return { id: 'asc' as const };
    }
  })();
  if (options.sort === 'popularity') {
    const popular = await getBestSellingProducts(
      options.offset + options.limit
    );
    return {
      total: popular.length,
      products: popular.slice(options.offset, options.offset + options.limit),
    };
  }
  let rows = await db.product.findMany({
    where,
    include: { category: true, vendor: true, variants: true },
    orderBy,
  });
  const total = rows.length;
  rows = rows.slice(options.offset, options.offset + options.limit);
  return {
    total,
    products: rows.map(mapDbRowToProduct),
  };
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const db = getDb();
  return db.category.findFirst({ where: { slug } });
}

export async function approveProduct(uuid: string): Promise<void> {
  const db = getDb();
  await db.product.update({ where: { uuid }, data: { status: 'approved' } });
}

export async function rejectProduct(uuid: string): Promise<void> {
  const db = getDb();
  await db.product.update({ where: { uuid }, data: { status: 'rejected' } });
}

export async function getCategoriesFlat(): Promise<Category[]> {
  const db = getDb();
  return db.category.findMany({ orderBy: { name: 'asc' } });
}

export async function getCategoryTree(): Promise<Category[]> {
  return getCategoriesFlat();
}

export async function getCategoriesPaginated(
  search: string,
  limit: number,
  offset = 0
): Promise<Category[]> {
  const db = getDb();
  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : undefined;
  return db.category.findMany({
    where,
    orderBy: { name: 'asc' },
    take: limit,
    skip: offset,
  });
}

export async function createCategory(
  name: string,
  slug?: string
): Promise<Category> {
  const db = getDb();
  const slugValue = slug || name.toLowerCase().replace(/\s+/g, '-');
  const existing = await db.category.findFirst({
    where: { OR: [{ name }, { slug: slugValue }] },
  });
  if (existing) return existing;
  return db.category.create({ data: { name, slug: slugValue } });
}

export async function renameCategory(
  uuid: string,
  name: string
): Promise<void> {
  const db = getDb();
  await db.category.update({ where: { uuid }, data: { name } });
}

export async function removeCategory(uuid: string): Promise<void> {
  const db = getDb();
  const category = await db.category.findUnique({ where: { uuid } });
  if (!category) return;
  const count = await db.product.count({ where: { categoryId: category.id } });
  if (count === 0) {
    await db.category.delete({ where: { uuid } });
  } else {
    throw new Error('category in use');
  }
}

export async function deleteProduct(uuid: string): Promise<void> {
  const db = getDb();
  await db.product.delete({ where: { uuid } });
}

export async function getDistinctTags(search = ''): Promise<string[]> {
  const db = getDb();
  const rows = await db.product.findMany({
    select: { tags: true },
  });
  const term = search.trim().toLowerCase();
  const set = new Set<string>();
  for (const row of rows) {
    const tags = Array.isArray(row.tags) ? row.tags : [];
    for (const tag of tags) {
      if (!term || tag.toLowerCase().includes(term)) {
        set.add(tag);
      }
    }
  }
  return Array.from(set).sort();
}
