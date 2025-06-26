import React, { useContext, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProductForm from '../../../components/Product/ProductForm';
import CreateCategoryModal from '../../../components/Category/CreateCategoryModal';
import { AppContext } from '../../../contexts/AppContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import type { User } from '../../../types/user';
import { getPageTitle } from '../../../lib/pageTitle';

const NewProductPage: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const { addNotification } = useContext(NotificationContext);

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catInitialName, setCatInitialName] = useState('');
  const catResolver = useRef<
    ((cat?: { id: number | string; name: string }) => void) | undefined
  >();

  const submitProduct = async (values: FormData) => {
    const res = await fetch('/api/brand/products', {
      method: 'POST',
      body: values,
    });
    if (res.ok) {
      addNotification('Product added', 'success');
    } else {
      const data = await res.json().catch(() => ({ message: 'Error' }));
      addNotification(data.message || 'Error', 'error');
    }
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
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('New Product')}</title>
      </Head>
      <div className="max-w-lg mx-auto mt-10 border border-gray-200 rounded-lg shadow-sm p-6 bg-white w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Add New Product</h1>
        <ProductForm
          onSubmit={submitProduct}
          submitLabel="Add Product"
          requestNewCategory={requestNewCategory}
        />
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
      </div>
    </div>
  );
};

export default NewProductPage;
