import { JSDOM } from 'jsdom';
import FlexSearch from 'flexsearch';
const { Document } = FlexSearch;
import path from 'path';
import fs from 'fs';
import {
  getAllFromDb,
  addProduct as dbAddProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
  getPendingFromDb,
  setProductStatus,
  getCategories as dbGetCategories,
  addCategory as dbAddCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  getCategoryByName,
  getCategoryById,
  countProductsForCategory,
} from './db';

let products = [];
let productIndex = null;
let isDataLoaded = false;

const INDEX_FILE_PATH = path.join(process.cwd(), 'public', 'index.json');

const stripHtml = (html) => {
  if (!html) return '';
  try {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent || '';
  } catch (e) {
    console.error('Error stripping HTML:', e);
    return html;
  }
};

function processProductRow(row) {
  const processed = { ...row };
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
            ? JSON.parse(processed[field])
            : processed[field];
      } catch (e) {
        console.warn(
          `Could not parse JSON for field '${field}' in row with ID: ${processed.ID || 'N/A'}. Error: ${e.message}`
        );
        processed[field] = null;
      }
    }
  });

  processed.DESCRIPTION_TEXT = stripHtml(processed.DESCRIPTION);
  processed.BODY_HTML_TEXT = stripHtml(processed.BODY_HTML);
  processed.MIN_PRICE =
    processed.PRICE_RANGE_V2?.min_variant_price?.amount || 0;
  processed.MAX_PRICE =
    processed.PRICE_RANGE_V2?.max_variant_price?.amount || 0;
  processed.CURRENCY =
    processed.PRICE_RANGE_V2?.min_variant_price?.currency_code || 'GBP';
  processed.SOLD_COUNT = parseInt(
    processed.METAFIELDS?.stoked_inventory_sold_count?.value || '0',
    10
  );
  processed.REVIEW_COUNT = parseInt(
    processed.METAFIELDS?.yotpo_reviews_count?.value || '0',
    10
  );
  processed.AVERAGE_RATING = parseFloat(
    processed.METAFIELDS?.yotpo_reviews_average?.value || '0'
  );
  processed.ID = String(processed.ID);
  if (processed.SLUG) {
    processed.SLUG = String(processed.SLUG);
  }
  if (processed.IMAGES && processed.IMAGES.length > 0) {
    processed.FEATURED_IMAGE = { url: processed.IMAGES[0] };
  }
  return processed;
}

async function loadProductsData() {
  const rows = getAllFromDb('approved');
  return rows.map((row) =>
    processProductRow({
      ID: row.id,
      SLUG: row.slug,
      TITLE: row.title,
      VENDOR: row.vendor,
      DESCRIPTION: row.description,
      PRODUCT_TYPE: row.product_type,
      TAGS: row.tags,
      CATEGORY: row.category,
      IMAGES: row.images ? JSON.parse(row.images) : [],
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
    })
  );
}

export function mapDbRowToProduct(row) {
  return processProductRow({
    ID: row.id,
    SLUG: row.slug,
    TITLE: row.title,
    VENDOR: row.vendor,
    DESCRIPTION: row.description,
    PRODUCT_TYPE: row.product_type,
    TAGS: row.tags,
    CATEGORY: row.category,
    IMAGES: row.images ? JSON.parse(row.images) : [],
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
        'METAFIELDS.my_fields_ingredients.value',
      ],
      store: true,
    },
    preset: 'match',
    tokenize: 'forward',
    resolution: 9,
  });
}

export async function loadAndIndexProducts() {
  if (isDataLoaded) {
    console.log('Products already loaded and indexed.');
    return { products, productIndex };
  }

  console.log('Attempting to load pre-built index from file...');

  productIndex = createFlexDoc();

  try {
    if (fs.existsSync(INDEX_FILE_PATH)) {
      const indexData = JSON.parse(fs.readFileSync(INDEX_FILE_PATH, 'utf8'));
      const { serializedIndex, loadedProducts } = indexData;

      if (loadedProducts && loadedProducts.length > 0) {
        products = loadedProducts;

        Object.keys(serializedIndex).forEach((key) => {
          productIndex.import(key, serializedIndex[key]);
        });

        console.log('Index loaded from file.');
        isDataLoaded = true;
        return { products, productIndex };
      } else {
        console.warn('Index file missing product data. Rebuilding from database.');
      }
    } else {
      console.warn('No index file found. Building from database.');
    }
  } catch (e) {
    console.error('Failed to load index file, rebuilding from database:', e);
  }

  console.log('Building index from database...');
  products = [];
  await forceBuildAndSaveIndexToFile();
  return { products, productIndex };
}

export async function forceBuildAndSaveIndexToFile() {
  console.log('Building index from data source and writing to file...');
  try {
    products = await loadProductsData();
    products = products.filter((p) => p.TOTAL_INVENTORY > 0);
    productIndex = createFlexDoc();
    products.forEach((p) => productIndex.add(p));
    console.log('Products indexed with FlexSearch.');
    isDataLoaded = true;
    await saveIndexToFile(productIndex, products);
  } catch (error) {
    console.error('Failed to load product data:', error);
    isDataLoaded = false;
    throw error;
  }
}

async function saveIndexToFile(indexToSave, productsToSave) {
  if (!indexToSave || productsToSave.length === 0) {
    console.warn('No index or products to save.');
    return;
  }

  const serializedIndex = {};
  await indexToSave.export((key, data) => {
    serializedIndex[key] = data;
  });

  const dataToSave = {
    serializedIndex,
    loadedProducts: productsToSave,
  };

  console.log('Writing FlexSearch index to file...');
  try {
    fs.writeFileSync(INDEX_FILE_PATH, JSON.stringify(dataToSave, null, 2));
    console.log(`FlexSearch index saved to ${INDEX_FILE_PATH}`);
  } catch (e) {
    console.error('Failed to save FlexSearch index to file:', e);
    throw e;
  }
}

export function getAllProducts() {
  return products;
}

export function searchProducts(query) {
  if (!productIndex) {
    console.warn('Product index not initialized for searchProducts.');
    return [];
  }

  if (!query || query.trim() === '') {
    return [];
  }

  const searchResults = productIndex.search(query.trim(), {
    enrich: true,
    suggest: true,
  });

  const uniqueResults = new Map();
  searchResults.forEach((fieldResult) => {
    fieldResult.result.forEach((item) => {
      uniqueResults.set(item.doc.ID, item.doc);
    });
  });

  return Array.from(uniqueResults.values());
}

export function addProduct(product) {
  dbAddProduct(product);
  isDataLoaded = false;
}

export function updateProduct(product) {
  dbUpdateProduct(product);
  isDataLoaded = false;
}

export function getPendingProducts() {
  return getPendingFromDb();
}

export function approveProduct(id) {
  setProductStatus(id, 'approved');
  isDataLoaded = false;
}

export function rejectProduct(id) {
  setProductStatus(id, 'rejected');
  isDataLoaded = false;
}

export function getCategoriesFlat() {
  return dbGetCategories();
}

export function getCategoryTree() {
  const flat = dbGetCategories();
  if (flat.length > 0) {
    const map = {};
    flat.forEach((c) => {
      map[c.id] = { name: c.name, image: c.image, subcategories: [] };
    });
    flat.forEach((c) => {
      if (c.parentId) {
        map[c.parentId]?.subcategories.push(c.name);
      }
    });
    return flat
      .filter((c) => !c.parentId)
      .map((c) => ({
        name: c.name,
        image: c.image,
        subcategories: map[c.id].subcategories.sort((a, b) =>
          a.localeCompare(b)
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const rows = getAllFromDb();
  const map = {};
  for (const row of rows) {
    if (!row.category) continue;
    if (!map[row.category]) map[row.category] = new Set();
    if (row.product_type) map[row.category].add(row.product_type);
  }
  return Object.entries(map)
    .map(([name, set]) => ({ name, subcategories: Array.from(set).sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function createCategory(name, parentId = null, image = null) {
  const existing = getCategoryByName(name);
  if (!existing) {
    if (parentId) {
      const parent = getCategoryById(parentId);
      if (parent?.parentId) {
        throw new Error('depth');
      }
    }
    dbAddCategory(name, parentId, image);
  }
}

export function renameCategory(id, name, parentId = null, image = null) {
  dbUpdateCategory(id, name, parentId, image);
}

export function removeCategory(id) {
  const cat = getCategoryById(id);
  if (!cat) return;
  const count = countProductsForCategory(cat.name);
  if (count === 0) {
    dbDeleteCategory(id);
  } else {
    throw new Error('category in use');
  }
}

export function deleteProduct(id) {
  dbDeleteProduct(id);
  isDataLoaded = false;
}
