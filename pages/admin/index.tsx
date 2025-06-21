import { useState, useEffect, useContext, useCallback, ChangeEvent } from 'react';
import Link from 'next/link';
import { AppContext } from '../../contexts/AppContext';
import { Product, ApiMessage } from '../../types';
import { fetchJson } from '../../lib/utils/fetchJson';

export default function Admin() {
  const { user } = useContext(AppContext)!;
  type FormState = Partial<Product>;
  const emptyForm: FormState = {
    id: '',
    sku: '',
    title: '',
    vendor: '',
    description: '',
    productType: '',
    tags: '',
    quantity: 0,
    minPrice: 0,
    maxPrice: 0,
    currency: 'USD',
  };
  const [form, setForm] = useState<FormState>(emptyForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [photos, setPhotos] = useState<File[]>([]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const data = await fetchJson<Product[]>(
      `/api/admin/products?vendor=${encodeURIComponent(user.brandName || '')}`
    );
    setProducts(data);
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    const payload = editingId ? { ...form, id: editingId } : form;
    Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
    photos.forEach((file) => fd.append('photos', file));
    try {
      await fetchJson<ApiMessage>('/api/admin/products', {
        method: editingId ? 'PUT' : 'POST',
        body: fd,
      });
      setMessage(editingId ? 'Product updated' : 'Product added');
      setForm(emptyForm);
      setEditingId(null);
      setPhotos([]);
      fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setMessage(msg);
    }
  };

  const handleEdit = (p: Product) => {
      setForm({
      id: p.id,
      sku: p.sku || '',
      title: p.title || '',
      vendor: p.vendor || '',
      description: p.description || '',
      productType: p.productType || '',
      tags: p.tags || '',
      quantity: p.totalInventory || 0,
      minPrice: p.minPrice || 0,
      maxPrice: p.maxPrice || 0,
      currency: p.currency || 'USD',
    });
    setPhotos([]);
    setEditingId(p.id);
    setShowModal(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotos([]);
  };

  if (!user) {
    return <div className="p-4">Please log in to view your products.</div>;
  }
  if (user.role !== 'super-admin') {
    return <div className="p-4">Admin access required.</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="mb-4 space-x-2">
        <Link href="/admin/users" className="btn btn-sm">
          Users
        </Link>
        <Link href="/admin/categories" className="btn btn-sm">
          Categories
        </Link>
        <Link href="/admin/approvals" className="btn btn-sm">
          Approvals
        </Link>
        <Link href="/admin/analytics" className="btn btn-sm">
          Analytics
        </Link>
      </div>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <button
        className="btn mb-4"
        onClick={() => {
          setEditingId(null);
          setForm(emptyForm);
          setPhotos([]);
          setShowModal(true);
        }}
      >
        Add Product
      </button>
      {showModal && (
        <dialog open className="modal">
          <div className="modal-box">
            <form onSubmit={submit} className="space-y-2">
              {[
                'id',
                'sku',
                'title',
                'vendor',
                'description',
                'productType',
                'tags',
                'quantity',
                'minPrice',
                'maxPrice',
                'currency',
              ].map((field) => (
                <div key={field}>
                  <label className="label capitalize">
                    <span className="label-text">
                      {field.replace('_', ' ')}
                    </span>
                  </label>
                  <input
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    placeholder={field}
                    className="input input-bordered w-full"
                  />
                </div>
              ))}
              <div>
                <label className="label">
                  <span className="label-text">Photos</span>
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPhotos(e.target.files ? Array.from(e.target.files) : [])
                  }
                  className="file-input file-input-bordered w-full"
                />
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
            <form method="dialog" className="modal-backdrop">
              <button
                onClick={() => {
                  setShowModal(false);
                  cancelEdit();
                }}
              >
                close
              </button>
            </form>
          </div>
        </dialog>
      )}
      <h2 className="text-xl font-semibold mb-2">Existing Products</h2>
      <ul className="space-y-1">
        {products.map((p) => (
          <li key={p.id} className="flex justify-between items-center">
            <span>
              {p.title} ({p.sku}) - {p.productType}
            </span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => handleEdit(p)}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
