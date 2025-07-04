import { apiFetch } from '@lib/api';
import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product, SearchResults } from '@/types';

interface RecommendedProductsProps {
  category?: string;
  excludeId?: string;
  title?: string;
  limit?: number;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  category,
  excludeId,
  title = 'Suggested Products',
  limit = 5,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!category) return;
    apiFetch(
      `/api/search?filterByCategory=${encodeURIComponent(category)}&perPage=${limit}`
    )
      .then((res) => (res.ok ? (res.json() as Promise<SearchResults>) : null))
      .then((data) => {
        if (data && Array.isArray(data.results)) {
          const filtered = data.results
            .filter((p) => p.id !== excludeId)
            .slice(0, limit);
          setProducts(filtered);
        }
      })
      .catch(() => {});
  }, [category, excludeId]);

  if (!products.length) return null;

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-4 sm:gap-6 flex-nowrap pb-2">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              className="w-36 sm:w-44 flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;
