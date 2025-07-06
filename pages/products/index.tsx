import { apiFetch } from '@lib/api';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Loader from '@components/Loader';
import { getPageTitle } from '@lib/pageTitle';
import {
  getProductsPaginated,
  PaginatedResult,
  getCategoriesFlat,
} from '@lib/products';
import type { Product, Category } from '@/types';
import { serializeDates } from '@utils/serializeDates';
import { NotificationContext } from '../../contexts/NotificationContext';
import { 
  ProductFilters,
  ActiveFilters,
  ProductGrid,
  InfiniteLoader,
  SortMenu
} from '@lib/dynamicImports';
import type { SortValue } from '@components/SortMenu';

interface ProductsProps {
  products: Product[];
  total: number;
  categories: Category[];
}

export const getServerSideProps: GetServerSideProps<ProductsProps> = async (
  context
) => {
  const inStock = context.query.inStock === 'true';
  const categoryParam = context.query.category as string | undefined;
  const categorySlugs = categoryParam
    ? categoryParam.split(',').filter(Boolean)
    : [];
  const q = context.query.q as string | undefined;
  const minPrice = context.query.minPrice
    ? parseFloat(context.query.minPrice as string)
    : undefined;
  const maxPrice = context.query.maxPrice
    ? parseFloat(context.query.maxPrice as string)
    : undefined;
  const sort = (context.query.sort as string) || 'newest';

  const limit = 20;
  const offset = 0;
  const result: PaginatedResult = await getProductsPaginated({
    limit,
    offset,
    categorySlugs,
    search: q,
    inStock,
    minPrice,
    maxPrice,
    sort: sort as import('@lib/products').PaginatedOptions['sort'],
  });

  const categories = serializeDates(await getCategoriesFlat());
  const products = serializeDates(result.products);
  return { props: { products, total: result.total, categories } };
};

const ProductsPage: React.FC<ProductsProps> & { maxWidthClass?: string } = ({
  products,
  total,
  categories,
}) => {
  const router = useRouter();
  const { addNotification } = useContext(NotificationContext);
  const [keyword, setKeyword] = useState(
    typeof router.query.q === 'string' ? router.query.q : ''
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    typeof router.query.category === 'string' && router.query.category
      ? router.query.category.split(',')
      : []
  );
  const [minPrice, setMinPrice] = useState(
    typeof router.query.minPrice === 'string' ? router.query.minPrice : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    typeof router.query.maxPrice === 'string' ? router.query.maxPrice : ''
  );
  const [inStock, setInStock] = useState(router.query.inStock === 'true');
  const [sort, setSort] = useState<SortValue>(
    (router.query.sort as SortValue) || 'newest'
  );
  const [items, setItems] = useState<Product[]>(products);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(products.length < total);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const requestedRef = useRef<Set<string>>(new Set());
  const loadingRef = useRef(false);
  const initializingRef = useRef(false);
  const filterChangedRef = useRef(0);
  const lastFilterSnapshot = useRef('');
  const lastPageRequested = useRef(1);
  const firstFilterRef = useRef(true);
  const loadProductsRef = useRef<
    null | ((p: number, mode: 'reset' | 'append') => void)
  >(null);

  const buildParams = useCallback(
    (p: number) => {
      const query: Record<string, string> = {};
      if (keyword) query.q = keyword;
      if (selectedCategories.length > 0)
        query.category = selectedCategories.join(',');
      if (minPrice) query.minPrice = minPrice;
      if (maxPrice) query.maxPrice = maxPrice;
      if (inStock) query.inStock = 'true';
      if (sort) query.sort = sort;
      const params = new URLSearchParams(query);
      params.set('page', String(p));
      return params;
    },
    [keyword, selectedCategories, minPrice, maxPrice, inStock, sort]
  );

  const getFilterSnapshot = useCallback(() => {
    return JSON.stringify({
      keyword,
      categories: selectedCategories,
      minPrice,
      maxPrice,
      inStock,
      sort,
    });
  }, [keyword, selectedCategories, minPrice, maxPrice, inStock, sort]);

  const loadProductsFn = useCallback(
    async (p: number, mode: 'reset' | 'append') => {
      const snapshot = getFilterSnapshot();
      const key = `${snapshot}_${p}`;
      if (requestedRef.current.has(key)) return;
      if (loadingRef.current) return;
      if (mode === 'append' && !hasMore) return;

      loadingRef.current = true;
      requestedRef.current.add(key);
      lastFilterSnapshot.current = snapshot;
      lastPageRequested.current = p;
      
      if (mode === 'append') {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await fetch(
          `/api/products?${buildParams(p).toString()}`
        );
        
        if (res.status === 304) {
          // Data is cached and hasn't changed, skip this request
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch');
        const data = (await res.json()) as {
          products: Product[];
          total: number;
        };
        
        if (mode === 'reset') {
          setItems(data.products);
          setHasMore(data.products.length < data.total);
          window.scrollTo({ top: 0 });
        } else {
          setItems((prev) => {
            const updated = [...prev, ...data.products];
            return updated;
          });
          setHasMore(data.products.length < data.total);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        loadingRef.current = false;
        if (mode === 'append') {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [
      buildParams,
      getFilterSnapshot,
      hasMore,
      keyword,
      selectedCategories,
      minPrice,
      maxPrice,
      inStock,
      sort,
    ]
  );

  useEffect(() => {
    loadProductsRef.current = loadProductsFn;
  }, [loadProductsFn]);

  const handleLoadMore = useCallback(() => {
    if (
      loadingRef.current ||
      !hasMore ||
      initializingRef.current ||
      Date.now() - filterChangedRef.current <= 300
    ) {
      return;
    }
    const nextPage = lastPageRequested.current + 1;
    loadProductsRef.current?.(nextPage, 'append');
  }, [hasMore]);

  useEffect(() => {
    if (firstFilterRef.current) {
      firstFilterRef.current = false;
      return;
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    filterChangedRef.current = Date.now();
    debounceTimerRef.current = setTimeout(() => {
      requestedRef.current.clear();
      setHasMore(true);
      initializingRef.current = true;
      loadProductsRef.current?.(1, 'reset');
      initializingRef.current = false;
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [keyword, selectedCategories, minPrice, maxPrice, inStock, sort]);

  const toggleInStock = useCallback(() => {
    setInStock((prev) => !prev);
  }, []);

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (selectedCategories.length > 0)
    selectedCategories.forEach((sc) =>
      activeFilters.push({
        label: categories.find((c) => c.slug === sc)?.name || sc,
        clear: () =>
          setSelectedCategories((prev) => prev.filter((s) => s !== sc)),
      })
    );
  if (inStock) activeFilters.push({ label: 'In Stock', clear: toggleInStock });
  if (minPrice)
    activeFilters.push({
      label: `Min £${minPrice}`,
      clear: () => {
        setMinPrice('');
      },
    });
  if (maxPrice)
    activeFilters.push({
      label: `Max £${maxPrice}`,
      clear: () => {
        setMaxPrice('');
      },
    });
  if (keyword)
    activeFilters.push({ label: keyword, clear: () => setKeyword('') });

  const clearAll = useCallback(() => {
    setKeyword('');
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setSort('newest');
    router.replace({ pathname: router.pathname, query: {} }, undefined, {
      shallow: true,
    });
    addNotification('Filters cleared', 'success');
  }, [router, addNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
      <Head>
        <title>{getPageTitle('Products')}</title>
        <meta name="description" content="Discover amazing products from top brands" />
      </Head>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Explore our curated collection of premium products from trusted brands
            </p>
            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-base-content/60">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {total} Products Available
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fast Shipping
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Secure Checkout
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 w-full flex-shrink-0">
            <div className="bg-base-100 rounded-2xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-base-content">Filters</h2>
                <button
                  onClick={clearAll}
                  className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"
                >
                  Clear All
                </button>
              </div>
              <ProductFilters
                keyword={keyword}
                setKeyword={setKeyword}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                inStock={inStock}
                setInStock={setInStock}
                categories={categories}
                clearAll={clearAll}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Results Header */}
            <div className="bg-base-100 rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-base-content">
                    {items.length} Products
                  </h2>
                  {activeFilters.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-base-content/60">Filtered by:</span>
                      <ActiveFilters filters={activeFilters} clearAll={clearAll} />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <SortMenu value={sort} onChange={(v) => setSort(v)} />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="relative">
              <div className="bg-base-100 rounded-2xl shadow-lg p-6">
                <ProductGrid products={items} />
                {loading && (
                  <div className="absolute inset-0 bg-base-100/80 rounded-2xl flex items-center justify-center">
                    <Loader className="w-12 h-12" />
                  </div>
                )}
              </div>
              
              {/* Load More */}
              <div className="mt-6">
                <InfiniteLoader
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  loading={loadingMore}
                  itemsLength={items.length}
                />
              </div>
            </div>

            {/* No Results */}
            {items.length === 0 && !loading && (
              <div className="bg-base-100 rounded-2xl shadow-lg p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-xl font-semibold text-base-content mb-2">No products found</h3>
                  <p className="text-base-content/60 mb-6">
                    Try adjusting your filters or search terms to find what you&apos;re looking for.
                  </p>
                  <button
                    onClick={clearAll}
                    className="btn btn-primary"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProductsPage.maxWidthClass = 'max-w-[95%] 2xl:max-w-[1440px]';

export default ProductsPage;
