import { JSDOM } from 'jsdom';
import { getDb } from './db';
import type { Product, ProductDbRow } from '../types/product';
import type { Category } from '../types/category';

/**
 * Simplified representation of a product row returned from the database.
 * Only the fields that are accessed in this module are included.
 */

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
    'priceRange',
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
          `Could not parse JSON for field '${field}' in row with id: ${String(processed.id ?? 'N/A')}. Error: ${message}`
        );
        processed[field] = null;
      }
    }
  });

  processed.descriptionText = stripHtml(processed.description as string | null | undefined);
  processed.bodyHtmlText = stripHtml(processed.bodyHtml as string | null | undefined);
  processed.minPrice = processed.priceRange?.minVariantPrice?.amount || 0;
  processed.maxPrice = processed.priceRange?.maxVariantPrice?.amount || 0;
  processed.currency = processed.priceRange?.minVariantPrice?.currencyCode || 'GBP';
  const meta = processed.METAFIELDS as
    | { stoked_inventory_sold_count?: { value?: string }; yotpo_reviews_count?: { value?: string }; yotpo_reviews_average?: { value?: string } }
    | undefined;
  processed.soldCount = parseInt(meta?.stoked_inventory_sold_count?.value ?? '0', 10);
  processed.reviewCount = parseInt(meta?.yotpo_reviews_count?.value ?? '0', 10);
  processed.averageRating = parseFloat(meta?.yotpo_reviews_average?.value ?? '0');
  processed.id = String(processed.id);
  if (processed.slug) {
    processed.slug = String(processed.slug);
  }
  if (processed.images && processed.images.length > 0) {
    processed.featuredImage = { url: processed.images[0] };
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
        id: row.id,
        slug: row.slug,
        title: row.title,
        vendor: row.vendor?.brandName ?? String(row.vendorId),
        description: row.description,
        productType: row.productType,
        tags: row.tags,
        category: row.category?.name,
        images: row.images ? JSON.parse(row.images) : [],
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
    console.error('Failed to load products from database:', error);
    throw error;
  }
}

export function mapDbRowToProduct(row: Record<string, unknown>): Product {
  return processProductRow({
    id: row.id,
    slug: row.slug,
    title: row.title,
    vendor: row.vendor,
    description: row.description,
    productType: row.product_type,
    tags: row.tags,
    category: row.category,
    images: row.images ? JSON.parse(row.images as string) : [],
    totalInventory: row.quantity,
    priceRange: {
      minVariantPrice: {
        amount: row.min_price,
        currencyCode: row.currency,
      },
      maxVariantPrice: {
        amount: row.max_price,
        currencyCode: row.currency,
      },
    },
  });
}

export async function loadAndIndexProducts(): Promise<{ products: Product[]; productIndex: null }> {
  // Legacy function name preserved for API routes.
  const products = await loadProductsData();
  return { products, productIndex: null };
}

export async function addProduct(product: Product): Promise<void> {
  const db = getDb();
  const vendor = await db.user.findFirst({ where: { brandName: String(product.vendor) } });
  const category = product.category
    ? await db.category.findFirst({ where: { name: product.category } })
    : null;
  const data: any = {
    id: Number(product.id),
    slug: product.slug,
    title: product.title,
    description: product.description ?? '',
    productType: product.productType ?? '',
    tags: product.tags ?? '',
    quantity: product.quantity ?? 0,
    minPrice: product.minPrice ?? 0,
    maxPrice: product.maxPrice ?? 0,
    currency: product.currency ?? 'USD',
    status: product.status ?? 'approved',
  };
  if (vendor) {
    data.vendor = { connect: { id: vendor.id } };
  }
  if (category) {
    data.category = { connect: { id: category.id } };
  }
  await db.product.create({
    data,
  });
}

export async function updateProduct(product: Product): Promise<void> {
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
      productType: product.productType,
      tags: product.tags,
      quantity: product.quantity,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      currency: product.currency,
      images: undefined,
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
      id: row.id,
      slug: row.slug,
      title: row.title,
      vendor: row.vendor?.brandName ?? String(row.vendorId),
      description: row.description,
      productType: row.productType,
      tags: row.tags,
      category: row.category?.name,
      images: row.images ? JSON.parse(row.images) : [],
      totalInventory: row.quantity,
      priceRange: {
        minVariantPrice: { amount: row.minPrice, currencyCode: row.currency },
        maxVariantPrice: { amount: row.maxPrice, currencyCode: row.currency },
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
