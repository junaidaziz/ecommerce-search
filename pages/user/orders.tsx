import { fetchUserOrders, reorderOrder } from '@lib/api/user';
import { useContext, useEffect, useState, useMemo } from 'react';
import { AppContext } from '@contexts/AppContext';
import type { Order } from '@/types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import TableHeader from '@components/common/TableHeader';
import TableBody from '@components/common/TableBody';
import { SelectOption } from '@components/form-fields/SelectDropdown';

const UserOrders: React.FC = () => {
  const { user } = useContext(AppContext)!;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SelectOption>({
    label: 'All Orders',
    value: 'all',
  });

  const statusOptions: SelectOption[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchUserOrders()
      .then((data) => {
        setOrders(data);
        setError(null);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchTerm === '' ||
        order.id.toString().includes(searchTerm) ||
        order.product?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter.value === 'all' || order.status === statusFilter.value;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
      confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '✓' },
      processing: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚙️' },
      shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🚚' },
      delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: '📦' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: '❌' },
      returned: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '↩️' },
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
      <div className="flex items-center gap-1 mt-1">
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
    return <div className="p-4">Please log in to view orders.</div>;
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
        <div className="alert alert-error mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
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
            value={statusFilter.value}
            onChange={(e) => {
              const selected = statusOptions.find(
                (opt) => opt.value === e.target.value
              );
              if (selected) setStatusFilter(selected);
            }}
            className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <TableHeader
                columns={[
                  { label: 'Order #' },
                  { label: 'Product' },
                  { label: 'Date' },
                  { label: 'Status' },
                  { label: 'Total' },
                  { label: 'Actions' },
                ]}
              />
              <TableBody
                data={filteredOrders}
                columns={[
                  { label: 'Order #' },
                  { label: 'Product' },
                  { label: 'Date' },
                  { label: 'Status' },
                  { label: 'Total' },
                  { label: 'Actions' },
                ]}
                emptyMessage="No orders found."
                renderRow={(order) => [
                  <td
                    key="id"
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    #{order.id}
                  </td>,
                  <td
                    key="product"
                    className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                  >
                    <div className="font-medium">{order.product?.title || 'N/A'}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      Qty: {order.quantity}
                    </div>
                  </td>,
                  <td
                    key="date"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                  >
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>,
                  <td key="status" className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-start">
                      {getStatusBadge(order.status)}
                      {['shipped', 'processing', 'confirmed'].includes(order.status) &&
                        getOrderTracking(order)}
                    </div>
                  </td>,
                  <td
                    key="total"
                    className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100"
                  >
                    £{order.total}
                  </td>,
                  <td
                    key="actions"
                    className="px-6 py-4 whitespace-nowrap text-sm space-x-2"
                  >
                    <a
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      href={`/user/orders/${order.uuid}`}
                    >
                      View
                    </a>
                    <a
                      className="inline-flex items-center px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                      href={`/api/orders/${order.uuid}/invoice`}
                      download
                    >
                      Invoice
                    </a>
                    <button
                      className="inline-flex items-center px-3 py-1.5 border border-blue-300 dark:border-blue-600 rounded-lg text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      onClick={() =>
                        reorderOrder(order.uuid).then(() =>
                          window.location.assign('/cart')
                        )
                      }
                    >
                      Reorder
                    </button>
                  </td>,
                ]}
              />
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
