import React, { useContext, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProductForm from '@components/Product/ProductForm';
import CreateCategoryModal from '@components/Category/CreateCategoryModal';
import { AppContext } from '@contexts/AppContext';
import { NotificationContext } from '@contexts/NotificationContext';
import type { User } from '@/types/user';
import type { Product, ProductFormValues } from '@/types';
import { getPageTitle } from '@lib/pageTitle';
import PageContainer from '@components/Layout/PageContainer';

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
    fetch(`/api/products/${encodeURIComponent(editId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.statusText);
        const data: Product = await res.json();
        const init: Partial<ProductFormValues> = {
          id: data.uuid || String(data.id),
          vendor: data.vendor?.brandName || '',
          sku: data.sku || '',
          title: data.title || '',
          description: data.description || '',
          productType: data.productType || '',
          tags:
            data.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [],
          categoryId: data.category?.id
            ? String(data.category.id)
            : data.categoryId
            ? String(data.categoryId)
            : '',
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
      const res = await fetch(url, {
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
    const res = await fetch('/api/vendors/check-or-create', {
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
    return <div className="p-4">Please log in to manage products.</div>;
  }
  if (user.role !== 'brand') {
    return <div className="p-4">Brand access required.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-auto px-4 py-6 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle(editId ? 'Edit Product' : 'New Product')}</title>
      </Head>
      <PageContainer>
        <h1 className="text-2xl font-bold mb-4 text-center">
          {editId ? 'Edit Product' : 'Add New Product'}
        </h1>
        {fetchError && (
          <p className="text-error text-center mb-2">{fetchError}</p>
        )}
        {fetching && !initialValues ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner"></span>
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
        <CreateCategoryModal
          isOpen={catModalOpen}
          initialName={catInitialName}
          onClose={handleCatClose}
          onCreated={handleCatCreated}
        />
        <p className="text-center mt-4">
          <Link href="/brand/dashboard" className="link">
            Back to Dashboard
          </Link>
        </p>
      </PageContainer>
    </div>
  );
};

export default NewProductPage;
