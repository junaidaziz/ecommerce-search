import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';

interface Props {
  brand?: string;
}

interface Product {
  id: string;
  title: string;
  quantity: number;
}

const BestSellersCard: React.FC<Props> = ({ brand }) => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    setProducts(null);
    setError('');
    const url =
      '/api/dashboard/best-sellers' +
      (brand ? `?brand=${encodeURIComponent(brand)}` : '');
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setProducts(data.products))
      .catch(() => setError('Failed to load'));
  }, [brand]);

  return (
    <DashboardCard
      title="Best-Selling Products"
      loading={!products && !error}
      error={error}
    >
      {products && products.length > 0 ? (
        <ul className="list-disc pl-4 space-y-1">
          {products.map((p) => (
            <li key={p.id}>
              {p.title} - {p.quantity}
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>No sales yet.</p>
      )}
    </DashboardCard>
  );
};

export default BestSellersCard;
