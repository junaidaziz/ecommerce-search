import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { AppContext } from '@contexts/AppContext';
import { useSession } from 'next-auth/react';
import { Order } from '../../types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import OrderDetailsModal from '@components/brand/OrderDetailsModal';

const BrandOrders: React.FC = () => {
  const { user } = useContext(AppContext)!;
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewGroup, setViewGroup] = useState<{
    order: Order;
    items: Order[];
  } | null>(null);

  const loadOrders = useCallback(() => {
    if (!user) return;
    setLoading(true);
    fetch('/api/brand/orders')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Order[]) => {
        setOrders(data);
        setError(null);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  const groupedOrders = useMemo(() => {
    const map = new Map<string, { order: Order; items: Order[] }>();
    for (const o of orders) {
      const key =
        o.paymentReference || new Date(o.createdAt).toISOString().split('.')[0];
      const existing = map.get(key);
      if (existing) {
        existing.items.push(o);
      } else {
        map.set(key, { order: o, items: [o] });
      }
    }
    return Array.from(map.values());
  }, [orders]);

  useEffect(() => {
    if (!user || status === 'loading') return;
    loadOrders();
  }, [user, session, status, loadOrders]);

  if (!user) {
    return <div className="p-4">Please log in to view orders.</div>;
  }
  if (user.role !== 'brand') {
    return <div className="p-4">Brand access required.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Head>
        <title>{getPageTitle('Brand Orders')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {error && <div className="alert alert-error mb-2">{error}</div>}
      {loading && (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner"></span>
        </div>
      )}
      {groupedOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Items</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {groupedOrders.map((g, idx) => (
                  <tr key={idx} className="hover">
                    <td>{g.order.id}</td>
                    <td>{g.items.length}</td>
                    <td>
                      {g.order.user
                        ? `${g.order.user.firstName || ''} ${
                            g.order.user.lastName || ''
                          }`.trim() || g.order.user.email
                        : '-'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          g.order.status === 'pending'
                            ? 'badge-ghost'
                            : g.order.status === 'confirmed'
                              ? 'badge-secondary'
                              : g.order.status === 'processing'
                                ? 'badge-warning'
                                : g.order.status === 'shipped'
                                  ? 'badge-info'
                                  : g.order.status === 'delivered' ||
                                      g.order.status === 'completed'
                                    ? 'badge-success'
                                    : 'badge-error'
                        }`}
                      >
                        {g.order.status}
                      </span>
                    </td>
                    <td>£{g.order.total}</td>
                    <td>{new Date(g.order.createdAt).toLocaleDateString()}</td>
                    <td className="space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setViewGroup(g)}
                      >
                        View
                      </button>
                      <a className="link" href={`/messages/${g.order.uuid}`}>
                        Chat
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && <p>No orders found.</p>
      )}
      <OrderDetailsModal
        group={viewGroup}
        isOpen={!!viewGroup}
        onClose={() => setViewGroup(null)}
        onUpdated={loadOrders}
      />
    </div>
  );
};

export default BrandOrders;
