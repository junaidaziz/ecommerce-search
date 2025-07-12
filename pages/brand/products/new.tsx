import { apiFetch } from '@lib/api';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProductForm from '@components/Product/ProductForm';
import CreateCategoryModal from '@components/Category/CreateCategoryModal';
import { AppContext } from '@contexts/AppContext';
import { NotificationContext } from '@contexts/NotificationContext';
import type { User } from '@/types';
import type { Product, ProductFormValues } from '@/types';
import { UserRole } from '@/types';
import { getPageTitle } from '@lib/pageTitle';
import PageContainer from '@components/Layout/PageContainer';

import ArrowLeftIcon from '@components/icons/ArrowLeftIcon';
import PlusIcon from '@components/icons/PlusIcon';
import XMarkIcon from '@components/icons/XMarkIcon';

// Inline SVG icons removed in favor of reusable components

const NewProductPage: React.FC = () => {
  const router = useRouter();
  const { user } = useContext(AppContext) as { user: User | null };
  const { addNotification } = useContext(NotificationContext);

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catInitialName, setCatInitialName] = useState('');
  const catResolver = useRef<
    ((cat?: { id: number | string; name: string }) => void) | undefined
  >();
  const [formKey, setFormKey] = useState(0);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [initialValues, setInitialValues] = useState<
    Partial<ProductFormValues> | undefined
  >(undefined);

  const editId =
    typeof router.query.edit === 'string' ? router.query.edit : undefined;

  useEffect(() => {
    if (!editId) {
      setInitialValues(undefined);
      return;
    }
    setFetching(true);
    setFetchError('');
    apiFetch(`/api/products/${encodeURIComponent(editId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.statusText);
        const data: Product = await res.json();
        const init: Partial<ProductFormValues> = {
          id: data.uuid || String(data.id),
          vendorId: data.vendor?.id || 0,
          sku: data.sku || '',
          title: data.title || '',
          description: data.description || '',
          productType: data.productType || '',
          tags:
            data.tags
              ?.split(',')
              .map((t: string) => t.trim())
              .filter(Boolean) || [],
          categoryId: data.category?.id
            ? data.category.id
            : data.categoryId
              ? data.categoryId
              : undefined,
          quantity: data.quantity ?? 0,
          minPrice: data.minPrice ?? 0,
          maxPrice: data.maxPrice ?? 0,
          currency: data.currency || 'USD',
          discountType:
            (data.discountType as 'percentage' | 'fixed' | null) || 'none',
          discountValue: data.discountValue ?? undefined,
          available: (data.quantity ?? 0) > 0,
        };
        setInitialValues(init);
      })
      .catch(() => setFetchError('Failed to load product'))
      .finally(() => setFetching(false));
  }, [editId]);

  const submitProduct = async (values: FormData) => {
    setServerError('');
    setLoading(true);
    try {
      const url = editId
        ? `/api/brand/products/${encodeURIComponent(editId)}`
        : '/api/brand/products';
      const method = editId ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        credentials: 'include',
        body: values,
      });
      if (res.ok) {
        addNotification(
          editId ? 'Product updated' : 'Product added',
          'success'
        );
        if (!editId) setFormKey((k) => k + 1);
      } else {
        const data = await res.json().catch(() => ({ error: 'Error' }));
        setServerError(data.error || data.message || 'Error');
        addNotification(data.error || data.message || 'Error', 'error');
      }
    } catch (err) {
      setServerError('Error');
      addNotification('Error', 'error');
    }
    setLoading(false);
  };

  const requestNewCategory = (name: string) => {
    setCatInitialName(name);
    setCatModalOpen(true);
    return new Promise<{ id: number | string; name: string } | undefined>(
      (resolve) => {
        catResolver.current = resolve;
      }
    );
  };

  const requestNewVendor = async (name: string) => {
    const res = await apiFetch('/api/vendors/check-or-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.vendor as { brandName: string };
  };

  const handleCatClose = () => {
    setCatModalOpen(false);
    if (catResolver.current) {
      catResolver.current(undefined);
      catResolver.current = undefined;
    }
  };

  const handleCatCreated = (cat: { id: number | string; name: string }) => {
    setCatModalOpen(false);
    if (catResolver.current) {
      catResolver.current(cat);
      catResolver.current = undefined;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Please log in to manage products.</p>
        </div>
      </div>
    );
  }
  
  if (user.role !== 'brand' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <XMarkIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Brand access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Head>
        <title>{getPageTitle(editId ? 'Edit Product' : 'New Product')}</title>
      </Head>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/brand/products"
              className="inline-flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Products
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {editId ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-blue-100">
                {editId ? 'Update your product information' : 'Create a new product for your catalog'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {fetchError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XMarkIcon className="w-5 h-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{fetchError}</p>
                </div>
              </div>
            </div>
          )}
          
          {fetching && !initialValues ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ProductForm
              key={formKey}
              onSubmit={submitProduct}
              submitLabel={editId ? 'Update Product' : 'Add Product'}
              requestNewCategory={requestNewCategory}
              requestNewVendor={requestNewVendor}
              loading={loading}
              initial={initialValues}
              serverError={serverError}
            />
          )}
        </div>
      </div>

      <CreateCategoryModal
        isOpen={catModalOpen}
        initialName={catInitialName}
        onClose={handleCatClose}
        onCreated={handleCatCreated}
      />
    </div>
  );
};

export default NewProductPage;
