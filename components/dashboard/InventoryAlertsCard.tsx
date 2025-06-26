import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';

interface Props {
  brand?: string;
  threshold?: number;
}

interface Product {
  id: string;
  title: string;
  quantity: number;
}

const InventoryAlertsCard: React.FC<Props> = ({ brand, threshold = 10 }) => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    setProducts(null);
    setError('');
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (threshold) params.set('threshold', String(threshold));
    const url =
      '/api/dashboard/inventory-alerts' +
      (params.toString() ? `?${params.toString()}` : '');
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setProducts(data.products))
      .catch(() => setError('Failed to load'));
  }, [brand, threshold]);

  return (
    <DashboardCard
      title="Inventory Alerts"
      loading={!products && !error}
      error={error}
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
