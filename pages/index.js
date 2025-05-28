import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-inter">
            <Head>
                <title>Product Search App</title>
                <meta name="description" content="Search products from CSV data" />
                <link rel="icon" href="/favicon.ico" />
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <main className="w-full max-w-6xl bg-white p-8 rounded-lg shadow-xl">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Product Search</h1>

                <form onSubmit={handleSearch} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search Products
                        </label>
                        <input
                            type="text"
                            id="search"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search by title, vendor, description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="filterVendor" className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Vendor
                        </label>
                        <select
                            id="filterVendor"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={filterByVendor}
                            onChange={(e) => { setFilterByVendor(e.target.value); setCurrentPage(1); }}
                        >
                            {allVendors.map(vendor => (
                                <option key={vendor} value={vendor}>{vendor}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Type
                        </label>
                        <select
                            id="filterType"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={filterByType}
                            onChange={(e) => { setFilterByType(e.target.value); setCurrentPage(1); }}
                        >
                            {allProductTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                            Sort By
                        </label>
                        <select
                            id="sortBy"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={inStock}
                            onChange={(e) => { setInStock(e.target.checked); setCurrentPage(1); }}
                        />
                        <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
                            Show In Stock Only
                        </label>
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {loading && products.length === 0 && (
                    <p className="text-center text-gray-600 text-lg">Loading products...</p>
                )}

                {!loading && products.length === 0 && !error && (
                    <p className="text-center text-gray-600 text-lg">No products found. Try a different search or clear filters.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.ID} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col">
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

                            <div className="p-4 flex-grow flex flex-col">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2" title={product.TITLE}>
                                    {product.TITLE || 'Untitled Product'}
                                </h2>
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Vendor:</span> {product.VENDOR || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Type:</span> {product.PRODUCT_TYPE || 'N/A'}
                                </p>
                                <p className="text-md font-bold text-gray-800 mb-2">
                                    {product.CURRENCY} {product.MIN_PRICE.toFixed(2)}
                                    {product.MAX_PRICE > product.MIN_PRICE && ` - ${product.MAX_PRICE.toFixed(2)}`}
                                </p>
                                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                                    {product.DESCRIPTION_TEXT || product.BODY_HTML_TEXT || 'No description available.'}
                                </p>
                                <div className="mt-auto flex justify-between items-center text-sm text-gray-500">
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
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

