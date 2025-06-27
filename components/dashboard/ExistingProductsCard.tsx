import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardCard from './DashboardCard';
import BoxIcon from '../icons/BoxIcon';
import type { Product } from '../../types/product';

interface Props {
  previewCount?: number;
}

const ExistingProductsCard: React.FC<Props> = ({ previewCount = 3 }) => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setProducts(null);
    setError('');
    async function load() {
      try {
        const res = await fetch('/api/brand/products', {
          credentials: 'include',
        });
        if (res.ok) {
          const data: { products: Product[]; total: number } = await res.json();
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
  }, []);

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
      icon={<BoxIcon className="w-5 h-5" />}
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
        <Link href="/brand/products" className="btn btn-primary btn-sm gap-1">
          View <span aria-hidden>↗</span>
        </Link>
      </div>
    </DashboardCard>
  );
};

export default ExistingProductsCard;
