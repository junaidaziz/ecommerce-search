import { useEffect, useState } from 'react';
import useRequireAuth from '@hooks/useRequireAuth';
import type { Order } from '../types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

type OrdersProps = {};

const Orders: React.FC<OrdersProps> = (_props) => {
  const user = useRequireAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch('/api/orders')
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => null);
          return Promise.reject(d?.message || 'Failed to load orders');
        }
        return res.json();
      })
      .then((data: Order[]) => {
        setOrders(data);
        setError(null);
      })
      .catch((err) =>
        setError(typeof err === 'string' ? err : 'Failed to load orders')
      )
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
                <th>Order #</th>
                <th>Items</th>
                <th>Buyer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th></th>
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
                      <span className="whitespace-nowrap">
                        {o.product.title}
                      </span>
                    </div>
                  </td>
                  <td>
                    {o.user
                      ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() ||
                        o.user.email
                      : '-'}
                  </td>
                  <td>
                    <span
                      className={`badge ${
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
                  </td>
                  <td>£{o.total}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="space-x-2">
                    <a className="btn btn-sm" href={`/orders/${o.uuid}`}>
                      View
                    </a>
                    <a className="link" href={`/api/orders/${o.uuid}/invoice`}>
                      PDF
                    </a>
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
