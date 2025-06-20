import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';

type TopProduct = {
  id: string;
  qty: number;
};

type AnalyticsData = {
  totalOrders: number;
  totalRevenue: number;
  topProducts: TopProduct[];
};

const BrandAnalytics: React.FC = () => {
  const { user } = useContext(AppContext)!;
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/brand/analytics?vendor=${encodeURIComponent(user.brandName || '')}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setData);
  }, [user]);

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role !== 'brand')
    return <div className="p-4">Brand access required.</div>;

  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sales Summary</h1>
      <p>Total Orders: {data.totalOrders}</p>
      <p>Total Revenue: £{data.totalRevenue.toFixed(2)}</p>
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
    </div>
  );
};

export default BrandAnalytics;
