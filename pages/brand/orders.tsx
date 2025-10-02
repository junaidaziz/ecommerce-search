import { apiFetch } from '@lib/api';
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { AppContext } from '@contexts/AppContext';
import { useSession } from 'next-auth/react';
import { Order, USER_ROLES } from '@/types';
import { UserRole } from '@/types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import OrderDetailsModal from '@components/brand/OrderDetailsModal';
import ChatWindow from '@components/Chat/ChatWindow';
import { ChatContext } from '@contexts/ChatContext';
import { NotificationContext } from '@contexts/NotificationContext';

import TruckIcon from '@components/icons/TruckIcon';
import ChatBubbleIcon from '@components/icons/ChatBubbleIcon';
import EyeIcon from '@components/icons/EyeIcon';
import XMarkIcon from '@components/icons/XMarkIcon';

// Inline SVG icons removed in favor of reusable components

const BrandOrders: React.FC = () => {
  const { user } = useContext(AppContext)!;
  const { openChat } = useContext(ChatContext);
  const { addNotification } = useContext(NotificationContext);
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
    apiFetch('/api/brand/orders')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Order[]) => {
        setOrders(data);
        setError(null);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  const cancelOrder = async (uuid: string) => {
    if (!confirm('Cancel this order?')) return;
    const res = await apiFetch(`/api/orders/${uuid}/cancel`, {
      method: 'POST',
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      addNotification('Order cancelled', 'success');
      loadOrders();
    } else {
      addNotification(data?.message || 'Cancellation failed', 'error');
    }
  };

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Please log in to view orders.</p>
        </div>
      </div>
    );
  }
  
  if (user.role !== USER_ROLES.BRAND && user.role !== USER_ROLES.SUPER_ADMIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <XMarkIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Brand access required.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
      confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '✓' },
      processing: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚙️' },
      shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🚚' },
      delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: '📦' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: '❌' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Head>
        <title>{getPageTitle('Brand Orders')}</title>
      </Head>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Order Management</h1>
              <p className="text-blue-100">Manage and track your customer orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="w-5 h-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {groupedOrders.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedOrders.map((g, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{g.order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{g.items.length} item{g.items.length !== 1 ? 's' : ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {g.order.user
                            ? `${g.order.user.firstName || ''} ${
                                g.order.user.lastName || ''
                              }`.trim() || g.order.user.email
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(g.order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">£{g.order.total}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(g.order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                            onClick={() => setViewGroup(g)}
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                            onClick={() =>
                              openChat({
                                orderId: g.order.uuid,
                                customerName: g.order.user
                                  ? `${g.order.user.firstName || ''} ${
                                      g.order.user.lastName || ''
                                    }`.trim() || g.order.user.email
                                  : undefined,
                              })
                            }
                          >
                            <ChatBubbleIcon className="w-4 h-4 mr-1" />
                            Chat
                          </button>
                          {!['delivered', 'completed'].includes(g.order.status) && (
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                              onClick={() => cancelOrder(g.order.uuid)}
                            >
                              <XMarkIcon className="w-4 h-4 mr-1" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Orders will appear here once customers start placing them.</p>
            </div>
          )
        )}
      </div>
      
      <OrderDetailsModal
        group={viewGroup}
        isOpen={!!viewGroup}
        onClose={() => setViewGroup(null)}
        onUpdated={loadOrders}
      />
      <ChatWindow />
    </div>
  );
};

export default BrandOrders;
