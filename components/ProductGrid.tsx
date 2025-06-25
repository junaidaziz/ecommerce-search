import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from '../types/product';

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
      className={`min-h-[300px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 ${className}`}
    >
      {products.length === 0 ? (
        <p className="text-gray-500 col-span-full">No products found.</p>
      ) : (
        products.map((p) => (
          <ProductCard key={p.id} product={p} className="w-full" />
        ))
      )}
    </div>
  );
};

export default ProductGrid;
