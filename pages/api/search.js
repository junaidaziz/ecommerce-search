import { loadAndIndexProducts } from '../../lib/products';

// Module-level variables to store the loaded products and index
// These will persist across requests within the same serverless function instance.
let productsCache = [];
let productIndexCache = null;
let isInitialized = false;

export default async function handler(req, res) {
    // Initialize products and index only once per serverless function instance
    if (!isInitialized) {
        try {
            console.log("API: Initializing product data...");
            const { products, productIndex } = await loadAndIndexProducts();
            productsCache = products;
            productIndexCache = productIndex;
            isInitialized = true;
            console.log("API: Product data initialized.");
        } catch (error) {
            console.error("API: Failed to initialize product data:", error);
            return res.status(500).json({ error: 'Failed to load product data' });
        }
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { q, filterByVendor, filterByType, inStock, sortBy, page = 1, pageSize = 20, minPrice, maxPrice } = req.query;

    let results = [];

    // Perform search using the cached index
    if (q) {
        // FlexSearch.Document.search returns an array of { field: ..., result: [...] }
        // We need to flatten this into a unique list of product objects.
        const searchResults = productIndexCache.search(q.trim(), {
            enrich: true,
            suggest: true
        });

        const uniqueResults = new Map();
        searchResults.forEach(fieldResult => {
            fieldResult.result.forEach(item => {
                uniqueResults.set(item.doc.ID, item.doc);
            });
        });
        results = Array.from(uniqueResults.values());

    } else {
        results = [...productsCache]; // Return a copy of all products
    }

    if (filterByVendor && filterByVendor !== 'All') {
        results = results.filter(product => product.VENDOR === filterByVendor);
    }
    if (filterByType && filterByType !== 'All') {
        results = results.filter(product => product.PRODUCT_TYPE === filterByType);
    }
    if (inStock === 'true') {
        results = results.filter(product => product.TOTAL_INVENTORY > 0);
    }
    if (typeof minPrice !== 'undefined') {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) {
            results = results.filter(product => parseFloat(product.MIN_PRICE) >= min);
        }
    }
    if (typeof maxPrice !== 'undefined') {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) {
            results = results.filter(product => parseFloat(product.MIN_PRICE) <= max);
        }
    }

    if (sortBy) {
        results.sort((a, b) => {
            switch (sortBy) {
                case 'title_asc':
                    return a.TITLE.localeCompare(b.TITLE);
                case 'title_desc':
                    return b.TITLE.localeCompare(a.TITLE);
                case 'price_asc':
                    return a.MIN_PRICE - b.MIN_PRICE;
                case 'price_desc':
                    return b.MIN_PRICE - a.MIN_PRICE;
                case 'sold_count_desc':
                    return b.SOLD_COUNT - a.SOLD_COUNT;
                case 'review_count_desc':
                    return b.REVIEW_COUNT - a.REVIEW_COUNT;
                case 'average_rating_desc':
                    return b.AVERAGE_RATING - a.AVERAGE_RATING;
                default:
                    return 0;
            }
        });
    }

    const total = results.length;
    const pageInt = parseInt(page, 10);
    const pageSizeInt = parseInt(pageSize, 10);
    const paginated = results.slice((pageInt - 1) * pageSizeInt, pageInt * pageSizeInt);

    // Get all vendors and product types from the full cached list
    const vendors = [...new Set(productsCache.map(p => p.VENDOR).filter(Boolean))].sort();
    const productTypes = [...new Set(productsCache.map(p => p.PRODUCT_TYPE).filter(Boolean))].sort();

    res.status(200).json({
        results: paginated,
        total,
        page: pageInt,
        pageSize: pageSizeInt,
        totalPages: Math.ceil(total / pageSizeInt),
        vendors,
        productTypes
    });
}
