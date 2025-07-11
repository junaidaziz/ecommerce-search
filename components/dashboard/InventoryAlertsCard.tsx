import { apiFetch } from '@lib/api';
import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import { ExclamationTriangleIcon, BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  brandId?: number;
  threshold?: number;
}

interface Product {
  id: string;
  title: string;
  quantity: number;
}

const InventoryAlertsCard: React.FC<Props> = ({ brandId, threshold = 10 }) => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    setProducts(null);
    setError('');
    const params = new URLSearchParams();
    if (brandId) params.set('brandId', String(brandId));
    if (threshold) params.set('threshold', String(threshold));
    const url =
      '/api/dashboard/inventory-alerts' +
      (params.toString() ? `?${params.toString()}` : '');
    async function load() {
      try {
        const res = await apiFetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
        } else if (res.status === 404) {
          setError('No data available');
        } else {
          throw new Error('err');
        }
      } catch {
        setError('Failed to load');
      }
    }
    load();
  }, [brandId, threshold]);

  return (
    <DashboardCard
      title="Inventory Alerts"
      loading={!products && !error}
      error={error}
      icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />}
    >
      {products && products.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <BellIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {products.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Low stock items
              </p>
            </div>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {product.quantity} left
                  </p>
                </div>
              </div>
            ))}
          </div>
          {products.length > 3 && (
            <div className="text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{products.length - 3} more items
              </span>
            </div>
          )}
        </div>
      ) : (
        !error && (
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                All Good
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No low stock alerts
              </p>
            </div>
          </div>
        )
      )}
    </DashboardCard>
  );
};

export default InventoryAlertsCard;
