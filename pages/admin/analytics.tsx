import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Link from 'next/link';

export default function AdminAnalytics() {
  const { user } = useContext(AppContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch('/api/admin/analytics')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData);
  }, [user]);

  if (!user) return <div className="p-4">Please log in to view analytics.</div>;
  if (user.role !== 'super-admin')
    return <div className="p-4">Admin access required.</div>;

  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
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
    </div>
  );
}
