import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import CartIcon from '../icons/CartIcon';

interface Props {
  brandId?: number;
}

interface Data {
  count: number;
  revenue: number;
}

const WeeklySummaryCard: React.FC<Props> = ({ brandId }) => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setData(null);
      setError('');
      const params = new URLSearchParams();
      if (brandId) params.set('brandId', String(brandId));
      const res = await fetch(`/api/dashboard/weekly-summary?${params.toString()}`);
      if (!res.ok) {
        setError('Failed to load');
        return;
      }
      const json = await res.json();
      setData(json);
    }
    load();
  }, [brandId]);

  return (
    <DashboardCard
      title="Weekly Summary"
      loading={!data && !error}
      error={error}
      icon={<CartIcon className="w-5 h-5" />}
    >
      {data && (
        <div>
          <p className="text-3xl font-bold">{data.count} orders</p>
          <p className="text-sm">£{data.revenue.toFixed(2)}</p>
        </div>
      )}
    </DashboardCard>
  );
};

export default WeeklySummaryCard;
