import { apiFetch } from '@lib/api';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardCard from './DashboardCard';
import { CubeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types';

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
        const res = await apiFetch('/api/brand/products', {
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
      icon={<CubeIcon className="w-6 h-6 text-secondary dark:text-secondary-light" />}
      onClick={() => router.push('/brand/products')}
    >
      {products && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary-100 dark:bg-secondary-dark/30 rounded-lg">
              <CubeIcon className="w-8 h-8 text-secondary dark:text-secondary-light" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {products.length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {products.length === 1 ? 'Product' : 'Products'} in catalog
              </p>
            </div>
          </div>
          
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Recent additions:
              </p>
              <div className="space-y-2">
                {preview.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-neutral dark:text-neutral-400">
                        Added {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-end">
            <span className="text-sm font-medium text-primary dark:text-primary-light flex items-center gap-1">
              View all products
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </span>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export default ExistingProductsCard;
