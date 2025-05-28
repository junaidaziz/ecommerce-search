import csv from 'csv-parser';
import { JSDOM } from 'jsdom';
import FlexSearch from 'flexsearch';
const { Document } = FlexSearch;
import { createReadStream, promises as fsPromises, existsSync } from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';

let products = [];
let productIndex = null;
let isDataLoaded = false;

const CSV_FILE_PATH = path.join(process.cwd(), 'data', 'products.csv');
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
            console.warn("No pre-built index found in Vercel Blob. Building from CSV.");
            products = [];
        }
    } catch (e) {
        console.error("Failed to load pre-built index from Vercel Blob, building from CSV:", e);
        products = [];
    }

    console.log("Building index from CSV...");
    products = []; 
    await buildIndexFromCsvAndSaveToBlob();
    return { products, productIndex };
}

export async function forceBuildAndSaveIndexToBlob() {
    console.log("Building index from CSV and uploading to Blob...");
    products = [];

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
        await new Promise((resolve, reject) => {
            createReadStream(CSV_FILE_PATH)
                .pipe(csv())
                .on('data', (row) => {
                    const processedRow = { ...row };

                    const jsonFields = ['SEO', 'OPTIONS', 'VARIANTS', 'PRICE_RANGE_V2', 'METAFIELDS'];
                    jsonFields.forEach(field => {
                        if (processedRow[field]) {
                            try {
                                processedRow[field] = JSON.parse(processedRow[field]);
                            } catch (e) {
                                console.warn(`Could not parse JSON for field '${field}' in row with ID: ${processedRow.ID || 'N/A'}. Error: ${e.message}`);
                                processedRow[field] = null;
                            }
                        }
                    });

                    processedRow.DESCRIPTION_TEXT = stripHtml(processedRow.DESCRIPTION);
                    processedRow.BODY_HTML_TEXT = stripHtml(processedRow.BODY_HTML);

                    processedRow.MIN_PRICE = processedRow.PRICE_RANGE_V2?.min_variant_price?.amount || 0;
                    processedRow.MAX_PRICE = processedRow.PRICE_RANGE_V2?.max_variant_price?.amount || 0;
                    processedRow.CURRENCY = processedRow.PRICE_RANGE_V2?.min_variant_price?.currency_code || 'GBP';
                    processedRow.SOLD_COUNT = parseInt(processedRow.METAFIELDS?.stoked_inventory_sold_count?.value || '0', 10);
                    processedRow.REVIEW_COUNT = parseInt(processedRow.METAFIELDS?.yotpo_reviews_count?.value || '0', 10);
                    processedRow.AVERAGE_RATING = parseFloat(processedRow.METAFIELDS?.yotpo_reviews_average?.value || '0');
                    processedRow.ID = String(processedRow.ID);

                    products.push(processedRow);
                })
                .on('end', async () => {
                    console.log(`Loaded ${products.length} products.`);
                    
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

                    products.forEach(product => {
                        productIndex.add(product);
                    });

                    console.log("Products indexed with FlexSearch.");
                    isDataLoaded = true;

                    await saveIndexToBlob(productIndex, products);
                    resolve();
                })
                .on('error', (error) => {
                    console.error("Error reading or parsing CSV:", error);
                    isDataLoaded = false;
                    reject(error);
                });
        });
    } catch (error) {
        console.error("Failed to load CSV data:", error);
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
