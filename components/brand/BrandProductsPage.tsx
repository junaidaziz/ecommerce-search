import { apiFetch } from '@lib/api';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppContext } from '@contexts/AppContext';
import type { User } from '@/types';
import type { Product } from '@/types';
import { UserRole } from '@/types';
import { getPageTitle } from '@lib/pageTitle';
import ProductTable from './ProductTable';
import ProductDetailsModal from './ProductDetailsModal';
import { NotificationContext } from '@contexts/NotificationContext';
import { ConfirmModal } from '@components/UI';
import BrandProductSort, { BrandProductSortValue } from './BrandProductSort';
import Pagination from '@components/Pagination';

import PlusIcon from '@components/icons/PlusIcon';
import SearchIcon from '@components/icons/SearchIcon';
import FunnelIcon from '@components/icons/FunnelIcon';
import XMarkIcon from '@components/icons/XMarkIcon';


// Inline SVG icons removed in favor of reusable components

const SORT_VALUES: BrandProductSortValue[] = [
  'title_asc',
  'title_desc',
  'category_asc',
  'category_desc',
  'status_asc',
  'status_desc',
  'quantity_asc',
  'quantity_desc',
];

const BrandProductsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useContext(AppContext) as { user: User | null };
  const { addNotification } = useContext(NotificationContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
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
  }, [sort, search]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    params.set('sort', sort);
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    if (search) params.set('search', search);
    apiFetch(`/api/brand/products?${params.toString()}`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { products: Product[]; total: number }) => {
        setProducts(data.products);
        setTotalPages(Math.max(1, Math.ceil(data.total / pageSize)));
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [user, sort, search, currentPage]);

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

  useEffect(() => {
    const sortParam = router.query.sort;
    if (!sortParam) return;
    const value = Array.isArray(sortParam) ? sortParam[0] : sortParam;
    if (
      SORT_VALUES.includes(value as BrandProductSortValue) &&
      value !== sort
    ) {
      setSort(value as BrandProductSortValue);
    }
  }, [router.query.sort]);

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
      apiFetch(`/api/products/${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setViewProduct(data as Product | null))
        .catch(() => setViewProduct(null));
    }
  }, [slug, products]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Please log in to manage products.</p>
        </div>
      </div>
    );
  }
  
  if (user.role !== 'BRAND' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <XMarkIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">Brand access required.</p>
        </div>
      </div>
    );
  }

  const handleDelete = (id: string): void => {
    setDeleteId(id);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await apiFetch(
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
      addNotification('Cannot delete product with orders', 'error');
    } else {
      addNotification('Failed to delete product', 'error');
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const handleSortChange = (value: BrandProductSortValue) => {
    setSort(value);
    const query = {
      ...router.query,
      sort: value,
      page: '1',
    } as Record<string, string>;
    router.push({ pathname: '/brand/products', query }, undefined, {
      shallow: true,
    });
  };

  const handlePageChange = (p: number) => {
    if (p > 0 && p <= totalPages) {
      setCurrentPage(p);
      const query = { ...router.query, page: String(p) } as Record<
        string,
        string
      >;
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
      {
        pathname: '/brand/products',
        query: { page: String(currentPage) },
      },
      undefined,
      {
        shallow: true,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Head>
        <title>{getPageTitle('Brand Products')}</title>
      </Head>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Product Management</h1>
              <p className="text-blue-100">Manage your product catalog and inventory</p>
            </div>
            <div className="mt-6 lg:mt-0">
              <Link
                href="/brand/products/new"
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add New Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              </div>
              <BrandProductSort value={sort} onChange={handleSortChange} />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="w-5 h-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Products Table */}
        {!loading && products.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <ProductTable
              products={products}
              sort={sort}
              onSort={(field) => {
                const [currentField] = sort.split('_');
                const newSort = currentField === field 
                  ? `${field}_${sort.endsWith('asc') ? 'desc' : 'asc'}`
                  : `${field}_asc`;
                handleSortChange(newSort as BrandProductSortValue);
              }}
              onView={handleView}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {search ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
            </p>
            <Link
              href="/brand/products/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Your First Product
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductDetailsModal
        product={viewProduct}
        isOpen={!!viewProduct}
        onClose={handleClose}
      />
      
      <ConfirmModal
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
      />
    </div>
  );
};

export default BrandProductsPage;
