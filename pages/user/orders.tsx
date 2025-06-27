import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import type { Order } from '../../types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
const UserOrders: React.FC = () => {
  const { user } = useContext(AppContext)!;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch('/api/user/orders')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Order[]) => {
        setOrders(data);
        setError(null);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <div className="p-4">Please log in to view orders.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Head>
        <title>{getPageTitle('My Orders')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
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
              Order #{o.id} -
              <span
                className={`badge ml-2 ${
                  o.status === 'processing'
                    ? 'badge-warning'
                    : o.status === 'shipped'
                    ? 'badge-info'
                    : o.status === 'delivered'
                    ? 'badge-success'
                    : 'badge-error'
                }`}
              >
                {o.status}
              </span>
            </p>
            <ul className="list-disc pl-4 text-sm mb-1">
              <li>
                {o.product.title} x {o.quantity}
              </li>
            </ul>
            <p>Total: £{o.total}</p>
            <p className="space-x-2">
              <a className="btn btn-sm" href={`/user/orders/${o.uuid}`}>View</a>
              <a className="link" href={`/api/orders/${o.uuid}/invoice`}>
                Invoice
              </a>
              <button
                className="btn btn-sm"
                onClick={() =>
                  fetch(`/api/user/orders/${o.uuid}/reorder`, {
                    method: 'POST',
                  }).then(() => window.location.assign('/cart'))
                }
              >
                Reorder
              </button>
            </p>
          </li>
        ))}
        {!loading && orders.length === 0 && <li>No orders found.</li>}
      </ul>
    </div>
  );
};

export default UserOrders;
