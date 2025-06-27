import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import ProductFilters from '../../components/Product/ProductFilters';
import ActiveFilters from '../../components/ActiveFilters';
import ProductGrid from '../../components/Product/ProductGrid';
import Loader from '../../components/Loader';
import InfiniteLoader from '../../components/InfiniteLoader';
import SortMenu, { SortValue } from '../../components/SortMenu';
import { getPageTitle } from '../../lib/pageTitle';
import {
  getProductsPaginated,
  PaginatedResult,
  getCategoriesFlat,
} from '../../lib/products';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import { serializeDates } from '../../lib/utils/serializeDates';

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
    sort: sort as import('../../lib/products').PaginatedOptions['sort'],
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
  const lastPageRequested = useRef(0);
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
      if (mode === 'append') setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await fetch(`/api/products?${buildParams(p).toString()}`);
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
            setHasMore(updated.length < data.total);
            return updated;
          });
        }
        if (mode === 'reset') {
          const query: Record<string, string> = {};
          if (keyword) query.q = keyword;
          if (selectedCategories.length > 0)
            query.category = selectedCategories.join(',');
          if (minPrice) query.minPrice = minPrice;
          if (maxPrice) query.maxPrice = maxPrice;
          if (inStock) query.inStock = 'true';
          if (sort) query.sort = sort;
          router.replace({ pathname: router.pathname, query }, undefined, {
            shallow: true,
          });
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (mode === 'append') setLoadingMore(false);
        else setLoading(false);
        loadingRef.current = false;
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
      router,
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
    router.replace({ pathname: router.pathname, query: {} }, undefined, {
      shallow: true,
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <Head>
        <title>{getPageTitle('Products')}</title>
      </Head>
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-80 w-full flex-shrink-0">
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
          </aside>
          <div className="flex-1">
          <ActiveFilters filters={activeFilters} clearAll={clearAll} />
          <SortMenu value={sort} onChange={(v) => setSort(v)} />
          <div className="relative">
              <ProductGrid products={items} />
              {loading && (
                <Loader className="absolute inset-0 bg-base-200/70" />
              )}
            </div>
            <InfiniteLoader
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loading={loadingMore}
              itemsLength={items.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

ProductsPage.maxWidthClass = 'max-w-[95%] 2xl:max-w-[1440px]';

export default ProductsPage;
