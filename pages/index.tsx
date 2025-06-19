import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { AppContext } from '../contexts/AppContext';
import ProductImageSlider from '../components/ProductImageSlider';
import Hero from '../components/Hero';
import { Product } from '../types/product';
import RecommendedProducts from '../components/RecommendedProducts';

interface SearchResult extends Product {
  highlights?: { field: string; snippet: string }[];
}

export default function Home() {
  const router = useRouter();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } =
    useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<SearchResult[]>([]);
  const [fallbackProducts, setFallbackProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState('sold_count_desc');
  const [filterByVendor, setFilterByVendor] = useState('All');
  const [filterByCategory, setFilterByCategory] = useState('All');
  const [filterByType, setFilterByType] = useState('All');
  const [inStock, setInStock] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 20;

  const [allVendors, setAllVendors] = useState<string[]>([]);
  const [allProductTypes, setAllProductTypes] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [historyInfo, setHistoryInfo] = useState<{ category?: string; id?: string } | null>(null);

  // useRef to store the AbortController instance
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const qParam = router.query.q;
    if (qParam) {
      const q = Array.isArray(qParam) ? qParam[0] : (qParam as string);
      setSearchTerm(q);
    } else {
      setSearchTerm('');
    }
  }, [router.query.q]);

  // Sync filter with query parameter
  useEffect(() => {
    const typeParam = router.query.type;
    if (typeParam) {
      const t = Array.isArray(typeParam) ? typeParam[0] : (typeParam as string);
      setFilterByType(t);
    } else {
      setFilterByType('All');
    }
  }, [router.query.type]);

  useEffect(() => {
    const catParam = router.query.category;
    if (catParam) {
      const c = Array.isArray(catParam) ? catParam[0] : (catParam as string);
      setFilterByCategory(c);
    } else {
      setFilterByCategory('All');
    }
  }, [router.query.category]);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setAllCategories(['All', ...data.map((c: any) => c.name)]);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCats();
  }, []);

  useEffect(() => {
    try {
      const hist = JSON.parse(localStorage.getItem('browse-history') || '[]');
      if (hist.length > 0) {
        fetch(`/api/products/${hist[0]}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.CATEGORY) {
              setHistoryInfo({ category: data.CATEGORY, id: hist[0] });
            }
          })
          .catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchProducts = useCallback(async (): Promise<void> => {
    // Abort any ongoing request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);
    setFallbackProducts([]);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (sortBy) params.append('sort', sortBy);
      if (filterByVendor && filterByVendor !== 'All')
        params.append('brand', filterByVendor);
      if (filterByCategory && filterByCategory !== 'All')
        params.append('category', filterByCategory);
      if (filterByType && filterByType !== 'All')
        params.append('filterByType', filterByType);
      if (inStock) params.append('inStock', 'true');
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('page', String(currentPage));
      params.append('perPage', String(pageSize));

      const queryString = params.toString();
      const response = await fetch(
        `/api/search${queryString ? `?${queryString}` : ''}`,
        { signal }
      ); // Pass the signal

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();
      setProducts(data.results as SearchResult[]);
      setFallbackProducts(data.fallback || []);
      setTotalPages(data.totalPages || 1);
      if (allVendors.length === 0 && Array.isArray(data.brands)) {
        setAllVendors(['All', ...data.brands]);
      }
      if (allCategories.length === 0 && Array.isArray(data.categories)) {
        setAllCategories(['All', ...data.categories]);
      }
    } catch (e: any) {
      // Check if the error is due to an aborted request
      if (e.name === 'AbortError') {
        console.log('Fetch aborted:', searchTerm);
        // Do not set error state for aborted requests
      } else {
        console.error('Failed to fetch products:', e);
        setError('Failed to load products. Please try again.');
        setProducts([]);
        setFallbackProducts([]);
      }
    } finally {
      // Only set loading to false if the request was not aborted
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    searchTerm,
    sortBy,
    filterByVendor,
    filterByCategory,
    filterByType,
    inStock,
    minPrice,
    maxPrice,
    currentPage,
    pageSize,
    allVendors.length,
    allProductTypes.length,
    allCategories.length,
  ]);

  useEffect(() => {
    fetchProducts();
    // Cleanup function to abort any pending request when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleTypeClick = (type: string) => {
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (filterByVendor !== 'All')
    activeFilters.push({
      label: filterByVendor,
      clear: () => {
        setFilterByVendor('All');
        setCurrentPage(1);
      },
    });
  if (filterByType !== 'All')
    activeFilters.push({
      label: filterByType,
      clear: () => handleTypeClick('All'),
    });
  if (filterByCategory !== 'All')
    activeFilters.push({
      label: filterByCategory,
      clear: () => {
        setFilterByCategory('All');
        setCurrentPage(1);
      },
    });
  if (inStock)
    activeFilters.push({
      label: 'In Stock',
      clear: () => {
        setInStock(false);
        setCurrentPage(1);
      },
    });
  if (minPrice)
    activeFilters.push({
      label: `Min £${minPrice}`,
      clear: () => {
        setMinPrice('');
        setCurrentPage(1);
      },
    });
  if (maxPrice)
    activeFilters.push({
      label: `Max £${maxPrice}`,
      clear: () => {
        setMaxPrice('');
        setCurrentPage(1);
      },
    });

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <Head>
        <title>Product Search App</title>
        <meta name="description" content="Search products from CSV data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full bg-base-100 p-8 sm:p-10 lg:p-12 rounded-box shadow-xl space-y-6">
        <Hero />
        {/* Theme toggle moved to header */}

        {allProductTypes.length > 0 && (
          <div className="flex flex-wrap justify-center mb-6">
            {['All', ...allProductTypes.filter((t) => t !== 'All')].map(
              (type) => (
                <button
                  key={type}
                  className={`btn btn-sm m-1 transition-all duration-200 ${filterByType === type ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleTypeClick(type)}
                >
                  {type}
                </button>
              )
            )}
          </div>
        )}
        <div className="md:flex">
          <form
            onSubmit={handleSearch}
            className="md:w-60 md:mr-8 mb-8 flex flex-col gap-4"
          >
            {allVendors.length > 0 && (
              <div>
                <label
                  htmlFor="filterVendor"
                  className="block text-sm font-medium text-base-content mb-1"
                >
                  Filter by Vendor
                </label>
                <select
                  id="filterVendor"
                  className="select select-bordered w-full"
                  value={filterByVendor}
                  onChange={(e) => {
                    setFilterByVendor(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {allVendors.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {allCategories.length > 0 && (
              <div>
                <label
                  htmlFor="filterCategory"
                  className="block text-sm font-medium text-base-content mb-1"
                >
                  Filter by Category
                </label>
                <select
                  id="filterCategory"
                  className="select select-bordered w-full"
                  value={filterByCategory}
                  onChange={(e) => {
                    setFilterByCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {allProductTypes.length > 0 && (
              <div>
                <label
                  htmlFor="filterType"
                  className="block text-sm font-medium text-base-content mb-1"
                >
                  Filter by Type
                </label>
                <select
                  id="filterType"
                  className="select select-bordered w-full"
                  value={filterByType}
                  onChange={(e) => handleTypeClick(e.target.value)}
                >
                  {allProductTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <div className="w-1/2">
                <label
                  htmlFor="minPrice"
                  className="block text-sm font-medium text-base-content mb-1"
                >
                  Min Price
                </label>
                <input
                  type="number"
                  id="minPrice"
                  className="input input-bordered w-full"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="maxPrice"
                  className="block text-sm font-medium text-base-content mb-1"
                >
                  Max Price
                </label>
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
              <label
                htmlFor="sortBy"
                className="block text-sm font-medium text-base-content mb-1"
              >
                Sort By
              </label>
              <select
                id="sortBy"
                className="select select-bordered w-full"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setInStock(e.target.checked);
                  setCurrentPage(1);
                }}
              />
              <label
                htmlFor="inStock"
                className="ml-2 block text-sm text-base-content"
              >
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
          <div className="flex-1">
            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {activeFilters.map((f, i) => (
                  <span key={i} className="badge badge-outline gap-1">
                    {f.label}
                    <button type="button" onClick={f.clear} className="ml-1">
                      ✕
                    </button>
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
              <div className="mb-4">
                <div className="alert shadow-sm mb-4">No results found.</div>
                {fallbackProducts.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-2">Popular Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-4">
                      {fallbackProducts.map((product) => (
                        <div
                          key={product.ID}
                          className="card bg-base-100 border border-base-300 rounded-xl shadow hover:shadow-lg transition-all duration-200"
                        >
                          <Link href={`/product/${product.SLUG}`}>
                            <ProductImageSlider
                              images={
                                product.IMAGES && product.IMAGES.length > 0
                                  ? product.IMAGES
                                  : product.FEATURED_IMAGE?.url
                                    ? [product.FEATURED_IMAGE.url]
                                    : []
                              }
                              placeholderSeed={Number(product.ID)}
                              className="w-full h-40 bg-gray-200 overflow-hidden flex items-center justify-center"
                              imgClass="w-full h-full"
                            />
                          </Link>

                          <div className="card-body flex flex-col gap-1">
                            <Link
                              href={`/product/${product.SLUG}`}
                              className="hover:underline transition-colors duration-200"
                            >
                              <h2
                                className="text-lg font-semibold text-base-content line-clamp-2"
                                title={product.TITLE}
                              >
                                {product.TITLE || 'Untitled Product'}
                              </h2>
                            </Link>
                            <div className="flex flex-wrap gap-1 text-xs text-base-content">
                              {product.VENDOR && (
                                <span className="badge badge-ghost">
                                  {product.VENDOR}
                                </span>
                              )}
                              {product.PRODUCT_TYPE && (
                                <span className="badge badge-ghost">
                                  {product.PRODUCT_TYPE}
                                </span>
                              )}
                            </div>
                            <p className="text-md font-bold text-base-content">
                              {product.CURRENCY} {product.MIN_PRICE.toFixed(2)}
                              {product.MAX_PRICE > product.MIN_PRICE &&
                                ` - ${product.MAX_PRICE.toFixed(2)}`}
                            </p>
                            <p className="text-sm text-base-content line-clamp-2">
                              {product.DESCRIPTION_TEXT ||
                                product.BODY_HTML_TEXT ||
                                'No description available.'}
                            </p>
                            <div className="mt-auto flex justify-between items-center text-sm text-base-content">
                              {product.SOLD_COUNT > 0 && (
                                <span>Sold: {product.SOLD_COUNT}</span>
                              )}
                              {product.REVIEW_COUNT > 0 && (
                                <span>
                                  Reviews: {product.REVIEW_COUNT} (
                                  {product.AVERAGE_RATING.toFixed(1)} avg)
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                className="btn btn-sm btn-primary transition-all duration-200"
                                onClick={() => addToCart(product)}
                              >
                                Add to Cart
                              </button>
                              {wishlist.some((w) => w.ID === product.ID) ? (
                                <button
                                  className="btn btn-sm transition-all duration-200"
                                  onClick={() => removeFromWishlist(product.ID)}
                                >
                                  Remove Wishlist
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm transition-all duration-200"
                                  onClick={() => addToWishlist(product)}
                                >
                                  Add Wishlist
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.ID}
                  className="card bg-base-100 border border-base-300 rounded-xl shadow hover:shadow-lg transition-all duration-200"
                >
                  <Link href={`/product/${product.SLUG}`}>
                    <ProductImageSlider
                      images={
                        product.IMAGES && product.IMAGES.length > 0
                          ? product.IMAGES
                          : product.FEATURED_IMAGE?.url
                            ? [product.FEATURED_IMAGE.url]
                            : []
                      }
                      placeholderSeed={Number(product.ID)}
                      className="w-full h-40 bg-gray-200 overflow-hidden flex items-center justify-center"
                      imgClass="w-full h-full"
                    />
                  </Link>

                  <div className="card-body flex flex-col gap-1">
                    {(() => {
                      const titleHighlight = product.highlights?.find(
                        (h) => h.field === 'title'
                      )?.snippet;
                      const descHighlight = product.highlights?.find(
                        (h) => h.field === 'description'
                      )?.snippet;
                      return (
                        <>
                          <Link
                            href={`/product/${product.SLUG}`}
                            className="hover:underline transition-colors duration-200"
                          >
                            <h2
                              className="text-lg font-semibold text-base-content line-clamp-2"
                              title={product.TITLE}
                            >
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: titleHighlight || product.TITLE || 'Untitled Product',
                                }}
                              />
                            </h2>
                          </Link>
                          <div className="flex flex-wrap gap-1 text-xs text-base-content">
                            {product.VENDOR && (
                              <span className="badge badge-ghost">{product.VENDOR}</span>
                            )}
                            {product.PRODUCT_TYPE && (
                              <span className="badge badge-ghost">{product.PRODUCT_TYPE}</span>
                            )}
                          </div>
                          <p className="text-md font-bold text-base-content">
                            {product.CURRENCY} {product.MIN_PRICE.toFixed(2)}
                            {product.MAX_PRICE > product.MIN_PRICE && ` - ${product.MAX_PRICE.toFixed(2)}`}
                          </p>
                          <p className="text-sm text-base-content line-clamp-2">
                            <span
                              dangerouslySetInnerHTML={{
                                __html:
                                  descHighlight ||
                                  product.DESCRIPTION_TEXT ||
                                  product.BODY_HTML_TEXT ||
                                  'No description available.',
                              }}
                            />
                          </p>
                        </>
                      );
                    })()}
                    <div className="mt-auto flex justify-between items-center text-sm text-base-content">
                      {product.SOLD_COUNT > 0 && (
                        <span>Sold: {product.SOLD_COUNT}</span>
                      )}
                      {product.REVIEW_COUNT > 0 && (
                        <span>
                          Reviews: {product.REVIEW_COUNT} (
                          {product.AVERAGE_RATING.toFixed(1)} avg)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="btn btn-sm btn-primary transition-all duration-200"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>
                      {wishlist.some((w) => w.ID === product.ID) ? (
                        <button
                          className="btn btn-sm transition-all duration-200"
                          onClick={() => removeFromWishlist(product.ID)}
                        >
                          Remove Wishlist
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm transition-all duration-200"
                          onClick={() => addToWishlist(product)}
                        >
                          Add Wishlist
                        </button>
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
        </div>
        {historyInfo?.category && (
          <RecommendedProducts
            category={historyInfo.category}
            excludeId={historyInfo.id}
          />
        )}
      </main>
    </div>
  );
}
