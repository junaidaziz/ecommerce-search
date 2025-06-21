import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import Pagination from '../../components/Pagination';
import ProductCard from '../../components/ProductCard';
import { getPageTitle } from '../../lib/pageTitle';
import { getProductsPaginated, PaginatedResult } from '../../lib/products';
import type { Product } from '../../types/product';

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

  return { props: { products: result.products, total: result.total } };
};

export default function ProductsPage({ products, total }: ProductsProps) {
  const router = useRouter();
  const pageParam = Array.isArray(router.query.page)
    ? router.query.page[0]
    : router.query.page;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const inStock = router.query.inStock === 'true';
  const totalPages = Math.ceil(total / 20);

  const handlePageChange = useCallback(
    (p: number) => {
      const query = { ...router.query, page: String(p) } as Record<string, string>;
      router.push({ pathname: router.pathname, query });
    },
    [router]
  );

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
        {products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
