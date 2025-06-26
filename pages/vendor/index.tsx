import {
  useState,
  useEffect,
  useContext,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';
import { AppContext } from '../../contexts/AppContext';
import type { Product } from '../../types';
import { TextInput } from '../../components/UI/form-fields';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';

export default function VendorDashboard() {
  const { user } = useContext(AppContext)!;
  interface FormState {
    id: string;
    title: string;
    vendor: string;
    description: string;
    productType: string;
    tags: string;
    category: string;
    quantity: number;
    minPrice: number;
    maxPrice: number;
    currency: string;
  }
  const emptyForm: FormState = {
    id: '',
    title: '',
    vendor: '',
    description: '',
    productType: '',
    tags: '',
    category: '',
    quantity: 0,
    minPrice: 0,
    maxPrice: 0,
    currency: 'USD',
  };
  const [form, setForm] = useState<FormState>(emptyForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async (): Promise<void> => {
    if (!user) return;
    const res = await fetch(
      `/api/admin/products?vendor=${encodeURIComponent(user.brandName || '')}`
    );
    if (res.ok) {
      setProducts(await res.json());
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name as keyof FormState;
    setForm({ ...form, [key]: e.target.value });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = editingId ? { ...form, id: editingId } : form;
    const res = await fetch('/api/admin/products', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: payload.id,
        title: payload.title,
        vendor: payload.vendor,
        description: payload.description,
        product_type: payload.productType,
        tags: payload.tags,
        category: payload.category,
        quantity: payload.quantity,
        min_price: payload.minPrice,
        max_price: payload.maxPrice,
        currency: payload.currency,
      }),
    });
    if (res.ok) {
      setMessage(editingId ? 'Product updated' : 'Product added');
      setForm(emptyForm);
      setEditingId(null);
      fetchProducts();
    } else {
      const data = await res.json();
      setMessage(data.message || 'Error');
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      id: p.id,
      title: p.title || '',
      vendor: p.vendor?.brandName || '',
      description: p.description || '',
      productType: p.productType || '',
      tags: p.tags || '',
      category: p.category?.name || '',
      quantity: p.totalInventory || 0,
      minPrice: p.minPrice || 0,
      maxPrice: p.maxPrice || 0,
      currency: p.currency || 'USD',
    });
    setEditingId(p.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(
      `/api/admin/products?id=${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      fetchProducts();
    }
  };

  if (!user) {
    return <div className="p-4">Please log in to manage products.</div>;
  }
  if (user.role !== 'brand') {
    return <div className="p-4">Brand access required.</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Vendor Dashboard')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Vendor Dashboard</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <form onSubmit={submit} className="space-y-2 mb-6">
        {[
          'id',
          'title',
          'vendor',
          'description',
          'productType',
          'tags',
          'category',
          'quantity',
          'minPrice',
          'maxPrice',
          'currency',
        ].map((field) => (
          <TextInput
            key={field}
            name={field as keyof FormState}
            value={String(form[field as keyof FormState] ?? '')}
            onChange={handleChange}
            placeholder={field}
          />
        ))}
        <div className="flex gap-2">
          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn">
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
      <h2 className="text-xl font-semibold mb-2">Existing Products</h2>
      <ul className="space-y-1">
        {products.map((p) => (
          <li key={p.id} className="flex justify-between items-center gap-2">
            <span>
              {p.title} - {p.category || p.productType}
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
  );
}
