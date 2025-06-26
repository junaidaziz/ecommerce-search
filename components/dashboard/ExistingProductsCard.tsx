import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardCard from './DashboardCard';
import type { Product } from '../../types/product';

interface Props {
  brand?: string;
  previewCount?: number;
}

const ExistingProductsCard: React.FC<Props> = ({ brand, previewCount = 3 }) => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!brand) return;
    setProducts(null);
    setError('');
    const url = `/api/brand/products?vendor=${encodeURIComponent(brand)}`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Product[]) => setProducts(data))
      .catch(() => setError('Failed to load'));
  }, [brand]);

  const preview =
    products
      ?.slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, previewCount) || [];

  return (
    <DashboardCard
      title="Existing Products"
      loading={!products && !error}
      error={error}
      className="space-y-2"
      onClick={() => router.push('/brand/products')}
    >
      {products && (
        <p>
          You currently have {products.length} product
          {products.length !== 1 ? 's' : ''}.
        </p>
      )}
      {preview.length > 0 && (
        <ul className="list-disc pl-4 space-y-1 text-sm">
          {preview.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
      )}
      <div>
        <Link href="/brand/products" className="btn btn-primary btn-sm">
          Go to Products
        </Link>
      </div>
    </DashboardCard>
  );
};

export default ExistingProductsCard;
