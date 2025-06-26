import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';

interface Props {
  brandId?: number;
}

interface Data {
  count: number;
  revenue: number;
}

const OrdersThisMonthCard: React.FC<Props> = ({ brandId }) => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setData(null);
    setError('');
    const url =
      '/api/dashboard/orders-this-month' +
      (brandId ? `?brandId=${brandId}` : '');
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError('Failed to load'));
  }, [brandId]);

  return (
    <DashboardCard
      title="Orders This Month"
      loading={!data && !error}
      error={error}
    >
      {data && (
        <div>
          <p className="text-3xl font-bold">{data.count}</p>
          <p className="text-sm">£{data.revenue.toFixed(2)}</p>
        </div>
      )}
    </DashboardCard>
  );
};

export default OrdersThisMonthCard;
