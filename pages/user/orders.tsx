import { fetchUserOrders, reorderOrder } from '@lib/api/user';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import type { Order } from '@/types';
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
    fetchUserOrders()
      .then((data) => {
        setOrders(data);
        setError(null);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <div className="p-4 text-gray-700 dark:text-gray-300">Please log in to view orders.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Head>
        <title>{getPageTitle('My Orders')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">My Orders</h1>
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-2 text-red-800 dark:text-red-200">{error}</div>}
      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <p className="text-gray-900 dark:text-gray-100">
              Order #{o.id} -
              <span
                className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                  o.status === 'processing'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                    : o.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                      : o.status === 'delivered'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                }`}
              >
                {o.status}
              </span>
            </p>
            <ul className="list-disc pl-4 text-sm mb-1 text-gray-700 dark:text-gray-300">
              <li>
                {o.product.title} x {o.quantity}
              </li>
            </ul>
            <p className="text-gray-900 dark:text-gray-100">Total: £{o.total}</p>
            <p className="space-x-2 mt-2">
              <a className="px-3 py-1 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors inline-block" href={`/user/orders/${o.uuid}`}>
                View
              </a>
              <a className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary" href={`/api/orders/${o.uuid}/invoice`}>
                Invoice
              </a>
              <button
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() =>
                  reorderOrder(o.uuid).then(() =>
                    window.location.assign('/cart')
                  )
                }
              >
                Reorder
              </button>
            </p>
          </li>
        ))}
        {!loading && orders.length === 0 && <li className="text-gray-500 dark:text-gray-400">No orders found.</li>}
      </ul>
    </div>
  );
};

export default UserOrders;
