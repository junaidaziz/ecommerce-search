import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types/product';

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products?limit=8')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProducts(data?.products || []))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <h2 className="text-5xl font-bold mb-6 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} className="w-full" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
