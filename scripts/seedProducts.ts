import { createReadStream, existsSync } from 'fs';
import path from 'path';
import csv from 'csv-parser';
import bcrypt from 'bcryptjs';
import { prisma } from '@lib/prisma';
import { slugify } from '@lib/slugify';
import { loadAndIndexProducts } from '@lib/products';

interface CsvRow {
  TITLE?: string;
  HANDLE?: string;
  DESCRIPTION?: string;
  BODY_HTML?: string;
  VENDOR?: string;
  PRODUCT_TYPE?: string;
  TAGS?: string;
  IMAGES?: string;
  PRICE_RANGE_V2?: string;
  TOTAL_INVENTORY?: string;
}

async function ensureVendor(name: string) {
  const slug = slugify(name);
  const email = `${slug}@example.com`;
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash('password', 10),
        firstName: name,
        lastName: '',
        brandName: name,
        gender: 'OTHER',
        role: 'BRAND',
      },
    });
  }
  return user;
}

async function ensureCategory(name: string) {
  const slug = slugify(name);
  let category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    category = await prisma.category.create({ data: { name, slug } });
  }
  return category;
}

function parsePriceRange(raw?: string) {
  if (!raw) return { min: 0, max: 0, currency: 'USD' };
  try {
    const obj = JSON.parse(raw);
    return {
      min: parseFloat(obj.min_variant_price?.amount ?? '0'),
      max: parseFloat(obj.max_variant_price?.amount ?? '0'),
      currency: obj.min_variant_price?.currency_code ?? 'USD',
    };
  } catch {
    return { min: 0, max: 0, currency: 'USD' };
  }
}

async function processRow(row: CsvRow) {
  const title = row.TITLE?.trim();
  if (!title) return;
  const slug = row.HANDLE ? slugify(row.HANDLE) : slugify(title);

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    console.log(`Skipping ${slug}, already exists`);
    return;
  }

  const vendorName = row.VENDOR || 'Unknown';
  const categoryName = row.PRODUCT_TYPE || 'Uncategorized';
  const vendor = await ensureVendor(vendorName);
  const category = await ensureCategory(categoryName);

  const price = parsePriceRange(row.PRICE_RANGE_V2);

  try {
    await prisma.product.create({
      data: {
        slug,
        sku: slug,
        title,
        description: row.DESCRIPTION || row.BODY_HTML || '',
        productType: row.PRODUCT_TYPE || '',
        tags: row.TAGS ? row.TAGS.split(',').map(t => t.trim()).filter(Boolean) : [],
        images: row.IMAGES ? row.IMAGES.split(',').map(i => i.trim()).filter(Boolean) : [],
        quantity: (() => {
          const rand = Math.floor(Math.random() * 20);
          return rand < 6 ? 0 : rand;
        })(),
        minPrice: price.min,
        maxPrice: price.max,
        currency: price.currency,
        status: 'approved',
        vendor: { connect: { id: vendor.id } },
        category: { connect: { id: category.id } },
      },
    });
    console.log(`Inserted ${slug}`);
  } catch (err) {
    console.error(`Failed to insert ${slug}:`, err);
  }
}

async function main() {
  const csvPath =
    process.env.PRODUCTS_CSV ||
    path.join(process.cwd(), 'data', 'products.csv');
  if (!existsSync(csvPath)) {
    console.error('CSV file not found at', csvPath);
    process.exit(1);
  }

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(csvPath).pipe(csv());
    stream.on('data', (row) => {
      stream.pause();
      processRow(row).then(() => stream.resume());
    });
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  // Re-index products in Typesense after seeding
  try {
    const { products } = await loadAndIndexProducts();
    console.log(`Re-indexed ${products.length} products`);
  } catch (err) {
    console.error('Failed to re-index products', err);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
