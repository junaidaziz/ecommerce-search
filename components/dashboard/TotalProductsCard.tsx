import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';

interface Props {
  brand?: string;
}

const TotalProductsCard: React.FC<Props> = ({ brand }) => {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    setCount(null);
    setError('');
    const url =
      '/api/dashboard/total-products' +
      (brand ? `?brand=${encodeURIComponent(brand)}` : '');
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setCount(data.count))
      .catch(() => setError('Failed to load'));
  }, [brand]);

  return (
    <DashboardCard
      title="Total Products"
      loading={count === null && !error}
      error={error}
    >
      {count !== null && <p className="text-3xl font-bold">{count}</p>}
    </DashboardCard>
  );
};

export default TotalProductsCard;
