import React, { useContext } from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import type { Product } from '@/types';
import { AppContext } from '@contexts/AppContext';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  className = '',
}) => {
  const appContext = useContext(AppContext);
  const wishlist = appContext?.wishlist || [];
  const addToWish = appContext?.addToWishlist;
  const removeFromWish = appContext?.removeFromWishlist;

  return (
    <div
      className={`min-h-[400px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 py-6 justify-center ${className}`}
    >
      {products.length === 0 ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <ProductCardSkeleton />
          </div>
        ))
      ) : (
        products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            className="w-full h-full transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl"
            inWishlist={wishlist.some((w) => w.product.id === p.id)}
            addToWish={addToWish}
            removeFromWish={removeFromWish ? (id) => removeFromWish(Number(id)) : undefined}
          />
        ))
      )}
    </div>
  );
};

export default ProductGrid;
