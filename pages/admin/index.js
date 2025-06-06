import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

export default function Admin() {
  const { user } = useContext(AppContext);
  const emptyForm = { id: '', title: '', vendor: '', description: '', product_type: '', tags: '', quantity: 0, min_price: 0, max_price: 0, currency: 'USD' };
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = async () => {
    if (!user) return;
    const res = await fetch(`/api/admin/products?vendor=${encodeURIComponent(user.brandName || '')}`);
    if (res.ok) {
      setProducts(await res.json());
    }
  };

  useEffect(() => { fetchProducts(); }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async e => {
    e.preventDefault();
    const res = await fetch('/api/admin/products', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingId ? { ...form, id: editingId } : form)
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

  const handleEdit = (p) => {
    setForm({
      id: p.ID,
      title: p.TITLE || '',
      vendor: p.VENDOR || '',
      description: p.DESCRIPTION || '',
      product_type: p.PRODUCT_TYPE || '',
      tags: p.TAGS || '',
      quantity: p.TOTAL_INVENTORY || 0,
      min_price: p.MIN_PRICE || 0,
      max_price: p.MAX_PRICE || 0,
      currency: p.CURRENCY || 'USD'
    });
    setEditingId(p.ID);
    setShowModal(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  if (!user) {
    return <div className="p-4">Please log in to view your products.</div>;
  }
  if (user.role !== 'admin') {
    return <div className="p-4">Admin access required.</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <button className="btn mb-4" onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>Add Product</button>
      {showModal && (
        <dialog open className="modal">
          <div className="modal-box">
            <form onSubmit={submit} className="space-y-2">
              {['id','title','vendor','description','product_type','tags','quantity','min_price','max_price','currency'].map(field => (
                <div key={field}>
                  <label className="label capitalize">
                    <span className="label-text">{field.replace('_',' ')}</span>
                  </label>
                  <input name={field} value={form[field]} onChange={handleChange} placeholder={field} className="input input-bordered w-full" />
                </div>
              ))}
              <div className="flex gap-2">
                {editingId && <button type="button" onClick={cancelEdit} className="btn">Cancel</button>}
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => { setShowModal(false); cancelEdit(); }}>close</button>
            </form>
          </div>
        </dialog>
      )}
      <h2 className="text-xl font-semibold mb-2">Existing Products</h2>
      <ul className="space-y-1">
        {products.map(p => (
          <li key={p.ID} className="flex justify-between items-center">
            <span>{p.TITLE} - {p.PRODUCT_TYPE}</span>
            <button type="button" className="btn btn-sm" onClick={() => handleEdit(p)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

