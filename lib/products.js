import { JSDOM } from 'jsdom';
import FlexSearch from 'flexsearch';
const { Document } = FlexSearch;
import path from 'path';
import { put, list } from '@vercel/blob';
import { getAllFromDb, addProduct as dbAddProduct, updateProduct as dbUpdateProduct } from './db.js';

let products = [];
let productIndex = null;
let isDataLoaded = false;

const BLOB_FILE_NAME = 'flexsearch_index.json';

const stripHtml = (html) => {
    if (!html) return '';
    try {
        const dom = new JSDOM(html);
        return dom.window.document.body.textContent || '';
    } catch (e) {
        console.error("Error stripping HTML:", e);
        return html;
    }
};

function processProductRow(row) {
    const processed = { ...row };
    const jsonFields = ['SEO', 'OPTIONS', 'VARIANTS', 'PRICE_RANGE_V2', 'METAFIELDS'];
    jsonFields.forEach(field => {
        if (processed[field]) {
            try {
                processed[field] = typeof processed[field] === 'string' ? JSON.parse(processed[field]) : processed[field];
            } catch (e) {
                console.warn(`Could not parse JSON for field '${field}' in row with ID: ${processed.ID || 'N/A'}. Error: ${e.message}`);
                processed[field] = null;
            }
        }
    });

    processed.DESCRIPTION_TEXT = stripHtml(processed.DESCRIPTION);
    processed.BODY_HTML_TEXT = stripHtml(processed.BODY_HTML);
    processed.MIN_PRICE = processed.PRICE_RANGE_V2?.min_variant_price?.amount || 0;
    processed.MAX_PRICE = processed.PRICE_RANGE_V2?.max_variant_price?.amount || 0;
    processed.CURRENCY = processed.PRICE_RANGE_V2?.min_variant_price?.currency_code || 'GBP';
    processed.SOLD_COUNT = parseInt(processed.METAFIELDS?.stoked_inventory_sold_count?.value || '0', 10);
    processed.REVIEW_COUNT = parseInt(processed.METAFIELDS?.yotpo_reviews_count?.value || '0', 10);
    processed.AVERAGE_RATING = parseFloat(processed.METAFIELDS?.yotpo_reviews_average?.value || '0');
    processed.ID = String(processed.ID);
    return processed;
}

async function loadProductsData() {
    const rows = getAllFromDb();
    return rows.map(row => processProductRow({
        ID: row.id,
        TITLE: row.title,
        VENDOR: row.vendor,
        DESCRIPTION: row.description,
        PRODUCT_TYPE: row.product_type,
        TAGS: row.tags,
        TOTAL_INVENTORY: row.quantity,
        PRICE_RANGE_V2: {
            min_variant_price: { amount: row.min_price, currency_code: row.currency },
            max_variant_price: { amount: row.max_price, currency_code: row.currency }
        }
    }));
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
                'METAFIELDS.my_fields_ingredients.value'
            ],
            store: true
        },
        preset: 'match',
        tokenize: 'forward',
        resolution: 9
    });
}

export async function loadAndIndexProducts() {
    if (isDataLoaded) {
        console.log("Products already loaded and indexed.");
        return { products, productIndex };
    }

    console.log("Attempting to load pre-built index from Vercel Blob...");

    productIndex = new Document({
        document: {
            id: 'ID',
            index: [
                'TITLE',
                'VENDOR',
                'DESCRIPTION_TEXT',
                'BODY_HTML_TEXT',
                'TAGS',
                'PRODUCT_TYPE',
                'METAFIELDS.my_fields_ingredients.value'
            ],
            store: true
        },
        preset: "match",
        tokenize: "forward",
        resolution: 9
    });

    try {
        const { blobs } = await list();
        const targetBlob = blobs.find(blob => blob.pathname === BLOB_FILE_NAME);

        if (targetBlob && targetBlob.downloadUrl) {
            console.log(`Downloaded index from Blob URL: ${targetBlob.downloadUrl}`);
            const response = await fetch(targetBlob.downloadUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch blob from URL: ${response.statusText}`);
            }
            const indexData = await response.json();

            const { serializedIndex, loadedProducts } = indexData;

            if (loadedProducts && loadedProducts.length > 0) {
                console.log("Loaded products from pre-built Blob data. Rebuilding index manually...");
                products = loadedProducts;

                products.forEach(product => {
                    productIndex.add(product);
                });

                console.log("Index rebuilt from serialized product data from Blob.");
                isDataLoaded = true;
                return { products, productIndex };
            } else {
                console.warn("Pre-built products data from Blob is empty or invalid. Building from CSV.");
                products = [];
            }
        } else {
            console.warn("No pre-built index found in Vercel Blob. Building from source data.");
            products = [];
        }
    } catch (e) {
        console.error("Failed to load pre-built index from Vercel Blob, building from source:", e);
        products = [];
    }

    console.log("Building index from provided data source...");
    products = [];
    await forceBuildAndSaveIndexToBlob();
    return { products, productIndex };
}

export async function forceBuildAndSaveIndexToBlob() {
    console.log("Building index from data source and uploading to Blob...");
    try {
        products = await loadProductsData();
        productIndex = createFlexDoc();
        products.forEach(p => productIndex.add(p));
        console.log("Products indexed with FlexSearch.");
        isDataLoaded = true;
        await saveIndexToBlob(productIndex, products);
    } catch (error) {
        console.error("Failed to load product data:", error);
        isDataLoaded = false;
        throw error;
    }
}


async function saveIndexToBlob(indexToSave, productsToSave) {
    if (!indexToSave || productsToSave.length === 0) {
        console.warn("No index or products to save to Blob.");
        return;
    }

    const serializedIndex = {};
    await indexToSave.export((key, data) => {
        serializedIndex[key] = data;
    });

    const dataToSave = {
        serializedIndex,
        loadedProducts: productsToSave
    };

    console.log("Uploading FlexSearch index to Vercel Blob...");
    try {
        const blob = await put(BLOB_FILE_NAME, JSON.stringify(dataToSave), {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false
        });
        console.log(`FlexSearch index saved successfully to Vercel Blob: ${blob.url}`);
    } catch (e) {
        console.error("Failed to save FlexSearch index to Vercel Blob:", e);
        throw e;
    }
}

export function getAllProducts() {
    return products;
}

export function searchProducts(query) {
    if (!productIndex) {
        console.warn("Product index not initialized for searchProducts.");
        return [];
    }

    if (!query || query.trim() === '') {
        return [];
    }

    const searchResults = productIndex.search(query.trim(), {
        enrich: true,
        suggest: true
    });

    const uniqueResults = new Map();
    searchResults.forEach(fieldResult => {
        fieldResult.result.forEach(item => {
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
