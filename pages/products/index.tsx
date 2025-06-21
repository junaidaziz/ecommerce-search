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
  const page = parseInt((context.query.page as string) || '1', 10);
  const inStock = context.query.inStock === 'true';
  const category = context.query.category as string | undefined;
  const q = context.query.q as string | undefined;
  const minPrice = context.query.minPrice
    ? parseFloat(context.query.minPrice as string)
    : undefined;
  const maxPrice = context.query.maxPrice
    ? parseFloat(context.query.maxPrice as string)
    : undefined;

  const limit = 20;
  const offset = (page - 1) * limit;
  const result: PaginatedResult = await getProductsPaginated({
    limit,
    offset,
    categorySlug: category,
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
  const pageParam = Array.isArray(router.query.page)
    ? router.query.page[0]
    : router.query.page;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const [keyword, setKeyword] = useState(
    typeof router.query.q === 'string' ? router.query.q : ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    typeof router.query.category === 'string' ? router.query.category : ''
  );
  const [minPrice, setMinPrice] = useState(
    typeof router.query.minPrice === 'string' ? router.query.minPrice : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    typeof router.query.maxPrice === 'string' ? router.query.maxPrice : ''
  );
  const inStock = router.query.inStock === 'true';
  const totalPages = Math.ceil(total / 20);
  const [items, setItems] = useState<Product[]>(products);
  const [page, setPage] = useState(currentPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(products.length < total);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver>();
  const priceTimer = useRef<NodeJS.Timeout>();
  const firstPriceRef = useRef(true);

  const fetchPage = useCallback(
    async (p: number) => {
      const params = new URLSearchParams();
      params.set('page', String(p));
      if (router.query.category) params.set('category', String(router.query.category));
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
    if (loadingMore || !hasMore) return;
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
      router.replace(
        { pathname: router.pathname, query: { ...router.query, page: String(next) } },
        undefined,
        { shallow: true }
      );
    }
    setLoadingMore(false);
  }, [fetchPage, hasMore, loadingMore, page, router]);

  const loadMoreFn = useRef(loadMore);
  loadMoreFn.current = loadMore;

  useEffect(() => {
    if (currentPage > 1 && page === 1) {
      (async () => {
        let extra: Product[] = [];
        for (let p = 2; p <= currentPage; p++) {
          const data = await fetchPage(p);
          if (data) {
            extra = [...extra, ...data.products];
          }
        }
        if (extra.length > 0) {
          setItems((prev) => {
            const updated = [...prev, ...extra];
            setHasMore(updated.length < total);
            return updated;
          });
        }
        setPage(currentPage);
      })();
    }
  }, [currentPage, fetchPage, page, total]);

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
        page: '1',
      } as Record<string, string>;
      if (keyword) query.q = keyword;
      else delete query.q;
      if (selectedCategory) query.category = selectedCategory;
      else delete query.category;
      if (minPrice) query.minPrice = minPrice;
      else delete query.minPrice;
      if (maxPrice) query.maxPrice = maxPrice;
      else delete query.maxPrice;
      if (inStock) query.inStock = 'true';
      else delete query.inStock;
      const params = new URLSearchParams(query);
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { products: Product[]; total: number };
        setItems(data.products);
        setPage(1);
        setHasMore(data.products.length < data.total);
        router.replace({ pathname: router.pathname, query }, undefined, {
          shallow: true,
        });
      }
    },
    [
      router,
      keyword,
      selectedCategory,
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
    query.page = '1';
    const params = new URLSearchParams(query);
    fetch(`/api/products?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setItems(data.products);
          setPage(1);
          setHasMore(data.products.length < data.total);
          router.replace({ pathname: router.pathname, query }, undefined, {
            shallow: true,
          });
        }
      });
  }, [router, inStock]);

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (selectedCategory)
    activeFilters.push({
      label: categories.find((c) => c.slug === selectedCategory)?.name || '',
      clear: () => setSelectedCategory(''),
    });
  if (inStock)
    activeFilters.push({
      label: 'In Stock',
      clear: () => {
        const query = { ...router.query } as Record<string, string>;
        delete query.inStock;
        query.page = '1';
        const params = new URLSearchParams(query);
        fetch(`/api/products?${params.toString()}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              setItems(data.products);
              setPage(1);
              setHasMore(data.products.length < data.total);
              router.replace({ pathname: router.pathname, query }, undefined, {
                shallow: true,
              });
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
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    const query = { page: '1' } as Record<string, string>;
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
      <div className="max-w-screen-xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-60 w-full">
            <form onSubmit={applyFilters} className="space-y-4 sticky top-4">
              <details open className="collapse bg-base-100 rounded-box">
                <summary className="collapse-title font-medium">Category</summary>
                <div className="collapse-content max-h-48 overflow-y-auto">
                  <label className="block mb-1">
                    <input
                      type="radio"
                      name="category"
                      className="radio mr-2"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                    />
                    All
                  </label>
                  {categories.map((c) => (
                    <label key={c.slug} className="block mb-1">
                      <input
                        type="radio"
                        name="category"
                        className="radio mr-2"
                        value={c.slug}
                        checked={selectedCategory === c.slug}
                        onChange={() => setSelectedCategory(c.slug || '')}
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={inStock}
                  onChange={toggleInStock}
                />
                <span>In Stock Only</span>
              </label>
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
              <div className="mb-4 flex flex-wrap gap-2">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
