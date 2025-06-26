import React, { useContext } from 'react';
import Head from 'next/head';
import { AppContext } from '../../../contexts/AppContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import type { User } from '../../../types/user';
import ProductForm from '../../../components/ProductForm';
import { getPageTitle } from '../../../lib/pageTitle';

const NewProductPage: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const { addNotification } = useContext(NotificationContext);

  const submitProduct = async (values: FormData): Promise<void> => {
    const res = await fetch('/api/brand/products', { method: 'POST', body: values });
    if (res.ok) {
      addNotification('Product added', 'success');
    } else {
      const data = await res.json().catch(() => ({ message: 'Error' }));
      addNotification(data.message || 'Error', 'error');
    }
  };

  if (!user) return <div className="p-4">Please log in to manage products.</div>;
  if (user.role !== 'brand') return <div className="p-4">Brand access required.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Head>
        <title>{getPageTitle('Add Product')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <ProductForm onSubmit={submitProduct} submitLabel="Add Product" />
    </div>
  );
};

export default NewProductPage;
