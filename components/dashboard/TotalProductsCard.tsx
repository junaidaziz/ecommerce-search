import { apiFetch } from '@lib/api';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardCard from './DashboardCard';
import { CubeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

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
        const res = await apiFetch(url);
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
      icon={<CubeIcon className="w-6 h-6 text-primary dark:text-primary-light" />}
      onClick={handleClick}
    >
      {count !== null && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-dark/30 rounded-lg">
              <ShoppingBagIcon className="w-8 h-8 text-primary dark:text-primary-light" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                {count.toLocaleString()}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Products in inventory
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export default TotalProductsCard;
