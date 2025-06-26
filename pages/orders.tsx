import { useEffect, useState } from 'react';
import useRequireAuth from '../hooks/useRequireAuth';
import type { Order } from '../types';
import Head from 'next/head';
import { getPageTitle } from '../lib/pageTitle';

type OrdersProps = {};

const Orders: React.FC<OrdersProps> = (_props) => {
  const user = useRequireAuth();
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
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Head>
        <title>{getPageTitle('Orders')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {error && <div className="alert alert-error mb-2">{error}</div>}
      {loading && (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner"></span>
        </div>
      )}
      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Chat</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="hover">
                  <td>{o.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          o.product.featuredImage?.url ||
                          `https://picsum.photos/seed/${o.product.id}/40/40`
                        }
                        alt={o.product.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span>{o.product.title}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        o.status === 'pending'
                          ? 'badge-warning'
                          : o.status === 'shipped'
                            ? 'badge-info'
                            : 'badge-success'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td>£{o.total}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <a className="link" href={`/messages/${o.uuid}`}>Chat</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p>No orders found.</p>
      )}
    </div>
  );
};

export default Orders;
