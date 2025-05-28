import { loadAndIndexProducts, searchProducts, getAllProducts } from '../../lib/products';

let isInitialized = false;

export default async function handler(req, res) {
    if (!isInitialized) {
        try {
            await loadAndIndexProducts();
            isInitialized = true;
        } catch (error) {
            console.error("Failed to initialize product data:", error);
            return res.status(500).json({ error: 'Failed to load product data' });
        }
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { q, filterByVendor, filterByType, inStock, sortBy, page = 1, pageSize = 20 } = req.query;

    let results = [];

    if (q) {
        results = searchProducts(q);
    } else {
        results = getAllProducts();
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

    const allProducts = getAllProducts();
    const vendors = [...new Set(allProducts.map(p => p.VENDOR).filter(Boolean))].sort();
    const productTypes = [...new Set(allProducts.map(p => p.PRODUCT_TYPE).filter(Boolean))].sort();

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

