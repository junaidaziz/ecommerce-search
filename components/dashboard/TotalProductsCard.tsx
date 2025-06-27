import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardCard from './DashboardCard';
import BoxIcon from '../icons/BoxIcon';
import CartIcon from '../icons/CartIcon';

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
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        } else if (res.status === 404) {
          setError('No data available');
          setCount(0);
        } else {
          throw new Error('err');
        }
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
      icon={<BoxIcon className="w-5 h-5" />}
      onClick={handleClick}
      className="bg-indigo-50"
    >
      {count !== null && (
        <div className="flex items-center gap-2">
          <CartIcon className="w-5 h-5 text-indigo-600" />
          <p className="text-3xl font-bold">{count}</p>
        </div>
      )}
    </DashboardCard>
  );
};

export default TotalProductsCard;
