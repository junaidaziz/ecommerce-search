import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import WarningIcon from '../icons/WarningIcon';
import BellIcon from '../icons/BellIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';

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
        const res = await fetch(url);
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
      icon={<WarningIcon className="w-5 h-5" />}
      className="bg-rose-50"
    >
      {products && products.length > 0 ? (
        <div className="max-h-40 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <BellIcon className="w-5 h-5 text-rose-600" />
            <span className="badge badge-error badge-sm">
              {products.length}
            </span>
          </div>
          <ul className="list-disc pl-4 space-y-1">
            {products.map((p) => (
              <li key={p.id}>
                {p.title} - {p.quantity} left
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !error && (
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="badge badge-success badge-sm">OK</span>
          </div>
        )
      )}
    </DashboardCard>
  );
};

export default InventoryAlertsCard;
