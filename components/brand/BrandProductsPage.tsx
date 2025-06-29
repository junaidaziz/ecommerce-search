import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { AppContext } from '@contexts/AppContext';
import type { User } from '@/types/user';
import type { Product } from '@/types/product';
import { getPageTitle } from '@lib/pageTitle';
import { StatusLabel } from '@components/UI';

const BrandProductsPage: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    fetch('/api/brand/products', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { products: Product[]; total: number }) => setProducts(data.products))
      .catch(() => setError('Failed to load products'))
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
    return p.title?.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term);
  });

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/brand/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => String(p.uuid || p.id) !== id));
    }
  };

  const getCategory = (p: Product): string =>
    typeof p.category === 'string' ? p.category : p.category?.name || p.productType;

  return (
    <div className="min-h-screen px-4 py-6 space-y-4">
      <Head>
        <title>{getPageTitle('Products')}</title>
      </Head>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
      ) : error ? (
        <div className="text-error py-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-[80vh] overflow-y-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="hidden sm:table-cell">Category</th>
                  <th>Status</th>
                  <th>Qty</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap">{p.title}</td>
                    <td className="hidden sm:table-cell">{getCategory(p)}</td>
                    <td>
                      <StatusLabel
                        color={
                          p.status === 'approved'
                            ? 'success'
                            : p.status === 'pending'
                            ? 'warning'
                            : 'error'
                        }
                        size="sm"
                      >
                        {p.status}
                      </StatusLabel>
                    </td>
                    <td>{p.quantity ?? p.totalInventory ?? 0}</td>
                    <td className="space-x-2 whitespace-nowrap">
                      <Link href={`/products/${p.uuid || p.id}`} className="btn btn-xs sm:btn-sm">
                        View
                      </Link>
                      <Link href={`/brand/products/new?edit=${p.uuid || p.id}`} className="btn btn-xs sm:btn-sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-xs sm:btn-sm btn-error"
                        onClick={() => handleDelete(String(p.uuid || p.id))}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandProductsPage;
