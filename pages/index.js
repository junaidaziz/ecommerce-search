import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AppContext } from '../contexts/AppContext';

export default function Home({ theme, setTheme }) {
    const router = useRouter();
    const { addToCart } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [sortBy, setSortBy] = useState('sold_count_desc');
    const [filterByVendor, setFilterByVendor] = useState('All');
    const [filterByType, setFilterByType] = useState('All');
    const [inStock, setInStock] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 20;

    const [allVendors, setAllVendors] = useState([]);
    const [allProductTypes, setAllProductTypes] = useState([]);

    // useRef to store the AbortController instance
    const abortControllerRef = useRef(null);

    // Sync filter with query parameter
    useEffect(() => {
        if (router.query.type) {
            const t = Array.isArray(router.query.type) ? router.query.type[0] : router.query.type;
            setFilterByType(t);
        } else {
            setFilterByType('All');
        }
    }, [router.query.type]);

    const fetchProducts = useCallback(async () => {
        // Abort any ongoing request before starting a new one
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('q', searchTerm);
            if (sortBy) params.append('sortBy', sortBy);
            if (filterByVendor && filterByVendor !== 'All') params.append('filterByVendor', filterByVendor);
            if (filterByType && filterByType !== 'All') params.append('filterByType', filterByType);
            if (inStock) params.append('inStock', 'true');
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            params.append('page', currentPage);
            params.append('pageSize', pageSize);

            const queryString = params.toString();
            const response = await fetch(`/api/search${queryString ? `?${queryString}` : ''}`, { signal }); // Pass the signal

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setProducts(data.results);
            setTotalPages(data.totalPages);

            if (allVendors.length === 0 || allProductTypes.length === 0) {
                setAllVendors(['All', ...data.vendors]);
                setAllProductTypes(['All', ...data.productTypes]);
            }

        } catch (e) {
            // Check if the error is due to an aborted request
            if (e.name === 'AbortError') {
                console.log('Fetch aborted:', searchTerm);
                // Do not set error state for aborted requests
            } else {
                console.error("Failed to fetch products:", e);
                setError('Failed to load products. Please try again.');
                setProducts([]);
            }
        } finally {
            // Only set loading to false if the request was not aborted
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [searchTerm, sortBy, filterByVendor, filterByType, inStock, minPrice, maxPrice, currentPage, pageSize, allVendors.length, allProductTypes.length]);

    useEffect(() => {
        fetchProducts();
        // Cleanup function to abort any pending request when component unmounts
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchProducts]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleTypeClick = (type) => {
        setFilterByType(type);
        setCurrentPage(1);
        const query = { ...router.query };
        if (type && type !== 'All') {
            query.type = type;
        } else {
            delete query.type;
        }
        router.replace({ pathname: '/', query }, undefined, { shallow: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts();
    };

    const activeFilters = [];
    if (filterByVendor !== 'All') activeFilters.push({ label: filterByVendor, clear: () => { setFilterByVendor('All'); setCurrentPage(1); } });
    if (filterByType !== 'All') activeFilters.push({ label: filterByType, clear: () => handleTypeClick('All') });
    if (inStock) activeFilters.push({ label: 'In Stock', clear: () => { setInStock(false); setCurrentPage(1); } });
    if (minPrice) activeFilters.push({ label: `Min £${minPrice}`, clear: () => { setMinPrice(''); setCurrentPage(1); } });
    if (maxPrice) activeFilters.push({ label: `Max £${maxPrice}`, clear: () => { setMaxPrice(''); setCurrentPage(1); } });

    return (
        <div className="min-h-screen bg-base-200 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-inter">
            <Head>
                <title>Product Search App</title>
                <meta name="description" content="Search products from CSV data" />
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <main className="w-full max-w-6xl bg-base-100 p-8 rounded-box shadow-xl">
                <h1 className="text-4xl font-bold text-center text-base-content mb-8">Product Search</h1>
                <div className="flex justify-end mb-6">
                    <label className="flex items-center cursor-pointer gap-2">
                        <span className="text-sm">Dark Mode</span>
                        <input
                            type="checkbox"
                            className="toggle"
                            checked={theme === 'dark'}
                            onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        />
                    </label>
                </div>

                <div className="flex flex-wrap justify-center mb-6">
                    {['All', ...allProductTypes.filter(t => t !== 'All')].map(type => (
                        <button
                            key={type}
                            className={`btn btn-sm m-1 ${filterByType === type ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleTypeClick(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearch} className="mb-8 flex gap-2">
                    <input
                        type="text"
                        id="search"
                        className="input input-bordered flex-grow"
                        placeholder="Search by title, vendor, description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                <div className="md:flex">
                    <form onSubmit={handleSearch} className="md:w-60 md:mr-8 mb-8 flex flex-col gap-4">

                        <div>
                            <label htmlFor="filterVendor" className="block text-sm font-medium text-base-content mb-1">
                                Filter by Vendor
                            </label>
                            <select
                                id="filterVendor"
                                className="select select-bordered w-full"
                                value={filterByVendor}
                                onChange={(e) => { setFilterByVendor(e.target.value); setCurrentPage(1); }}
                            >
                                {allVendors.map(vendor => (
                                    <option key={vendor} value={vendor}>{vendor}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="filterType" className="block text-sm font-medium text-base-content mb-1">
                                Filter by Type
                            </label>
                            <select
                                id="filterType"
                                className="select select-bordered w-full"
                                value={filterByType}
                                onChange={(e) => handleTypeClick(e.target.value)}
                            >
                                {allProductTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <label htmlFor="minPrice" className="block text-sm font-medium text-base-content mb-1">Min Price</label>
                                <input
                                    type="number"
                                    id="minPrice"
                                    className="input input-bordered w-full"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="maxPrice" className="block text-sm font-medium text-base-content mb-1">Max Price</label>
                                <input
                                    type="number"
                                    id="maxPrice"
                                    className="input input-bordered w-full"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="sortBy" className="block text-sm font-medium text-base-content mb-1">
                                Sort By
                            </label>
                            <select
                                id="sortBy"
                                className="select select-bordered w-full"
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="sold_count_desc">Popularity (Sold Count)</option>
                                <option value="review_count_desc">Review Count</option>
                                <option value="average_rating_desc">Average Rating</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="title_asc">Title: A-Z</option>
                                <option value="title_desc">Title: Z-A</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="inStock"
                                name="inStock"
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={inStock}
                                onChange={(e) => { setInStock(e.target.checked); setCurrentPage(1); }}
                            />
                            <label htmlFor="inStock" className="ml-2 block text-sm text-base-content">
                                Show In Stock Only
                            </label>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={loading}
                            >
                                {loading ? 'Applying...' : 'Apply Filters'}
                            </button>
                        </div>
                    </form>
                </div>
                    <div className="flex-1">
                        {activeFilters.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {activeFilters.map((f, i) => (
                                    <span key={i} className="badge badge-outline gap-1">
                                        {f.label}
                                        <button type="button" onClick={f.clear} className="ml-1">✕</button>
                                    </span>
                                ))}
                            </div>
                        )}

                {error && (
                    <div className="alert alert-error mb-4" role="alert">
                        <span>{error}</span>
                    </div>
                )}

                {loading && products.length === 0 && (
                    <div className="flex justify-center my-4">
                        <span className="loading loading-spinner"></span>
                    </div>
                )}

                {!loading && products.length === 0 && !error && (
                    <div className="alert shadow-sm">No products found. Try a different search or clear filters.</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.ID} className="card bg-base-100 border border-gray-200 shadow-md transform hover:shadow-xl hover:scale-105 transition duration-200 ease-in-out">
                            <div className="w-full h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                                {product.FEATURED_IMAGE?.url ? (
                                    <img
                                        src={product.FEATURED_IMAGE.url}
                                        alt={product.TITLE || 'Product Image'}
                                        className="object-cover w-full h-full"
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/e0e0e0/555555?text=No+Image`; }}
                                    />
                                ) : (
                                    <img
                                        src={`https://placehold.co/400x300/e0e0e0/555555?text=No+Image`}
                                        alt="No Image Available"
                                        className="object-cover w-full h-full"
                                    />
                                )}
                            </div>

                            <div className="card-body flex flex-col gap-1">
                                <h2 className="text-lg font-semibold text-base-content line-clamp-2" title={product.TITLE}>
                                    {product.TITLE || 'Untitled Product'}
                                </h2>
                                <div className="flex flex-wrap gap-1 text-xs text-base-content">
                                    {product.VENDOR && <span className="badge badge-ghost">{product.VENDOR}</span>}
                                    {product.PRODUCT_TYPE && <span className="badge badge-ghost">{product.PRODUCT_TYPE}</span>}
                                </div>
                                <p className="text-md font-bold text-base-content">
                                    {product.CURRENCY} {product.MIN_PRICE.toFixed(2)}
                                    {product.MAX_PRICE > product.MIN_PRICE && ` - ${product.MAX_PRICE.toFixed(2)}`}
                                </p>
                                <p className="text-sm text-base-content line-clamp-2">
                                    {product.DESCRIPTION_TEXT || product.BODY_HTML_TEXT || 'No description available.'}
                                </p>
                                <div className="mt-auto flex justify-between items-center text-sm text-base-content">
                                    {product.SOLD_COUNT > 0 && (
                                        <span>Sold: {product.SOLD_COUNT}</span>
                                    )}
                                    {product.REVIEW_COUNT > 0 && (
                                        <span>Reviews: {product.REVIEW_COUNT} ({product.AVERAGE_RATING.toFixed(1)} avg)</span>
                                    )}
                                </div>
                                <button
                                    className="btn btn-sm btn-primary mt-2"
                                    onClick={() => addToCart(product)}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {products.length > 0 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                            className="btn btn-primary"
                        >
                            Previous
                        </button>
                        <span className="text-base-content">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                            className="btn btn-primary"
                        >
                            Next
                        </button>
                    </div>
                )}
                </div>
            </main>
        </div>
    );
}

