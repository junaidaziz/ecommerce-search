import {
  useState,
  useEffect,
  useContext,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';
import { AppContext } from '@contexts/AppContext';
import { NotificationContext } from '@contexts/NotificationContext';
import { ConfirmModal } from '@components/UI';
import type { Product } from '../../types';
import { TextInput } from '@components/form-fields';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export default function VendorDashboard() {
  const { user } = useContext(AppContext)!;
  const { addNotification } = useContext(NotificationContext);
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
  interface VariantForm {
    size: string;
    color: string;
    material: string;
    quantity: number;
    priceModifier: number;
    id?: number;
  }
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      { size: '', color: '', material: '', quantity: 0, priceModifier: 0 },
    ]);
  };

  const updateVariant = (
    index: number,
    field: keyof VariantForm,
    value: string
  ) => {
    setVariants((prev) => {
      const next = [...prev];
      // @ts-ignore
      next[index][field] =
        field === 'quantity' || field === 'priceModifier'
          ? Number(value)
          : value;
      return next;
    });
  };

  const removeVariantRow = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
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
        variants,
      }),
    });
    if (res.ok) {
      setMessage(editingId ? 'Product updated' : 'Product added');
      setForm(emptyForm);
      setVariants([]);
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
    setVariants(
      p.variants?.map((v) => ({
        id: v.id,
        size: v.attributes.size || '',
        color: v.attributes.color || '',
        material: v.attributes.material || '',
        quantity: v.quantity,
        priceModifier: v.priceModifier || 0,
      })) || []
    );
    setEditingId(p.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setVariants([]);
  };

  const handleDelete = (id: string): void => {
    setDeleteId(id);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(
      `/api/admin/products?id=${encodeURIComponent(deleteId)}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      fetchProducts();
      addNotification('Product deleted', 'success');
    } else if (res.status === 409) {
      addNotification('Cannot delete product with stock or orders', 'error');
    } else {
      addNotification('Failed to delete product', 'error');
    }
    setDeleting(false);
    setDeleteId(null);
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
        <div>
          <h4 className="font-semibold">Variants</h4>
          {variants.map((v, idx) => (
            <div key={idx} className="flex gap-2 mb-1">
              <input
                className="input input-sm input-bordered"
                placeholder="Size"
                value={v.size}
                onChange={(e) => updateVariant(idx, 'size', e.target.value)}
              />
              <input
                className="input input-sm input-bordered"
                placeholder="Color"
                value={v.color}
                onChange={(e) => updateVariant(idx, 'color', e.target.value)}
              />
              <input
                className="input input-sm input-bordered"
                placeholder="Material"
                value={v.material}
                onChange={(e) => updateVariant(idx, 'material', e.target.value)}
              />
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                placeholder="Qty"
                value={v.quantity}
                onChange={(e) => updateVariant(idx, 'quantity', e.target.value)}
              />
              <input
                type="number"
                className="input input-sm input-bordered w-24"
                placeholder="Price +"
                value={v.priceModifier}
                onChange={(e) =>
                  updateVariant(idx, 'priceModifier', e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-xs btn-error"
                onClick={() => removeVariantRow(idx)}
              >
                X
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-xs" onClick={addVariantRow}>
            Add Variant
          </button>
        </div>
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
}
