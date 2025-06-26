import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import ArrowTrendingUpIcon from '../icons/ArrowTrendingUpIcon';

interface Props {
  brandId?: number;
}

const TotalSalesCard: React.FC<Props> = ({ brandId }) => {
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    setTotal(null);
    setError('');
    const url =
      '/api/dashboard/total-sales' +
      (brandId ? `?brandId=${brandId}` : '');
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setTotal(data.total))
      .catch(() => setError('Failed to load'));
  }, [brandId]);

  return (
    <DashboardCard
      title="Total Sales"
      loading={total === null && !error}
      error={error}
      className="bg-green-50"
    >
      {total !== null && (
        <div className="flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
          <p className="text-3xl font-bold">£{total.toFixed(2)}</p>
        </div>
      )}
    </DashboardCard>
  );
};

export default TotalSalesCard;
