import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

export default function Admin() {
  const { user } = useContext(AppContext);
  const [form, setForm] = useState({ id: '', title: '', vendor: '', description: '', product_type: '', tags: '', quantity: 0, min_price: 0, max_price: 0, currency: 'USD' });
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMessage('Product added');
      setForm({ id: '', title: '', vendor: '', description: '', product_type: '', tags: '', quantity: 0, min_price: 0, max_price: 0, currency: 'USD' });
      fetchProducts();
    } else {
      const data = await res.json();
      setMessage(data.message || 'Error');
    }
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
      <form onSubmit={submit} className="space-y-2 mb-6">
        {['id','title','vendor','description','product_type','tags','quantity','min_price','max_price','currency'].map(field => (
          <input key={field} name={field} value={form[field]} onChange={handleChange} placeholder={field} className="input input-bordered w-full" />
        ))}
        <button type="submit" className="btn btn-primary">Add Product</button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Existing Products</h2>
      <ul className="space-y-1">
        {products.map(p => (
          <li key={p.ID}>{p.TITLE} - {p.PRODUCT_TYPE}</li>
        ))}
      </ul>
    </div>
  );
}

