import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppContext } from '@contexts/AppContext';
import type { User } from '@/types/user';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import { getPageTitle } from '@lib/pageTitle';
import ProductTable from './ProductTable';
import ProductDetailsModal from './ProductDetailsModal';
import { NotificationContext } from '@contexts/NotificationContext';
import { ConfirmModal } from '@components/UI';
import BrandProductSort, { BrandProductSortValue } from './BrandProductSort';
import Pagination from '@components/Pagination';

const BrandProductsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useContext(AppContext) as { user: User | null };
  const { addNotification } = useContext(NotificationContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [sort, setSort] = useState<BrandProductSortValue>('title_asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [sort, search, categoryFilter, minQty, maxQty]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    params.set('sort', sort);
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    if (minQty) params.set('minQty', minQty);
    if (maxQty) params.set('maxQty', maxQty);
    fetch(`/api/brand/products?${params.toString()}`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { products: Product[]; total: number }) => {
        setProducts(data.products);
        setTotalPages(Math.max(1, Math.ceil(data.total / pageSize)));
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [user, sort, search, categoryFilter, minQty, maxQty, currentPage]);

  useEffect(() => {
    fetch('/api/categories?limit=250')
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data: { categories: Category[] }) =>
        setCategories(data.categories)
      )
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const pageParam = router.query.page;
    if (pageParam) {
      const p = Array.isArray(pageParam)
        ? parseInt(pageParam[0], 10)
        : parseInt(pageParam as string, 10);
      setCurrentPage(isNaN(p) ? 1 : p);
    } else {
      setCurrentPage(1);
    }
  }, [router.query.page]);

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

  const handleDelete = (id: string): void => {
    setDeleteId(id);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(
      `/api/brand/products/${encodeURIComponent(deleteId)}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );
    if (res.ok) {
      setProducts((prev) =>
        prev.filter((p) => String(p.uuid || p.id) !== deleteId)
      );
      addNotification('Product deleted', 'success');
    } else if (res.status === 409) {
      addNotification('Cannot delete product with stock or orders', 'error');
    } else {
      addNotification('Failed to delete product', 'error');
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const handlePageChange = (p: number) => {
    if (p > 0 && p <= totalPages) {
      setCurrentPage(p);
      const query = { ...router.query, page: String(p) } as Record<string, string>;
      router.push({ pathname: '/brand/products', query }, undefined, {
        shallow: true,
      });
    }
  };

  const handleView = (p: Product) => {
    setViewProduct(p);
    router.push(
      {
        pathname: `/brand/products/${p.slug ?? p.uuid ?? p.id}`,
        query: { page: String(currentPage) },
      },
      undefined,
      {
        shallow: true,
      }
    );
  };

  const handleClose = () => {
    setViewProduct(null);
    router.push(
      { pathname: '/brand/products', query: { page: String(currentPage) } },
      undefined,
      { shallow: true }
    );
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <input
          type="text"
          className="input input-bordered w-full sm:w-72"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="sm:ml-auto">
          <BrandProductSort value={sort} onChange={setSort} />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner"></span>
        </div>
      ) : error ? (
        <div className="text-error py-4">{error}</div>
      ) : (
        <ProductTable
          products={products}
          categories={categories}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          minQty={minQty}
          maxQty={maxQty}
          onMinQtyChange={setMinQty}
          onMaxQtyChange={setMaxQty}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <ProductDetailsModal
        product={viewProduct}
        isOpen={!!viewProduct}
        onClose={handleClose}
      />
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Product?"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default BrandProductsPage;
