import { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '@contexts/AppContext';
import { NotificationContext } from '@contexts/NotificationContext';
import type { Order } from '../../types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export default function VendorOrders() {
  const { user } = useContext(AppContext)!;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useContext(NotificationContext);

  const fetchOrders = useCallback((): void => {
    if (!user) return;
    setLoading(true);
    fetch(
      `/api/vendor/orders?vendor=${encodeURIComponent(user.brandName || '')}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setOrders(data);
        setError(null);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (id: number, status: string): Promise<void> => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      addNotification('Order updated', 'success');
      fetchOrders();
    } else {
      addNotification('Failed to update order', 'error');
    }
  };

  if (!user) {
    return <div className="p-4">Please log in to view orders.</div>;
  }
  if (user.role !== 'brand') {
    return <div className="p-4">Brand access required.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Head>
        <title>{getPageTitle('Vendor Orders')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {error && <div className="alert alert-error mb-2">{error}</div>}
      {loading && (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner"></span>
        </div>
      )}
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="border p-2 space-y-1">
            <p>Order #{o.id}</p>
            <select
              className="select select-bordered"
              value={o.status}
              onChange={(e) => updateStatus(o.id, e.target.value)}
            >
              {['processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p>Total: £{o.total}</p>
            <p>
              <a className="link" href={`/messages/${o.uuid}`}>Chat</a>
            </p>
          </li>
        ))}
        {!loading && orders.length === 0 && <li>No orders found.</li>}
      </ul>
    </div>
  );
}
