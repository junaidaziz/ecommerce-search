import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import Link from 'next/link';
import { AnalyticsData, LowStockProduct, UserRole } from '@/types';
import { fetchJson } from '@utils/fetchJson';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import BarChart from '@components/BarChart';

export default function AdminAnalytics() {
  const { user } = useContext(AppContext)!;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);

  const load = () => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    fetchJson<AnalyticsData>(
      '/api/admin/analytics' + (params.toString() ? `?${params}` : '')
    )
      .then((res) => setData(res))
      .catch(() =>
        setData({ totalOrders: 0, totalRevenue: 0, topProducts: [] })
      )
      .finally(() => setLoading(false));
    fetchJson<{ products: LowStockProduct[] }>('/api/admin/low-stock')
      .then((res) => setLowStock(res.products))
      .catch(() => setLowStock([]));
  };

  useEffect(() => {
    load();
  }, [user]);

  if (!user) return <div className="p-4">Please log in to view analytics.</div>;
  if (user.role !== UserRole.SUPER_ADMIN)
    return <div className="p-4">Admin access required.</div>;

  if (loading || data === null) return <div className="p-4">Loading...</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{getPageTitle('Admin Analytics')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
      <div className="mb-4 space-x-2">
        <Link href="/admin/users" className="btn btn-sm">
          Users
        </Link>
        <Link href="/admin/categories" className="btn btn-sm">
          Categories
        </Link>
        <Link href="/admin/approvals" className="btn btn-sm">
          Approvals
        </Link>
        <Link href="/admin/search-analytics" className="btn btn-sm">
          Search Logs
        </Link>
      </div>
      <form
        className="flex flex-wrap gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="input input-sm input-bordered"
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="input input-sm input-bordered"
        />
        <button type="submit" className="btn btn-sm btn-primary">
          Apply
        </button>
      </form>
      <p>Total Orders: {data.totalOrders}</p>
      <p>Total Revenue: £{data.totalRevenue.toFixed(2)}</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">Top Products</h2>
      <ul className="list-disc list-inside">
        {data.topProducts.map((p) => (
          <li key={p.id}>
            {p.id} - {p.qty} sold
          </li>
        ))}
        {data.topProducts.length === 0 && <li>No sales yet.</li>}
      </ul>
      <div className="mt-4">
        <BarChart
          data={data.topProducts.map((p) => ({ label: p.id, value: p.qty }))}
        />
      </div>
      {lowStock.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Low Stock Products</h2>
          <ul className="list-disc list-inside text-rose-600">
            {lowStock.map((p) => (
              <li key={p.id}>
                {p.title} - {p.quantity} left
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
