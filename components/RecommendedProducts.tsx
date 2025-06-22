import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types/product';
import type { SearchResults } from '../types/api';

interface RecommendedProductsProps {
  category?: string;
  excludeId?: string;
  title?: string;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  category,
  excludeId,
  title = 'You may also like',
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!category) return;
    fetch(
      `/api/search?filterByCategory=${encodeURIComponent(category)}&perPage=10`
    )
      .then((res) => (res.ok ? (res.json() as Promise<SearchResults>) : null))
      .then((data) => {
        if (data && Array.isArray(data.results)) {
          const filtered = data.results.filter((p) => p.id !== excludeId);
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
