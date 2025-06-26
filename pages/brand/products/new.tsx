import React, { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProductForm from '../../../components/ProductForm';
import { AppContext } from '../../../contexts/AppContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import type { User } from '../../../types/user';
import { getPageTitle } from '../../../lib/pageTitle';

const NewProductPage: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const { addNotification } = useContext(NotificationContext);

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

  if (!user) {
    return <div className="p-4">Please log in to manage products.</div>;
  }
  if (user.role !== 'brand') {
    return <div className="p-4">Brand access required.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Head>
        <title>{getPageTitle('New Product')}</title>
      </Head>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <Link href="/brand/dashboard" className="btn">
          Back to Dashboard
        </Link>
      </div>
      <ProductForm onSubmit={submitProduct} submitLabel="Add Product" />
    </div>
  );
};

export default NewProductPage;
