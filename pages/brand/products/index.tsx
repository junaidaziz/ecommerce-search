import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { AppContext } from '../../../contexts/AppContext';
import type { User } from '../../../types/user';
import type { Product } from '../../../types/product';
import { getPageTitle } from '../../../lib/pageTitle';

const BrandProductsPage: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch('/api/brand/products')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { products: Product[]; total: number }) =>
        setProducts(data.products)
      )
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <div className="p-4">Please log in to manage products.</div>;
  }
  if (user.role !== 'brand') {
    return <div className="p-4">Brand access required.</div>;
  }

  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen px-4 py-6 space-y-4">
      <Head>
        <title>{getPageTitle('Products')}</title>
      </Head>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/brand/products/new" className="btn btn-primary">
          Add New Product
        </Link>
      </div>
      <input
        type="text"
        className="input input-bordered w-full sm:w-80"
        placeholder="Search products"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner"></span>
        </div>
      ) : (
        <ul className="space-y-1">
          {filtered.map((p) => (
            <li key={p.id} className="border p-2">
              {p.title} ({p.sku}) -{' '}
              {typeof p.category === 'string'
                ? p.category
                : p.category?.name || p.productType}
            </li>
          ))}
          {filtered.length === 0 && <li>No products found.</li>}
        </ul>
      )}
    </div>
  );
};

export default BrandProductsPage;
