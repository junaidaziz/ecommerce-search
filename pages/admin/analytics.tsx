import { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '@contexts/AppContext';
import type { AdminAnalyticsData } from '../../types/dashboard';
import type { LowStockProduct } from '@/types';
import { USER_ROLES } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import PageHero from '@components/UI/PageHero';
import AdminPanelLayout from '@components/Layout/AdminPanelLayout';
import { ArrowTrendingUpIcon, ShoppingBagIcon, CurrencyPoundIcon } from '@heroicons/react/24/outline';

export default function AdminAnalytics() {
  const { user } = useContext(AppContext)!;
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockTotal, setLowStockTotal] = useState(0);
  const [lowStockLoading, setLowStockLoading] = useState(false);
  const lowStockRef = useRef<HTMLDivElement>(null);

  const load = () => {
    if (!user) return;
    setLoading(true);
    fetchJson<AdminAnalyticsData>('/api/admin/analytics')
      .then((res) => setData(res))
      .catch(() => setData({ totalOrders: 0, totalRevenue: 0, topProducts: [] }))
      .finally(() => setLoading(false));
  };

  const loadLowStock = async (page = 1) => {
    setLowStockLoading(true);
    const res = await fetchJson<{ products: LowStockProduct[]; total: number; page: number; limit: number }>(`/api/admin/low-stock?page=${page}&limit=20`);
    setLowStock((prev) => (page === 1 ? res.products : [...prev, ...res.products]));
    setLowStockTotal(res.total);
    setLowStockPage(page);
    setLowStockLoading(false);
  };

  useEffect(() => {
    load();
    loadLowStock(1);
  }, [user]);

  // Infinite scroll handler
  useEffect(() => {
    const el = lowStockRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && !lowStockLoading && lowStock.length < lowStockTotal) {
        loadLowStock(lowStockPage + 1);
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [lowStockLoading, lowStock.length, lowStockTotal, lowStockPage]);

  if (!user) return <div className="p-4">Please log in to view analytics.</div>;
  if (user.role !== USER_ROLES.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;
  if (loading || data === null) return <div className="p-4">Loading...</div>;

  return (
    <>
      <Head>
        <title>{getPageTitle('Admin Analytics')}</title>
      </Head>
      <PageHero
        heading="Super Admin Analytics"
        description="Platform-wide sales, orders, and product performance overview."
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <ShoppingBagIcon className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalOrders}</div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Total Orders</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <CurrencyPoundIcon className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">£{data.totalRevenue.toFixed(2)}</div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Total Revenue</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <ArrowTrendingUpIcon className="w-8 h-8 text-emerald-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.topProducts.length}</div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Top Products</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" /> Top Products
            </h2>
            {data.topProducts.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.topProducts.map((p: { id: string; qty: number }) => (
                  <li key={p.id} className="py-2 flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{p.id}</span>
                    <span className="text-gray-500 dark:text-gray-300 text-sm">{p.qty} sold</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 dark:text-gray-500">No sales yet.</div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 text-rose-600 dark:text-rose-400">Low Stock Products</h2>
            <div ref={lowStockRef} className="max-h-72 overflow-y-auto pr-2">
              {lowStock.length > 0 ? (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {lowStock.map((p) => (
                    <li key={p.id} className="py-2 flex justify-between items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{p.title}</span>
                      <span className="text-rose-600 dark:text-rose-400 text-sm">{p.quantity} left</span>
                    </li>
                  ))}
                  {lowStockLoading && (
                    <li className="py-2 text-center text-gray-400 dark:text-gray-500">Loading...</li>
                  )}
                  {lowStock.length >= lowStockTotal && !lowStockLoading && (
                    <li className="py-2 text-center text-gray-400 dark:text-gray-500">End of list</li>
                  )}
                </ul>
              ) : (
                <div className="text-gray-400 dark:text-gray-500">No low stock products.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

AdminAnalytics.getLayout = (page: React.ReactNode) => <AdminPanelLayout>{page}</AdminPanelLayout>;
