import React from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  className = '',
}) => {
  return (
    <div
      className={`min-h-[400px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}
    >
      {products.length === 0 ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <ProductCardSkeleton />
          </div>
        ))
      ) : (
        products.map((p) => (
          <div key={p.id} className="group">
            <ProductCard product={p} className="w-full h-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl" />
          </div>
        ))
      )}
    </div>
  );
};

export default ProductGrid;
