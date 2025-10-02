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
import SearchLargeIcon from '../../components/icons/SearchLargeIcon';
import CheckIcon from '../../components/icons/CheckIcon';
import TruckIcon from '../../components/icons/TruckIcon';
import LockIcon from '../../components/icons/LockIcon';

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
  const vendorParam = context.query.vendor as string | undefined;
  const vendorIds = vendorParam 
    ? vendorParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    : undefined;
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
    vendorIds,
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
  const [selectedBrands, setSelectedBrands] = useState<number[]>(
    typeof router.query.vendor === 'string' && router.query.vendor
      ? router.query.vendor.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
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
      if (selectedBrands.length > 0)
        query.vendor = selectedBrands.join(',');
      if (minPrice) query.minPrice = minPrice;
      if (maxPrice) query.maxPrice = maxPrice;
      if (inStock) query.inStock = 'true';
      if (sort) query.sort = sort;
      const params = new URLSearchParams(query);
      params.set('page', String(p));
      return params;
    },
    [keyword, selectedCategories, selectedBrands, minPrice, maxPrice, inStock, sort]
  );

  const getFilterSnapshot = useCallback(() => {
    return JSON.stringify({
      keyword,
      categories: selectedCategories,
      brands: selectedBrands,
      minPrice,
      maxPrice,
      inStock,
      sort,
    });
  }, [keyword, selectedCategories, selectedBrands, minPrice, maxPrice, inStock, sort]);

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
      selectedBrands,
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
  }, [keyword, selectedCategories, selectedBrands, minPrice, maxPrice, inStock, sort]);

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
  if (selectedBrands.length > 0)
    selectedBrands.forEach((brandId) =>
      activeFilters.push({
        label: `Brand #${brandId}`,
        clear: () =>
          setSelectedBrands((prev) => prev.filter((id) => id !== brandId)),
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
    setSelectedBrands([]);
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
    <div className="min-h-screen">
      <Head>
        <title>{getPageTitle('Products')}</title>
        <meta name="description" content="Discover amazing products from top brands" />
      </Head>
      {/* Hero Section */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Discover Amazing Products</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">Explore our curated collection of premium products from trusted brands.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-base text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2"><CheckIcon className="w-5 h-5 text-green-500" />{total} Products Available</span>
            <span className="flex items-center gap-2"><TruckIcon className="w-5 h-5 text-blue-500" />Fast Shipping</span>
            <span className="flex items-center gap-2"><LockIcon className="w-5 h-5 text-purple-500" />Secure Checkout</span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-10 items-start">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 xl:w-80 mb-6 lg:mb-0 lg:sticky lg:top-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-base-content">Filters</h2>
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
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
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
                <div className="flex flex-wrap items-start sm:items-center gap-2 sm:space-x-4">
                  <h2 className="text-2xl font-bold text-base-content">
                    {items.length} Products
                  </h2>
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-base-content/60">Filtered by:</span>
                      <ActiveFilters filters={activeFilters} clearAll={clearAll} />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 sm:ml-auto">
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
                  <SearchLargeIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
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

ProductsPage.maxWidthClass = 'max-w-screen-2xl';

export default ProductsPage;
