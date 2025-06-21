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
    fetch(`/api/search?category=${encodeURIComponent(category)}&perPage=4`)
      .then((res) => (res.ok ? (res.json() as Promise<SearchResults>) : null))
      .then((data) => {
        if (data && Array.isArray(data.results)) {
          const filtered = data.results.filter((p) => p.ID !== excludeId);
          setProducts(filtered);
        }
      })
      .catch(() => {});
  }, [category, excludeId]);

  if (!products.length) return null;

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {products.map((p) => (
          <ProductCard key={p.ID} product={p} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
