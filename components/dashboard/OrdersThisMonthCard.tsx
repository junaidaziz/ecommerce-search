import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import ArrowTrendingUpIcon from '../icons/ArrowTrendingUpIcon';

interface Props {
  brand?: string;
}

interface Data {
  count: number;
  revenue: number;
}

const OrdersThisMonthCard: React.FC<Props> = ({ brand }) => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setData(null);
    setError('');
    const url =
      '/api/dashboard/orders-this-month' +
      (brand ? `?brand=${encodeURIComponent(brand)}` : '');
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError('Failed to load'));
  }, [brand]);

  return (
    <DashboardCard
      title="Orders This Month"
      loading={!data && !error}
      error={error}
      className="bg-yellow-50"
    >
      {data && (
        <div className="flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-3xl font-bold">{data.count}</p>
            <p className="text-sm">£{data.revenue.toFixed(2)}</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export default OrdersThisMonthCard;
