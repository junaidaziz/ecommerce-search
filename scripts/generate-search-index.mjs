import fs from 'fs';
import path from 'path';
import FlexSearch from 'flexsearch';
const { Document } = FlexSearch;
import { getAllFromDb } from '../lib/db.js';
import { mapDbRowToProduct } from '../lib/products.js';

const OUTPUT_FILE = path.join(process.cwd(), 'public', 'index.json');

function createFlexDoc() {
  return new Document({
    document: {
      id: 'ID',
      index: [
        'TITLE',
        'VENDOR',
        'DESCRIPTION_TEXT',
        'BODY_HTML_TEXT',
        'TAGS',
        'PRODUCT_TYPE',
        'CATEGORY',
        'METAFIELDS.my_fields_ingredients.value'
      ],
      store: true
    },
    preset: 'match',
    tokenize: 'forward',
    resolution: 9
  });
}

function loadActiveProducts() {
  return getAllFromDb('approved')
    .filter((row) => row.quantity > 0)
    .map(mapDbRowToProduct);
}

async function buildAndSave() {
  const products = loadActiveProducts();
  const index = createFlexDoc();
  products.forEach((p) => index.add(p));

  const serializedIndex = {};
  await index.export((key, data) => {
    serializedIndex[key] = data;
  });

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify({ serializedIndex, loadedProducts: products }, null, 2)
  );
}

async function generateIndex() {
  const rebuild = process.argv.includes('--rebuild');

  if (!rebuild && fs.existsSync(OUTPUT_FILE)) {
    console.log('Search index already exists. Use --rebuild to regenerate.');
    return;
  }

  console.log('Building search index...');
  await buildAndSave();
  console.log(`Index written to ${OUTPUT_FILE}`);
}

generateIndex().catch((err) => {
  console.error('Error during index generation:', err);
  process.exit(1);
});
