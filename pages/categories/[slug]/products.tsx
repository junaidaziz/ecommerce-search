import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProductCard from '@components/Product/ProductCard';
import type { Product, Category } from '@/types';
import {
  getCategoryBySlug,
  getProductsByCategorySlug,
} from '@lib/products';
import { serializeDates } from '@utils/serializeDates';

interface CategoryProductsProps {
  products: Product[];
  category: Category;
}

export const getServerSideProps: GetServerSideProps<
  CategoryProductsProps
> = async (context: GetServerSidePropsContext) => {
  const { params } = context;
  const slug = params?.slug;
  if (!slug || Array.isArray(slug)) {
    return { notFound: true };
  }
  const [category, products] = await Promise.all([
    getCategoryBySlug(String(slug)),
    getProductsByCategorySlug(String(slug)),
  ]);
  if (!category) {
    return { notFound: true };
  }
  return {
    props: {
      products: serializeDates(products),
      category: serializeDates(category),
    },
  };
};

export default function CategoryProductsPage({
  products,
  category,
}: CategoryProductsProps) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [rating, setRating] = useState('');

  useEffect(() => {
    setMinPrice((router.query.min as string) || '');
    setMaxPrice((router.query.max as string) || '');
    setBrand((router.query.brand as string) || '');
    setRating((router.query.rating as string) || '');
  }, [
    router.query.min,
    router.query.max,
    router.query.brand,
    router.query.rating,
  ]);

  const updateQuery = (key: string, value: string) => {
    const query = { ...router.query } as Record<string, string>;
    if (value) query[key] = value;
    else delete query[key];
    router.push(
      { pathname: router.pathname, query: { ...query, slug: category.slug } },
      undefined,
      { shallow: true }
    );
  };

  const filtered = products.filter((p) => {
    if (minPrice && p.minPrice < parseFloat(minPrice)) return false;
    if (maxPrice && p.minPrice > parseFloat(maxPrice)) return false;
    if (brand && p.vendor.brandName !== brand) return false;
    if (rating && Math.round(p.averageRating) < parseInt(rating, 10))
      return false;
    return true;
  });

  return (
    <div className="max-w-screen-2xl mx-auto min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      <Head>
        <title>{getPageTitle(`${category.name} Products`)}</title>
        <meta name="description" content={`Products for ${category.name}`} />
      </Head>
      <h1 className="text-2xl font-bold mb-4">
        {category.name} ({filtered.length})
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <aside className="border rounded bg-base-100 p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Price</h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  updateQuery('min', e.target.value);
                }}
                placeholder="Min"
                className="input input-bordered w-full"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateQuery('max', e.target.value);
                }}
                placeholder="Max"
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Brand</h3>
            {['BrandA', 'BrandB', 'BrandC'].map((b) => (
              <label key={b} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={brand === b}
                  onChange={() => {
                    const v = brand === b ? '' : b;
                    setBrand(v);
                    updateQuery('brand', v);
                  }}
                />
                <span>{b}</span>
              </label>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Rating</h3>
            {[5, 4, 3].map((r) => (
              <label key={r} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={rating === String(r)}
                  onChange={() => {
                    const v = rating === String(r) ? '' : String(r);
                    setRating(v);
                    updateQuery('rating', v);
                  }}
                />
                <span>{r}★ & up</span>
              </label>
            ))}
          </div>
        </aside>
        <section>
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
