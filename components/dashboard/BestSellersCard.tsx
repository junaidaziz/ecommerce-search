import { apiFetch } from '@lib/api';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardCard from './DashboardCard';
import { StarIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface Props {
  brandId?: number;
}

interface Product {
  id: string;
  title: string;
  quantity: number;
}

const BestSellersCard: React.FC<Props> = ({ brandId }) => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  useEffect(() => {
    setProducts(null);
    setError('');
    const url =
      '/api/dashboard/best-sellers' + (brandId ? `?brandId=${brandId}` : '');
    apiFetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setProducts(data.products))
      .catch(() => setError('Failed to load'));
  }, [brandId]);

  const handleClick = () => {
    router.push('/brand/orders');
  };

  return (
    <DashboardCard
      title="Best-Selling Products"
      loading={!products && !error}
      error={error}
      icon={<StarIcon className="w-6 h-6 text-warning dark:text-warning-light" />}
      onClick={handleClick}
    >
      {products && products.length > 0 ? (
        <div className="space-y-3">
          <div className="space-y-2">
            {products.slice(0, 3).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-warning-100 dark:bg-warning-dark/30 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-warning dark:text-warning-light">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-neutral dark:text-neutral-400">
                      {product.quantity} sold
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm font-medium text-primary dark:text-primary-light flex items-center gap-1">
              View all
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </span>
          </div>
        </div>
      ) : (
        !error && (
          <div className="text-center py-4">
            <p className="text-neutral dark:text-neutral-400">No sales yet.</p>
          </div>
        )
      )}
    </DashboardCard>
  );
};

export default BestSellersCard;
