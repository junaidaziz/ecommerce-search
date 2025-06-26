import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';

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
    >
      {total !== null && (
        <p className="text-3xl font-bold">£{total.toFixed(2)}</p>
      )}
    </DashboardCard>
  );
};

export default TotalSalesCard;
