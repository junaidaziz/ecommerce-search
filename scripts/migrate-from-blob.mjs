import fs from 'fs';
import { list } from '@vercel/blob';
import fetch from 'node-fetch';
import { getDb } from '../lib/db.js';

const FLAG_FILE = './data/blob_migrated.flag';
const BLOB_FILE = 'flexsearch_index.json';

async function loadProductsFromBlob() {
  const { blobs } = await list();
  const target = blobs.find((b) => b.pathname === BLOB_FILE);
  if (!target || !target.downloadUrl) {
    throw new Error('Blob file not found');
  }
  const res = await fetch(target.downloadUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch blob: ${res.statusText}`);
  }
  const { loadedProducts } = await res.json();
  return loadedProducts || [];
}

function insertProducts(products) {
  const db = getDb();
  const existsStmt = db.prepare('SELECT 1 FROM products WHERE id = ?');
  const insertStmt = db.prepare(`INSERT INTO products (
    id, title, vendor, description, product_type, tags, category,
    quantity, min_price, max_price, currency, status, images
  ) VALUES (
    @id, @title, @vendor, @description, @product_type, @tags, @category,
    @quantity, @min_price, @max_price, @currency, @status, @images
  )`);
  let inserted = 0;
  let skipped = 0;
  const tx = db.transaction(() => {
    for (const p of products) {
      if (existsStmt.get(String(p.ID))) {
        skipped++;
        continue;
      }
      insertStmt.run({
        id: String(p.ID),
        title: p.TITLE,
        vendor: p.VENDOR,
        description: p.DESCRIPTION,
        product_type: p.PRODUCT_TYPE,
        tags: p.TAGS,
        category: p.CATEGORY,
        quantity: p.TOTAL_INVENTORY || 0,
        min_price: p.MIN_PRICE || 0,
        max_price: p.MAX_PRICE || 0,
        currency: p.CURRENCY || 'USD',
        status: 'approved',
        images: JSON.stringify(p.IMAGES || []),
      });
      inserted++;
    }
  });
  tx();
  return { inserted, skipped };
}

async function main() {
  if (fs.existsSync(FLAG_FILE)) {
    console.log('Migration already completed.');
    return;
  }
  const products = await loadProductsFromBlob();
  const { inserted, skipped } = insertProducts(products);
  fs.writeFileSync(FLAG_FILE, 'done');
  console.log(`Inserted ${inserted} products, skipped ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
