import csv from 'csv-parser';
import { JSDOM } from 'jsdom';
import FlexSearch from 'flexsearch';
import { createReadStream } from 'fs';
import path from 'path';

let products = [];
let productIndex = null;
let isDataLoaded = false;

const CSV_FILE_PATH = path.join(process.cwd(), 'data', 'products.csv');

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
        return;
    }

    console.log("Loading and indexing products...");
    products = [];

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
                .on('end', () => {
                    console.log(`Loaded ${products.length} products.`);
                    
                    productIndex = new FlexSearch.Document({
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

export function getAllProducts() {
    return products;
}

export function searchProducts(query) {
    if (!productIndex) {
        console.warn("Product index not initialized. Call loadAndIndexProducts() first.");
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
