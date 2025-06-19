import { getDb } from '../lib/db.js';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const db = getDb();
const rows = db.prepare('SELECT id, title FROM products').all();
const existing = new Set(
  db.prepare('SELECT slug FROM products WHERE slug IS NOT NULL').all().map(r => r.slug)
);
const update = db.prepare('UPDATE products SET slug = ? WHERE id = ?');

for (const row of rows) {
  let base = slugify(row.title || String(row.id));
  let slug = base;
  let counter = 1;
  while (existing.has(slug)) {
    slug = `${base}-${row.id}`;
    if (!existing.has(slug)) break;
    slug = `${base}-${counter}`;
    counter++;
  }
  existing.add(slug);
  update.run(slug, row.id);
  console.log(`Set slug for ${row.id}: ${slug}`);
}
