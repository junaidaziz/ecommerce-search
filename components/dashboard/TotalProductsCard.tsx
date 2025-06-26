import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardCard from './DashboardCard';

interface Props {
  brandId?: number;
}

const TotalProductsCard: React.FC<Props> = ({ brandId }) => {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setCount(null);
      setError('');
      const url =
        '/api/dashboard/total-products' +
        (brandId ? `?brandId=${brandId}` : '');
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setCount(data.count);
      } catch {
        setError('Failed to load');
        setCount(0);
      }
    }
    load();
  }, [brandId]);

  const handleClick = () => {
    router.push(brandId ? '/brand/products' : '/products');
  };

  return (
    <DashboardCard
      title="Total Products"
      loading={count === null && !error}
      error={error}
      onClick={handleClick}
    >
      {count !== null && <p className="text-3xl font-bold">{count}</p>}
    </DashboardCard>
  );
};

export default TotalProductsCard;
