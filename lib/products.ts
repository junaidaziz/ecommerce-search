import { JSDOM } from 'jsdom';
import { getDb } from './db';
import type { Product } from '../types/product';
import type { Category } from '../types/category';

/**
 * Simplified representation of a product row returned from the database.
 * Only the fields that are accessed in this module are included.
 */
interface ProductDbRow {
  id: number;
  slug: string | null;
  title: string;
  vendorId?: number | null;
  vendor?: { brandName: string | null } | null;
  description: string | null;
  productType: string | null;
  tags: string | null;
  category?: { name: string | null } | null;
  images: string | null;
  quantity: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
}

const stripHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  try {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent || '';
  } catch (e: unknown) {
    console.error('Error stripping HTML:', e);
    return html ?? '';
  }
};

function processProductRow(row: Record<string, unknown>): Product {
  const processed: Record<string, unknown> & Partial<Product> = { ...row };
  const jsonFields = [
    'SEO',
    'OPTIONS',
    'VARIANTS',
    'PRICE_RANGE_V2',
    'METAFIELDS',
  ];
  jsonFields.forEach((field) => {
    if (processed[field]) {
      try {
        processed[field] =
          typeof processed[field] === 'string'
            ? JSON.parse(processed[field] as string)
            : processed[field];
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.warn(
          `Could not parse JSON for field '${field}' in row with ID: ${String(processed.ID ?? 'N/A')}. Error: ${message}`
        );
        processed[field] = null;
      }
    }
  });

  processed.DESCRIPTION_TEXT = stripHtml(processed.DESCRIPTION as string | null | undefined);
  processed.BODY_HTML_TEXT = stripHtml(processed.BODY_HTML as string | null | undefined);
  processed.MIN_PRICE =
    processed.PRICE_RANGE_V2?.min_variant_price?.amount || 0;
  processed.MAX_PRICE =
    processed.PRICE_RANGE_V2?.max_variant_price?.amount || 0;
  processed.CURRENCY =
    processed.PRICE_RANGE_V2?.min_variant_price?.currency_code || 'GBP';
  const meta = processed.METAFIELDS as
    | { stoked_inventory_sold_count?: { value?: string }; yotpo_reviews_count?: { value?: string }; yotpo_reviews_average?: { value?: string } }
    | undefined;
  processed.SOLD_COUNT = parseInt(meta?.stoked_inventory_sold_count?.value ?? '0', 10);
  processed.REVIEW_COUNT = parseInt(meta?.yotpo_reviews_count?.value ?? '0', 10);
  processed.AVERAGE_RATING = parseFloat(meta?.yotpo_reviews_average?.value ?? '0');
  processed.ID = String(processed.ID);
  if (processed.SLUG) {
    processed.SLUG = String(processed.SLUG);
  }
  if (processed.IMAGES && processed.IMAGES.length > 0) {
    processed.FEATURED_IMAGE = { url: processed.IMAGES[0] };
  }
  return processed as Product;
}

async function loadProductsData(): Promise<Product[]> {
  const db = getDb();
  try {
    const rows = (await db.product.findMany({
      where: { status: 'approved' },
      include: { category: true, vendor: true },
    })) as ProductDbRow[];

    return rows.map((row: ProductDbRow) =>
      processProductRow({
        ID: row.id,
        SLUG: row.slug,
        TITLE: row.title,
        VENDOR: row.vendor?.brandName ?? String(row.vendorId),
        DESCRIPTION: row.description,
        PRODUCT_TYPE: row.productType,
        TAGS: row.tags,
        CATEGORY: row.category?.name,
        IMAGES: row.images ? JSON.parse(row.images) : [],
        TOTAL_INVENTORY: row.quantity,
        PRICE_RANGE_V2: {
          min_variant_price: {
            amount: row.minPrice,
            currency_code: row.currency,
          },
          max_variant_price: {
            amount: row.maxPrice,
            currency_code: row.currency,
          },
        },
      })
    );
  } catch (error) {
    console.error('Failed to load products from database:', error);
    throw error;
  }
}

export function mapDbRowToProduct(row: Record<string, unknown>): Product {
  return processProductRow({
    ID: row.id,
    SLUG: row.slug,
    TITLE: row.title,
    VENDOR: row.vendor,
    DESCRIPTION: row.description,
    PRODUCT_TYPE: row.product_type,
    TAGS: row.tags,
    CATEGORY: row.category,
    IMAGES: row.images ? JSON.parse(row.images as string) : [],
    TOTAL_INVENTORY: row.quantity,
    PRICE_RANGE_V2: {
      min_variant_price: {
        amount: row.min_price,
        currency_code: row.currency,
      },
      max_variant_price: {
        amount: row.max_price,
        currency_code: row.currency,
      },
    },
  });
}

export async function loadAndIndexProducts(): Promise<{ products: Product[]; productIndex: null }> {
  // Legacy function name preserved for API routes.
  const products = await loadProductsData();
  return { products, productIndex: null };
}

export async function addProduct(product: Record<string, unknown>): Promise<void> {
  const db = getDb();
  const vendor = await db.user.findFirst({ where: { brandName: product.vendor } });
  const category = product.category
    ? await db.category.findFirst({ where: { name: product.category } })
    : null;
  await db.product.create({
    data: {
      id: Number(product.id),
      slug: product.slug,
      title: product.title,
      description: product.description ?? '',
      productType: product.product_type ?? '',
      tags: product.tags ?? '',
      quantity: product.quantity ?? 0,
      minPrice: product.min_price ?? 0,
      maxPrice: product.max_price ?? 0,
      currency: product.currency ?? 'USD',
      status: product.status ?? 'approved',
      images: product.images ?? null,
      vendor: vendor ? { connect: { id: vendor.id } } : undefined,
      category: category ? { connect: { id: category.id } } : undefined,
    },
  });
}

export async function updateProduct(product: Record<string, unknown>): Promise<void> {
  const db = getDb();
  const vendor = product.vendor
    ? await db.user.findFirst({ where: { brandName: product.vendor } })
    : null;
  const category = product.category
    ? await db.category.findFirst({ where: { name: product.category } })
    : null;
  await db.product.update({
    where: { id: Number(product.id) },
    data: {
      title: product.title,
      description: product.description,
      productType: product.product_type,
      tags: product.tags,
      quantity: product.quantity,
      minPrice: product.min_price,
      maxPrice: product.max_price,
      currency: product.currency,
      images: product.images,
      vendor: vendor ? { connect: { id: vendor.id } } : undefined,
      category: category ? { connect: { id: category.id } } : undefined,
    },
  });
}

export async function getPendingProducts(): Promise<Product[]> {
  const db = getDb();
  const rows = (await db.product.findMany({
    where: { status: 'pending' },
    include: { category: true, vendor: true },
  })) as ProductDbRow[];
  return rows.map((row: ProductDbRow) =>
    processProductRow({
      ID: row.id,
      SLUG: row.slug,
      TITLE: row.title,
      VENDOR: row.vendor?.brandName ?? String(row.vendorId),
      DESCRIPTION: row.description,
      PRODUCT_TYPE: row.productType,
      TAGS: row.tags,
      CATEGORY: row.category?.name,
      IMAGES: row.images ? JSON.parse(row.images) : [],
      TOTAL_INVENTORY: row.quantity,
      PRICE_RANGE_V2: {
        min_variant_price: { amount: row.minPrice, currency_code: row.currency },
        max_variant_price: { amount: row.maxPrice, currency_code: row.currency },
      },
    })
  );
}

export async function approveProduct(id: string | number): Promise<void> {
  const db = getDb();
  await db.product.update({ where: { id: Number(id) }, data: { status: 'approved' } });
}

export async function rejectProduct(id: string | number): Promise<void> {
  const db = getDb();
  await db.product.update({ where: { id: Number(id) }, data: { status: 'rejected' } });
}

export async function getCategoriesFlat(): Promise<Category[]> {
  const db = getDb();
  return db.category.findMany({ orderBy: { name: 'asc' } });
}

export async function getCategoryTree(): Promise<{ name: string; subcategories: string[]; image?: string }[]> {
  const flat = await getCategoriesFlat();
  if (flat.length > 0) {
    const map: Record<number, { name: string; image?: string; subcategories: string[] }> = {};
    flat.forEach((c) => {
      if (typeof c.id === 'number') {
        map[c.id] = { name: c.name, image: c.image, subcategories: [] };
      }
    });
    flat.forEach((c) => {
      if (typeof c.parentId === 'number') {
        map[c.parentId]?.subcategories.push(c.name);
      }
    });
    return flat
      .filter((c) => typeof c.id === 'number' && !c.parentId)
      .map((c) => ({
        name: c.name,
        image: c.image,
        subcategories: (map[c.id as number]?.subcategories ?? []).sort((a, b) =>
          a.localeCompare(b)
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const db = getDb();
  const rows = await db.product.findMany({ include: { category: true } });
  const map = {} as Record<string, Set<string>>;
  for (const row of rows) {
    const categoryName = row.category?.name;
    if (!categoryName) continue;
    if (!map[categoryName]) map[categoryName] = new Set();
    if (row.productType) map[categoryName].add(row.productType);
  }
  return Object.entries(map)
    .map(([name, set]) => ({ name, subcategories: Array.from(set).sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCategory(
  name: string,
  parentId: number | null = null,
  image: string | null = null
): Promise<void> {
  const db = getDb();
  const existing = await db.category.findFirst({ where: { name } });
  if (existing) return;
  await db.category.create({ data: { name, slug: name.toLowerCase().replace(/\s+/g, '-') } });
}

export async function renameCategory(
  id: string | number,
  name: string,
  _parentId: number | null = null,
  _image: string | null = null
): Promise<void> {
  const db = getDb();
  await db.category.update({ where: { id: Number(id) }, data: { name } });
}

export async function removeCategory(id: string | number): Promise<void> {
  const db = getDb();
  const count = await db.product.count({ where: { categoryId: Number(id) } });
  if (count === 0) {
    await db.category.delete({ where: { id: Number(id) } });
  } else {
    throw new Error('category in use');
  }
}

export async function deleteProduct(id: string | number): Promise<void> {
  const db = getDb();
  await db.product.delete({ where: { id: Number(id) } });
}
