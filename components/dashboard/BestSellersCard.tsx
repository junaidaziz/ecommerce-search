import { apiFetch } from '@lib/api';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardCard from './DashboardCard';
import CartIcon from '../icons/CartIcon';

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
      icon={<CartIcon className="w-5 h-5" />}
      onClick={handleClick}
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
      <div className="mt-2 text-right text-sm">
        <span className="link">View ↗</span>
      </div>
    </DashboardCard>
  );
};

export default BestSellersCard;
