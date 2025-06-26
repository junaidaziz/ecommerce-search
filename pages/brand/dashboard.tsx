import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import type { User } from '../../types/user';
import type { Product } from '../../types/product';
import ProductForm from '../../components/ProductForm';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';

type ProductApi = Product;

const BrandDashboard: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const [editing, setEditing] = useState<ProductApi | null>(null);
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [lowStock, setLowStock] = useState<ProductApi[]>([]);
  const { addNotification } = useContext(NotificationContext);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const res = await fetch(
      `/api/brand/products?vendor=${encodeURIComponent(user.brandName || '')}`
    );
    if (res.ok) {
      setProducts(await res.json());
    }
    const lowRes = await fetch(
      `/api/brand/low-stock?vendor=${encodeURIComponent(user.brandName || '')}`
    );
    if (lowRes.ok) {
      setLowStock(await lowRes.json());
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const submitProduct = async (
    values: FormData,
    id?: string
  ): Promise<void> => {
    const url = id ? `/api/brand/products/${id}` : '/api/brand/products';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, body: values });
    if (res.ok) {
      addNotification(id ? 'Product updated' : 'Product added', 'success');
      setEditing(null);
      fetchProducts();
    } else {
      const data = await res.json().catch(() => ({ message: 'Error' }));
      addNotification(data.message || 'Error', 'error');
    }
  };

  const handleEdit = (p: ProductApi) => {
    setEditing(p);
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    const res = await fetch(`/api/brand/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      addNotification('Product deleted', 'success');
      fetchProducts();
    } else {
      addNotification('Delete failed', 'error');
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
        <title>{getPageTitle('Brand Dashboard')}</title>
      </Head>
      <div className="max-w-lg mx-auto mt-10 border border-gray-200 rounded-lg shadow-sm p-6 bg-white w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Brand Dashboard</h1>
        {lowStock.length > 0 && (
          <div className="alert alert-warning mb-4">
            Low stock on {lowStock.length} product
            {lowStock.length > 1 ? 's' : ''}.
          </div>
        )}

        <ProductForm
          key={editing?.id || 'new'}
          initial={editing ? {
            sku: editing.sku,
            title: editing.title,
            description: editing.description,
            productType: editing.productType,
            tags: editing.tags,
            category: typeof editing.category === 'string' ? editing.category : editing.category?.name,
            quantity: editing.totalInventory || 0,
            minPrice: editing.minPrice,
            maxPrice: editing.maxPrice,
            currency: editing.currency,
            available: (editing.totalInventory ?? editing.quantity ?? 0) > 0,
          } : undefined}
          onSubmit={(fd) => submitProduct(fd, editing?.id)}
          onCancel={editing ? () => setEditing(null) : undefined}
          submitLabel={editing ? 'Update Product' : 'Add Product'}
        />
        <h2 className="text-xl font-semibold mb-2">Existing Products</h2>
        <ul className="space-y-1">
          {products.map((p) => (
            <li key={p.id} className="flex justify-between items-center gap-2">
              <span>
                {p.title} ({p.sku}) - {p.category || p.productType}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-error"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BrandDashboard;
