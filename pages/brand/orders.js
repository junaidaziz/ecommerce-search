import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';

export default function BrandOrders() {
  const { user } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(
      `/api/brand/orders?vendor=${encodeURIComponent(user.brandName || '')}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setOrders(data);
        setError(null);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <div className="p-4">Please log in to view orders.</div>;
  }
  if (user.role !== 'brand') {
    return <div className="p-4">Brand access required.</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {error && <div className="alert alert-error mb-2">{error}</div>}
      {loading && (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner"></span>
        </div>
      )}
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="border p-2">
            <p>
              Order #{o.id} - {o.status}
            </p>
            <p>Total: £{o.total}</p>
          </li>
        ))}
        {!loading && orders.length === 0 && <li>No orders found.</li>}
      </ul>
    </div>
  );
}
