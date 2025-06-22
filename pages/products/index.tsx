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
  const categorySlugs = categoryParam ? categoryParam.split(',').filter(Boolean) : [];
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

export default function ProductsPage({ products, total, categories }: ProductsProps) {
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
  const inStock = router.query.inStock === 'true';
  const [items, setItems] = useState<Product[]>(products);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(products.length < total);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver>();
  const isFetchingRef = useRef(false);
  const priceTimer = useRef<NodeJS.Timeout>();
  const firstPriceRef = useRef(true);

  const fetchPage = useCallback(
    async (p: number) => {
      const params = new URLSearchParams();
      params.set('page', String(p));
      if (router.query.category)
        params.set('category', String(router.query.category));
      if (router.query.q) params.set('q', String(router.query.q));
      if (router.query.inStock) params.set('inStock', String(router.query.inStock));
      if (router.query.minPrice) params.set('minPrice', String(router.query.minPrice));
      if (router.query.maxPrice) params.set('maxPrice', String(router.query.maxPrice));
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) return null;
      return (await res.json()) as { products: Product[]; total: number };
    },
    [router.query]
  );

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || loadingMore || !hasMore) return;
    isFetchingRef.current = true;
    setLoadingMore(true);
    const next = page + 1;
    const data = await fetchPage(next);
    if (data) {
      setItems((prev) => {
        const updated = [...prev, ...data.products];
        setHasMore(updated.length < data.total);
        return updated;
      });
      setPage(next);
    }
    setLoadingMore(false);
    isFetchingRef.current = false;
  }, [fetchPage, hasMore, loadingMore, page]);

  const loadMoreFn = useRef(loadMore);
  loadMoreFn.current = loadMore;


  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreFn.current();
        }
      },
      { rootMargin: '200px' }
    );
    observerRef.current = observer;
    const el = loadMoreRef.current;
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  const applyFilters = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
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
      const query = {
        ...router.query,
      } as Record<string, string>;
      if (keyword) query.q = keyword;
      else delete query.q;
      if (selectedCategories.length > 0)
        query.category = selectedCategories.join(',');
      else delete query.category;
      if (minPrice) query.minPrice = minPrice;
      else delete query.minPrice;
      if (maxPrice) query.maxPrice = maxPrice;
      else delete query.maxPrice;
      if (inStock) query.inStock = 'true';
      else delete query.inStock;
      const params = new URLSearchParams(query);
      params.set('page', '1');
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { products: Product[]; total: number };
        setItems(data.products);
        setPage(1);
        setHasMore(data.products.length < data.total);
      }
    },
    [
      router,
      keyword,
      selectedCategories,
      minPrice,
      maxPrice,
      inStock,
      addNotification,
    ]
  );

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

  const toggleInStock = useCallback(() => {
    const query = { ...router.query } as Record<string, string>;
    if (inStock) delete query.inStock;
    else query.inStock = 'true';
    const params = new URLSearchParams(query);
    params.set('page', '1');
    fetch(`/api/products?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setItems(data.products);
          setPage(1);
          setHasMore(data.products.length < data.total);
        }
      });
  }, [router, inStock]);

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (selectedCategories.length > 0)
    selectedCategories.forEach((sc) =>
      activeFilters.push({
        label: categories.find((c) => c.slug === sc)?.name || sc,
        clear: () =>
          setSelectedCategories((prev) => prev.filter((s) => s !== sc)),
      })
    );
  if (inStock)
    activeFilters.push({
      label: 'In Stock',
      clear: () => {
        const query = { ...router.query } as Record<string, string>;
        delete query.inStock;
        const params = new URLSearchParams(query);
        params.set('page', '1');
        fetch(`/api/products?${params.toString()}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              setItems(data.products);
              setPage(1);
              setHasMore(data.products.length < data.total);
            }
          });
      },
    });
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


  const clearAll = useCallback(async () => {
    setKeyword('');
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    const query = {} as Record<string, string>;
    const res = await fetch('/api/products?page=1');
    if (res.ok) {
      const data = (await res.json()) as { products: Product[]; total: number };
      setItems(data.products);
      setPage(1);
      setHasMore(data.products.length < data.total);
    }
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [router]);

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <Head>
        <title>{getPageTitle('Products')}</title>
      </Head>
      <div className="w-full px-4">
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
                <summary className="collapse-title font-medium">Category</summary>
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
                <summary className="collapse-title font-medium">Price Range</summary>
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
                <summary className="collapse-title font-medium">Keyword</summary>
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
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm flex-1">
                  Apply
                </button>
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
                        applyFilters();
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            {items.length === 0 ? (
              <p className="text-gray-500">No products found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
            <div className="flex justify-center my-4 h-8" aria-hidden={!loadingMore}>
              {loadingMore && <span className="loading loading-spinner" />}
            </div>
            {!hasMore && items.length > 0 && (
              <p className="text-center text-sm text-gray-500 my-4">No more products.</p>
            )}
            <div ref={loadMoreRef} className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
