import { JSDOM } from 'jsdom';
import { getDb } from './db';
import type { Product, ProductInput } from '../types/product';
import { parseImages } from './utils/parseImages';
import type { Category } from '../types/category';
import type { Vendor } from '../types/vendor';
import type { Prisma } from '@prisma/client';
import client from './typesenseClient';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { category: true; vendor: true };
}>;

interface ProductRow {
  id: number | string;
  uuid?: string | null;
  slug?: string | null;
  sku: string;
  title: string;
  vendor?: Vendor | null;
  description?: string | null;
  productType?: string | null;
  tags?: string | null;
  category?: Category | null;
  images: string | null;
  quantity: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
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
      include: { category: true, vendor: true },
    });

    return rows.map((row) =>
      processProductRow({
        id: row.id,
        uuid: row.uuid,
        slug: row.slug,
        sku: row.sku,
        title: row.title,
        vendor: row.vendor ?? null,
        description: row.description,
        productType: row.productType,
        tags: row.tags,
        category: row.category ?? null,
        images: parseImages(row.images),
        totalInventory: row.quantity,
        priceRange: {
          minVariantPrice: {
            amount: row.minPrice,
            currencyCode: row.currency,
          },
          maxVariantPrice: {
            amount: row.maxPrice,
            currencyCode: row.currency,
          },
        },
      })
    );
  } catch (error) {
    throw error;
  }
}

export function mapDbRowToProduct(row: ProductRow): Product {
  return processProductRow({
    id: row.id,
    uuid: row.uuid,
    slug: row.slug,
    sku: row.sku,
    title: row.title,
    vendor: row.vendor ?? null,
    description: row.description,
    productType: row.productType,
    tags: row.tags,
    category: row.category,
    images: parseImages(row.images),
    totalInventory: row.quantity,
    priceRange: {
      minVariantPrice: {
        amount: row.minPrice,
        currencyCode: row.currency,
      },
      maxVariantPrice: {
        amount: row.maxPrice,
        currencyCode: row.currency,
      },
    },
  });
}

export async function indexProductsToTypesense(
  products: Product[]
): Promise<void> {
  if (products.length === 0) return;
  const documents = products.map((p) => ({
    id: String(p.id),
    title: p.title,
    name: p.title,
    slug: p.slug,
    description: p.descriptionText || p.description || '',
    price: p.minPrice,
    category: p.category.name.trim().toLowerCase(),
    brand: p.vendor.brandName.trim(),
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
  } catch (err) {
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
  const vendor = product.vendor?.brandName
    ? await db.user.findFirst({
        where: { brandName: product.vendor.brandName },
      })
    : null;
  let category = null;
  if (product.category?.id) {
    category = await db.category.findUnique({
      where: { id: Number(product.category.id) },
    });
  } else if (product.category?.uuid) {
    category = await db.category.findFirst({
      where: { uuid: product.category.uuid },
    });
  } else if (product.category?.name) {
    category = await db.category.findFirst({ where: { name: product.category.name } });
  }

  if (!vendor || !category) {
    throw new Error('Invalid vendor or category');
  }

  const data: Prisma.ProductCreateInput = {
    uuid: product.uuid,
    slug: product.slug ?? '',
    sku: product.sku,
    title: product.title,
    description: product.description ?? '',
    productType: product.productType ?? '',
    tags: product.tags ?? '',
    quantity: product.quantity ?? 0,
    minPrice: product.minPrice ?? 0,
    maxPrice: product.maxPrice ?? 0,
    currency: product.currency ?? 'USD',
    status: product.status ?? 'approved',
    vendor: { connect: { id: vendor.id } },
    category: { connect: { id: category.id } },
  };

  await db.product.create({ data });
}

export async function updateProduct(
  product: ProductInput & { id?: string | number }
): Promise<void> {
  const db = getDb();
  const vendor = product.vendor?.brandName
    ? await db.user.findFirst({
        where: { brandName: product.vendor.brandName },
      })
    : null;
  let category = null;
  if (product.category?.id) {
    category = await db.category.findUnique({
      where: { id: Number(product.category.id) },
    });
  } else if (product.category?.uuid) {
    category = await db.category.findFirst({
      where: { uuid: product.category.uuid },
    });
  } else if (product.category?.name) {
    category = await db.category.findFirst({ where: { name: product.category.name } });
  }
  if (!vendor || !category) {
    throw new Error('Invalid vendor or category');
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
      vendor: { connect: { id: vendor.id } },
      category: { connect: { id: category.id } },
    } as Prisma.ProductUpdateInput,
  });
}

export async function getPendingProducts(): Promise<Product[]> {
  const db = getDb();
  const rows: ProductWithRelations[] = await db.product.findMany({
    where: { status: 'pending' },
    include: { category: true, vendor: true },
  });
  return rows.map((row) =>
    processProductRow({
      id: row.id,
      slug: row.slug,
      sku: row.sku,
      title: row.title,
      vendor: row.vendor ?? null,
      description: row.description,
      productType: row.productType,
      tags: row.tags,
      category: row.category ?? null,
      images: parseImages(row.images),
      totalInventory: row.quantity,
      priceRange: {
        minVariantPrice: { amount: row.minPrice, currencyCode: row.currency },
        maxVariantPrice: { amount: row.maxPrice, currencyCode: row.currency },
      },
    })
  );
}

export async function getProductsByCategorySlug(
  slug: string
): Promise<Product[]> {
  const db = getDb();
  const rows: ProductWithRelations[] = await db.product.findMany({
    where: { status: 'approved', category: { slug } },
    include: { category: true, vendor: true },
  });
  return rows.map((row) =>
    processProductRow({
      id: row.id,
      uuid: row.uuid,
      slug: row.slug,
      sku: row.sku,
      title: row.title,
      vendor: row.vendor ?? null,
      description: row.description,
      productType: row.productType,
      tags: row.tags,
      category: row.category ?? null,
      images: parseImages(row.images),
      totalInventory: row.quantity,
      priceRange: {
        minVariantPrice: { amount: row.minPrice, currencyCode: row.currency },
        maxVariantPrice: { amount: row.maxPrice, currencyCode: row.currency },
      },
    })
  );
}

export async function getProductsByCategorySlugPaginated(
  slug: string,
  limit: number,
  offset = 0
): Promise<Product[]> {
  const db = getDb();
  const rows: ProductWithRelations[] = await db.product.findMany({
    where: { status: 'approved', category: { slug } },
    include: { category: true, vendor: true },
    take: limit,
    skip: offset,
    orderBy: { id: 'asc' },
  });
  return rows.map((row) =>
    processProductRow({
      id: row.id,
      uuid: row.uuid,
      slug: row.slug,
      sku: row.sku,
      title: row.title,
      vendor: row.vendor ?? null,
      description: row.description,
      productType: row.productType,
      tags: row.tags,
      category: row.category ?? null,
      images: parseImages(row.images),
      totalInventory: row.quantity,
      priceRange: {
        minVariantPrice: { amount: row.minPrice, currencyCode: row.currency },
        maxVariantPrice: { amount: row.maxPrice, currencyCode: row.currency },
      },
    })
  );
}

export async function getApprovedProductsPaginated(
  limit: number,
  offset = 0
): Promise<Product[]> {
  const db = getDb();
  const rows: ProductWithRelations[] = await db.product.findMany({
    where: { status: 'approved' },
    include: { category: true, vendor: true },
    take: limit,
    skip: offset,
    orderBy: { id: 'asc' },
  });
  return rows.map((row) =>
    processProductRow({
      id: row.id,
      uuid: row.uuid,
      slug: row.slug,
      sku: row.sku,
      title: row.title,
      vendor: row.vendor ?? null,
      description: row.description,
      productType: row.productType,
      tags: row.tags,
      category: row.category ?? null,
      images: parseImages(row.images),
      totalInventory: row.quantity,
      priceRange: {
        minVariantPrice: { amount: row.minPrice, currencyCode: row.currency },
        maxVariantPrice: { amount: row.maxPrice, currencyCode: row.currency },
      },
    })
  );
}

export interface PaginatedOptions {
  limit: number;
  offset: number;
  categorySlugs?: string[];
  search?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedResult {
  products: Product[];
  total: number;
}

export async function getProductsPaginated(
  options: PaginatedOptions
): Promise<PaginatedResult> {
  const db = getDb();
  const where: Prisma.ProductWhereInput = { status: 'approved' };
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
    where.minPrice = { ...(where.minPrice as any), lte: options.maxPrice };
  }
  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { category: true, vendor: true },
      take: options.limit,
      skip: options.offset,
      orderBy: { id: 'asc' },
    }),
  ]);
  return {
    total,
    products: rows.map((row) =>
      processProductRow({
        id: row.id,
        uuid: row.uuid,
        slug: row.slug,
        sku: row.sku,
        title: row.title,
        vendor: row.vendor ?? null,
        description: row.description,
        productType: row.productType,
        tags: row.tags,
        category: row.category ?? null,
        images: parseImages(row.images),
        totalInventory: row.quantity,
        priceRange: {
          minVariantPrice: { amount: row.minPrice, currencyCode: row.currency },
          maxVariantPrice: { amount: row.maxPrice, currencyCode: row.currency },
        },
      })
    ),
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
): Promise<{ categories: Category[]; total: number }> {
  const db = getDb();
  const where: Prisma.CategoryWhereInput = search
    ? { name: { contains: search, mode: 'insensitive' } }
    : {};
  const [total, rows] = await Promise.all([
    db.category.count({ where }),
    db.category.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
      skip: offset,
    }),
  ]);
  return { categories: rows, total };
}

export async function createCategory(name: string): Promise<Category> {
  const db = getDb();
  const existing = await db.category.findFirst({ where: { name } });
  if (existing) return existing;
  const cat = await db.category.create({
    data: { name, slug: name.toLowerCase().replace(/\s+/g, '-') },
  });
  return cat;
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
