import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

export default function Home({ theme, setTheme }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [sortBy, setSortBy] = useState('sold_count_desc');
    const [filterByVendor, setFilterByVendor] = useState('All');
    const [filterByType, setFilterByType] = useState('All');
    const [inStock, setInStock] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 20;

    const [allVendors, setAllVendors] = useState([]);
    const [allProductTypes, setAllProductTypes] = useState([]);

    // useRef to store the AbortController instance
    const abortControllerRef = useRef(null);

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
    }, [searchTerm, sortBy, filterByVendor, filterByType, inStock, currentPage, pageSize, allVendors.length, allProductTypes.length]);

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

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts();
    };

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

                <form onSubmit={handleSearch} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium text-base-content mb-1">
                            Search Products
                        </label>
                        <input
                            type="text"
                            id="search"
                            className="input input-bordered w-full"
                            placeholder="Search by title, vendor, description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

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
                            onChange={(e) => { setFilterByType(e.target.value); setCurrentPage(1); }}
                        >
                            {allProductTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
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

                    <div className="md:col-span-1 flex justify-end">
                        <button
                            type="submit"
                            className="btn btn-primary w-full md:w-auto"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

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
                        <div key={product.ID} className="card bg-base-100 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
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

                            <div className="card-body flex flex-col">
                                <h2 className="text-xl font-semibold text-base-content mb-2 line-clamp-2" title={product.TITLE}>
                                    {product.TITLE || 'Untitled Product'}
                                </h2>
                                <p className="text-sm text-base-content mb-1">
                                    <span className="font-medium">Vendor:</span> {product.VENDOR || 'N/A'}
                                </p>
                                <p className="text-sm text-base-content mb-1">
                                    <span className="font-medium">Type:</span> {product.PRODUCT_TYPE || 'N/A'}
                                </p>
                                <p className="text-md font-bold text-base-content mb-2">
                                    {product.CURRENCY} {product.MIN_PRICE.toFixed(2)}
                                    {product.MAX_PRICE > product.MIN_PRICE && ` - ${product.MAX_PRICE.toFixed(2)}`}
                                </p>
                                <p className="text-sm text-base-content mb-4 line-clamp-3">
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
                            </div>
                        </div>
                    ))}
                </div>

                {products.length > 0 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                            className="btn btn-secondary"
                        >
                            Previous
                        </button>
                        <span className="text-base-content">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                            className="btn btn-secondary"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

