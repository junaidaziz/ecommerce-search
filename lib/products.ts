import { JSDOM } from 'jsdom';
import { getDb } from './db';
import type { Product, ProductInput } from '@/types/product';
import type { Variant } from '@/types/variant';
import { parseImages } from './utils/parseImages';
import type { Category } from '@/types/category';
import type { Vendor } from '@/types/vendor';
import { Prisma } from '@prisma/client';
import client from './typesenseClient';
import { getBestSellingProducts } from './orders';
import { slugify } from './slugify';

/**
 * Partial representation of a product record returned from Prisma including
 * related category, vendor and variant records. Prisma's generated types are
 * not available in this environment so we define the minimal shape locally.
 */
interface ProductWithRelations {
  id: number | string;
  uuid?: string | null;
  slug?: string | null;
  sku: string;
  title: string;
  description?: string | null;
  productType?: string | null;
  tags?: string | null;
  quantity: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  discountType?: string | null;
  discountValue?: number | null;
  images: string | null;
  vendor: (Vendor & { brandName: string | null; phoneNumber?: string | null | undefined });
  category: Category;
  variants: Variant[];
}

interface ProductRow {
  id: number | string;
  uuid?: string | null;
  slug?: string | null;
  sku: string;
  title: string;
  vendor?:
    | (Vendor & { brandName: string | null; phoneNumber?: string | null | undefined })
    | null;
  description?: string | null;
  productType?: string | null;
  tags?: string | null;
  category?: Category | null;
  images: string | null;
  quantity: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  discountType?: string | null;
  discountValue?: number | null;
  variants?: Variant[];
}

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

function processProductRow(row: Record<string, unknown>): Product {
  const processed: Record<string, unknown> & Partial<Product> = { ...row };
  const jsonFields = ['SEO', 'OPTIONS', 'VARIANTS', 'priceRange', 'METAFIELDS'];
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
  processed.minPrice = processed.priceRange?.minVariantPrice?.amount || 0;
  processed.maxPrice = processed.priceRange?.maxVariantPrice?.amount || 0;
  processed.currency =
    processed.priceRange?.minVariantPrice?.currencyCode || 'GBP';
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
  if (processed.images && processed.images.length > 0) {
    if (typeof processed.images[0] === 'string') {
      processed.images = (processed.images as unknown as string[]).map((u) => ({
        url: u,
      }));
    }
    processed.featuredImage = processed.images[0];
  }
  return processed as Product;
}

async function loadProductsData(): Promise<Product[]> {
  const db = getDb();
  try {
    const rows: ProductWithRelations[] = await db.product.findMany({
      where: { status: 'approved' },
      include: { category: true, vendor: true, variants: true },
    });

    return rows.map(mapDbRowToProduct);
  } catch (error: unknown) {
    throw error;
  }
}

export function mapDbRowToProduct(row: ProductRow): Product {
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
    vendor: row.vendor
      ? {
          ...row.vendor,
          brandName: row.vendor.brandName ?? '',
          phoneNumber: row.vendor.phoneNumber ?? undefined,
        }
      : null,
    category: row.category ?? null,
    images: parseImages(images),
    totalInventory: quantity,
    variants: row.variants,
    priceRange: {
      minVariantPrice: { amount: minPrice, currencyCode: currency },
      maxVariantPrice: { amount: maxPrice, currencyCode: currency },
    },
    discountType,
    discountValue,
  });
}

export async function indexProductsToTypesense(
  products: Product[]
): Promise<void> {
  if (products.length === 0) return;
  const documents = products.map((p: Product) => ({
    id: String(p.id),
    title: p.title,
    name: p.title,
    slug: p.slug ?? slugify(p.title),
    description: p.descriptionText || p.description || '',
    price: p.minPrice,
    category: p.category?.name?.trim().toLowerCase() ?? '',
    brand: (p.vendor.brandName ?? '').trim(),
    sold_count: p.soldCount,
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

  if (!product.vendor?.brandName) {
    const err = new Error('Vendor is required') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }
  if (!product.category || (!product.category.id && !product.category.name)) {
    const err = new Error('Category is required') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }

  const vendor = await db.user.findFirst({
    where: { brandName: product.vendor.brandName },
  });
  const category = product.category.id
    ? await db.category.findUnique({
        where: { id: Number(product.category.id) },
      })
    : await db.category.findFirst({
        where: { name: product.category.name },
      });

  if (!vendor) {
    const err = new Error('Vendor not found') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }
  if (!category) {
    const err = new Error('Category not found') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }

  const data = {
    uuid: product.uuid,
    slug: (product.slug ?? '').trim() || slugify(product.title || product.uuid),
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
    vendor: { connect: { id: vendor.id } },
    category: { connect: { id: category.id } },
  };

  try {
    await db.product.create({ data });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
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
  if (!product.vendor?.brandName) {
    const err = new Error('Vendor is required') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }
  if (!product.category || (!product.category.id && !product.category.name)) {
    const err = new Error('Category is required') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }

  const vendor = await db.user.findFirst({
    where: { brandName: product.vendor.brandName },
  });
  const category = product.category.id
    ? await db.category.findUnique({
        where: { id: Number(product.category.id) },
      })
    : await db.category.findFirst({
        where: { name: product.category.name },
      });

  if (!vendor) {
    const err = new Error('Vendor not found') as Error & { code?: string };
    err.code = 'BAD_REQUEST';
    throw err;
  }
  if (!category) {
    const err = new Error('Category not found') as Error & { code?: string };
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
      vendor: { connect: { id: vendor.id } },
      category: { connect: { id: category.id } },
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
  const rows: ProductWithRelations[] = await db.product.findMany({
    where: { status: 'pending' },
    include: { category: true, vendor: true, variants: true },
  });
  return rows.map(mapDbRowToProduct);
}

export async function getProductsByCategorySlug(
  slug: string
): Promise<Product[]> {
  const db = getDb();
  const rows: ProductWithRelations[] = await db.product.findMany({
    where: { status: 'approved', category: { slug } },
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
  const rows: ProductWithRelations[] = await db.product.findMany({
    where: { status: 'approved', category: { slug } },
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
  const rows: ProductWithRelations[] = await db.product.findMany({
    where: { status: 'approved' },
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
  const rows: ProductWithRelations[] = await db.product.findMany({
    where: { status: 'approved', vendor: { brandName } },
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
  const where: Record<string, any> = { status: 'approved' };
  if (options.categorySlugs && options.categorySlugs.length > 0) {
    where.category = { slug: { in: options.categorySlugs } };
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
  const orderBy =
    (() => {
      switch (options.sort) {
        case 'price_asc':
          return { minPrice: 'asc' };
        case 'price_desc':
          return { minPrice: 'desc' };
        case 'newest':
          return { createdAt: 'desc' };
        default:
          return { id: 'asc' };
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
    where: { tags: { not: null } },
    select: { tags: true },
  });
  const term = search.trim().toLowerCase();
  const set = new Set<string>();
  for (const row of rows) {
    const tags =
      row.tags
        ?.split(',')
        .map((t: string) => t.trim())
        .filter(Boolean) || [];
    for (const tag of tags) {
      if (!term || tag.toLowerCase().includes(term)) {
        set.add(tag);
      }
    }
  }
  return Array.from(set).sort();
}
