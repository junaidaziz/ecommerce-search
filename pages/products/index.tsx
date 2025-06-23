import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState, useContext } from 'react';
import ProductCard from '../../components/ProductCard';
import { getPageTitle } from '../../lib/pageTitle';
import {
  getProductsPaginated,
  PaginatedResult,
  getCategoriesFlat,
} from '../../lib/products';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import { serializeDates } from '../../lib/utils/serializeDates';
import { NotificationContext } from '../../contexts/NotificationContext';

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
  });

  const categories = serializeDates(await getCategoriesFlat());

  const products = serializeDates(result.products);
  return { props: { products, total: result.total, categories } };
};

const ProductsPage: React.FC<ProductsProps> & { maxWidthClass?: string } = ({
  products,
  total,
  categories,
}: ProductsProps) => {
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
  const [items, setItems] = useState<Product[]>(products);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(products.length < total);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver>();
  const isFetchingRef = useRef(false);
  const filterAbortRef = useRef<AbortController | null>(null);
  const scrollAbortRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef(0);
  const priceTimer = useRef<NodeJS.Timeout>();
  const filterTimer = useRef<NodeJS.Timeout>();
  const firstPriceRef = useRef(true);
  const firstFilterRef = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const requestedRef = useRef<Set<string>>(new Set());

  const buildParams = useCallback(
    (p: number) => {
      const query: Record<string, string> = {};
      if (keyword) query.q = keyword;
      if (selectedCategories.length > 0)
        query.category = selectedCategories.join(',');
      if (minPrice) query.minPrice = minPrice;
      if (maxPrice) query.maxPrice = maxPrice;
      if (inStock) query.inStock = 'true';
      const params = new URLSearchParams(query);
      params.set('page', String(p));
      return params;
    },
    [keyword, selectedCategories, minPrice, maxPrice, inStock]
  );

  const fetchProducts = useCallback(
    async (p: number, signal?: AbortSignal) => {
      const params = buildParams(p);
      const key = params.toString();
      if (requestedRef.current.has(key)) return null;
      requestedRef.current.add(key);
      try {
        const res = await fetch(`/api/products?${key}`, { signal });
        if (!res.ok) {
          requestedRef.current.delete(key);
          return null;
        }
        return (await res.json()) as { products: Product[]; total: number };
      } catch (err) {
        requestedRef.current.delete(key);
        throw err;
      }
    },
    [buildParams]
  );

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || loadingMore || loading || !hasMore) return;
    const now = Date.now();
    if (now - lastFetchRef.current < 500) return;
    lastFetchRef.current = now;
    if (scrollAbortRef.current) scrollAbortRef.current.abort();
    const controller = new AbortController();
    scrollAbortRef.current = controller;
    isFetchingRef.current = true;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const data = await fetchProducts(next, controller.signal);
      if (data) {
        setItems((prev) => {
          const updated = [...prev, ...data.products];
          setHasMore(updated.length < data.total);
          return updated;
        });
        setPage(next);
      }
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
      scrollAbortRef.current = null;
    }
  }, [fetchProducts, hasMore, loadingMore, loading, page]);

  const loadMoreFn = useRef(loadMore);
  loadMoreFn.current = loadMore;

  const resetObserver = useCallback(() => {
    if (observerRef.current && loadMoreRef.current) {
      observerRef.current.disconnect();
      observerRef.current.observe(loadMoreRef.current);
    }
  }, []);

  const applyFilters = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (filterAbortRef.current) {
        filterAbortRef.current.abort();
      }
      if (scrollAbortRef.current) {
        scrollAbortRef.current.abort();
      }
      requestedRef.current.clear();
      filterAbortRef.current = new AbortController();
      const signal = filterAbortRef.current.signal;
      isFetchingRef.current = true;
      setLoading(true);
      const min = minPrice ? parseFloat(minPrice) : undefined;
      const max = maxPrice ? parseFloat(maxPrice) : undefined;
      if (
        typeof min === 'number' &&
        typeof max === 'number' &&
        !isNaN(min) &&
        !isNaN(max) &&
        min > max
      ) {
        addNotification('Min price cannot exceed Max price', 'error');
        return;
      }
      try {
        const data = await fetchProducts(1, signal);
        if (data) {
          setItems(data.products);
          setPage(1);
          setHasMore(data.products.length < data.total);
          resetObserver();
          window.scrollTo({ top: 0 });
        }
        const query: Record<string, string> = {};
        if (keyword) query.q = keyword;
        if (selectedCategories.length > 0)
          query.category = selectedCategories.join(',');
        if (minPrice) query.minPrice = minPrice;
        if (maxPrice) query.maxPrice = maxPrice;
        if (inStock) query.inStock = 'true';
        router.replace({ pathname: router.pathname, query }, undefined, {
          shallow: true,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to fetch products:', err);
        }
      } finally {
        filterAbortRef.current = null;
        isFetchingRef.current = false;
        setLoading(false);
      }
    },
    [
      router,
      keyword,
      selectedCategories,
      minPrice,
      maxPrice,
      inStock,
      fetchProducts,
      resetObserver,
      addNotification,
    ]
  );

  const applyFiltersRef = useRef(applyFilters);
  applyFiltersRef.current = applyFilters;

  useEffect(() => {
    setInStock(router.query.inStock === 'true');
  }, [router.query.inStock]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            loadMoreFn.current();
          }, 250);
        }
      },
      { rootMargin: '200px' }
    );
    observerRef.current = observer;
    const el = loadMoreRef.current;
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (firstPriceRef.current) {
      firstPriceRef.current = false;
      return;
    }
    if (priceTimer.current) clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => {
      applyFilters();
    }, 500);
    return () => {
      if (priceTimer.current) clearTimeout(priceTimer.current);
    };
  }, [minPrice, maxPrice, applyFilters]);

  useEffect(() => {
    if (firstFilterRef.current) {
      firstFilterRef.current = false;
      return;
    }
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => {
      applyFiltersRef.current();
    }, 300);
    return () => {
      if (filterTimer.current) clearTimeout(filterTimer.current);
    };
  }, [selectedCategories, keyword, inStock]);

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
    router.replace({ pathname: router.pathname, query: {} }, undefined, {
      shallow: true,
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <Head>
        <title>{getPageTitle('Products')}</title>
      </Head>
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-80 w-full flex-shrink-0">
            <form onSubmit={applyFilters} className="space-y-4 sticky top-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={inStock}
                  onChange={toggleInStock}
                />
                <span>In Stock Only</span>
              </label>
              <details open className="collapse bg-base-100 rounded-box">
                <summary className="collapse-title font-medium">
                  Category
                </summary>
                <div className="collapse-content max-h-48 overflow-y-auto">
                  {categories.map((c) => (
                    <label key={c.slug} className="block mb-1">
                      <input
                        type="checkbox"
                        className="checkbox mr-2"
                        value={c.slug}
                        checked={selectedCategories.includes(c.slug || '')}
                        onChange={(e) => {
                          const slug = c.slug || '';
                          setSelectedCategories((prev) =>
                            e.target.checked
                              ? [...prev, slug]
                              : prev.filter((s) => s !== slug)
                          );
                        }}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </details>
              <details className="collapse bg-base-100 rounded-box">
                <summary className="collapse-title font-medium">
                  Price Range
                </summary>
                <div className="collapse-content space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="input input-sm input-bordered w-full"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="input input-sm input-bordered w-full"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </details>
              <details className="collapse bg-base-100 rounded-box">
                <summary className="collapse-title font-medium">
                  Keyword
                </summary>
                <div className="collapse-content">
                  <input
                    type="text"
                    placeholder="Search name"
                    className="input input-sm input-bordered w-full"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </details>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={clearAll}
                >
                  Clear All
                </button>
              </div>
            </form>
          </aside>
          <div className="flex-1">
            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2 items-center">
                {activeFilters.map((f, i) => (
                  <span key={i} className="badge badge-outline gap-1">
                    {f.label}
                    <button
                      type="button"
                      className="ml-1"
                      onClick={() => {
                        f.clear();
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            {loading && (
              <div className="flex justify-center my-4">
                <span className="loading loading-spinner" />
              </div>
            )}
            {items.length === 0 && !loading ? (
              <p className="text-gray-500">No products found.</p>
            ) : !loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} className="w-full" />
                ))}
              </div>
            ) : null}
            <div
              className="flex justify-center my-4 h-8"
              aria-hidden={!loadingMore}
            >
              {loadingMore && <span className="loading loading-spinner" />}
            </div>
            {!hasMore && items.length > 0 && (
              <p className="text-center text-sm text-gray-500 my-4">
                No more products.
              </p>
            )}
            <div ref={loadMoreRef} className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

ProductsPage.maxWidthClass = 'max-w-[95%] 2xl:max-w-[1440px]';

export default ProductsPage;
