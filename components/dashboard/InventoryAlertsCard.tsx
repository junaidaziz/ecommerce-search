import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import WarningIcon from '../icons/WarningIcon';

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
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setProducts(data.products))
      .catch(() => setError('Failed to load'));
  }, [brandId, threshold]);

  return (
    <DashboardCard
      title="Inventory Alerts"
      loading={!products && !error}
      error={error}
      icon={<WarningIcon className="w-5 h-5" />}
    >
      {products && products.length > 0 ? (
        <div className="max-h-40 overflow-y-auto">
          <ul className="list-disc pl-4 space-y-1">
            {products.map((p) => (
              <li key={p.id}>
                {p.title} - {p.quantity} left
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !error && <p>All good!</p>
      )}
    </DashboardCard>
  );
};

export default InventoryAlertsCard;
