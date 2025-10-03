import { apiFetch } from '@lib/api';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [chatOrder, setChatOrder] = useState<{
    id: string;
    brandName: string;
    brandLogo?: string | null;
  } | null>(null);

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchTerm === '' ||
        order.id.toString().includes(searchTerm) ||
        order.product?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const groupedOrders = useMemo(() => {
    const map = new Map<string, { order: Order; items: Order[] }>();
    for (const o of filteredOrders) {
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
  }, [filteredOrders]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiFetch('/api/orders')
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
    const res = await apiFetch(`/api/user/orders/${uuid}/cancel`, {
      method: 'POST',
    });
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

  const reorderOrder = async (uuid: string) => {
    try {
      const res = await apiFetch(`/api/user/orders/${uuid}/reorder`, {
        method: 'POST',
      });
      if (res.ok) {
        addNotification('Items added to cart', 'success');
        window.location.assign('/cart');
      } else {
        const data = await res.json().catch(() => null);
        addNotification(data?.message || 'Failed to reorder', 'error');
      }
    } catch (error) {
      addNotification('Failed to reorder', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
        icon: '⏳',
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800',
        icon: '✓',
      },
      processing: {
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800',
        icon: '⚙️',
      },
      shipped: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800',
        icon: '🚚',
      },
      delivered: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800',
        icon: '📦',
      },
      completed: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800',
        icon: '✅',
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-800',
        icon: '❌',
      },
      returned: {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200 border-gray-200 dark:border-gray-800',
        icon: '↩️',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getOrderTracking = (order: Order) => {
    const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusSteps.indexOf(order.status);

    if (currentIndex === -1 || ['cancelled', 'returned'].includes(order.status)) {
      return null;
    }

    return (
      <div className="flex items-center gap-1 mt-2">
        {statusSteps.slice(0, 5).map((step, idx) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full ${
                idx <= currentIndex
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={step}
            />
            {idx < 4 && (
              <div
                className={`w-4 h-0.5 ${
                  idx < currentIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Head>
        <title>{getPageTitle('My Orders')}</title>
      </Head>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          My Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your order history
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order # or product name..."
            className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
      {orders.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {groupedOrders.map((group, idx) => (
                  <Fragment key={group.order.id}>
                    <tr
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === idx ? null : idx)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{group.order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {group.items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {group.order.user
                          ? `${group.order.user.firstName || ''} ${
                              group.order.user.lastName || ''
                            }`.trim() || group.order.user.email
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start">
                          {getStatusBadge(group.order.status)}
                          {['shipped', 'processing', 'confirmed'].includes(
                            group.order.status
                          ) && getOrderTracking(group.order)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        £{group.order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(group.order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="inline-flex items-center px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
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
                            className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs"
                            href={`/orders/${group.order.uuid}`}
                          >
                            View
                          </a>
                          <a
                            className="inline-flex items-center px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            href={`/api/orders/${group.order.uuid}/invoice`}
                            download
                          >
                            Invoice
                          </a>
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-1 border border-blue-300 dark:border-blue-600 rounded-lg text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-xs"
                            onClick={() => reorderOrder(group.order.uuid)}
                          >
                            Reorder
                          </button>
                          {['pending', 'confirmed', 'processing'].includes(
                            group.order.status
                          ) && (
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs"
                              onClick={() => cancelOrder(group.order.uuid)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === idx && (
                      <tr className="bg-gray-50 dark:bg-gray-900">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              Order Items
                            </h4>
                            <ul className="space-y-2">
                              {group.items.map((item) => (
                                <li
                                  key={item.uuid}
                                  className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg"
                                >
                                  <img
                                    src={
                                      item.product.featuredImage?.url ||
                                      `https://picsum.photos/seed/${item.product.id}/40/40`
                                    }
                                    alt={item.product.title}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {item.product.title}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      Quantity: {item.quantity}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
          </div>
        )
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
