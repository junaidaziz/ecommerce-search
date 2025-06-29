import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppContext } from '@contexts/AppContext';
import type { User } from '@/types/user';
import type { Product } from '@/types/product';
import { getPageTitle } from '@lib/pageTitle';
import ProductTable from './ProductTable';
import ProductDetailsModal from './ProductDetailsModal';

const BrandProductsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useContext(AppContext) as { user: User | null };
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

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

  const slug = router.query.slug as string | undefined;
  useEffect(() => {
    if (!slug) {
      setViewProduct(null);
      return;
    }
    const existing = products.find(
      (p) => p.slug === slug || String(p.id) === slug || p.uuid === slug
    );
    if (existing) {
      setViewProduct(existing);
    } else {
      fetch(`/api/products/${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setViewProduct(data as Product | null))
        .catch(() => setViewProduct(null));
    }
  }, [slug, products]);

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

  const handleView = (p: Product) => {
    setViewProduct(p);
    router.push(`/brand/products/${p.slug ?? p.uuid ?? p.id}`, undefined, {
      shallow: true,
    });
  };

  const handleClose = () => {
    setViewProduct(null);
    router.push('/brand/products', undefined, { shallow: true });
  };

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
        <ProductTable products={filtered} onView={handleView} onDelete={handleDelete} />
      )}
      <ProductDetailsModal product={viewProduct} isOpen={!!viewProduct} onClose={handleClose} />
    </div>
  );
};

export default BrandProductsPage;
