import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { getPageTitle } from '../../lib/pageTitle';
import { getProductsPaginated, PaginatedResult } from '../../lib/products';
import type { Product } from '../../types/product';
import { serializeDates } from '../../lib/utils/serializeDates';

interface ProductsProps {
  products: Product[];
  total: number;
}

export const getServerSideProps: GetServerSideProps<ProductsProps> = async (
  context
) => {
  const page = parseInt((context.query.page as string) || '1', 10);
  const inStock = context.query.inStock === 'true';
  const category = context.query.category as string | undefined;
  const q = context.query.q as string | undefined;

  const limit = 20;
  const offset = (page - 1) * limit;
  const result: PaginatedResult = await getProductsPaginated({
    limit,
    offset,
    categorySlug: category,
    search: q,
    inStock,
  });

  const products = serializeDates(result.products);
  return { props: { products, total: result.total } };
};

export default function ProductsPage({ products, total }: ProductsProps) {
  const router = useRouter();
  const pageParam = Array.isArray(router.query.page)
    ? router.query.page[0]
    : router.query.page;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const inStock = router.query.inStock === 'true';
  const totalPages = Math.ceil(total / 20);

  const [items, setItems] = useState<Product[]>(products);
  const [page, setPage] = useState<number>(currentPage);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(currentPage < totalPages);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(router.query).map(([k, v]) => [
            k,
            Array.isArray(v) ? v[0] : v,
          ])
        ),
        page: String(nextPage),
        limit: '20',
      });
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as PaginatedResult;
        setItems((prev) => [...prev, ...data.products]);
        setPage(nextPage);
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, page: String(nextPage) },
          },
          undefined,
          { shallow: true }
        );
        if (nextPage >= Math.ceil(data.total / 20)) {
          setHasMore(false);
        }
      } else {
        console.error('Failed to load products', await res.text());
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, router]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        loadMore();
      }
    });
    observer.observe(sentinelRef.current);
    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  const toggleInStock = useCallback(() => {
    const query = { ...router.query } as Record<string, string>;
    if (inStock) delete query.inStock;
    else query.inStock = 'true';
    query.page = '1';
    router.push({ pathname: router.pathname, query });
  }, [router, inStock]);

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <Head>
        <title>{getPageTitle('Products')}</title>
      </Head>
      <div className="max-w-screen-xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            className="checkbox"
            checked={inStock}
            onChange={toggleInStock}
          />
          <span>In Stock Only</span>
        </label>
        {items.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <div
          ref={sentinelRef}
          className="h-10 mt-4 flex justify-center items-center"
        >
          {loadingMore && <span className="loading loading-spinner" />}
          {!hasMore && page >= totalPages && items.length > 0 && (
            <span className="text-sm text-gray-500">No more products</span>
          )}
        </div>
      </div>
    </div>
  );
}
