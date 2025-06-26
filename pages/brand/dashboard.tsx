import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';
import { AppContext } from '../../contexts/AppContext';
import type { User } from '../../types/user';
import type { Product, ProductInput } from '../../types/product';
import { TextInput } from '../../components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';

type ProductForm = Partial<ProductInput> & { id?: string };

type ProductApi = Product;

const emptyForm: ProductForm = {
  id: '',
  sku: '',
  title: '',
  vendor: { email: '', brandName: '' },
  description: '',
  productType: '',
  tags: '',
  category: { name: '', slug: '' },
  quantity: 0,
  minPrice: 0,
  maxPrice: 0,
  currency: 'USD',
};

const labels: Record<keyof ProductForm, string> = {
  id: 'ID',
  sku: 'SKU',
  title: 'Title',
  vendor: 'Vendor',
  description: 'Description',
  productType: 'Product Type',
  tags: 'Tags',
  category: 'Category',
  quantity: 'Quantity',
  minPrice: 'Min Price',
  maxPrice: 'Max Price',
  currency: 'Currency',
};

const requiredFields: (keyof ProductForm)[] = [
  'sku',
  'title',
  'vendor',
  'category',
  'quantity',
  'minPrice',
  'maxPrice',
];

const BrandDashboard: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductForm, string>>
  >({});
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [lowStock, setLowStock] = useState<ProductApi[]>([]);
  const [message, setMessage] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setForm((prev) => {
      if (name === 'vendor') {
        return {
          ...prev,
          vendor: { ...(prev.vendor || { email: '' }), brandName: value },
        };
      }
      if (name === 'category') {
        return {
          ...prev,
          category: { ...(prev.category || { slug: '' }), name: value },
        };
      }
      if (name === 'quantity' || name === 'minPrice' || name === 'maxPrice') {
        const num = Number(value);
        return { ...prev, [name]: num < 0 ? 0 : num };
      }
      return { ...prev, [name]: value };
    });
    if (name === 'quantity' || name === 'minPrice' || name === 'maxPrice') {
      const num = Number(value);
      if (num < 0) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'Value must be non-negative',
        }));
      }
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof ProductForm, string>> = {};
    requiredFields.forEach((field) => {
      let val: any = (form as any)[field];
      if (field === 'vendor') val = form.vendor?.brandName;
      if (field === 'category') val = form.category?.name;
      if (
        val === undefined ||
        val === null ||
        (typeof val === 'string' && val.trim() === '')
      ) {
        newErrors[field] = 'This field is required';
      }
    });
    ['quantity', 'minPrice', 'maxPrice'].forEach((f) => {
      const val = (form as any)[f];
      if (typeof val === 'number' && val < 0) {
        newErrors[f as keyof ProductForm] = 'Value must be non-negative';
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    const payload = editingId ? { ...form, id: editingId } : form;
    const url = editingId
      ? `/api/brand/products/${editingId}`
      : '/api/brand/products';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: payload.id,
        sku: payload.sku,
        title: payload.title,
        vendor: payload.vendor?.brandName,
        description: payload.description,
        product_type: payload.productType,
        tags: payload.tags,
        category: payload.category?.name,
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

  const handleEdit = (p: ProductApi) => {
    setForm({
      id: p.id,
      sku: p.sku || '',
      title: p.title || '',
      vendor:
        typeof p.vendor === 'string'
          ? { email: '', brandName: p.vendor }
          : p.vendor || { email: '', brandName: '' },
      description: p.description || '',
      productType: p.productType || '',
      tags: p.tags || '',
      category:
        typeof p.category === 'string'
          ? { name: p.category, slug: '' }
          : p.category || { name: '', slug: '' },
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    const res = await fetch(`/api/brand/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
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
        {message && <div className="mb-4 text-green-600">{message}</div>}

        <form onSubmit={submit} className="space-y-2 mb-6">
          {(
            [
              'id',
              'sku',
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
            ] as (keyof ProductForm)[]
          ).map((field) => (
            <TextInput
              key={field}
              label={labels[field]}
              name={field as keyof ProductForm}
              value={
                field === 'vendor'
                  ? form.vendor?.brandName || ''
                  : field === 'category'
                    ? form.category?.name || ''
                    : (form as any)[field]
              }
              onChange={handleChange as any}
              placeholder={labels[field]}
              type={
                field === 'quantity' ||
                field === 'minPrice' ||
                field === 'maxPrice'
                  ? 'number'
                  : 'text'
              }
              min={
                field === 'quantity' ||
                field === 'minPrice' ||
                field === 'maxPrice'
                  ? 0
                  : undefined
              }
              error={errors[field]}
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
