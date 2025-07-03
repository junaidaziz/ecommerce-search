import OrderChatWindow from '@components/Chat/OrderChatWindow';
import { useEffect, useState, useMemo, Fragment, useContext } from 'react';
import useRequireAuth from '@hooks/useRequireAuth';
import type { Order } from '../types';
import { OrderStatus } from '../types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { NotificationContext } from '@contexts/NotificationContext';

type OrdersProps = {};

const Orders: React.FC<OrdersProps> = (_props) => {
  const user = useRequireAuth();
  const { addNotification } = useContext(NotificationContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [chatOrder, setChatOrder] = useState<{
    id: string;
    brandName: string;
    brandLogo?: string | null;
  } | null>(null);

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

  const cancelOrder = async (uuid: string) => {
    if (!confirm('Cancel this order?')) return;
    const res = await fetch(`/api/user/orders/${uuid}/cancel`, { method: 'POST' });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      addNotification('Order cancelled', 'success');
      setOrders((prev) =>
        prev.map((o) =>
          o.uuid === uuid ? { ...o, status: OrderStatus.CANCELLED } : o
        )
      );
    } else {
      addNotification(data?.message || 'Cancellation failed', 'error');
    }
  };

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
              {groupedOrders.map((group, idx) => (
                <Fragment key={group.order.id}>
                  <tr
                    className="hover cursor-pointer"
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                  >
                    <td>{group.order.id}</td>
                    <td>{group.items.length}</td>
                    <td>
                      {group.order.user
                        ? `${group.order.user.firstName || ''} ${
                            group.order.user.lastName || ''
                          }`.trim() || group.order.user.email
                        : '-'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          group.order.status === 'processing'
                            ? 'badge-warning'
                            : group.order.status === 'shipped'
                              ? 'badge-info'
                              : group.order.status === 'delivered' ||
                                  group.order.status === 'completed'
                                ? 'badge-success'
                                : 'badge-error'
                        }`}
                      >
                        {group.order.status}
                      </span>
                    </td>
                    <td>£{group.order.total}</td>
                    <td>
                      {new Date(group.order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="space-x-2">
                    <button
                      type="button"
                      className="link"
                      onClick={() =>
                        setChatOrder({
                          id: group.order.uuid,
                          brandName:
                            group.order.product.vendor.brandName || 'Brand',
                          brandLogo: group.order.product.vendor.logo,
                        })
                      }
                    >
                      Chat
                    </button>
                      <a
                        className="btn btn-sm"
                        href={`/orders/${group.order.uuid}`}
                      >
                        View
                      </a>
                      <a
                        className="link"
                        href={`/api/orders/${group.order.uuid}/invoice`}
                      >
                        PDF
                      </a>
                      {['pending', 'confirmed', 'processing'].includes(
                        group.order.status
                      ) && (
                        <button
                          type="button"
                          className="btn btn-sm btn-error"
                          onClick={() => cancelOrder(group.order.uuid)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === idx && (
                    <tr className="bg-base-200">
                      <td colSpan={7} className="p-2">
                        <ul className="space-y-1">
                          {group.items.map((item) => (
                            <li
                              key={item.uuid}
                              className="flex items-center gap-2"
                            >
                              <img
                                src={
                                  item.product.featuredImage?.url ||
                                  `https://picsum.photos/seed/${item.product.id}/40/40`
                                }
                                alt={item.product.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span className="flex-1 whitespace-nowrap">
                                {item.product.title} x {item.quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p>No orders found.</p>
      )}
      <OrderChatWindow
        isOpen={!!chatOrder}
        orderId={chatOrder?.id || ''}
        brandName={chatOrder?.brandName || ''}
        brandLogo={chatOrder?.brandLogo}
        onClose={() => setChatOrder(null)}
      />
    </div>
  );
};

export default Orders;
