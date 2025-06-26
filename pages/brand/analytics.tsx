import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';
import BarChart from '../../components/BarChart';

type TopProduct = {
  id: string;
  qty: number;
};

type AnalyticsData = {
  totalOrders: number;
  totalRevenue: number;
  topProducts: TopProduct[];
};

type EarningsData = {
  totalEarned: number;
  pending: number;
};

const BrandAnalytics: React.FC = () => {
  const { user } = useContext(AppContext)!;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(
      `/api/brand/analytics?vendor=${encodeURIComponent(user.brandName || '')}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((d) =>
        setData(d || { totalOrders: 0, totalRevenue: 0, topProducts: [] })
      )
      .finally(() => setLoading(false));
    fetch(
      `/api/brand/earnings?vendor=${encodeURIComponent(user.brandName || '')}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then(setEarnings);
  }, [user]);

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role !== 'brand')
    return <div className="p-4">Brand access required.</div>;

  if (loading || data === null) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Head>
        <title>{getPageTitle('Brand Analytics')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Sales Summary</h1>
      <p>Total Orders: {data.totalOrders}</p>
      <p>Total Revenue: £{data.totalRevenue.toFixed(2)}</p>
      {earnings && (
        <div className="my-2 space-y-1">
          <p>Total Earned: £{earnings.totalEarned.toFixed(2)}</p>
          <p>Pending Payouts: £{earnings.pending.toFixed(2)}</p>
        </div>
      )}
      <h2 className="text-xl font-semibold mt-4 mb-2">Top Products</h2>
      <ul className="list-disc list-inside">
        {data.topProducts.length > 0 ? (
          data.topProducts.map((p) => (
            <li key={p.id}>
              {p.id} - {p.qty} sold
            </li>
          ))
        ) : (
          <li>No sales yet.</li>
        )}
      </ul>
      <div className="mt-4">
        <BarChart
          data={data.topProducts.map((p) => ({ label: p.id, value: p.qty }))}
        />
      </div>
    </div>
  );
};

export default BrandAnalytics;
