import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from '../types/product';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center my-4">
        <span className="loading loading-spinner" />
      </div>
    );
  }
  if (products.length === 0) {
    return <p className="text-gray-500">No products found.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} className="w-full" />
      ))}
    </div>
  );
};

export default ProductGrid;
